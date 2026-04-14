"""
Rule Engine - Legacy rule application utilities.

Pure Python module (no FastAPI imports).
"""

from typing import Dict, List, Any


def apply_rules(skill: str, rules: Dict[str, str]) -> str:
    """
    Apply L1 rules to map a user skill to canonical skill ID.
    
    Args:
        skill: User-provided skill string
        rules: {user_input: skillId} mapping
    
    Returns:
        skillId if match found, else original skill
    """
    if not skill:
        return skill
    
    skill_lower = skill.strip().lower()
    
    # Direct match
    if skill_lower in rules:
        return rules[skill_lower]
    
    # Try with normalized spaces/underscores
    skill_normalized = skill_lower.replace(' ', '_').replace('-', '_')
    for rule_key, rule_value in rules.items():
        rule_normalized = rule_key.replace(' ', '_').replace('-', '_')
        if rule_normalized == skill_normalized:
            return rule_value
    
    return skill


def batch_apply_rules(skills: List[str], rules: Dict[str, str]) -> List[str]:
    """Apply rules to multiple skills."""
    return [apply_rules(s, rules) for s in skills]
