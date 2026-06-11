"""
pipeline.py - 2-stage orchestration engine for GradRAG.

Coordinates Mode A (fast local lookup) and Mode B (RAG fallback).
Normalizes job titles, decides which mode to use, generates final skill gap response.

Flow:
  job_title → normalize → Mode A → (match? YES → return) + (NO → Mode B)
                                    → (evidence? YES → return) + (NO → error)
"""

import logging
import re
from typing import Optional

from src.loaders import find_best_match
from src.role_library import normalize_skill_name, normalize_skills_list, get_skill_name
from src.gap_engine import run_gap_analysis
from src.retrieval_helpers import gather_evidence, normalize_weights
from src.llm import extract_skills_from_evidence

logger = logging.getLogger(__name__)
MODE_A_CORE_SKILL_LIMIT = 6


def _normalize_job_title(title: str) -> str:
    """Clean and normalize job title for matching."""
    return title.strip().lower()


def _build_response(
    job_title: str,
    required_skills: list[dict],
    user_skill_ids: list[str],
    unknown_skills: list[str],
    role_confidence: float,
    source: str,
    experience_score: float = 1.0,
    education_score: float = 1.0,
) -> dict:
    """Assemble final response dict matching the requested schema.

    Output fields: jobTitle, requiredSkills, matchedSkills, missingSkills,
    readinessScore, roleConfidence
    """
    gap = run_gap_analysis(
        required_skills=required_skills,
        user_skill_ids=user_skill_ids,
        experience_score=experience_score,
        education_score=education_score,
    )

    return {
        "jobTitle": job_title,
        "source": source,
        "requiredSkills": required_skills,
        "matchedSkills": gap["matchedSkills"],
        "missingSkills": gap["missingSkills"],
        "readinessScore": gap["readinessScore"],
        "roleConfidence": round(role_confidence, 4),
        "unknownSkills": unknown_skills,
    }


def _mode_a(job_title: str) -> Optional[tuple[list[dict], float, str]]:
    """
    Attempt Mode A: local knowledge-base lookup.

    Returns:
        (required_skills, confidence, match_type) or None.
    """
    result = find_best_match(job_title)
    if result is None:
        return None
    role, confidence, match_type = result
    skills = sorted(
        role.get("requiredSkills", []),
        key=lambda skill: skill.get("weight", 0.0),
        reverse=True,
    )[:MODE_A_CORE_SKILL_LIMIT]
    return normalize_weights([dict(skill) for skill in skills]), confidence, match_type


def _mode_b(job_title: str) -> Optional[list[dict]]:
    """
    Attempt Mode B: RAG fallback via Adzuna + Chroma + Groq.

    Returns:
        List of required skill dicts or None on failure.
    """
    evidence, has_evidence = gather_evidence(job_title)
    if not has_evidence:
        logger.warning(f"Mode B: No evidence for '{job_title}'")
        return None

    raw_skills = extract_skills_from_evidence(job_title, evidence)
    if not raw_skills:
        logger.warning(f"Mode B: LLM returned no valid skills for '{job_title}'")
        return None

    # Normalize skill IDs from LLM output
    normalized_by_id = {}
    for skill in raw_skills:
        sid = skill["skillId"]
        # Try to map to canonical ID
        canonical = normalize_skill_name(sid.replace("S_", "").replace("_", " "))
        if canonical:
            sid = canonical
        if not canonical:
            continue
        entry = {
            "skillId": sid,
            "weight": skill.get("weight", 0.1),
        }
        normalized_by_id[sid] = entry

    normalized = list(normalized_by_id.values())[:6]
    if not normalized:
        return None

    # Normalize weights to sum to 1.0
    normalized = normalize_weights(normalized)
    return normalized


def run_pipeline(
    job_title: str,
    user_skills: Optional[list[str]] = None,
    user_profile: Optional[dict] = None,
    metadata: Optional[dict] = None,
    experience_score: float = 1.0,
    education_score: float = 1.0,
) -> dict:
    """
    Main pipeline entry point.

    Runs Mode A first, falls back to Mode B if needed.

    Args:
        job_title: Raw job title string.
        user_skills: List of raw skill strings the user has (optional).
        experience_score: Experience level score 0.0–1.0 (default 1.0).
        education_score: Education level score 0.0–1.0 (default 1.0).

    Returns:
        Result dict with jobTitle, requiredSkills, matchedSkills,
        missingSkills, readinessScore, roleConfidence, source, unknownSkills.
        On failure returns an error dict.
    """
    if not isinstance(job_title, str) or not job_title.strip():
        return {
            "error": True,
            "errorCode": "INVALID_JOB_TITLE",
            "message": "jobTitle must be a non-empty role title.",
            "jobTitle": job_title,
            "source": "none",
        }

    cleaned_title = job_title.strip()
    if (
        len(cleaned_title) > 200
        or cleaned_title.lower() in {"null", "none", "undefined", "n/a"}
        or not re.search(r"[A-Za-z]", cleaned_title)
    ):
        return {
            "error": True,
            "errorCode": "INVALID_JOB_TITLE",
            "message": "jobTitle must be a recognizable role title of at most 200 characters.",
            "jobTitle": job_title,
            "source": "none",
        }

    # Extract user skills from `user_profile.skills[]` (skillId) or `user_skills` list
    combined_user_inputs = []
    if user_profile and isinstance(user_profile, dict):
        for s in user_profile.get("skills", []) or []:
            if isinstance(s, dict):
                sid = s.get("skillId") or s.get("id") or s.get("skill_id")
                if isinstance(sid, str):
                    combined_user_inputs.append(sid)
            elif isinstance(s, str):
                combined_user_inputs.append(s)

    if user_skills:
        combined_user_inputs.extend([s for s in user_skills if isinstance(s, str)])

    user_skill_ids = []
    unknown_skills = []
    if combined_user_inputs:
        user_skill_ids, unknown_skills = normalize_skills_list(combined_user_inputs)

    logger.info(f"Pipeline running for '{job_title}' | user_skills={len(user_skill_ids)}")

    # --- MODE A ---
    # Use metadata (seniority/location/industry) to improve Mode A matching when provided
    match_title = job_title
    if metadata and isinstance(metadata, dict):
        parts = []
        seniority = metadata.get("seniority")
        industry = metadata.get("industry")
        location = metadata.get("location")
        if seniority and isinstance(seniority, str):
            parts.append(seniority)
        if industry and isinstance(industry, str):
            parts.append(industry)
        if location and isinstance(location, str):
            parts.append(location)
        if parts:
            match_title = " ".join(parts + [job_title])

    mode_a_result = _mode_a(match_title)
    if mode_a_result:
        required_skills, confidence, match_type = mode_a_result
        if required_skills:
            logger.info(f"Mode A success for '{job_title}' ({match_type}, conf={confidence:.3f})")
            return _build_response(
                job_title=job_title,
                required_skills=required_skills,
                user_skill_ids=user_skill_ids,
                unknown_skills=unknown_skills,
                role_confidence=confidence,
                source="mode_a",
                experience_score=experience_score,
                education_score=education_score,
            )
        else:
            # Role was found but contained no normalized skills — log and fall back to Mode B
            logger.warning(
                f"Mode A found role for '{job_title}' ({match_type}) but no normalized required skills were present; falling back to Mode B."
            )

    # --- MODE B ---
    logger.info(f"Mode A failed for '{job_title}'. Trying Mode B...")
    mode_b_skills = _mode_b(match_title)
    if mode_b_skills:
        logger.info(f"Mode B success for '{job_title}' with {len(mode_b_skills)} skills")
        return _build_response(
            job_title=job_title,
            required_skills=mode_b_skills,
            user_skill_ids=user_skill_ids,
            unknown_skills=unknown_skills,
            role_confidence=0.65,  # Mode B is inherently less certain
            source="mode_b",
            experience_score=experience_score,
            education_score=education_score,
        )

    # --- FAIL-SAFE ---
    logger.error(f"Both Mode A and Mode B failed for '{job_title}'")
    message = (
        f"Could not determine required skills for job title: '{job_title}'. "
        "Mode A found no role and Mode B found no usable evidence or skills. "
        "Try a more descriptive job title or check the optional external API credentials."
    )

    return {
        "error": True,
        "errorCode": "NO_MATCH_FOUND",
        "message": message,
        "jobTitle": job_title,
        "source": "none",
    }
