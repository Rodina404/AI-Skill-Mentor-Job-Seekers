import logging
import time
from typing import Dict, Any

from schemas import CourseRecommendationRequest, StandardSuccessResponse, StandardErrorResponse, ErrorDetails, ResponseData, ResponseMeta
from core.course_recommender import CourseRecommender

logger = logging.getLogger(__name__)

class CoursePipeline:
    def __init__(self, recommender: CourseRecommender):
        self.recommender = recommender

    def run(self, request: CourseRecommendationRequest) -> Dict[str, Any]:
        """
        Orchestrates the course recommendation process and returns a strict StandardResponse.
        """
        start_time = time.time()
        
        try:
            logger.info(f"Course pipeline started for user_id={request.user_id}, job_title={request.job_title}")
            
            # Map request to core module inputs
            user_skills = request.user_profile.skills
            target_role = request.job_title
            
            # Semantic search using FAISS
            recommendations = self.recommender.recommend_courses(
                user_skills=user_skills,
                target_role=target_role,
                top_n=request.top_n
            )
            
            if not recommendations:
                logger.warning("No recommendations found")
                recommendations = []
                rec_type = "popular"
            else:
                rec_type = "hybrid-semantic"
                
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            success_response = StandardSuccessResponse(
                success=True,
                data=ResponseData(
                    recommendations=recommendations,
                    total_count=len(recommendations),
                    recommendation_type=rec_type
                ),
                meta=ResponseMeta(
                    processing_time_ms=processing_time_ms,
                    user_id=request.user_id
                )
            )
            return success_response.model_dump()
            
        except Exception as e:
            logger.error(f"Course pipeline failed: {str(e)}", exc_info=True)
            error_response = StandardErrorResponse(
                success=False,
                error=ErrorDetails(
                    code="PIPELINE_ERROR",
                    message=str(e)
                )
            )
            return error_response.model_dump()
