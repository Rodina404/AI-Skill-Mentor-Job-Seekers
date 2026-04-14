from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "service": "CV Matching & Job Scoring Service",
        "version": "1.0.0"
    }
