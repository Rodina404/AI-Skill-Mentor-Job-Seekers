import time
from fastapi import APIRouter
from schemas import CourseRecommendationRequest, CourseRecommendationResponse, ErrorResponse
import sys
import os

# Ensure core is importable
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from core.pipeline import run_recommendation_pipeline

router = APIRouter()


def _normalize_course(c: dict) -> dict:
    """Convert camelCase course dict from pipeline to snake_case for Pydantic."""
    return {
        "course_id": c.get("courseId", c.get("course_id", "")),
        "title": c.get("title", ""),
        "url": c.get("url"),
        "score": c.get("score", 0.0),
        "duration": c.get("duration", 0.0),
        "provider": c.get("provider", ""),
        "level": c.get("level", ""),
        "language": c.get("language", ""),
    }


def _normalize_recommendations(raw: list) -> list:
    """Convert camelCase pipeline output to snake_case for Pydantic response model."""
    result = []
    for item in raw:
        result.append({
            "skill_id": item.get("skillId", item.get("skill_id", "")),
            "skill_name": item.get("skillName", item.get("skill_name", "")),
            "courses": [_normalize_course(c) for c in item.get("courses", [])],
        })
    return result


@router.post("/run", response_model=CourseRecommendationResponse, responses={500: {"model": ErrorResponse}})
async def run_recommendations(req: CourseRecommendationRequest):
    try:
        start_time = time.time()

        # Call pure Python orchestrator component
        raw_recommendations = run_recommendation_pipeline(
            missing_skills=[s.model_dump() for s in req.missing_skills],
            user_constraints=req.user_constraints.model_dump() if req.user_constraints else {}
        )

        processing_time_ms = int((time.time() - start_time) * 1000)

        return {
            "success": True,
            "data": {
                "recommendations": _normalize_recommendations(raw_recommendations)
            },
            "meta": {
                "processing_time_ms": processing_time_ms,
                "user_id": req.user_id
            }
        }
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": str(e)
                }
            }
        )
