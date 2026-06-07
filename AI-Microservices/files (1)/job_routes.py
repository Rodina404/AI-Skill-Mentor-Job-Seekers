"""
Job recommendation routes.
Uses module-level init pattern (called from main.py lifespan).
"""
from fastapi import APIRouter, HTTPException
from schemas import (
    JobRecommendationRequest,
    JobRecommendationResponse,
    JobItem
)
from core.job_recommender import JobRecommender
import os

router = APIRouter(tags=["jobs"])

_recommender: JobRecommender = None

async def init_recommender():
    """Called from main.py lifespan — initializes the recommender once."""
    global _recommender
    data_path = os.getenv("DATA_PATH", "./data")
    _recommender = JobRecommender(data_path=data_path)
    _recommender.initialize()

def get_recommender() -> JobRecommender:
    if _recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized yet")
    return _recommender

# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/recommend-job", response_model=JobRecommendationResponse)
async def recommend_jobs(request: JobRecommendationRequest):
    """
    Returns job recommendations based on user's skills and readiness score.
    Input comes from gap_engine + skill_normalization output.
    """
    rec = get_recommender()
    try:
        results = rec.recommend_by_skills(
            user_skills=request.normalized_skills,
            target_role=request.target_role,
            readiness_score=request.readiness_score,
            top_k=request.top_k
        )
        jobs = [
            JobItem(
                job_id=str(r.get("job_id", "")),
                title=r.get("title", ""),
                company=r.get("company"),
                location=r.get("location"),
                required_skills=r.get("required_skills", []),
                match_score=float(r.get("score", 0.0)),
                readiness_fit=r.get("readiness_fit"),
                description_snippet=r.get("description", "")[:200] if r.get("description") else None
            )
            for r in results
        ]
        return JobRecommendationResponse(
            user_id=request.user_id,
            user_skills=request.normalized_skills,
            readiness_score=request.readiness_score,
            recommendations=jobs,
            total_found=len(jobs)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}")
async def get_job(job_id: str):
    rec = get_recommender()
    job = rec.get_job_details(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/popular-jobs")
async def get_popular_jobs(top_k: int = 10):
    rec = get_recommender()
    return {"jobs": rec.get_popular_jobs(top_k=top_k)}

@router.get("/job-stats")
async def get_stats():
    rec = get_recommender()
    return rec.get_stats()
