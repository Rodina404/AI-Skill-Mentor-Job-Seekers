"""
gap_engine.py - Computes skill matching and readiness scoring.

Given required skills (from Mode A or B) and user's skills,
categorizes into matched/missing and calculates a readiness score.

Readiness = (skill_score × 0.5) + (experience_score × 0.3) + (education_score × 0.2)
Range: 0.0 (unready) → 1.0 (fully ready)
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def compute_skill_gap(
    required_skills: list[dict],
    user_skill_ids: list[str],
) -> dict:
    """
    Compare user skills against required skills.

    Args:
        required_skills: List of {"skillId": str, "weight": float}
        user_skill_ids: List of canonical skill IDs the user has.

    Returns:
        Dict with matched_skills, missing_skills, skill_score.
    """
    user_set = set(user_skill_ids)
    matched = []
    missing = []
    total_weight = sum(s.get("weight", 0) for s in required_skills)

    for skill in required_skills:
        sid = skill["skillId"]
        weight = skill.get("weight", 0)
        if sid in user_set:
            matched.append(skill)
        else:
            missing.append(skill)

    matched_weight = sum(s.get("weight", 0) for s in matched)
    skill_score = matched_weight / total_weight if total_weight > 0 else 0.0

    return {
        "matchedSkills": matched,
        "missingSkills": missing,
        "skillScore": round(skill_score, 4),
    }


def compute_readiness_score(
    skill_score: float,
    experience_score: float = 1.0,
    education_score: float = 1.0,
) -> float:
    """
    Compute overall readiness score as a weighted sum of components.

    Weights: skills 50%, experience 30%, education 20%.

    Args:
        skill_score: Fraction of required skills matched (0.0–1.0).
        experience_score: Normalized experience score (0.0–1.0).
        education_score: Normalized education score (0.0–1.0).

    Returns:
        Readiness score in [0.0, 1.0].
    """
    # Clamp inputs
    skill_score = min(max(skill_score, 0.0), 1.0)
    experience_score = min(max(experience_score, 0.0), 1.0)
    education_score = min(max(education_score, 0.0), 1.0)

    readiness = (skill_score * 0.5) + (experience_score * 0.3) + (education_score * 0.2)
    return round(min(max(readiness, 0.0), 1.0), 4)


def run_gap_analysis(
    required_skills: list[dict],
    user_skill_ids: list[str],
    experience_score: float = 1.0,
    education_score: float = 1.0,
) -> dict:
    """
    Full gap analysis: matched/missing skills + readiness score.

    Args:
        required_skills: List of {"skillId": str, "weight": float}
        user_skill_ids: Canonical skill IDs the user has.
        experience_score: 0.0–1.0 (default 1.0 = unspecified / not penalized).
        education_score: 0.0–1.0 (default 1.0 = unspecified).

    Returns:
        Gap analysis dict.
    """
    gap = compute_skill_gap(required_skills, user_skill_ids)
    readiness = compute_readiness_score(
        gap["skillScore"],
        experience_score=experience_score,
        education_score=education_score,
    )

    logger.debug(
        f"Gap analysis: skill_score={gap['skillScore']}, "
        f"exp={experience_score}, edu={education_score}, readiness={readiness}"
    )

    return {
        "matchedSkills": gap["matchedSkills"],
        "missingSkills": gap["missingSkills"],
        "skillScore": gap["skillScore"],
        "readinessScore": readiness,
    }
