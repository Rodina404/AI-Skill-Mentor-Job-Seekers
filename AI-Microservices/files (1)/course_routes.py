"""
Course recommendation routes.
Replaces deprecated @router.on_event with module-level init function
called from main.py lifespan context manager.
"""
from fastapi import APIRouter, HTTPException
from schemas import (
    CourseRecommendationRequest,
    CourseRecommendationResponse,
    CourseItem,
    RateCourseRequest
)
from core.course_recommender import CollaborativeCourseRecommender
import os

router = APIRouter(tags=["courses"])

# Module-level recommender instance
_recommender: CollaborativeCourseRecommender = None

async def init_recommender():
    """Called from main.py lifespan — initializes the recommender once."""
    global _recommender
    data_path = os.getenv("DATA_PATH", "./data")
    _recommender = CollaborativeCourseRecommender(data_path=data_path)
    _recommender.initialize()

def get_recommender() -> CollaborativeCourseRecommender:
    if _recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized yet")
    return _recommender

# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/recommend-course", response_model=CourseRecommendationResponse)
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Returns course recommendations based on missing skills.
    Input comes from gap_engine output.
    """
    rec = get_recommender()
    try:
        results = rec.recommend_by_skills(
            missing_skills=request.missing_skills,
            target_role=request.target_role,
            top_k=request.top_k,
            user_id=request.user_id
        )
        courses = [
            CourseItem(
                course_id=str(r.get("course_id", "")),
                title=r.get("title", ""),
                provider=r.get("provider"),
                url=r.get("url"),
                skills_covered=r.get("skills_covered", []),
                difficulty=r.get("difficulty"),
                duration_hours=r.get("duration_hours"),
                relevance_score=float(r.get("score", 0.0))
            )
            for r in results
        ]
        return CourseRecommendationResponse(
            user_id=request.user_id,
            missing_skills=request.missing_skills,
            recommendations=courses,
            total_found=len(courses)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/course/{course_id}")
async def get_course(course_id: str):
    rec = get_recommender()
    course = rec.get_course_details(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/popular-courses")
async def get_popular_courses(top_k: int = 10):
    rec = get_recommender()
    return {"courses": rec.get_popular_courses(top_k=top_k)}

@router.get("/course-stats")
async def get_stats():
    rec = get_recommender()
    return rec.get_stats()

@router.post("/rate-course")
async def rate_course(request: RateCourseRequest):
    rec = get_recommender()
    rec.add_rating(
        user_id=request.user_id,
        course_id=request.course_id,
        rating=request.rating
    )
    return {"message": "Rating recorded", "course_id": request.course_id}
