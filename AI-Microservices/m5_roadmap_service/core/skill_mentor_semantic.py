"""
AI Skill Mentor - Semantic Skill Matching Module
=================================================

Implements semantic similarity matching between skills and courses
using sentence-transformers embeddings, replacing simple substring matching.

Features:
- Embedding-based skill matching
- Synonym expansion
- Configurable similarity thresholds
- Caching for performance
"""

import hashlib
from typing import Dict, List, Optional, Tuple
from functools import lru_cache

from skill_mentor_config import Config, default_config
from skill_mentor_utils import ok, info, warn, SimpleCache


# Try to import sentence-transformers (optional dependency)
EMBEDDINGS_AVAILABLE = False
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    pass


class SemanticMatcher:
    """
    Semantic skill matching using sentence-transformers.
    
    Falls back to synonym-based matching if embeddings are unavailable.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self._model = None
        self._embedding_cache = SimpleCache(ttl_seconds=3600)  # 1 hour cache
        self._model_loaded = False
    
    @property
    def model(self):
        """Lazy load the embedding model."""
        if self._model is None and EMBEDDINGS_AVAILABLE:
            try:
                info(f"Loading embedding model: {self.config.semantic.embedding_model}")
                self._model = SentenceTransformer(self.config.semantic.embedding_model)
                self._model_loaded = True
                ok("Semantic embedding model loaded")
            except Exception as e:
                warn(f"Failed to load embedding model: {e}")
                self._model = None
        return self._model
    
    @property
    def embeddings_available(self) -> bool:
        """Check if embeddings are available."""
        return EMBEDDINGS_AVAILABLE and self.model is not None
    
    def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Get embedding vector for text.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector or None if unavailable
        """
        if not self.embeddings_available:
            return None
        
        # Check cache
        cache_key = hashlib.md5(text.encode()).hexdigest()
        cached = self._embedding_cache.get(cache_key)
        if cached is not None:
            return cached
        
        # Generate embedding
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            result = embedding.tolist()
            self._embedding_cache.set(cache_key, result)
            return result
        except Exception as e:
            warn(f"Embedding generation failed: {e}")
            return None
    
    def compute_similarity(
        self,
        skill: str,
        course_skills: List[str]
    ) -> Tuple[float, Optional[str]]:
        """
        Compute semantic similarity between a skill and course skills.
        
        Args:
            skill: Target skill to match
            course_skills: List of skills taught by course
            
        Returns:
            Tuple of (similarity_score, best_matching_skill)
        """
        if self.embeddings_available:
            return self._compute_embedding_similarity(skill, course_skills)
        else:
            return self._compute_synonym_similarity(skill, course_skills)
    
    def _compute_embedding_similarity(
        self,
        skill: str,
        course_skills: List[str]
    ) -> Tuple[float, Optional[str]]:
        """Compute similarity using embeddings."""
        skill_embedding = self.get_embedding(skill.lower())
        if skill_embedding is None:
            return self._compute_synonym_similarity(skill, course_skills)
        
        skill_vec = np.array(skill_embedding)
        best_score = 0.0
        best_match = None
        
        for course_skill in course_skills:
            course_embedding = self.get_embedding(course_skill.lower())
            if course_embedding is None:
                continue
            
            course_vec = np.array(course_embedding)
            
            # Cosine similarity
            dot_product = np.dot(skill_vec, course_vec)
            norm_a = np.linalg.norm(skill_vec)
            norm_b = np.linalg.norm(course_vec)
            
            if norm_a > 0 and norm_b > 0:
                similarity = dot_product / (norm_a * norm_b)
                
                # Boost exact matches
                if skill.lower() == course_skill.lower():
                    similarity = min(1.0, similarity + self.config.semantic.exact_match_boost)
                
                if similarity > best_score:
                    best_score = similarity
                    best_match = course_skill
        
        return best_score, best_match
    
    def _compute_synonym_similarity(
        self,
        skill: str,
        course_skills: List[str]
    ) -> Tuple[float, Optional[str]]:
        """Compute similarity using synonym matching (fallback)."""
        skill_lower = skill.lower()
        synonyms = self.config.semantic.skill_synonyms
        
        # Get synonyms for the target skill
        target_synonyms = set()
        target_synonyms.add(skill_lower)
        
        for canonical, syns in synonyms.items():
            if skill_lower == canonical.lower() or skill_lower in [s.lower() for s in syns]:
                target_synonyms.add(canonical.lower())
                target_synonyms.update(s.lower() for s in syns)
        
        # Check each course skill
        best_score = 0.0
        best_match = None
        
        for course_skill in course_skills:
            course_lower = course_skill.lower()
            
            # Exact match
            if course_lower == skill_lower:
                return 1.0, course_skill
            
            # Synonym match
            if course_lower in target_synonyms:
                if 0.9 > best_score:
                    best_score = 0.9
                    best_match = course_skill
                continue
            
            # Substring match
            if skill_lower in course_lower or course_lower in skill_lower:
                if 0.7 > best_score:
                    best_score = 0.7
                    best_match = course_skill
                continue
            
            # Check course skill synonyms
            course_synonyms = set()
            for canonical, syns in synonyms.items():
                if course_lower == canonical.lower() or course_lower in [s.lower() for s in syns]:
                    course_synonyms.add(canonical.lower())
                    course_synonyms.update(s.lower() for s in syns)
            
            # Cross-match synonyms
            if target_synonyms & course_synonyms:
                if 0.8 > best_score:
                    best_score = 0.8
                    best_match = course_skill
        
        return best_score, best_match
    
    def match_skill_to_courses(
        self,
        skill: str,
        courses: List[Dict],
        threshold: Optional[float] = None
    ) -> List[Tuple[Dict, float, str]]:
        """
        Find courses that match a skill.
        
        Args:
            skill: Skill to match
            courses: List of course dictionaries
            threshold: Minimum similarity threshold (default from config)
            
        Returns:
            List of (course, similarity, matched_skill) tuples, sorted by similarity
        """
        if threshold is None:
            threshold = self.config.semantic.min_similarity_threshold
        
        matches = []
        
        for course in courses:
            course_skills = course.get("skills_taught", [])
            if not course_skills:
                continue
            
            similarity, matched_skill = self.compute_similarity(skill, course_skills)
            
            if similarity >= threshold:
                matches.append((course, similarity, matched_skill))
        
        # Sort by similarity (descending)
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches
    
    def find_best_course_for_skill(
        self,
        skill: str,
        courses: List[Dict],
        exclude_ids: Optional[set] = None,
        threshold: Optional[float] = None
    ) -> Optional[Tuple[Dict, float]]:
        """
        Find the best course for a skill.
        
        Args:
            skill: Skill to find course for
            courses: List of available courses
            exclude_ids: Set of course IDs to exclude
            threshold: Minimum similarity threshold
            
        Returns:
            Tuple of (best_course, similarity) or None
        """
        exclude_ids = exclude_ids or set()
        
        matches = self.match_skill_to_courses(skill, courses, threshold)
        
        # Filter out excluded courses and find best by combined score
        for course, similarity, _ in matches:
            if course["id"] in exclude_ids:
                continue
            
            # Combine similarity with course quality
            rating = course.get("rating", 4.0) / 5.0
            combined_score = similarity * 0.6 + rating * 0.4
            
            return course, combined_score
        
        return None
    
    def compute_skill_gaps(
        self,
        user_skills: List[str],
        target_skills: List[str]
    ) -> List[Dict]:
        """
        Compute skill gaps between user skills and target skills.
        
        Args:
            user_skills: Skills the user already has
            target_skills: Skills required for target role
            
        Returns:
            List of skill gap dictionaries with similarity scores
        """
        gaps = []
        
        for target in target_skills:
            best_similarity = 0.0
            best_match = "none"
            
            for user_skill in user_skills:
                similarity, _ = self.compute_similarity(target, [user_skill])
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = user_skill
            
            # Gap score is inverse of similarity
            gap_score = 1.0 - best_similarity
            
            gaps.append({
                "skill": target,
                "gap_score": round(gap_score, 3),
                "similarity": round(best_similarity, 3),
                "best_match": best_match,
            })
        
        return gaps
    
    def expand_skill_synonyms(self, skill: str) -> List[str]:
        """
        Expand a skill to include all synonyms.
        
        Args:
            skill: Skill to expand
            
        Returns:
            List of skill names including synonyms
        """
        skill_lower = skill.lower()
        synonyms = self.config.semantic.skill_synonyms
        
        expanded = {skill}
        
        for canonical, syns in synonyms.items():
            if skill_lower == canonical.lower() or skill_lower in [s.lower() for s in syns]:
                expanded.add(canonical)
                expanded.update(syns)
        
        return list(expanded)


class CourseSkillMatcher:
    """
    Higher-level interface for matching skills to courses.
    
    Combines semantic matching with course quality scoring.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.semantic_matcher = SemanticMatcher(config)
    
    def rank_courses_for_skill(
        self,
        skill: str,
        courses: List[Dict],
        limit: int = 10
    ) -> List[Dict]:
        """
        Rank courses by relevance to a skill.
        
        Args:
            skill: Target skill
            courses: List of courses
            limit: Maximum courses to return
            
        Returns:
            List of courses with added 'relevance_score' field
        """
        matches = self.semantic_matcher.match_skill_to_courses(skill, courses)
        
        ranked = []
        for course, similarity, matched_skill in matches[:limit]:
            course_copy = course.copy()
            
            # Calculate combined score
            rating = course.get("rating", 4.0) / 5.0
            reviews = min(course.get("reviews", 0) / 100000, 1.0)  # Normalize to 100k
            
            # Weighted combination
            relevance_score = (
                similarity * 0.5 +
                rating * 0.3 +
                reviews * 0.2
            )
            
            course_copy["relevance_score"] = round(relevance_score, 3)
            course_copy["matched_skill"] = matched_skill
            course_copy["semantic_similarity"] = round(similarity, 3)
            
            ranked.append(course_copy)
        
        return ranked
    
    def match_gaps_to_courses(
        self,
        skill_gaps: List[Dict],
        courses: List[Dict]
    ) -> Dict[str, Dict]:
        """
        Match each skill gap to the best course.
        
        Args:
            skill_gaps: List of skill gap dictionaries
            courses: List of available courses
            
        Returns:
            Dictionary mapping skill -> best course
        """
        skill_to_course = {}
        used_course_ids = set()
        
        # Sort gaps by priority and gap_score
        priority_order = {"high": 0, "medium": 1, "low": 2}
        sorted_gaps = sorted(
            skill_gaps,
            key=lambda g: (
                priority_order.get(g.get("priority", "medium"), 1),
                -g.get("gap_score", 0.5)
            )
        )
        
        for gap in sorted_gaps:
            skill = gap["skill"]
            
            result = self.semantic_matcher.find_best_course_for_skill(
                skill,
                courses,
                exclude_ids=used_course_ids
            )
            
            if result:
                course, score = result
                skill_to_course[skill] = {
                    "course": course,
                    "match_score": score,
                    "gap": gap,
                }
                used_course_ids.add(course["id"])
        
        return skill_to_course


# Singleton instance for convenience
_default_matcher = None

def get_semantic_matcher(config: Optional[Config] = None) -> SemanticMatcher:
    """Get or create the default semantic matcher."""
    global _default_matcher
    if _default_matcher is None:
        _default_matcher = SemanticMatcher(config)
    return _default_matcher


if __name__ == "__main__":
    # Test semantic matching
    print("Testing semantic skill matching...\n")
    
    matcher = SemanticMatcher()
    
    # Test synonym matching
    print("Synonym matching tests:")
    test_cases = [
        ("Power BI", ["powerbi", "excel"]),
        ("machine learning", ["ml", "deep learning", "python"]),
        ("SQL", ["mysql", "database", "excel"]),
    ]
    
    for skill, course_skills in test_cases:
        score, match = matcher.compute_similarity(skill, course_skills)
        print(f"  '{skill}' vs {course_skills} -> {score:.2f} (matched: {match})")
    
    # Test course matching
    print("\nCourse matching test:")
    test_courses = [
        {"id": "1", "title": "Python ML Bootcamp", "skills_taught": ["Python", "machine learning"], "rating": 4.8},
        {"id": "2", "title": "Excel Basics", "skills_taught": ["Excel", "data visualization"], "rating": 4.5},
        {"id": "3", "title": "Power BI Masterclass", "skills_taught": ["Power BI", "DAX"], "rating": 4.7},
    ]
    
    course_matcher = CourseSkillMatcher()
    ranked = course_matcher.rank_courses_for_skill("powerbi", test_courses)
    
    for course in ranked:
        print(f"  {course['title']} - relevance: {course['relevance_score']:.2f}")
    
    print("\n✓ Semantic matching tests complete!")
