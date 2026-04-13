from fuzzywuzzy import fuzz
import config
import logging
import time

# Use hybrid transformer-based parser for better accuracy
try:
    from services.job_parser_transformer import parse_job_hybrid
    PARSER_FN = lambda text: parse_job_hybrid(text, use_transformer=True)
    logger = logging.getLogger(__name__)
    logger.info("[OK] Using hybrid transformer-based job parser")
except ImportError:
    # Fallback to regex-only parser
    from services.job_parser import parse_job
    PARSER_FN = lambda text: parse_job(text)
    logger = logging.getLogger(__name__)
    logger.warning("[WARN] Transformer parser not available, using regex-only parser")

def compute_score_detailed(job_text, candidate, semantic_similarity=0.5):
    """
    Compute matching score with detailed skill breakdown.
    Uses transformer-based job parsing for better accuracy.
    
    Args:
        job_text: Job description text
        candidate: Candidate dictionary with skills, experience, tools
        semantic_similarity: Vector similarity score (0-1) from FAISS
    
    Returns:
        Dictionary with score and skill details
    """
    # Parse job requirements using hybrid transformer-based parser
    start_time = time.time()
    job_req = PARSER_FN(job_text)
    parse_time = time.time() - start_time
    
    required_skills = job_req.get('skills', [])
    job_text_lower = job_text.lower()
    
    if parse_time > 0.5:
        logger.debug(f"Job parsing took {parse_time*1000:.1f}ms using {job_req.get('parsing_method', 'unknown')}")
    
    # 1. Skill matching - compare candidate skills against required skills
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
    
    # Score based on matching vs missing skills
    total_required = len(required_skills) if required_skills else 1
    skill_score = len(matching_skills) / max(total_required, 1)
    
    # 2. Experience scoring
    experience_required = config.EXPERIENCE_BASELINE
    experience_score = min(candidate.get("experience", 0) / max(experience_required, 1), 1.0)
    
    # 3. Tools/Technologies matching
    tools_matches = 0
    for tool in candidate.get("tools", []):
        if any(fuzz.partial_ratio(tool.lower(), word) > config.TOOL_MATCH_THRESHOLD 
               for word in job_text_lower.split()):
            tools_matches += 1
    
    tools_score = (tools_matches / max(len(candidate.get("tools", [])), 1)) if candidate.get("tools") else 0
    
    # 4. Semantic similarity
    semantic_score = min(semantic_similarity * 2, 1.0)
    
    # 5. Weighted final score
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

