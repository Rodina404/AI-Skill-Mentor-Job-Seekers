from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    """Liveness probe — returns service status."""
    return {"status": "ok", "service": "cv-extraction", "version": "1.0.0"}
