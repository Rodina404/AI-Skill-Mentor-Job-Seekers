"""
health.py - Health check endpoint for load balancers and monitoring.

GET /health
  Response: {"status": "ok", "service": "gap-engine", "version": "1.0.0"}
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe — returns service status."""
    return {
        "status": "ok",
        "service": "gap-engine",
        "version": "1.0.0",
    }
