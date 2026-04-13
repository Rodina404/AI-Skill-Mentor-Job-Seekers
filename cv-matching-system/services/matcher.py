import logging
from utils.helpers import candidate_to_text
from models.vector_store import build_vector_store
from services.scorer import compute_score_detailed
from services.job_parser import parse_job

logger = logging.getLogger(__name__)

def match_candidates(job_text, candidates):
    """
    Match candidates against a job description using semantic + rule-based scoring.
    
    Args:
        job_text: Job description
        candidates: List of candidate dictionaries
        
    Returns:
        Sorted list of candidates with match scores
    """
    logger.info(f"Matching {len(candidates)} candidates against job description")
    
    if not candidates:
        logger.warning("No candidates provided for matching")
        return []
    
    # Parse job requirements
    job_requirements = parse_job(job_text)
    logger.debug(f"Extracted requirements - Skills: {job_requirements.get('skills')}, Tools: {job_requirements.get('tools')}")
    
    # Build vector store
    texts = [candidate_to_text(c) for c in candidates]
    vector_db = build_vector_store(texts, candidates)

    # Search with similarity scores
    docs = vector_db.similarity_search_with_score(job_text, k=len(candidates))

    results = []

    for doc, similarity_score in docs:
        candidate = doc.metadata
        score_detail = compute_score_detailed(job_text, candidate, similarity_score)

        results.append({
            "name": candidate["name"],
            "score": score_detail["score"],
            "experience": candidate.get("experience", 0),
            "skills": candidate.get("skills", []),
            "matching_skills": score_detail["matching_skills"],
            "missing_skills": score_detail["missing_skills"],
            "skill_match_count": score_detail["skill_match_count"],
            "skill_total_required": score_detail["skill_total_required"]
        })

    logger.info(f"Matched {len(results)} candidates, top match: {results[0]['name'] if results else 'None'}")
    return sorted(results, key=lambda x: x["score"], reverse=True)