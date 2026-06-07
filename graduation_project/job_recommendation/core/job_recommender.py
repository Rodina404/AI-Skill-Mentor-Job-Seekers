"""
Job Recommendation Engine
Implements TF-IDF based job recommendations with cosine similarity
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path

from .data_preprocessor import JobDataPreprocessor

logger = logging.getLogger(__name__)

class JobRecommender:
    """Job recommendation engine using TF-IDF and cosine similarity"""

    def __init__(self, data_path: str = "../../data", model_path: str = "models"):
        self.data_path = Path(data_path)
        self.model_path = Path(model_path)
        self.preprocessor = JobDataPreprocessor(data_path)
        self.is_initialized = False

    def initialize(self) -> bool:
        """Initialize the recommendation system"""
        try:
            # Try to load preprocessed data first
            if not self.preprocessor.load_preprocessed_data(str(self.model_path)):
                # If not available, process data from scratch
                logger.info("Preprocessed data not found, processing raw data...")
                if not self.preprocessor.load_data():
                    return False

                if not self.preprocessor.preprocess_jobs_data():
                    return False

                if not self.preprocessor.create_tfidf_matrix():
                    return False

                # Save processed data for future use
                self.preprocessor.save_preprocessed_data(str(self.model_path))

            self.is_initialized = True
            logger.info("Job recommender initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Error initializing job recommender: {e}")
            return False

    def _create_user_profile_vector(self, user_skills: List[str],
                                  user_experience: int = 0,
                                  user_education: str = "",
                                  desired_role: str = "") -> np.ndarray:
        """Create a user profile vector from skills and preferences"""
        if not self.is_initialized or self.preprocessor.tfidf_vectorizer is None:
            return np.array([])

        try:
            # Combine user information into text
            user_text = ' '.join(user_skills)
            if user_education:
                user_text += f" {user_education}"

            if desired_role:
                user_text += f" {desired_role}"

            # Transform user profile using the same TF-IDF vectorizer
            user_vector = self.preprocessor.tfidf_vectorizer.transform([user_text])

            return user_vector.toarray().flatten()

        except Exception as e:
            logger.error(f"Error creating user profile vector: {e}")
            return np.array([])

    def recommend_jobs(self, user_skills: List[str],
                      user_experience: int = 0,
                      user_education: str = "",
                      desired_role: str = "",
                      top_n: int = 10,
                      min_similarity: float = 0.1) -> List[Dict[str, Any]]:
        """
        Recommend jobs based on user profile

        Args:
            user_skills: List of user skills
            user_experience: Years of experience
            user_education: Education level
            top_n: Number of recommendations to return
            min_similarity: Minimum similarity threshold

        Returns:
            List of recommended jobs with similarity scores
        """
        if not self.is_initialized:
            logger.error("Job recommender not initialized")
            return []

        try:
            # Create user profile vector
            user_vector = self._create_user_profile_vector(
                user_skills, user_experience, user_education,
                desired_role
            )

            if user_vector.size == 0:
                return []

            # Calculate similarities with all jobs
            similarities = cosine_similarity(
                user_vector.reshape(1, -1),
                self.preprocessor.tfidf_matrix
            )[0]

            # Filter by minimum similarity
            valid_indices = np.where(similarities >= min_similarity)[0]

            if len(valid_indices) == 0:
                logger.warning("No jobs found above minimum similarity threshold")
                return []

            # Get top similar jobs
            top_indices = valid_indices[np.argsort(similarities[valid_indices])[::-1][:top_n]]

            recommendations = []
            for idx in top_indices:
                job_data = self.preprocessor.jobs_df.iloc[idx].to_dict()
                job_data['similarity_score'] = float(similarities[idx])

                # Add relevance explanation
                job_data['relevance_explanation'] = self._generate_explanation(
                    user_skills, job_data
                )

                recommendations.append(job_data)

            logger.info(f"Generated {len(recommendations)} job recommendations")
            return recommendations

        except Exception as e:
            logger.error(f"Error generating job recommendations: {e}")
            return []

    def _generate_explanation(self, user_skills: List[str], job_data: Dict[str, Any]) -> str:
        """Generate explanation for why this job was recommended"""
        try:
            job_title = job_data.get('title', '')
            job_description = job_data.get('description', '').lower()

            # Find matching skills
            matching_skills = []
            for skill in user_skills:
                if skill.lower() in job_description:
                    matching_skills.append(skill)

            if matching_skills:
                return f"Matches your skills in: {', '.join(matching_skills[:3])}"
            else:
                return f"Related to your profile based on job requirements"

        except Exception as e:
            return "Recommended based on profile analysis"

    def get_job_details(self, job_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific job"""
        if not self.is_initialized or self.preprocessor.jobs_df is None:
            return None

        try:
            if 0 <= job_id < len(self.preprocessor.jobs_df):
                return self.preprocessor.jobs_df.iloc[job_id].to_dict()
            else:
                logger.warning(f"Job ID {job_id} out of range")
                return None

        except Exception as e:
            logger.error(f"Error getting job details: {e}")
            return None

    def get_popular_jobs(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """Get most popular/relevant jobs (fallback recommendations)"""
        if not self.is_initialized or self.preprocessor.jobs_df is None:
            return []

        try:
            # For now, return first N jobs as popular ones
            # In a real system, this would be based on application counts or ratings
            popular_jobs = self.preprocessor.jobs_df.head(top_n).to_dict('records')
            return popular_jobs

        except Exception as e:
            logger.error(f"Error getting popular jobs: {e}")
            return []