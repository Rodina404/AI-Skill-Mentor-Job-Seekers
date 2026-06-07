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

@router.on_event("startup")
async def startup_event():
    """Initialize the course recommender on startup"""
    if not recommender.initialize():
        logger.error("Failed to initialize course recommender")
        raise RuntimeError("Course recommender initialization failed")

@router.post("/recommend-course", response_model=CourseRecommendationResponse)
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Get course recommendations using collaborative filtering

    This endpoint uses collaborative filtering to find courses that users
    with similar preferences have enjoyed. Supports both user-based and
    item-based filtering approaches.
    """
    try:
        if request.user_id is not None:
            logger.info(f"Processing user-based course recommendation for user {request.user_id}")
            recommendation_type = "user-based"
        elif request.user_ratings is not None:
            logger.info(f"Processing item-based course recommendation with {len(request.user_ratings)} ratings")
            recommendation_type = "item-based"
        else:
            logger.info("Processing popular courses recommendation")
            recommendation_type = "popular"

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
            "matrix_shape": recommender.preprocessor.user_item_matrix.shape if recommender.preprocessor.user_item_matrix is not None else None
        }

        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.post("/rate-course")
async def rate_course(user_id: int, course_id: int, rating: float = Query(..., ge=1.0, le=5.0)):
    """
    Record a course rating from a user

    Note: In a production system, this would update the user-item matrix
    and potentially retrain the recommendation model.
    """
    try:
        # Validate inputs
        if not recommender.is_initialized:
            raise HTTPException(status_code=503, detail="Course recommender not initialized")

        if user_id not in recommender.preprocessor.user_mapper:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        if course_id not in recommender.preprocessor.item_mapper:
            raise HTTPException(status_code=404, detail=f"Course {course_id} not found")

        # In a real system, this would update the database/matrix
        # For now, just acknowledge the rating
        logger.info(f"Recorded rating {rating} for user {user_id} on course {course_id}")

        return {
            "message": "Rating recorded successfully",
            "user_id": user_id,
            "course_id": course_id,
            "rating": rating
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording course rating: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record rating: {str(e)}")


@router.post('/debug-init-course')
async def debug_initialize_course(reinitialize: bool = False):
    """Debug endpoint to force course recommender initialization and report model files"""
    try:
        if reinitialize:
            recommender.is_initialized = False

        ok = recommender.initialize()

        model_path = recommender.model_path if hasattr(recommender, 'model_path') else 'models'
        from pathlib import Path
        files = []
        p = Path(model_path)
        if p.exists():
            files = [str(x.name) for x in p.iterdir()]

        return {
            'initialized': ok and recommender.is_initialized,
            'model_path': str(model_path),
            'files': files
        }

    except Exception as e:
        logger.error(f"Debug init failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/debug-recommend')
async def debug_recommend(skills: Optional[List[str]] = None, target_role: str = "", top_n: int = 5):
    """Return server-side recommendations using the running recommender instance"""
    try:
        if not recommender.is_initialized:
            raise HTTPException(status_code=503, detail="Course recommender not initialized")

        recs = recommender.recommend_courses(skills=skills or [], target_role=target_role or "", top_n=top_n)
        return { 'count': len(recs), 'recommendations': recs }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Debug recommend failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))