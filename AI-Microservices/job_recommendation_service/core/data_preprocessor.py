"""
Job Recommendation System - Data Preprocessing
Handles data loading, cleaning, and preprocessing for job recommendations
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import joblib
import logging
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class JobDataPreprocessor:
    """Handles preprocessing of job data for recommendation system"""

    def __init__(self, data_path: str = "../../data"):
        self.data_path = Path(data_path)
        self.jobs_df = None
        self.job_skills_df = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.scaler = StandardScaler()

    def load_data(self) -> bool:
        """Load job and job skills data"""
        try:
            jobs_path = self.data_path / "jobs.csv"
            skills_path = self.data_path / "job_skills.csv"

            if not jobs_path.exists():
                logger.error(f"Jobs data file not found: {jobs_path}")
                return False

            self.jobs_df = pd.read_csv(jobs_path)
            logger.info(f"Loaded {len(self.jobs_df)} jobs from {jobs_path}")

            if skills_path.exists():
                self.job_skills_df = pd.read_csv(skills_path)
                logger.info(f"Loaded {len(self.job_skills_df)} job skills from {skills_path}")
            else:
                logger.warning(f"Job skills file not found: {skills_path}")

            return True

        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return False

    def preprocess_jobs_data(self) -> bool:
        """Clean and preprocess jobs data"""
        if self.jobs_df is None:
            logger.error("Jobs data not loaded")
            return False

        try:
            # Handle missing values
            self.jobs_df = self.jobs_df.fillna('')

            # Create combined text features for TF-IDF
            text_columns = ['title', 'company', 'description', 'requirements', 'location']
            self.jobs_df['combined_text'] = self.jobs_df[text_columns].apply(
                lambda x: ' '.join(x.astype(str)), axis=1
            )

            # Clean text data
            self.jobs_df['combined_text'] = self.jobs_df['combined_text'].str.lower()
            self.jobs_df['combined_text'] = self.jobs_df['combined_text'].str.replace(
                r'[^\w\s]', '', regex=True
            )

            # Process salary information
            if 'salary' in self.jobs_df.columns:
                self.jobs_df['salary_numeric'] = pd.to_numeric(
                    self.jobs_df['salary'].str.extract(r'(\d+)')[0], errors='coerce'
                ).fillna(0)

            logger.info("Jobs data preprocessing completed")
            return True

        except Exception as e:
            logger.error(f"Error preprocessing jobs data: {e}")
            return False

    def create_tfidf_matrix(self, max_features: int = 5000, min_df: int = 2) -> bool:
        """Create TF-IDF matrix from job descriptions"""
        if self.jobs_df is None or 'combined_text' not in self.jobs_df.columns:
            logger.error("Jobs data not preprocessed")
            return False

        try:
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=max_features,
                min_df=min_df,
                stop_words='english',
                ngram_range=(1, 2)
            )

            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(
                self.jobs_df['combined_text']
            )

            logger.info(f"Created TF-IDF matrix with shape: {self.tfidf_matrix.shape}")
            return True

        except Exception as e:
            logger.error(f"Error creating TF-IDF matrix: {e}")
            return False

    def save_preprocessed_data(self, output_dir: str = "models") -> bool:
        """Save preprocessed data and models"""
        try:
            os.makedirs(output_dir, exist_ok=True)

            # Save processed dataframe
            self.jobs_df.to_pickle(f"{output_dir}/jobs_processed.pkl")

            # Save TF-IDF vectorizer and matrix
            if self.tfidf_vectorizer and self.tfidf_matrix is not None:
                joblib.dump(self.tfidf_vectorizer, f"{output_dir}/tfidf_vectorizer.pkl")
                joblib.dump(self.tfidf_matrix, f"{output_dir}/tfidf_matrix.pkl")

            logger.info(f"Preprocessed data saved to {output_dir}")
            return True

        except Exception as e:
            logger.error(f"Error saving preprocessed data: {e}")
            return False

    def load_preprocessed_data(self, input_dir: str = "models") -> bool:
        """Load preprocessed data and models"""
        try:
            # Load processed dataframe
            jobs_path = Path(input_dir) / "jobs_processed.pkl"
            if jobs_path.exists():
                self.jobs_df = pd.read_pickle(jobs_path)

            # Load TF-IDF models
            vectorizer_path = Path(input_dir) / "tfidf_vectorizer.pkl"
            matrix_path = Path(input_dir) / "tfidf_matrix.pkl"

            if vectorizer_path.exists() and matrix_path.exists():
                self.tfidf_vectorizer = joblib.load(vectorizer_path)
                self.tfidf_matrix = joblib.load(matrix_path)

            if self.jobs_df is not None and self.tfidf_vectorizer is not None and self.tfidf_matrix is not None:
                logger.info(f"Preprocessed data loaded from {input_dir}")
                return True

            logger.info(f"Preprocessed data not found in {input_dir}")
            return False

        except Exception as e:
            logger.error(f"Error loading preprocessed data: {e}")
            return False

    def get_job_features(self, job_id: int) -> Optional[np.ndarray]:
        """Get TF-IDF features for a specific job"""
        if self.tfidf_matrix is None:
            return None

        try:
            return self.tfidf_matrix[job_id].toarray().flatten()
        except IndexError:
            logger.warning(f"Job ID {job_id} not found")
            return None

    def get_similar_jobs(self, job_features: np.ndarray, top_n: int = 10) -> List[Dict[str, Any]]:
        """Find similar jobs using cosine similarity"""
        if self.tfidf_matrix is None or self.jobs_df is None:
            return []

        try:
            # Calculate cosine similarities
            similarities = cosine_similarity(job_features.reshape(1, -1), self.tfidf_matrix)[0]

            # Get top similar jobs (excluding the job itself if it's in the dataset)
            top_indices = np.argsort(similarities)[::-1][:top_n+1]

            similar_jobs = []
            for idx in top_indices:
                if idx < len(self.jobs_df):
                    job_data = self.jobs_df.iloc[idx].to_dict()
                    job_data['similarity_score'] = float(similarities[idx])
                    similar_jobs.append(job_data)

            return similar_jobs[:top_n]

        except Exception as e:
            logger.error(f"Error finding similar jobs: {e}")
            return []
