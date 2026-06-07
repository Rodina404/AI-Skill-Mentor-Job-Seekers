"""
Course Recommendation System - Data Preprocessing
Handles data loading, cleaning, and preprocessing for collaborative filtering
"""

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from scipy.sparse import csr_matrix
import joblib
import logging
import os
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

class CourseDataPreprocessor:
    """Handles preprocessing of course data for collaborative filtering"""

    def __init__(self, data_path: str = "../../data"):
        self.data_path = Path(data_path)
        self.courses_df = None
        self.user_item_matrix = None
        self.user_mapper = None
        self.item_mapper = None
        self.user_inv_mapper = None
        self.item_inv_mapper = None

    def load_data(self) -> bool:
        """Load course data and create user-item interactions"""
        try:
            courses_path = self.data_path / "courses.csv"

            if not courses_path.exists():
                logger.error(f"Courses data file not found: {courses_path}")
                return False

            self.courses_df = pd.read_csv(courses_path)
            logger.info(f"Loaded {len(self.courses_df)} courses from {courses_path}")

            # Create synthetic user-item interactions for collaborative filtering
            # In a real system, this would come from user ratings/behavior data
            self._create_synthetic_interactions()

            return True

        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return False

    def _create_synthetic_interactions(self):
        """Create synthetic user-item interactions for demonstration"""
        try:
            # Generate synthetic user-course interactions
            np.random.seed(42)  # For reproducibility

            n_users = 1000  # Synthetic users
            n_courses = len(self.courses_df)

            # Create user-item matrix with ratings (1-5 scale)
            interactions = []

            for user_id in range(n_users):
                # Each user interacts with 5-20 random courses
                n_interactions = np.random.randint(5, 21)
                course_indices = np.random.choice(n_courses, n_interactions, replace=False)

                for course_idx in course_indices:
                    # Rating based on course popularity and some randomness
                    base_rating = self._calculate_base_rating(course_idx)
                    rating = np.clip(base_rating + np.random.normal(0, 0.5), 1, 5)
                    interactions.append({
                        'user_id': user_id,
                        'course_id': course_idx,
                        'rating': round(rating, 1)
                    })

            self.interactions_df = pd.DataFrame(interactions)
            logger.info(f"Created {len(self.interactions_df)} synthetic user-course interactions")

        except Exception as e:
            logger.error(f"Error creating synthetic interactions: {e}")

    def _calculate_base_rating(self, course_idx: int) -> float:
        """Calculate base rating for a course based on its features"""
        try:
            course = self.courses_df.iloc[course_idx]

            # Base rating influenced by course level and category popularity
            base_rating = 3.0

            # Higher rating for advanced courses
            if 'level' in course and course['level'] == 'Advanced':
                base_rating += 0.5
            elif 'level' in course and course['level'] == 'Intermediate':
                base_rating += 0.2

            # Add some randomness
            base_rating += np.random.normal(0, 0.3)

            return np.clip(base_rating, 1, 5)

        except Exception:
            return 3.0

    def create_user_item_matrix(self) -> bool:
        """Create user-item matrix for collaborative filtering"""
        if self.interactions_df is None:
            logger.error("Interactions data not available")
            return False

        try:
            # Create user and item mappers
            unique_users = self.interactions_df['user_id'].unique()
            unique_items = self.interactions_df['course_id'].unique()

            self.user_mapper = {user: idx for idx, user in enumerate(unique_users)}
            self.item_mapper = {item: idx for idx, item in enumerate(unique_items)}

            self.user_inv_mapper = {v: k for k, v in self.user_mapper.items()}
            self.item_inv_mapper = {v: k for k, v in self.item_mapper.items()}

            # Create sparse matrix
            n_users = len(unique_users)
            n_items = len(unique_items)

            row = self.interactions_df['user_id'].map(self.user_mapper)
            col = self.interactions_df['course_id'].map(self.item_mapper)
            data = self.interactions_df['rating']

            self.user_item_matrix = csr_matrix(
                (data, (row, col)),
                shape=(n_users, n_items)
            )

            logger.info(f"Created user-item matrix with shape: {self.user_item_matrix.shape}")
            return True

        except Exception as e:
            logger.error(f"Error creating user-item matrix: {e}")
            return False

    def preprocess_courses_data(self) -> bool:
        """Clean and preprocess courses data"""
        if self.courses_df is None:
            logger.error("Courses data not loaded")
            return False

        try:
            # Handle missing values
            self.courses_df = self.courses_df.fillna('')

            # Clean text data
            text_columns = ['title', 'description', 'instructor', 'category']
            for col in text_columns:
                if col in self.courses_df.columns:
                    self.courses_df[col] = self.courses_df[col].astype(str).str.lower()

            # Process numeric columns
            if 'rating' in self.courses_df.columns:
                self.courses_df['rating'] = pd.to_numeric(
                    self.courses_df['rating'], errors='coerce'
                ).fillna(0)

            if 'students' in self.courses_df.columns:
                self.courses_df['students'] = pd.to_numeric(
                    self.courses_df['students'], errors='coerce'
                ).fillna(0)

            logger.info("Courses data preprocessing completed")
            return True

        except Exception as e:
            logger.error(f"Error preprocessing courses data: {e}")
            return False

    def save_preprocessed_data(self, output_dir: str = "models") -> bool:
        """Save preprocessed data and models"""
        try:
            os.makedirs(output_dir, exist_ok=True)

            # Save processed dataframes
            self.courses_df.to_pickle(f"{output_dir}/courses_processed.pkl")
            self.interactions_df.to_pickle(f"{output_dir}/interactions_processed.pkl")

            # Save user-item matrix and mappers
            if self.user_item_matrix is not None:
                joblib.dump(self.user_item_matrix, f"{output_dir}/user_item_matrix.pkl")
                joblib.dump(self.user_mapper, f"{output_dir}/user_mapper.pkl")
                joblib.dump(self.item_mapper, f"{output_dir}/item_mapper.pkl")
                joblib.dump(self.user_inv_mapper, f"{output_dir}/user_inv_mapper.pkl")
                joblib.dump(self.item_inv_mapper, f"{output_dir}/item_inv_mapper.pkl")

            logger.info(f"Preprocessed data saved to {output_dir}")
            return True

        except Exception as e:
            logger.error(f"Error saving preprocessed data: {e}")
            return False

    def load_preprocessed_data(self, input_dir: str = "models") -> bool:
        """Load preprocessed data and models"""
        try:
            # Load processed dataframes
            courses_path = Path(input_dir) / "courses_processed.pkl"
            interactions_path = Path(input_dir) / "interactions_processed.pkl"

            if courses_path.exists():
                self.courses_df = pd.read_pickle(courses_path)

            if interactions_path.exists():
                self.interactions_df = pd.read_pickle(interactions_path)

            # Load user-item matrix and mappers
            matrix_path = Path(input_dir) / "user_item_matrix.pkl"
            user_mapper_path = Path(input_dir) / "user_mapper.pkl"
            item_mapper_path = Path(input_dir) / "item_mapper.pkl"
            user_inv_mapper_path = Path(input_dir) / "user_inv_mapper.pkl"
            item_inv_mapper_path = Path(input_dir) / "item_inv_mapper.pkl"

            if all(p.exists() for p in [matrix_path, user_mapper_path, item_mapper_path,
                                      user_inv_mapper_path, item_inv_mapper_path]):
                self.user_item_matrix = joblib.load(matrix_path)
                self.user_mapper = joblib.load(user_mapper_path)
                self.item_mapper = joblib.load(item_mapper_path)
                self.user_inv_mapper = joblib.load(user_inv_mapper_path)
                self.item_inv_mapper = joblib.load(item_inv_mapper_path)

            logger.info(f"Preprocessed data loaded from {input_dir}")
            return True

        except Exception as e:
            logger.error(f"Error loading preprocessed data: {e}")
            return False

    def get_user_ratings(self, user_id: int) -> Optional[np.ndarray]:
        """Get ratings vector for a specific user"""
        if self.user_item_matrix is None or self.user_mapper is None:
            return None

        try:
            if user_id not in self.user_mapper:
                return None

            user_idx = self.user_mapper[user_id]
            return self.user_item_matrix[user_idx].toarray().flatten()

        except Exception as e:
            logger.error(f"Error getting user ratings: {e}")
            return None

    def get_similar_users(self, user_ratings: np.ndarray, top_n: int = 10) -> List[int]:
        """Find users similar to the given user"""
        if self.user_item_matrix is None:
            return []

        try:
            # Calculate cosine similarities between users
            similarities = cosine_similarity(user_ratings.reshape(1, -1), self.user_item_matrix)[0]

            # Get top similar users
            top_indices = np.argsort(similarities)[::-1][:top_n+1]

            similar_users = []
            for idx in top_indices:
                if idx < len(self.user_inv_mapper):
                    similar_users.append(self.user_inv_mapper[idx])

            return similar_users[1:top_n+1]  # Exclude the user themselves

        except Exception as e:
            logger.error(f"Error finding similar users: {e}")
            return []