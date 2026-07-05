import logging
import time
from typing import Dict, Any

from schemas import JobRecommendationRequest, StandardSuccessResponse, StandardErrorResponse, ErrorDetails, ResponseData, ResponseMeta
from core.job_recommender import JobRecommender
from core.adzuna_client import search as adzuna_search, AdzunaClientError
from core.scorer import score_job

logger = logging.getLogger(__name__)

class JobPipeline:
    def __init__(self, recommender: JobRecommender):
        self.recommender = recommender

    def run(self, request: JobRecommendationRequest) -> Dict[str, Any]:
        """
        Orchestrates the job recommendation process and returns a strict StandardResponse.
        """
        start_time = time.time()
        
        try:
            logger.info(f"Pipeline started for user_id={request.user_id}, job_title={request.job_title}")
            
            query = request.job_title
            location = request.user_profile.location or ""
            top_n = request.top_n or 20
            
            # Fetch from Adzuna API (with 5s timeout & exactly one retry handled in client)
            results = adzuna_search(query=query, location=location, results_per_page=top_n)
            
            user_profile_dict = request.user_profile.model_dump()
            recommendations = []
            
            for idx, raw_job in enumerate(results):
                company_info = raw_job.get("company", {})
                company_name = company_info.get("display_name", "") if isinstance(company_info, dict) else (company_info or "")
                
                location_info = raw_job.get("location", {})
                location_name = location_info.get("display_name", "") if isinstance(location_info, dict) else (location_info or "")
                
                salary_min = raw_job.get("salary_min")
                salary_max = raw_job.get("salary_max")
                if salary_min or salary_max:
                    salary_str = f"${salary_min or '0'} - ${salary_max or '0'}"
                else:
                    salary_str = "Competitive"
                    
                job_mapped = {
                    "id": raw_job.get("id", f"adzuna-{idx}"),
                    "title": raw_job.get("title", ""),
                    "description": raw_job.get("description", ""),
                    "company": company_name,
                    "location": location_name,
                    "url": raw_job.get("redirect_url", ""),
                    "salary": salary_str,
                    "posted": raw_job.get("created", "Recent"),
                }
                
                # Score the job posting
                scoring_result = score_job(user_profile_dict, raw_job)
                job_mapped.update({
                    "score": scoring_result["score"],
                    "breakdown": scoring_result["breakdown"],
                    "explanation": scoring_result["explanation"]
                })
                recommendations.append(job_mapped)
                
            # Sort descending by score
            recommendations.sort(key=lambda x: x["score"], reverse=True)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            success_response = StandardSuccessResponse(
                success=True,
                data=ResponseData(
                    recommendations=recommendations,
                    total_count=len(recommendations)
                ),
                meta=ResponseMeta(
                    processing_time_ms=processing_time_ms,
                    user_id=request.user_id
                )
            )
            return success_response.model_dump()
            
        except AdzunaClientError as e:
            logger.error(f"Adzuna client failed: {str(e)}")
            error_response = StandardErrorResponse(
                success=False,
                error=ErrorDetails(
                    code="ADZUNA_CLIENT_ERROR",
                    message=str(e)
                )
            )
            return error_response.model_dump()
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
