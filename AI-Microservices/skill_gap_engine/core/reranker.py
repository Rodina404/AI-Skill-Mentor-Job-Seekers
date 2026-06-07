from typing import List, Dict

def rerank_courses(courses: List[Dict], skill_name: str = "") -> List[Dict]:
    """
    L1-5: Hybrid Rerank Engine
    Input: candidate courses, target skill
    Output: rankedCourses[] with finalScore
    """
    weights = {
        "semantic": 0.75,   # Dominant signal — relevance must come first
        "rating": 0.15,     # Quality as second factor
        "popularity": 0.05,  # Tie-breaker only
        "level_match": 0.05
    }
    
    rated_courses = []
    for c in courses:
        semantic_raw = c.get("semanticScore", 0.0)
        # semanticScore is cosine similarity mapped to [0,1] by vector_search.py
        # (raw cosine in [-1,1] → (cosine + 1) / 2 → [0,1])
        semantic_norm = max(0.0, min(semantic_raw, 1.0))
        
        rating = c.get("rating", 0.0)
        rating_norm = min(rating / 5.0, 1.0) if rating > 0 else 0.5
        
        popularity = c.get("popularity", 0)
        pop_norm = min(popularity / 100000.0, 1.0) # Assume 100k+ is max popularity
        
        # Level matching logic (optional boost if skill name explicitly desires it, otherwise assume beginner/intermediate are common defaults)
        level_score = 0.8  # default acceptable
        level_str = c.get("level", "").lower()
        if "beginner" in level_str:
            level_score = 0.9 # Usually missing skills need beginner courses
            
        final_score = (
            (semantic_norm * weights["semantic"]) +
            (rating_norm * weights["rating"]) +
            (pop_norm * weights["popularity"]) +
            (level_score * weights["level_match"])
        )
        
        # --- KEYWORD MATCH BONUS ---
        # If the skill name actually appears in the title, give it a HUGE boost
        # This fixes "Semantic drift" where a Python query might surface a general SQL course.
        if skill_name.lower() in c.get("title", "").lower():
            final_score += 0.30 
            
        c["score"] = float(min(final_score, 1.0))
        c["scoreBreakdown"] = {
            "semantic": semantic_norm * weights["semantic"],
            "rating": rating_norm * weights["rating"],
            "popularity": pop_norm * weights["popularity"]
        }
        rated_courses.append(c)
        
    rated_courses.sort(key=lambda x: x["score"], reverse=True)
    return rated_courses
