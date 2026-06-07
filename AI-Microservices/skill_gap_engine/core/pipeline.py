from core.query_builder import build_skill_queries
from core.vector_search import search_courses
from core.filters import apply_constraints
from core.reranker import rerank_courses
from typing import List, Dict

def run_recommendation_pipeline(missing_skills: List[Dict], user_constraints: Dict) -> List[Dict]:
    """
    Orchestrates the sequence.
    Input: missing_skills (list of dicts), user_constraints (dict)
    Output: Grouped list of dicts.
    """
    # L1-1
    queries_data = build_skill_queries(missing_skills)
    
    final_output = []
    
    for sq in queries_data:
        skill_id = sq["skillId"]
        skill_name = sq["skillName"]
        expanded_queries = sq["queries"]
        
        # L1-3
        candidate_courses = search_courses(expanded_queries, top_k=60)
        
        # L1-4
        filtered_courses = apply_constraints(candidate_courses, user_constraints)
        
        # L1-5
        ranked_courses = rerank_courses(filtered_courses, skill_name)
        
        # L1-6: Group by Skill
        final_courses = ranked_courses[:5]
        
        final_output.append({
            "skillId": skill_id,
            "skillName": skill_name,
            "courses": final_courses
        })
        
    return final_output
