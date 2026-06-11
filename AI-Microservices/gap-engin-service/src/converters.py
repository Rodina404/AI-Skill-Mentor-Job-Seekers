"""
converters.py

Convert natural-language experience and education descriptors to
normalized float scores (0.0 - 1.0) consumed by the pipeline.
"""
from __future__ import annotations

from typing import Iterable


def _contains_any(raw: str, keywords: Iterable[str]) -> bool:
    if not raw:
        return False
    s = raw.lower().strip()
    return any(k in s for k in keywords)


def experience_to_score(raw: str) -> float:
    """Map free-text experience descriptions to a float score.

    Checks whether any keyword is contained in the input string (case-insensitive).
    """
    if not isinstance(raw, str):
        return 0.5

    s = raw.lower().strip()

    if _contains_any(s, ["no experience", "0 years", "fresher", "entry level"]):
        return 0.0

    if _contains_any(s, ["junior", "1 year", "2 years", "1-2 years", "less than 2 years"]):
        return 0.4

    if _contains_any(s, ["mid", "middle", "3 years", "4 years", "3-4 years", "2-4 years"]):
        return 0.7

    if _contains_any(
        s,
        [
            "senior",
            "5 years",
            "5+ years",
            "6 years",
            "7 years",
            "8 years",
            "10 years",
            "10+ years",
            "lead",
            "principal",
        ],
    ):
        return 1.0

    # Default / unknown
    return 0.5


def education_to_score(raw: str) -> float:
    """Map free-text education descriptions to a float score.

    Checks whether any keyword is contained in the input string (case-insensitive).
    """
    if not isinstance(raw, str):
        return 0.5

    s = raw.lower().strip()

    if _contains_any(s, ["high school", "no degree", "secondary", "none"]):
        return 0.2

    if _contains_any(s, ["bootcamp", "diploma", "certificate", "associate"]):
        return 0.5

    if _contains_any(s, ["bachelor", "bs", "ba", "b.s", "b.a", "undergraduate", "college"]):
        return 0.7

    if _contains_any(s, ["master", "ms", "msc", "m.s", "m.sc", "postgraduate", "graduate"]):
        return 0.9

    if _contains_any(s, ["phd", "ph.d", "doctorate", "doctoral"]):
        return 1.0

    return 0.5
