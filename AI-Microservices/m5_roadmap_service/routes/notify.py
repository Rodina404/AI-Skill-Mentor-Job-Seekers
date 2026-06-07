from fastapi import APIRouter
from schemas import NotifyRequest, StandardResponse
from core.skill_mentor_config import default_config
from core.skill_mentor_data_loaders import DataLoader
from core.skill_mentor_l4_notifications import NotificationSystem

router = APIRouter()

OULAD_THRESHOLDS = None

@router.post("/notify", response_model=StandardResponse)
def generate_notifications(req: NotifyRequest):
    global OULAD_THRESHOLDS
    if not OULAD_THRESHOLDS:
        loader = DataLoader(default_config)
        data = loader.load_all()
        OULAD_THRESHOLDS = data.get("oulad_thresholds", None)

    dummy_roadmap = {"user": req.user_id}
    progress_status_stub = {"overall_pct": req.progress_pct}

    system = NotificationSystem(roadmap=dummy_roadmap, oulad_thresholds=OULAD_THRESHOLDS, config=default_config)
    
    notifs = system.generate(
        progress_status=progress_status_stub, 
        last_activity_date=req.last_active_iso
    )
    
    alerts = []
    for n in notifs:
        prio = n.get("priority", "info")
        alerts.append({
            "message": n.get("message", n.get("title", n.get("text", "Alert"))),
            "priority": "urgent" if prio == "high" else "warning" if prio == "medium" else "info",
            "days_inactive": n.get("days_inactive", 0)
        })

    data = {
        "alerts": alerts
    }
    
    return StandardResponse(success=True, data=data, error=None)
