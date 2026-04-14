"""
Info Extractor - Legacy extraction utilities.

Pure Python module (no FastAPI imports).
"""

from typing import Dict, List, Any


def extract_skill_ids(skills: List[Dict[str, Any]]) -> List[str]:
    """
    Extract skill IDs from normalized skills list.
    
    Args:
        skills: List of {skillId, name, confidence, ...}
    
    Returns:
        List of skillIds
    """
    return [s.get('skillId') for s in skills if 'skillId' in s]


def extract_skill_names(skills: List[Dict[str, Any]]) -> List[str]:
    """
    Extract canonical skill names from normalized skills list.
    
    Args:
        skills: List of {skillId, name, confidence, ...}
    
    Returns:
        List of canonical skill names
    """
    return [s.get('name') for s in skills if 'name' in s]


def filter_by_confidence(skills: List[Dict[str, Any]], min_confidence: float = 0.7) -> List[Dict[str, Any]]:
    """
    Filter skills by minimum confidence threshold.
    
    Args:
        skills: List of {skillId, name, confidence, ...}
        min_confidence: Minimum confidence (0.0-1.0)
    
    Returns:
        Filtered skills list
    """
    return [s for s in skills if s.get('confidence', 0) >= min_confidence]
