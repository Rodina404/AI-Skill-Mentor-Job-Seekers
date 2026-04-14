"""
Pipeline - Orchestrates the complete skill normalization workflow.

Pure Python module (no FastAPI imports).
"""

import time
from typing import Dict, Any
from .normalizer import normalize_skills
from .profile_builder import build_user_profile


class SkillNormalizationPipeline:
    """Orchestrates L1-L4 normalization pipeline."""
    
    def __init__(self, skills_db: Dict[str, Any], rules: Dict[str, str], skill_embeddings: Dict[str, Any]):
        """
        Initialize pipeline with databases.
        
        Args:
            skills_db: Canonical skills database
            rules: L1 rule mappings
            skill_embeddings: Pre-computed skill embeddings
        """
        self.skills_db = skills_db
        self.rules = rules
        self.skill_embeddings = skill_embeddings
    
    def run(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute complete normalization pipeline.
        
        Args:
            request_data: {userId, skills, education, experience}
        
        Returns:
            {
                userId: str,
                skills: [...],
                education: {...},
                experience: {...},
                statistics: {...}
            }
        """
        start_time = time.time()
        
        # Extract request fields
        user_id = request_data.get('userId', '')
        skills = request_data.get('skills', [])
        education = request_data.get('education', {})
        experience = request_data.get('experience', {})
        
        # ==== L1-L4 PIPELINE ====
        # L1: Rule mapping, L2: Decision logic, L3: Embedding matching, L4: Deduplication
        normalized_skills = normalize_skills(
            skills,
            self.skills_db,
            self.rules,
            self.skill_embeddings
        )
        
        # Build final profile
        profile = build_user_profile(
            user_id,
            normalized_skills,
            education,
            experience
        )
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            'profile': profile,
            'processing_time_ms': processing_time_ms
        }
