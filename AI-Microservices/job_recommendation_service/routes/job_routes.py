"""
Job Recommendation API Routes
FastAPI endpoints for job recommendations using TF-IDF and cosine similarity
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from ..core.job_recommender import JobRecommender

logger = logging.getLogger(__name__)

# Initialize recommender
recommender = JobRecommender()

# Pydantic models
class JobRecommendationRequest(BaseModel):
    """Request model for job recommendations"""
    skills: List[str] = Field(..., description="List of user skills")
    experience_years: Optional[int] = Field(0, description="Years of experience")
    education: Optional[str] = Field("", description="Education level")
    desired_role: Optional[str] = Field("", description="Desired job or target role")
    location: Optional[str] = Field("", description="Preferred location")
    top_n: Optional[int] = Field(10, description="Number of recommendations")

class JobRecommendationResponse(BaseModel):
    """Response model for job recommendations"""
    recommendations: List[Dict[str, Any]] = Field(..., description="List of recommended jobs")
    total_count: int = Field(..., description="Total number of recommendations")

class JobDetailsResponse(BaseModel):
    """Response model for job details"""
    job: Dict[str, Any] = Field(..., description="Job details")

# Create router
router = APIRouter()

@router.post("/recommend-job", response_model=JobRecommendationResponse)
async def recommend_jobs(request: JobRecommendationRequest):
    """
    Get job recommendations based on user profile

    This endpoint uses TF-IDF vectorization and cosine similarity to find
    jobs that match the user's skills, experience, and education.
    """
    try:
        logger.info(f"Processing job recommendation request for skills: {request.skills[:3]}...")

        recommendations = recommender.recommend_jobs(
            user_skills=request.skills,
            user_experience=request.experience_years or 0,
            user_education=request.education or "",
            desired_role=request.desired_role or "",
            top_n=request.top_n or 10
        )

        if not recommendations:
            logger.warning("No recommendations found, returning popular jobs")
            recommendations = recommender.get_popular_jobs(request.top_n or 10)

        return JobRecommendationResponse(
            recommendations=recommendations,
            total_count=len(recommendations)
        )

    except Exception as e:
        logger.error(f"Error in job recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@router.get("/job/{job_id}", response_model=JobDetailsResponse)
async def get_job_details(job_id: int):
    """Get detailed information about a specific job"""
    try:
        job_details = recommender.get_job_details(job_id)

        if job_details is None:
            raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")

        return JobDetailsResponse(job=job_details)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job details: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get job details: {str(e)}")

@router.get("/popular-jobs")
async def get_popular_jobs(
    top_n: int = Query(10, description="Number of popular jobs to return", ge=1, le=50)
):
    """Get popular jobs (fallback recommendations)"""
    try:
        popular_jobs = recommender.get_popular_jobs(top_n)
        return {
            "popular_jobs": popular_jobs,
            "total_count": len(popular_jobs)
        }
    except Exception as e:
        logger.error(f"Error getting popular jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular jobs: {str(e)}")

@router.get("/job-stats")
async def get_job_statistics():
    """Get statistics about the job dataset"""
    try:
        if not recommender.is_initialized or recommender.preprocessor.jobs_df is None:
            raise HTTPException(status_code=503, detail="Job recommender not initialized")

        df = recommender.preprocessor.jobs_df

        stats = {
            "total_jobs": len(df),
            "unique_companies": df['company'].nunique() if 'company' in df.columns else 0,
            "unique_locations": df['location'].nunique() if 'location' in df.columns else 0,
            "avg_salary": df['salary_numeric'].mean() if 'salary_numeric' in df.columns else None,
            "tfidf_features": recommender.preprocessor.tfidf_matrix.shape[1] if recommender.preprocessor.tfidf_matrix is not None else 0
        }

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "job-recommendation",
        "initialized": recommender.is_initialized
    }