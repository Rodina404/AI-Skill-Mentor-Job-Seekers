from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any

from schemas import CourseRecommendationRequest, StandardErrorResponse, ErrorDetails
from core.pipeline import CoursePipeline
from core.course_recommender import CourseRecommender

logger = logging.getLogger(__name__)

router = APIRouter()
recommender = CourseRecommender()
pipeline = CoursePipeline(recommender)

@router.post("/run")
async def run_course_recommendation(request: CourseRecommendationRequest) -> Dict[str, Any]:
    """
    Standardized POST /run endpoint for Node.js microservice architecture.
    Zero business logic. Passes request to core pipeline and returns StandardResponse.
    """
    try:
        if not recommender.is_initialized:
            # Try to initialize if not ready
            recommender.initialize()
            
        result = pipeline.run(request)
        if not result.get("success"):
            return JSONResponse(status_code=500, content=result)
        return result
    except Exception as e:
        logger.error(f"Critical route error: {str(e)}", exc_info=True)
        error_response = StandardErrorResponse(
            success=False,
            error=ErrorDetails(code="ROUTE_ERROR", message="Internal Server Error")
        )
        return JSONResponse(status_code=500, content=error_response.model_dump())
