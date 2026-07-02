from fastapi import APIRouter
import datetime
from schemas import ProgressRequest, StandardResponse
from core.skill_mentor_config import default_config
from core.skill_mentor_l3_progress import ProgressEngine

router = APIRouter()

@router.post("/progress", response_model=StandardResponse)
def update_progress(req: ProgressRequest):
    engine = ProgressEngine(roadmap=req.roadmap_data, config=default_config)
    
    events_dict = [
        {"course_id": cid, "pct_complete": 100.0, "timestamp": req.last_active_iso} 
        for cid in req.completed_items
    ]
    
    status = engine.batch_update(events=events_dict)
    
    overall_pct = status.get("overall_pct", 0.0)
    completed_milestones = status.get("completed_milestones", [])
    
    eta_weeks = 0
    eta_completion = status.get("eta_completion", "N/A")
    if eta_completion != "N/A":
        try:
            target_date = datetime.datetime.fromisoformat(eta_completion)
            now = datetime.datetime.fromisoformat(req.last_active_iso)
            eta_weeks = max(0, (target_date - now).days // 7)
        except Exception:
            eta_weeks = 0

    # Let Progress Engine determine implicitly if it decayed internally (decay flag inference)
    decayed = False 
    if len(events_dict) == 0 and req.last_active_iso:
        now = datetime.datetime.fromisoformat(req.last_active_iso)
        days = (datetime.datetime.now() - now).days
        if days > default_config.progress.forgetting_half_life_days:
            decayed = True
    
    data = {
        "overall_pct": overall_pct,
        "completed_milestones": completed_milestones,
        "eta_weeks": eta_weeks,
        "decayed": decayed
    }
    
    return StandardResponse(success=True, data=data, error=None)
