"""
role_library.py - Maps user-provided skill names to canonical S_* IDs.

Maintains 92+ canonical skill IDs and maps natural language aliases
to their canonical forms. Exact matching only (no fuzzy, no LLM).
"""

import json
import os
import re
from typing import Optional

_SKILLS_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skills_catalog.json")

# Build alias → skillId lookup map at module load time
_alias_map: dict[str, str] = {}
_id_to_name: dict[str, str] = {}
_all_skills: list[dict] = []
_GENERIC_NON_SKILLS = {
    "communication",
    "leadership",
    "teamwork",
    "collaboration",
    "problem solving",
    "work ethic",
    "adaptability",
}


def _load_catalog():
    global _alias_map, _id_to_name, _all_skills
    if _alias_map:
        return  # already loaded

    with open(_SKILLS_CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    if isinstance(catalog, dict):
        skills_data = catalog.get("skills", [])
    elif isinstance(catalog, list):
        skills_data = catalog
    else:
        skills_data = []

    for skill in skills_data:
        skill_id = skill["skillId"]
        name = skill["name"]
        _all_skills.append(skill)
        _id_to_name[skill_id] = name

        # Register each alias (lowercased)
        for alias in skill.get("aliases", []):
            _alias_map[alias.lower().strip()] = skill_id

        # Also register the name itself as an alias
        _alias_map[name.lower().strip()] = skill_id

        # Register skill ID itself (e.g. "S_python" → "S_python")
        _alias_map[skill_id.lower()] = skill_id


def normalize_skill_name(raw: str) -> Optional[str]:
    """
    Normalize a natural language skill name to a canonical S_* ID.

    Args:
        raw: User-provided skill string (e.g. "aws ec2", "Python 3")

    Returns:
        Canonical skill ID (e.g. "S_aws") or None if not found.
    """
    _load_catalog()
    cleaned = raw.lower().strip()
    # Collapse multiple spaces
    cleaned = " ".join(cleaned.split())
    # Remove hyphens (e.g. "machine-learning" → "machine learning")
    cleaned_no_hyphen = cleaned.replace("-", " ")
    if cleaned in _GENERIC_NON_SKILLS or cleaned_no_hyphen in _GENERIC_NON_SKILLS:
        return None

    result = _alias_map.get(cleaned) or _alias_map.get(cleaned_no_hyphen)
    if result:
        return result

    # Fuzzy matching fallback
    try:
        from rapidfuzz import process, fuzz
        compact = re.sub(r"[^a-z0-9]", "", cleaned)
        cutoff = 80 if len(compact) >= 6 else 88
        match = process.extractOne(cleaned, list(_alias_map.keys()), scorer=fuzz.ratio, score_cutoff=cutoff)
        if match:
            return _alias_map[match[0]]
        match2 = process.extractOne(cleaned_no_hyphen, list(_alias_map.keys()), scorer=fuzz.ratio, score_cutoff=85)
        if match2:
            return _alias_map[match2[0]]
    except ImportError:
        pass
    return None


def get_skill_name(skill_id: str) -> str:
    """
    Return human-readable name for a canonical skill ID.

    Args:
        skill_id: Canonical ID like "S_python"

    Returns:
        Human-readable name like "Python", or the skill_id if not found.
    """
    _load_catalog()
    return _id_to_name.get(skill_id, skill_id)


def normalize_skills_list(raw_skills: list[str]) -> tuple[list[str], list[str]]:
    """
    Normalize a list of raw skill strings to canonical IDs.

    Returns:
        (mapped, unmapped) where mapped is list of canonical IDs
        and unmapped is list of strings that couldn't be resolved.
    """
    mapped = []
    unmapped = []
    for raw in raw_skills:
        canonical = normalize_skill_name(raw)
        if canonical:
            if canonical not in mapped:
                mapped.append(canonical)
        else:
            unmapped.append(raw)
    return mapped, unmapped


def get_all_skill_ids() -> list[str]:
    """Return all canonical skill IDs."""
    _load_catalog()
    return list(_id_to_name.keys())


def get_all_skills() -> list[dict]:
    """Return full skill catalog."""
    _load_catalog()
    return _all_skills
