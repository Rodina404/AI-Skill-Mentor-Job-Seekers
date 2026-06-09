"""
Course Recommendation Engine - State of the Art (SOTA)
Implements FAISS vector search with SentenceTransformers
"""

import os
import faiss
import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from urllib.parse import quote_plus
from sentence_transformers import SentenceTransformer

from .skill_processor import SkillProcessor

logger = logging.getLogger(__name__)

class CourseRecommender:
    """Advanced Hybrid course recommendation engine using FAISS and Semantic similarity"""

    def __init__(self):
        logger.info("Initializing HuggingFace Models (SentenceTransformer and NER)...")
        # Load the MPNET model for high-quality semantic embeddings
        self.device = "cpu"
        self.model = SentenceTransformer("all-mpnet-base-v2", device=self.device)
        self.skill_processor = SkillProcessor(model=self.model)
        
        # Load local FAISS artifacts
        self.artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
        
        # Try loading indices
        self.courses_index = self._load_index("courses.index")
        self.courses_metadata = self._load_metadata("courses.pkl")
        
        if self.courses_index is None or self.courses_metadata is None:
            logger.error(f"Failed to load FAISS artifacts from {self.artifacts_dir}. Course recommendations will fail!")
            self.is_initialized = False
        else:
            self.is_initialized = True
            logger.info("Course recommender loaded FAISS artifacts successfully.")

    def _load_index(self, filename: str):
        path = os.path.join(self.artifacts_dir, filename)
        if os.path.exists(path):
            return faiss.read_index(path)
        return None

    def _load_metadata(self, filename: str):
        path = os.path.join(self.artifacts_dir, filename)
        if os.path.exists(path):
            return pd.read_pickle(path)
        return None

    def initialize(self) -> bool:
        """Compatibility method for pipeline"""
        return self.is_initialized

    def _validate_course_data(self, course: pd.Series) -> bool:
        title = str(course.get('title') or course.get('course_name') or '').strip()
        return len(title) > 3

    def _get_course_level_score(self, level: str) -> int:
        level_str = str(level or '').lower()
        if 'beginner' in level_str or 'foundation' in level_str or 'introductory' in level_str:
            return 1
        elif 'intermediate' in level_str or 'intermediate' in level_str:
            return 2
        elif 'advanced' in level_str or 'expert' in level_str or 'professional' in level_str:
            return 3
        return 2

    def _normalize_link(self, link: Any) -> str:
        if link is None: return ""
        link_str = str(link).strip()
        if not link_str or link_str.lower() == 'nan': return ""
        if not link_str.startswith('http'): link_str = 'https://' + link_str
        return link_str

    def _build_course_search_url(self, title: str, provider: str = "udemy") -> str:
        if not title: return "https://www.udemy.com/courses/search/"
        query = quote_plus(str(title))
        return f"https://www.udemy.com/courses/search/?q={query}"

    def recommend_courses(self, user_skills: List[str], target_role: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Recommends courses ordered by progression level to bridge skill gaps intelligently."""
        if not self.is_initialized:
            return []

        # We want to recommend courses that teach the target_role, excluding what the user already knows.
        # Since we don't have the job description here, we use the target_role as the proxy for the missing skills!
        query_text = target_role
        logger.info(f"Querying FAISS with target role (as missing skills proxy): {query_text}")
        
        query_vector = self.model.encode([query_text], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)

        distances, indices = self.courses_index.search(query_vector, top_n * 2)
        results = []
        
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue

            course = self.courses_metadata.iloc[idx]
            if not self._validate_course_data(course):
                continue
            
            course_title = course.get('title') or course.get('course_name') or 'Unknown Course'
            course_description = str(course.get('description') or course.get('headline') or '').strip()[:150]
            course_link = self._normalize_link(course.get('url') or course.get('course_url') or course.get('course_link'))
            if not course_link:
                course_link = self._build_course_search_url(course_title)

            level = course.get('instructional_level') or course.get('level') or 'All Levels'
            level_score = self._get_course_level_score(level)
            rating = float(course.get('rating') or 0.0)
            
            # Score courses: prefer beginner→intermediate progression, then by rating
            relevance_score = float(distances[0][i])
            progression_score = 1.0 / level_score if level_score > 0 else 0.5
            rating_score = min(rating / 5.0, 1.0)
            
            combined_score = round((0.5 * relevance_score) + (0.3 * progression_score) + (0.2 * rating_score), 3)

            results.append({
                'course_id': str(idx),
                'title': course_title,
                'provider': course.get('instructor_names') or course.get('instructor') or 'Udemy',
                'rating': round(rating, 1),
                'duration': course.get('duration', 'Self-paced'),
                'level': level,
                'description': course_description,
                'missing_skills': [target_role],
                'similarity_score': combined_score,
                'url': course_link
            })

        # Sort by progression level first (beginner first), then by relevance score
        results.sort(key=lambda x: (x['level'] != 'Beginner Level', -x['similarity_score']))
        
        # Remove duplicates
        seen_titles = set()
        unique_results = []
        for course in results:
            title_lower = course['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_results.append(course)
        
        return unique_results[:top_n]