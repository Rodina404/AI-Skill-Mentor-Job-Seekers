"""
Course Recommendation API Routes
FastAPI endpoints for course recommendations using collaborative filtering
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from ..core.course_recommender import CollaborativeCourseRecommender

logger = logging.getLogger(__name__)

# Initialize recommender
recommender = CollaborativeCourseRecommender()

# Pydantic models
class CourseRecommendationRequest(BaseModel):
    """Request model for course recommendations"""
    user_id: Optional[int] = Field(None, description="Existing user ID for user-based filtering")
    user_ratings: Optional[Dict[int, float]] = Field(None, description="User ratings for item-based filtering")
    skills: Optional[List[str]] = Field(None, description="Current skills or missing skills for profile-based recommendations")
    desired_role: Optional[str] = Field(None, description="Desired role or focus area for course recommendations")
    top_n: Optional[int] = Field(10, description="Number of recommendations")

class CourseRecommendationResponse(BaseModel):
    """Response model for course recommendations"""
    recommendations: List[Dict[str, Any]] = Field(..., description="List of recommended courses")
    total_count: int = Field(..., description="Total number of recommendations")
    recommendation_type: str = Field(..., description="Type of recommendation algorithm used")

class CourseDetailsResponse(BaseModel):
    """Response model for course details"""
    course: Dict[str, Any] = Field(..., description="Course details")

# Create router
router = APIRouter()

@router.post("/recommend-course", response_model=CourseRecommendationResponse)
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Get course recommendations using collaborative filtering

    This endpoint uses collaborative filtering to find courses that users
    with similar preferences have enjoyed. Supports both user-based and
    item-based filtering approaches.
    """
    try:
        # Determine recommendation mode
        if request.user_id is not None:
            recommendation_type = "user-based"
        elif request.user_ratings is not None:
            recommendation_type = "item-based"
        elif request.skills or request.desired_role:
            recommendation_type = "profile-based"
        else:
            recommendation_type = "popular"

        # Get recommendations
        recommendations = recommender.recommend_courses(
            user_id=request.user_id,
            user_ratings=request.user_ratings,
            skills=request.skills,
            target_role=request.desired_role or "",
            top_n=request.top_n or 10
        )

        if not recommendations:
            logger.warning("No recommendations generated, this might indicate data issues")

        return CourseRecommendationResponse(
            recommendations=recommendations,
            total_count=len(recommendations),
            recommendation_type=recommendation_type
        )

    except Exception as e:
        logger.error(f"Error in course recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@router.get("/course/{course_id}", response_model=CourseDetailsResponse)
async def get_course_details(course_id: int):
    """Get detailed information about a specific course"""
    try:
        course_details = recommender._get_course_details(course_id)

        if course_details is None:
            raise HTTPException(status_code=404, detail=f"Course with ID {course_id} not found")

        return CourseDetailsResponse(course=course_details)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course details: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get course details: {str(e)}")

@router.get("/popular-courses")
async def get_popular_courses(
    top_n: int = Query(10, description="Number of popular courses to return", ge=1, le=50)
):
    """Get popular courses (fallback recommendations)"""
    try:
        popular_courses = recommender._get_popular_courses(top_n)
        return {
            "popular_courses": popular_courses,
            "total_count": len(popular_courses)
        }
    except Exception as e:
        logger.error(f"Error getting popular courses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular courses: {str(e)}")

@router.get("/course-stats")
async def get_course_statistics():
    """Get statistics about the course dataset and recommendation system"""
    try:
        if not recommender.is_initialized or recommender.preprocessor.courses_df is None:
            raise HTTPException(status_code=503, detail="Course recommender not initialized")

        df = recommender.preprocessor.courses_df

        stats = {
            "total_courses": len(df),
            "total_users": len(recommender.preprocessor.user_mapper) if recommender.preprocessor.user_mapper else 0,
            "total_interactions": len(recommender.preprocessor.interactions_df) if recommender.preprocessor.interactions_df is not None else 0,
            "avg_rating": df['rating'].mean() if 'rating' in df.columns else None,
            "unique_categories": df['category'].nunique() if 'category' in df.columns else 0,
            "matrix_shape": list(recommender.preprocessor.user_item_matrix.shape) if recommender.preprocessor.user_item_matrix is not None else None
        }

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "course-recommendation",
        "initialized": recommender.is_initialized
    }