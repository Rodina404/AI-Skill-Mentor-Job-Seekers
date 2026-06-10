"""
loaders.py - Data loading & indexing for Mode A fast lookup.

Loads 89 pre-curated roles, builds a searchable title index,
and computes sentence embeddings for semantic matching.
Uses sentence-transformers/all-MiniLM-L6-v2 model.
"""

import json
import os
import re
import logging
from typing import Optional

from src.role_library import normalize_skill_name

logger = logging.getLogger(__name__)
os.environ.setdefault("TRANSFORMERS_NO_TORCHVISION", "1")
os.environ.setdefault("USE_TORCHVISION", "0")

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Cached state
_roles: list[dict] = []
_title_index: dict[str, dict] = {}  # normalized_title → role
_embeddings = None   # np.ndarray of shape (n_roles, embedding_dim)
_model = None        # SentenceTransformer instance


def _normalize_title(title: str) -> str:
    """Lowercase, strip, collapse spaces, remove punctuation."""
    title = title.lower().strip()
    title = re.sub(r"[^a-z0-9 ]", " ", title)
    title = " ".join(title.split())
    return title


def _normalize_skill_weights(skills: list[dict]) -> list[dict]:
    total = sum(s.get("weight", 0) for s in skills)
    if total <= 0:
        if not skills:
            return skills
        weight = round(1.0 / len(skills), 4)
        for s in skills:
            s["weight"] = weight
        return skills
    for s in skills:
        s["weight"] = round(s.get("weight", 0) / total, 4)
    return skills


def _make_skill_entry(raw_skill) -> Optional[dict]:
    if isinstance(raw_skill, dict):
        skill_id = raw_skill.get("skillId") or raw_skill.get("skill_id") or raw_skill.get("id")
        weight = raw_skill.get("weight", 1.0)
        if not isinstance(skill_id, str):
            return None
    elif isinstance(raw_skill, str):
        skill_id = raw_skill
        weight = 1.0
    else:
        return None

    skill_id = skill_id.strip()
    if not skill_id:
        return None

    # Canonicalize both raw names and legacy alias-style S_* identifiers.
    canonical = normalize_skill_name(skill_id)
    if not canonical and skill_id.startswith("S_"):
        canonical = normalize_skill_name(skill_id[2:].replace("_", " "))
    if canonical:
        skill_id = canonical
    elif not skill_id.startswith("S_"):
        # Skill not recognized; skip it but allow role to be added if other skills map.
        return None

    return {"skillId": skill_id, "weight": float(weight)}


def _normalize_required_skills(raw_skills) -> list[dict]:
    by_skill_id: dict[str, dict] = {}
    if not isinstance(raw_skills, list):
        return []
    for raw in raw_skills:
        entry = _make_skill_entry(raw)
        if entry:
            skill_id = entry["skillId"]
            if skill_id in by_skill_id:
                by_skill_id[skill_id]["weight"] += entry["weight"]
            else:
                by_skill_id[skill_id] = entry
    return _normalize_skill_weights(list(by_skill_id.values()))


def _extract_roles_from_data(data) -> list[dict]:
    if isinstance(data, dict):
        if "roles" in data and isinstance(data["roles"], list):
            data = data["roles"]
        else:
            return []

    if not isinstance(data, list):
        return []

    extracted = []
    for entry in data:
        if not isinstance(entry, dict):
            continue

        title = entry.get("title") or entry.get("jobTitle") or entry.get("role_title")
        if not isinstance(title, str) or not title.strip():
            continue

        raw_skills = []
        if "requiredSkills" in entry:
            raw_skills = entry["requiredSkills"]
        elif "required_skills" in entry:
            raw_skills = entry["required_skills"]
        elif entry.get("must_have") or entry.get("optional"):
            raw_skills = list(entry.get("must_have", [])) + list(entry.get("optional", []))

        required_skills = _normalize_required_skills(raw_skills)
        
        # Require at least 1 mapped skill, but allow roles with partial skill mapping
        if not required_skills:
            continue

        role = {
            "title": title.strip().lower(),
            "requiredSkills": required_skills,
        }

        aliases = entry.get("aliases")
        if isinstance(aliases, list) and aliases:
            role["aliases"] = aliases

        extracted.append(role)
    return extracted


def _load_all_role_files() -> list[dict]:
    roles = []
    for filename in os.listdir(_DATA_DIR):
        if not filename.endswith(".json"):
            continue
        path = os.path.join(_DATA_DIR, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            logger.warning(f"Skipping unreadable data file: {filename}")
            continue

        roles.extend(_extract_roles_from_data(data))

    return roles


def _dedupe_roles(roles: list[dict]) -> tuple[list[dict], dict]:
    title_index: dict[str, dict] = {}
    merged_roles: list[dict] = []

    for role in roles:
        normalized = _normalize_title(role["title"])
        if normalized in title_index:
            existing = title_index[normalized]
            existing_skills = {s["skillId"]: s for s in existing["requiredSkills"]}
            for skill in role["requiredSkills"]:
                sid = skill["skillId"]
                if sid in existing_skills:
                    existing_skills[sid]["weight"] = max(existing_skills[sid]["weight"], skill["weight"])
                else:
                    existing_skills[sid] = skill
            existing["requiredSkills"] = _normalize_skill_weights(list(existing_skills.values()))
        else:
            title_index[normalized] = role
            merged_roles.append(role)

    return merged_roles, title_index


def load_job_title_index() -> tuple[list[dict], dict]:
    """
    Load and index all role definitions from the data folder.

    Returns:
        (roles, title_index) where title_index maps normalized title → role dict.
    """
    global _roles, _title_index

    if _title_index:
        return _roles, _title_index

    raw_roles = _load_all_role_files()
    _roles, _title_index = _dedupe_roles(raw_roles)
    for role in _roles:
        for alias in role.get("aliases", []):
            if isinstance(alias, str) and alias.strip():
                _title_index.setdefault(_normalize_title(alias), role)

    logger.info(f"Loaded {len(_roles)} roles into title index from data folder.")
    return _roles, _title_index


def _get_model():
    """Lazily load the sentence transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded sentence transformer model: all-MiniLM-L6-v2")
        except ImportError:
            logger.warning("sentence-transformers not installed. Semantic matching disabled.")
            _model = None
    return _model


def _get_embeddings(roles: list[dict]):
    """Compute (and cache) embeddings for all role titles."""
    global _embeddings
    if _embeddings is not None:
        return _embeddings

    model = _get_model()
    if model is None:
        return None

    import numpy as np
    titles = [r["title"] for r in roles]
    _embeddings = model.encode(titles, convert_to_numpy=True, show_progress_bar=False)
    return _embeddings


def compute_similarity(title1: str, title2: str) -> float:
    """
    Compute cosine similarity between two job titles using sentence embeddings.

    Returns:
        Similarity score in [0, 1]. Returns 0.0 if model unavailable.
    """
    model = _get_model()
    if model is None:
        return 0.0

    import numpy as np
    embs = model.encode([title1, title2], convert_to_numpy=True, show_progress_bar=False)
    a, b = embs[0], embs[1]
    cos_sim = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))
    return cos_sim


def _token_overlap(title1: str, title2: str) -> float:
    """Fraction of tokens in title1 that appear in title2."""
    t1 = set(_normalize_title(title1).split())
    t2 = set(_normalize_title(title2).split())
    if not t1:
        return 0.0
    return len(t1 & t2) / len(t1)


def find_best_match(title: str, semantic_threshold: float = 0.74) -> Optional[tuple[dict, float, str]]:
    """
    Find the closest role for a given job title.

    Strategy:
      1. Exact match on normalized title → confidence 1.0
      2. Semantic similarity ≥ threshold AND token overlap > 0 → confidence = similarity

    Args:
        title: Raw job title string from user.
        semantic_threshold: Minimum cosine similarity for a semantic match.

    Returns:
        (role_dict, confidence, match_type) or None if no match found.
    """
    roles, title_index = load_job_title_index()
    normalized = _normalize_title(title)

    # --- Exact match ---
    if normalized in title_index:
        logger.debug(f"Exact match for '{title}'")
        return title_index[normalized], 1.0, "exact"

    # --- Semantic match ---
    model = _get_model()
    if model is None:
        logger.warning("Semantic matching skipped: model not available.")
        return None

    embeddings = _get_embeddings(roles)
    if embeddings is None:
        return None

    import numpy as np
    query_emb = model.encode([title], convert_to_numpy=True, show_progress_bar=False)[0]
    sims = np.dot(embeddings, query_emb) / (
        np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_emb) + 1e-9
    )
    best_idx = int(np.argmax(sims))
    best_sim = float(sims[best_idx])
    best_role = roles[best_idx]

    overlap = _token_overlap(normalized, _normalize_title(best_role["title"]))

    if best_sim >= semantic_threshold and overlap > 0:
        logger.debug(f"Semantic match for '{title}' → '{best_role['title']}' (sim={best_sim:.3f})")
        return best_role, best_sim, "semantic"

    logger.debug(f"No match for '{title}' (best_sim={best_sim:.3f}, overlap={overlap:.2f})")
    return None
