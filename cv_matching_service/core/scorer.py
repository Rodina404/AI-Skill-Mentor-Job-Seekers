from fuzzywuzzy import fuzz
import core.config as config
import logging
import time

try:
    from core.job_parser_transformer import parse_job_hybrid
    PARSER_FN = lambda text: parse_job_hybrid(text, use_transformer=True)
except ImportError:
    from core.job_parser import parse_job
    PARSER_FN = lambda text: parse_job(text)

logger = logging.getLogger(__name__)

def compute_score_detailed(job_text, candidate, semantic_similarity=0.5):
    job_req = PARSER_FN(job_text)
    required_skills = job_req.get('skills', [])
    job_text_lower = job_text.lower()
    
    matching_skills = []
    missing_skills = []
    for req_skill in required_skills:
        found = False
        for cand_skill in candidate.get("skills", []):
            if fuzz.partial_ratio(req_skill.lower(), cand_skill.lower()) > config.SKILL_MATCH_THRESHOLD:
                if req_skill not in matching_skills:
                    matching_skills.append(req_skill)
                found = True
                break
        if not found and req_skill not in missing_skills:
            missing_skills.append(req_skill)
            
    total_required = len(required_skills) if required_skills else 1
    skill_score = len(matching_skills) / max(total_required, 1)
    
    experience_required = config.EXPERIENCE_BASELINE
    experience_score = min(candidate.get("experience", 0) / max(experience_required, 1), 1.0)
    
    tools_matches = 0
    for tool in candidate.get("tools", []):
        if any(fuzz.partial_ratio(tool.lower(), word) > config.TOOL_MATCH_THRESHOLD 
               for word in job_text_lower.split()):
            tools_matches += 1
    
    tools_score = (tools_matches / max(len(candidate.get("tools", [])), 1)) if candidate.get("tools") else 0
    semantic_score = min(semantic_similarity * 2, 1.0)
    
    weights = config.SCORING_WEIGHTS
    final_score = (
        semantic_score * weights["semantic_similarity"] +
        skill_score * weights["skill_match"] +
        tools_score * weights["tools_match"] +
        experience_score * weights["experience"]
    )
    
    return {
        "score": round(final_score * 100, 2),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "skill_match_count": len(matching_skills),
        "skill_total_required": total_required
    }
