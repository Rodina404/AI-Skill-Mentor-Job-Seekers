"""
llm.py - Interface to Groq API for intelligent skill extraction.

Creates Groq chat client, sends evidence + prompt to LLM,
receives structured JSON skill output, handles timeouts/failures.

Model: openai/gpt-oss-20b (via Groq)
Required env var: GROQ_API_KEY
"""

import os
import json
import logging
import re
from typing import Optional

from src.role_library import get_all_skills, normalize_skill_name

logger = logging.getLogger(__name__)
_last_extraction_source = "none"

GROQ_MODEL = "llama-3.3-70b-versatile"
DEFAULT_TIMEOUT = 30  # seconds
_BROAD_SUPPORTING_SKILLS = {
    "S_automation",
    "S_cloud_architecture",
    "S_data_analysis",
    "S_data_engineering",
    "S_mathematics",
    "S_monitoring",
    "S_statistics",
    "S_system_design",
}

SKILL_EXTRACTION_PROMPT = """You are a strict technical skill extraction system.

Return ONLY a valid JSON array. Each element must have:
- "skillId": one ID from the allowed canonical skill IDs below
- "weight": importance score from 0.0 to 1.0 (weights should sum to ~1.0)
- "confidence": how confident you are this skill is required (0.0 to 1.0)

Rules:
- Return 4 to 6 core skills when enough evidence exists; never return more than 6.
- Rank skills by importance, repeated support across relevant sources, and fit to the job title.
- Prefer concrete technologies and directly required capabilities over broad supporting topics.
- Treat a skill mentioned by only one loosely related role as weak evidence.
- Include only skills explicitly supported by the evidence and relevant to the job title.
- Do not infer loosely related, generic, or soft skills.
- Do not invent skill IDs.

Allowed canonical skill IDs:
{allowed_skill_ids}

Job Evidence:
{evidence}

Job Title: {job_title}

Return ONLY the JSON array, no other text:"""


def _aliases_by_skill_id() -> dict[str, set[str]]:
    aliases = {}
    for entry in get_all_skills():
        values = {entry["skillId"], entry.get("name", ""), *entry.get("aliases", [])}
        aliases[entry["skillId"]] = {value.lower() for value in values if value and len(value.strip()) >= 2}
    return aliases


def _consensus_support(evidence_text: str) -> dict[str, float]:
    """Read normalized support ratios from the deterministic RAG summary."""
    support = {}
    pattern = r"-\s+(S_[a-z0-9_]+): supported by (\d+)/(\d+) similar roles"
    for skill_id, count, total in re.findall(pattern, evidence_text):
        denominator = int(total)
        if denominator > 0:
            support[skill_id] = int(count) / denominator
    return support


def filter_evidence_supported_skills(
    skills: list[dict],
    evidence_text: str,
    min_confidence: float = 0.55,
    top_n: int = 6,
) -> list[dict]:
    """Keep canonical, confident skills explicitly supported by evidence."""
    evidence_lower = evidence_text.lower()
    aliases = _aliases_by_skill_id()
    consensus = _consensus_support(evidence_text)
    by_id = {}
    for skill in skills:
        confidence = skill.get("confidence", 0.0)
        if not isinstance(confidence, (int, float)) or confidence < min_confidence:
            continue
        raw_id = skill.get("skillId", "")
        canonical = normalize_skill_name(raw_id) or normalize_skill_name(
            raw_id.replace("S_", "").replace("_", " ")
        )
        if not canonical or canonical not in aliases:
            continue
        supported = any(
            re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", evidence_lower)
            for alias in aliases[canonical]
        )
        if not supported:
            continue
        candidate = {
            "skillId": canonical,
            "weight": float(skill.get("weight", 0.0)),
            "confidence": float(confidence),
        }
        support = consensus.get(canonical)
        if support is None:
            candidate["rankScore"] = candidate["confidence"] + candidate["weight"]
        else:
            broad_penalty = 0.12 if canonical in _BROAD_SUPPORTING_SKILLS else 0.0
            candidate["rankScore"] = (
                0.45 * candidate["confidence"]
                + 0.25 * candidate["weight"]
                + 0.30 * support
                - broad_penalty
            )
        previous = by_id.get(canonical)
        if previous is None or candidate["rankScore"] > previous["rankScore"]:
            by_id[canonical] = candidate

    filtered = sorted(
        by_id.values(),
        key=lambda item: (item["rankScore"], item["confidence"], item["weight"]),
        reverse=True,
    )[:top_n]
    for item in filtered:
        item.pop("rankScore", None)
    total = sum(item["weight"] for item in filtered)
    if total > 0:
        for item in filtered:
            item["weight"] = round(item["weight"] / total, 4)
    return filtered


def _get_groq_client():
    """Create a Groq client. Returns None if unavailable."""
    try:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not set.")
            return None
        return Groq(api_key=api_key)
    except ImportError:
        logger.warning("groq package not installed.")
        return None
    except Exception as e:
        logger.error(f"Failed to create Groq client: {e}")
        return None


def get_last_extraction_source() -> str:
    """Return the source used by the most recent extraction call."""
    return _last_extraction_source


def _clean_llm_response(raw: str) -> list[dict]:
    """
    Parse and clean LLM JSON response.

    Removes generic/placeholder entries and validates structure.

    Returns:
        List of {skillId, weight, confidence} dicts.
    """
    GENERIC_TERMS = {
        "communication", "teamwork", "software", "problem solving",
        "leadership", "adaptability", "work ethic", "collaboration",
        "not mentioned", "n/a", "unknown", "various", "other"
    }

    # Strip markdown fences if present
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    data = None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON: {e}\nRaw start: {raw[:200]}")
        # Try to recover a truncated JSON array by extracting the first [...] block
        try:
            start = raw.find("[")
            end = raw.rfind("]")
            if start != -1 and end != -1 and end > start:
                candidate = raw[start:end+1]
                data = json.loads(candidate)
            elif start != -1 and end == -1:
                # Append a closing bracket and attempt to parse
                candidate = raw[start:] + "]"
                data = json.loads(candidate)
        except Exception:
            data = None
            # As a last-resort recovery, extract any complete JSON objects
            try:
                objs = re.findall(r"\{[^}]*\}", raw, flags=re.S)
                recovered = []
                for o in objs:
                    try:
                        recovered.append(json.loads(o))
                    except Exception:
                        continue
                if recovered:
                    data = recovered
            except Exception:
                data = None

        if data is None:
            return []

    if not isinstance(data, list):
        logger.error("LLM response was not a JSON array.")
        return []

    cleaned = []
    for item in data:
        if not isinstance(item, dict):
            continue
        skill_id = item.get("skillId", "").strip()
        weight = item.get("weight", 0.0)
        confidence = item.get("confidence", 0.0)

        # Validate structure
        if not skill_id:
            continue
        if not isinstance(weight, (int, float)) or weight <= 0:
            continue

        # Filter generic terms
        skill_lower = skill_id.lower().replace("s_", "").replace("_", " ")
        if any(g in skill_lower for g in GENERIC_TERMS):
            continue

        # Ensure S_ prefix
        if not skill_id.startswith("S_"):
            skill_id = "S_" + skill_id.lower().replace(" ", "_").replace("-", "_")

        cleaned.append({
            "skillId": skill_id,
            "weight": round(float(weight), 3),
            "confidence": round(float(confidence), 3),
        })

    return cleaned


def _extract_skills_locally(evidence_text: str, top_n: int = 12) -> list[dict]:
    """
    Simple fallback extraction: match aliases from skills_catalog.json in the evidence text.

    Returns list of {skillId, weight, confidence} sorted by weight.
    """
    import pathlib

    skills_path = os.path.join(os.path.dirname(__file__), "..", "data", "skills_catalog.json")
    try:
        with open(skills_path, "r", encoding="utf-8") as f:
            catalog = json.load(f)
    except Exception:
        logger.error("Failed to load skills_catalog.json for local extraction.")
        return []

    # Normalize evidence
    text = evidence_text.lower()

    # Build alias -> skillId map
    alias_map = {}
    for entry in catalog:
        sid = entry.get("skillId")
        aliases = entry.get("aliases", []) or []
        name = entry.get("name", "")
        # include canonical name
        candidates = [sid, name] + aliases
        for a in candidates:
            if not a:
                continue
            alias_map[a.lower()] = sid

    # Count occurrences of aliases in text
    counts = {}
    for alias, sid in alias_map.items():
        # Avoid false positives from short aliases such as "c" inside words.
        if len(alias.strip()) < 2:
            continue
        pattern = rf"(?<!\w){re.escape(alias)}(?!\w)"
        cnt = len(re.findall(pattern, text))
        if cnt > 0:
            counts[sid] = counts.get(sid, 0) + cnt

    if not counts:
        return []

    # Build weighted list
    total = sum(counts.values())
    items = []
    for sid, cnt in counts.items():
        weight = round(cnt / total, 3)
        confidence = min(0.9, 0.5 + weight)  # heuristic
        items.append({"skillId": sid, "weight": weight, "confidence": confidence})

    # sort and trim
    items.sort(key=lambda x: x["weight"], reverse=True)
    items = items[:top_n]
    # normalize weights to sum to 1.0
    total_w = sum(i["weight"] for i in items)
    if total_w > 0:
        for i in items:
            i["weight"] = round(i["weight"] / total_w, 3)

    return items


def extract_skills_from_evidence(job_title: str, evidence_text: str) -> list[dict]:
    """
    Use Groq LLM to extract required skills from job market evidence.

    Args:
        job_title: The job title being analyzed.
        evidence_text: Combined text from Adzuna postings + Chroma chunks.

    Returns:
        List of {skillId, weight, confidence} dicts. Empty list on failure.
    """
    global _last_extraction_source
    _last_extraction_source = "none"
    client = _get_groq_client()
    if client is None:
        logger.warning("LLM client unavailable; using local skill extraction.")
        _last_extraction_source = "local_fallback"
        return _extract_skills_locally(evidence_text)

    if not evidence_text.strip():
        logger.warning("No evidence text provided to LLM.")
        return []

    # Truncate evidence to avoid token limits (~6000 chars ~= ~2000 tokens)
    evidence_truncated = evidence_text[:6000]

    allowed_skill_ids = ", ".join(skill["skillId"] for skill in get_all_skills())
    prompt = SKILL_EXTRACTION_PROMPT.format(
        evidence=evidence_truncated,
        job_title=job_title,
        allowed_skill_ids=allowed_skill_ids,
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=1000,
            timeout=DEFAULT_TIMEOUT,
        )
        raw = response.choices[0].message.content
        llm_skills = filter_evidence_supported_skills(
            _clean_llm_response(raw),
            evidence_truncated,
            min_confidence=0.55,
        )
        skills = llm_skills or filter_evidence_supported_skills(
            _extract_skills_locally(evidence_truncated, top_n=6),
            evidence_truncated,
            min_confidence=0.55,
        )
        logger.info(f"LLM extracted {len(skills)} skills for '{job_title}'")
        _last_extraction_source = "groq"
        return skills

    except Exception as e:
        logger.error(f"Groq LLM call failed for '{job_title}': {e}")
        logger.warning("Using local skill extraction after LLM failure.")
        _last_extraction_source = "local_fallback"
        return _extract_skills_locally(evidence_text)
