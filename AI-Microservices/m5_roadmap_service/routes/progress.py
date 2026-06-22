from fastapi import APIRouter
import datetime
from schemas import ProgressRequest, StandardResponse
from services.config import default_config
from services.progress_engine import ProgressEngine
from db.roadmap_repo import RoadmapRepository
from db.progress_repo import ProgressRepository
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/progress", response_model=StandardResponse)
def update_progress(req: ProgressRequest):
    roadmap_repo = RoadmapRepository()
    progress_repo = ProgressRepository()
    
    # 1. Load the REAL roadmap from DB
    try:
        roadmap_data = roadmap_repo.get_roadmap(req.roadmap_id)
    except Exception as e:
        logger.warning(f"Failed to fetch roadmap: {e}")
        roadmap_data = None
        
    if not roadmap_data:
        return StandardResponse(
            success=False, data={}, 
            error=f"Roadmap {req.roadmap_id} not found"
        )
    
    # 2. Load the user's REAL learning progress from Supabase
    profile_id = None
    enrolled_courses = []
    try:
        profile_id = progress_repo.get_profile_id(req.user_id)
        if profile_id:
            enrolled_courses = progress_repo.get_user_learning_progress(profile_id)
    except Exception as e:
        logger.warning(f"Failed to fetch user progress: {e}")
    
    # 3. Map enrolled courses to roadmap completion
    completed_course_ids = set()
    events_dict = []
    for ep in enrolled_courses:
        course_rec = ep.get("course_recommendations") or {}
        rec_id = ep.get("course_recommendation_id") or course_rec.get("id")
        if not rec_id:
            continue
            
        pct = ep.get("completion_percentage", 0.0)
        status_val = ep.get("status", "")
        
        if status_val == "completed" or pct >= 100.0:
            completed_course_ids.add(rec_id)
            
        events_dict.append({
            "course_id": rec_id,
            "pct_complete": float(pct),
            "timestamp": req.last_active_iso
        })
    
    # 4. Run the progress engine with REAL data
    actual_roadmap = roadmap_data.get("roadmap_data", {})
    engine = ProgressEngine(roadmap=actual_roadmap, config=default_config)
    
    status = engine.batch_update(events=events_dict)
    
    # Calculate ETA weeks
    eta_weeks = 0
    eta_completion = status.get("eta_completion", "N/A")
    if eta_completion != "N/A":
        try:
            target_date = datetime.datetime.fromisoformat(eta_completion)
            now = datetime.datetime.fromisoformat(req.last_active_iso)
            if target_date.tzinfo is not None:
                target_date = target_date.replace(tzinfo=None)
            if now.tzinfo is not None:
                now = now.replace(tzinfo=None)
            eta_weeks = max(0, (target_date - now).days // 7)
        except Exception:
            eta_weeks = 0

    # Calculate decayed flag
    decayed = False 
    if len(events_dict) == 0 and req.last_active_iso:
        try:
            now = datetime.datetime.fromisoformat(req.last_active_iso)
            if now.tzinfo is not None:
                now = now.replace(tzinfo=None)
            days = (datetime.datetime.now() - now).days
            if days > default_config.progress.forgetting_half_life_days:
                decayed = True
        except Exception:
            pass
            
    overall_pct = status.get("overall_pct", 0.0)
    completed_milestones = status.get("completed_milestones", [])
    
    data = {
        "overall_pct": overall_pct,
        "completed_milestones": completed_milestones,
        "eta_weeks": eta_weeks,
        "decayed": decayed,
        "enrolled_courses_count": len(enrolled_courses),
        "completed_courses_count": len(completed_course_ids),
    }
    
    # 5. Save progress snapshot back to roadmap
    try:
        roadmap_repo.update_roadmap_progress(req.roadmap_id, {
            **actual_roadmap,
            "progress_snapshot": data,
        })
    except Exception as e:
        logger.warning(f"Failed to save progress snapshot: {e}")
    
    return StandardResponse(success=True, data=data, error=None)

