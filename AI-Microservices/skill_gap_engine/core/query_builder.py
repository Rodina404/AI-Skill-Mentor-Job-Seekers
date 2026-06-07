import json
import os
from typing import List, Dict
from pathlib import Path

_expansions_cache = None

def _load_synonyms() -> Dict[str, List[str]]:
    global _expansions_cache
    if _expansions_cache is not None:
        return _expansions_cache
        
    synonyms_path = Path(__file__).parent.parent.parent / "data" / "skill_synonyms.json"
    if synonyms_path.exists():
        with open(synonyms_path, 'r', encoding='utf-8') as f:
            _expansions_cache = json.load(f)
    else:
        _expansions_cache = {}
        
    return _expansions_cache

def build_skill_queries(missing_skills: List[Dict]) -> List[Dict]:
    """
    L1-1: SkillQueryBuilder
    Input: missing_skills (list of dicts with skillId, skillName)
    Output: list of dicts with expanded queries.
    Expands skill into search query variants using offline definitions.
    """
    output = []
    expansions = _load_synonyms()
    
    for skill in missing_skills:
        skill_id = skill.get("skillId", "")
        # fallback for schemas mapped via model_dump()
        if not skill_id:
            skill_id = skill.get("skill_id", "")
            
        skill_name = skill.get("skillName", "")
        if not skill_name:
            skill_name = skill.get("skill_name", "")
            
        skill_lower = skill_name.lower()
        
        sq = [skill_name]
        
        # Exact match
        if skill_lower in expansions:
            sq.extend(expansions[skill_lower])
        else:
            # Substring matching (if "python" is anywhere in the name, add python things)
            found_expansion = False
            for key, targets in expansions.items():
                if key in skill_lower:
                    sq.extend(targets)
                    found_expansion = True
            
            if not found_expansion:
                sq.append(f"{skill_name} course")
                sq.append(f"learn {skill_name}")
            
        output.append({
            "skillId": skill_id,
            "skillName": skill_name,
            "queries": sq
        })
        
    return output
