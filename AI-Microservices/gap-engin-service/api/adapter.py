"""
adapter.py - Bridge between the HTTP API layer and pipeline business logic.

Responsibilities:
  1. Calls pipeline with correct parameters
  2. Enriches output with human-readable skill names
  3. Measures end-to-end processing time
  4. Returns (enriched_result, processing_time_ms)
"""

import time
import logging
from typing import Optional

from src.pipeline import run_pipeline
from src.converters import experience_to_score, education_to_score
from src.role_library import get_skill_name

logger = logging.getLogger(__name__)


def format_skill_name(skill_id: str) -> str:
    """
    Convert canonical skill ID to human-readable name.

    Example: "S_python" → "Python"
    """
    return get_skill_name(skill_id)


def enrich_skills_output(result: dict) -> dict:
    """
    Add human-readable 'skill' field to all skill entries in the result.

    Input:  {"skillId": "S_python", "weight": 0.25}
    Output: {"skillId": "S_python", "skill": "Python", "weight": 0.25}
    """
    def enrich_list(skills: list) -> list:
        enriched = []
        for s in skills:
            if isinstance(s, dict) and "skillId" in s:
                enriched.append({
                    "skillId": s["skillId"],
                    "skill": format_skill_name(s["skillId"]),
                    "weight": s.get("weight", 0.0),
                })
            else:
                enriched.append(s)
        return enriched

    result = dict(result)
    for key in ("requiredSkills", "matchedSkills", "missingSkills"):
        if key in result and isinstance(result[key], list):
            result[key] = enrich_list(result[key])
    return result


def run_role_gap_analysis(
    job_title: str,
    user_skills: Optional[list[str]] = None,
    experience_level: str = "",
    education_level: str = "",
    experience_score: Optional[float] = None,
    education_score: Optional[float] = None,
) -> tuple[dict, int]:
    """
    Main pipeline wrapper for API use.

    Args:
        job_title: Target job title.
        user_skills: List of raw skill strings.
        experience_score: Experience level 0.0–1.0.
        education_score: Education level 0.0–1.0.

    Returns:
        (enriched_result, processing_time_ms)
    """
    start = time.time()

    # Convert natural-language levels to normalized floats for the pipeline
    exp_score = experience_score if experience_score is not None else experience_to_score(experience_level)
    edu_score = education_score if education_score is not None else education_to_score(education_level)

    result = run_pipeline(
        job_title=job_title,
        user_skills=user_skills,
        experience_score=exp_score,
        education_score=edu_score,
    )

    elapsed_ms = int((time.time() - start) * 1000)

    if not result.get("error"):
        result = enrich_skills_output(result)

    logger.info(f"API adapter: '{job_title}' → {result.get('source', 'error')} in {elapsed_ms}ms")
    return result, elapsed_ms
