"""
GET /health endpoint - Service health check.
"""

from fastapi import APIRouter
from schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Called by Node.js backend on startup to verify service is running.
    
    Returns:
        {status: ok, service: name, version: string}
    """
    return {
        "status": "ok",
        "service": "Skill Normalization & User Profile Building",
        "version": "1.0.0"
    }
