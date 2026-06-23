from fastapi import APIRouter, Depends
from schemas import NotifyRequest, StandardResponse
from services.config import default_config
from services.notification_engine import NotificationSystem
from dependencies import get_oulad_thresholds
from db.notification_repo import NotificationRepository
from db.roadmap_repo import RoadmapRepository
from db.progress_repo import ProgressRepository
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/notify", response_model=StandardResponse)
def generate_notifications(
    req: NotifyRequest,
    oulad_thresholds=Depends(get_oulad_thresholds),
):
    # 1. Load real roadmap if available
    roadmap_data = {}
    if req.roadmap_id:
        try:
            repo = RoadmapRepository()
            roadmap_data = repo.get_roadmap(req.roadmap_id) or {}
        except Exception as e:
            logger.warning(f"Could not load roadmap: {e}")
    
    # 2. Get real progress
    progress_status = {"overall_pct": req.progress_pct}
    if req.user_id:
        try:
            progress_repo = ProgressRepository()
            profile_id = progress_repo.get_profile_id(req.user_id)
            if profile_id:
                enrolled = progress_repo.get_user_learning_progress(profile_id)
                if enrolled:
                    total = sum(e.get("completion_percentage", 0) for e in enrolled)
                    avg = total / len(enrolled) if enrolled else 0
                    progress_status["overall_pct"] = avg
        except Exception as e:
            logger.warning(f"Could not fetch real progress: {e}")
    
    # 3. Generate notifications
    actual_roadmap = roadmap_data.get("roadmap_data", {}) if roadmap_data else {"user": req.user_id}
    system = NotificationSystem(
        roadmap=actual_roadmap, 
        oulad_thresholds=oulad_thresholds, 
        config=default_config
    )
    notifs = system.generate(
        progress_status=progress_status,
        last_activity_date=req.last_active_iso,
    )
    
    # 4. Save notifications to Supabase
    alerts = []
    notif_repo = NotificationRepository()
    for n in notifs:
        prio = n.get("priority", "info")
        alert = {
            "message": n.get("body", n.get("message", n.get("title", "Alert"))),
            "priority": "urgent" if prio == "urgent" else "high" if prio == "high" else "warning" if prio == "medium" else "info",
            "days_inactive": n.get("days_inactive", 0),
        }
        alerts.append(alert)
        
        # Persist to DB
        try:
            notif_repo.create_notification(
                user_id=req.user_id,
                notif_type="system_alert",
                title=n.get("title", f"Learning Alert: {alert['priority'].title()}"),
                body=alert["message"],
            )
        except Exception as e:
            logger.warning(f"Failed to save notification: {e}")
    
    return StandardResponse(success=True, data={"alerts": alerts}, error=None)

