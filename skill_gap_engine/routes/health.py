from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_endpoint():
    return {"status": "ok", "service": "skill_gap_engine", "version": "1.0.0"}