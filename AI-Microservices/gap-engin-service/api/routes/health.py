"""
health.py - Health check endpoint for load balancers and monitoring.

GET /health
  Response: {"status": "ok", "service": "gradrag", "version": "1.0.0"}
  Latency: <10ms
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe — returns service status."""
    return {
        "status": "ok",
        "service": "gradrag",
        "version": "1.0.0",
    }
