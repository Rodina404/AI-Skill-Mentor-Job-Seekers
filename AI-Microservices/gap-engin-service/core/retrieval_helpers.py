"""
retrieval_helpers.py - Chroma retrieval utilities for Mode B context building.

Provides helpers to combine Adzuna postings + Chroma chunks
into a single evidence text for the LLM.
"""

import logging
import re
from collections import Counter
from core.adzuna_client import fetch_job_postings, postings_to_text
from core.vectorstore import retrieve_similar_roles_with_scores

logger = logging.getLogger(__name__)


def _skill_consensus(rows: list[dict]) -> str:
    """Summarize repeated canonical skills across retrieved role chunks."""
    counts = Counter()
    for row in rows:
        skill_ids = set(re.findall(r"\bS_[a-z0-9_]+\b", row.get("document", "")))
        counts.update(skill_ids)

    if not counts:
        return ""

    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return "\n".join(
        f"- {skill_id}: supported by {count}/{len(rows)} similar roles"
        for skill_id, count in ranked
    )


def gather_evidence(job_title: str, adzuna_count: int = 5, chroma_count: int = 6) -> tuple[str, bool]:
    """
    Gather evidence from Adzuna API and Chroma vector DB.

    Args:
        job_title: Job title to search for.
        adzuna_count: Max Adzuna postings to fetch.
        chroma_count: Max Chroma chunks to retrieve.

    Returns:
        (evidence_text, has_evidence) tuple.
        has_evidence is True if at least one source returned data.
    """
    # Fetch from Adzuna
    postings = fetch_job_postings(job_title, max_results=adzuna_count)
    adzuna_text = postings_to_text(postings)

    # Retrieve from Chroma
    chroma_rows = retrieve_similar_roles_with_scores(job_title, n_results=chroma_count)
    chroma_text = "\n\n".join(
        f"[distance={row['distance']:.3f}] {row['document']}" for row in chroma_rows
    )

    has_adzuna = bool(adzuna_text.strip())
    has_chroma = bool(chroma_text.strip())
    has_evidence = has_adzuna or has_chroma

    if not has_evidence:
        logger.warning(f"No evidence found for '{job_title}' from any source.")
        return "", False

    parts = []
    if adzuna_text:
        parts.append(f"=== Live Job Postings (Adzuna) ===\n{adzuna_text}")
    if chroma_text:
        consensus = _skill_consensus(chroma_rows)
        if consensus:
            parts.append(f"=== Similar Role Skill Consensus ===\n{consensus}")
        parts.append(f"=== Similar Role Knowledge Base ===\n{chroma_text}")

    evidence = "\n\n".join(parts)
    logger.info(
        f"Evidence gathered for '{job_title}': "
        f"adzuna={'yes' if has_adzuna else 'no'}, chroma={'yes' if has_chroma else 'no'}"
    )
    return evidence, True


def normalize_weights(skills: list[dict]) -> list[dict]:
    """
    Normalize skill weights to sum to 1.0.

    Args:
        skills: List of {skillId, weight, ...} dicts.

    Returns:
        Same list with normalized weights.
    """
    total = sum(s.get("weight", 0) for s in skills)
    if total <= 0:
        return skills
    for s in skills:
        s["weight"] = round(s.get("weight", 0) / total, 4)
    return skills

