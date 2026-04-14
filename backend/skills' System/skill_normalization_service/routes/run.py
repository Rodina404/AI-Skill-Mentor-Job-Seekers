"""
POST /run endpoint - Skill normalization and profile building.

This route has ZERO business logic - it calls core/pipeline.py and wraps response.
All exceptions are caught and converted to standard error responses.
"""

import logging
import time
from fastapi import APIRouter, HTTPException, status
from schemas import ProfileBuildRequest, SuccessResponse, ErrorResponse
from core.pipeline import SkillNormalizationPipeline

logger = logging.getLogger(__name__)
router = APIRouter()

# Pipeline instance (populated on startup)
pipeline: SkillNormalizationPipeline = None


def set_pipeline(p: SkillNormalizationPipeline):
    """Called from main.py on startup to inject pipeline."""
    global pipeline
    pipeline = p


@router.post("/run", response_model=SuccessResponse)
async def run_normalization(request: ProfileBuildRequest):
    """
    Normalize skills and build user profile.
    
    POST /run - Takes pre-extracted user data and returns structured profile
    with normalized skills.
    
    Args:
        request: ProfileBuildRequest (userId, skills, education, experience)
    
    Returns:
        SuccessResponse with normalized UserProfile
    
    Raises:
        HTTPException(500) if any error occurs
    """
    start_time = time.time()
    
    try:
        if pipeline is None:
            logger.error("Pipeline not initialized - check main.py startup")
            raise ValueError("Service not ready")
        
        # Call pipeline - pure business logic in core/
        result = pipeline.run({
            'userId': request.userId,
            'skills': request.skills,
            'education': request.education.dict() if request.education else {},
            'experience': request.experience.dict() if request.experience else {}
        })
        
        # Wrap in success response
        processing_time_ms = result['processing_time_ms']
        profile = result['profile']
        
        return SuccessResponse(
            success=True,
            data=profile,
            meta={
                'processingTimeMs': processing_time_ms,
                'userId': request.userId
            }
        )
    
    except ValueError as e:
        # Validation error
        logger.warning(f"Validation error for user {request.userId}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                success=False,
                error={
                    'code': 'VALIDATION_ERROR',
                    'message': str(e)
                }
            ).dict()
        )
    
    except Exception as e:
        # Any other error
        logger.error(f"Pipeline error for user {request.userId}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                success=False,
                error={
                    'code': 'INTERNAL_SERVER_ERROR',
                    'message': 'Failed to process skill normalization'
                }
            ).dict()
        )
