from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Standard GET /health for orchestration monitoring.
    """
    return {
        "status": "ok",
        "service": "job_recommendation",
        "version": "1.0.0"
    }
