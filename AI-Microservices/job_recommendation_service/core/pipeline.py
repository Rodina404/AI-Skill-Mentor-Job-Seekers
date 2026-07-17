import logging
import time
from typing import Dict, Any

from schemas import JobRecommendationRequest, StandardSuccessResponse, StandardErrorResponse, ErrorDetails, ResponseData, ResponseMeta
from core.adzuna_client import AdzunaJobProvider
from core.job_recommender import JobRecommender

logger = logging.getLogger(__name__)

class JobPipeline:
    def __init__(self, recommender: JobRecommender):
        self.recommender = recommender
        self.adzuna_provider = AdzunaJobProvider()

    def run(self, request: JobRecommendationRequest) -> Dict[str, Any]:
        """
        Orchestrates the job recommendation process and returns a strict StandardResponse.
        """
        start_time = time.time()
        
        try:
            logger.info(f"Pipeline started for user_id={request.user_id}, job_title={request.job_title}")
            
            # Map request to core module inputs
            user_skills = request.user_profile.skills
            gap_matched_skills = request.skill_gap.matched_skills if request.skill_gap else []
            search_skills = gap_matched_skills or user_skills
            user_experience = request.user_profile.experience_years or 0
            user_education = request.user_profile.education or ""
            desired_role = request.job_title

            if self.adzuna_provider.is_configured:
                logger.info("Adzuna configured; fetching external recommendations")
            else:
                logger.info("Adzuna not configured; skipping external recommendations")

            recommendations = self.adzuna_provider.recommend_jobs(
                user_skills=search_skills,
                desired_role=desired_role,
                location=request.user_profile.location or "",
                top_n=request.top_n,
                readiness_score=request.skill_gap.readiness_score if request.skill_gap else None,
            )

            recommendation_source = "adzuna" if recommendations else "local"
            warning = None if recommendations else self.adzuna_provider.last_error

            if not recommendations:
                if not self.recommender.is_initialized:
                    logger.warning("Local recommender not initialized; attempting initialization for fallback")
                    if not self.recommender.initialize():
                        initialization_reason = self.recommender.initialization_error or "unknown"
                        logger.error("Local recommender initialization failed: %s", initialization_reason)
                        raise RuntimeError(
                            f"No job recommendations are available. Adzuna: {warning or 'no results'}. "
                            f"Local fallback: {initialization_reason}"
                        )

                recommendations = self.recommender.recommend_jobs(
                    user_skills=user_skills,
                    user_experience=user_experience,
                    user_education=user_education,
                    desired_role=desired_role,
                    top_n=request.top_n
                )

            if not recommendations:
                logger.warning("No recommendations found, falling back to popular jobs")
                recommendations = self.recommender.get_popular_jobs(request.top_n)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            success_response = StandardSuccessResponse(
                success=True,
                data=ResponseData(
                    recommendations=recommendations,
                    total_count=len(recommendations)
                ),
                meta=ResponseMeta(
                    processing_time_ms=processing_time_ms,
                    user_id=request.user_id,
                    recommendation_source=recommendation_source,
                    warning=warning,
                )
            )
            return success_response.model_dump()
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}", exc_info=True)
            error_response = StandardErrorResponse(
                success=False,
                error=ErrorDetails(
                    code="PIPELINE_ERROR",
                    message=str(e)
                )
            )
            return error_response.model_dump()
