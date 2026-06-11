"""
role_gap.py - Main role gap analysis endpoint.

POST /run
  Input:  RoleGapRequest (jobTitle + optional userProfile)
  Output: SuccessResponse or ErrorResponse
  Latency: 100-200ms (Mode A) or 2-5s (Mode B)
"""

import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from api.schemas import (
    RoleGapRequest,
    SuccessResponse,
    ErrorResponse,
    ResponseMeta,
    AnalyzeRequest,
    AnalyzeResult,
)
from api.adapter import run_role_gap_analysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/run", tags=["Analysis"])
async def run_role_gap(request: RoleGapRequest):
    """
    Analyze the skill gap for a given job title.

    Runs Mode A (fast local lookup) first; falls back to Mode B (RAG + LLM) if needed.
    """
    # Extract user skills and natural-language levels from profile
    user_skills = []
    experience_level = ""
    education_level = ""
    experience_score = None
    education_score = None

    if request.userProfile:
        user_skills = [s.skillId for s in request.userProfile.skills]
        experience_level = request.userProfile.experienceLevel or ""
        education_level = request.userProfile.educationLevel or ""
        experience_score = request.userProfile.experienceScore
        education_score = request.userProfile.educationScore

    result, processing_time_ms = run_role_gap_analysis(
        job_title=request.jobTitle,
        user_skills=user_skills if user_skills else None,
        experience_level=experience_level,
        education_level=education_level,
        experience_score=experience_score,
        education_score=education_score,
    )

    meta = ResponseMeta(processing_time_ms=processing_time_ms)

    if result.get("error"):
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                error={
                    "code": result.get("errorCode", "PIPELINE_ERROR"),
                    "message": result.get("message", "Pipeline failed."),
                },
                meta=meta,
            ).model_dump(),
        )

    return SuccessResponse(data=result, meta=meta)



@router.post("/analyze-role-gap", tags=["Analysis"] , response_model=SuccessResponse)
async def analyze_role_gap(request: AnalyzeRequest):
    """
    Lightweight analyze endpoint for quick testing and integrations.

    Accepts simple payload with `role`, `skills`, `experience`, and `education`.
    Reuses `run_role_gap_analysis` to ensure identical behavior to the `/run` endpoint.
    """
    result, processing_time_ms = run_role_gap_analysis(
        job_title=request.role,
        user_skills=request.skills if request.skills else None,
        experience_level=request.experience,
        education_level=request.education,
    )

    # Build a stable, minimal response payload
    response_data = {
        "source": result.get("source"),
        "confidence": result.get("roleConfidence") or result.get("confidence") or None,
        "readiness": result.get("readinessScore") or None,
        "required_skills": result.get("requiredSkills", []),
        "matched_skills": result.get("matchedSkills", []),
        "missing_skills": result.get("missingSkills", []),
    }

    meta = ResponseMeta(processing_time_ms=processing_time_ms)
    return SuccessResponse(data=response_data, meta=meta)
