"""
Course Recommendation Engine
Implements collaborative filtering for course recommendations
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path

from .data_preprocessor import CourseDataPreprocessor

logger = logging.getLogger(__name__)

class CollaborativeCourseRecommender:
    """Course recommendation engine using collaborative filtering"""

    def __init__(self, data_path: str = "../../data", model_path: str = "models"):
        self.data_path = Path(data_path)
        self.model_path = Path(model_path)
        self.preprocessor = CourseDataPreprocessor(data_path)
        self.is_initialized = False
        self.knn_model = None

    def initialize(self) -> bool:
        """Initialize the recommendation system"""
        try:
            # Try to load preprocessed data first
            if not self.preprocessor.load_preprocessed_data(str(self.model_path)):
                # If not available, process data from scratch
                logger.info("Preprocessed data not found, processing raw data...")
                if not self.preprocessor.load_data():
                    return False

                if not self.preprocessor.preprocess_courses_data():
                    return False

                if not self.preprocessor.create_user_item_matrix():
                    return False

                # Save processed data for future use
                self.preprocessor.save_preprocessed_data(str(self.model_path))

            # Initialize KNN model for item-based collaborative filtering
            self._initialize_knn_model()

            self.is_initialized = True
            logger.info("Course recommender initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Error initializing course recommender: {e}")
            return False

    def _initialize_knn_model(self):
        """Initialize KNN model for finding similar items"""
        try:
            if self.preprocessor.user_item_matrix is None:
                return

            # Transpose matrix for item-based filtering (items x users)
            item_user_matrix = self.preprocessor.user_item_matrix.T

            # Initialize KNN with cosine similarity
            self.knn_model = NearestNeighbors(
                metric='cosine',
                algorithm='brute',
                n_neighbors=min(20, item_user_matrix.shape[0])
            )

            self.knn_model.fit(item_user_matrix)

            logger.info("KNN model initialized for item-based collaborative filtering")

        except Exception as e:
            logger.error(f"Error initializing KNN model: {e}")

    def recommend_courses(self, user_id: Optional[int] = None,
                         user_ratings: Optional[Dict[int, float]] = None,
                         skills: Optional[List[str]] = None,
                         target_role: str = "",
                         top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Recommend courses using collaborative filtering

        Args:
            user_id: Existing user ID for user-based filtering
            user_ratings: New user ratings for item-based filtering
            top_n: Number of recommendations to return

        Returns:
            List of recommended courses with scores
        """
        if not self.is_initialized:
            logger.error("Course recommender not initialized")
            return []

        try:
            if user_id is not None:
                # User-based collaborative filtering
                return self._user_based_recommendations(user_id, top_n)
            elif user_ratings is not None:
                # Item-based collaborative filtering for new users
                return self._item_based_recommendations(user_ratings, top_n)
            elif skills or target_role:
                # Profile-based recommendation using skills and role
                return self._profile_based_recommendations(skills or [], target_role, top_n)
            else:
                # Return popular courses as fallback
                return self._get_popular_courses(top_n)

        except Exception as e:
            logger.error(f"Error generating course recommendations: {e}")
            return []

    def _user_based_recommendations(self, user_id: int, top_n: int) -> List[Dict[str, Any]]:
        """Generate recommendations using user-based collaborative filtering"""
        try:
            # Get user's ratings
            user_ratings = self.preprocessor.get_user_ratings(user_id)

            if user_ratings is None:
                logger.warning(f"User {user_id} not found, returning popular courses")
                return self._get_popular_courses(top_n)

            # Find similar users
            similar_users = self.preprocessor.get_similar_users(user_ratings, top_n=50)

            if not similar_users:
                return self._get_popular_courses(top_n)

            # Get courses rated highly by similar users but not by target user
            recommendations = self._get_recommendations_from_similar_users(
                user_id, similar_users, user_ratings, top_n
            )

            return recommendations

        except Exception as e:
            logger.error(f"Error in user-based recommendations: {e}")
            return []

    def _item_based_recommendations(self, user_ratings: Dict[int, float],
                                  top_n: int) -> List[Dict[str, Any]]:
        """Generate recommendations using item-based collaborative filtering"""
        try:
            if self.knn_model is None or self.preprocessor.courses_df is None:
                return self._get_popular_courses(top_n)

            # Create user rating vector
            n_items = self.preprocessor.user_item_matrix.shape[1]
            rating_vector = np.zeros(n_items)

            for course_id, rating in user_ratings.items():
                if course_id in self.preprocessor.item_mapper:
                    item_idx = self.preprocessor.item_mapper[course_id]
                    rating_vector[item_idx] = rating

            # Find similar courses for each rated course
            recommendations = {}
            rated_items = [idx for idx, rating in enumerate(rating_vector) if rating > 0]

            for item_idx in rated_items:
                # Get similar items
                distances, indices = self.knn_model.kneighbors(
                    self.preprocessor.user_item_matrix.T[item_idx].reshape(1, -1),
                    n_neighbors=min(10, self.preprocessor.user_item_matrix.shape[1])
                )

                # Weight recommendations by similarity and user rating
                for dist, similar_idx in zip(distances[0], indices[0]):
                    if similar_idx not in rated_items:  # Don't recommend already rated items
                        similarity = 1 - dist  # Convert distance to similarity
                        score = similarity * rating_vector[item_idx]

                        course_id = self.preprocessor.item_inv_mapper.get(similar_idx)
                        if course_id is not None:
                            if course_id not in recommendations:
                                recommendations[course_id] = 0
                            recommendations[course_id] += score

            # Sort and return top recommendations
            sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)

            result = []
            for course_id, score in sorted_recs[:top_n]:
                course_data = self._get_course_details(course_id)
                if course_data:
                    course_data['recommendation_score'] = float(score)
                    course_data['recommendation_reason'] = "Based on similar courses you rated"
                    result.append(course_data)

            return result

        except Exception as e:
            logger.error(f"Error in item-based recommendations: {e}")
            return []

    def _profile_based_recommendations(self, skills: List[str], target_role: str, top_n: int) -> List[Dict[str, Any]]:
        """Generate simple course recommendations based on skills and desired role"""
        try:
            if self.preprocessor.courses_df is None:
                return []

            query_terms = [term.lower().strip() for term in skills if term]
            if target_role:
                query_terms.append(target_role.lower().strip())

            course_df = self.preprocessor.courses_df.copy()
            if query_terms:
                def compute_match(row):
                    # Consider common text fields present in the dataset
                    fields = ["title", "headline", "description", "instructor", "instructor_names", "category", "objectives", "curriculum"]
                    search_text = " ".join(
                        [str(row.get(field, "")).lower() for field in fields if field in row.index]
                    )
                    return sum(1 for term in query_terms if term in search_text)

                course_df["match_score"] = course_df.apply(compute_match, axis=1)
                course_df["popularity_score"] = 0.0
                if "rating" in course_df.columns and "students" in course_df.columns:
                    course_df["popularity_score"] = course_df["rating"] * np.log1p(course_df["students"])
                course_df["rank_score"] = course_df["match_score"] * 10 + course_df["popularity_score"]
                course_df = course_df[course_df["match_score"] > 0].sort_values("rank_score", ascending=False)
            else:
                course_df = course_df.copy()

            recommended = []
            for _, row in course_df.head(top_n).iterrows():
                course_data = row.to_dict()
                course_data["recommendation_score"] = float(course_data.get("rank_score", course_data.get("popularity_score", 0)))
                course_data["recommendation_reason"] = (
                    "Matches your skills and desired role"
                    if course_data.get("match_score", 0) > 0
                    else "Recommended course"
                )
                recommended.append(course_data)

            if recommended:
                return recommended

            return self._get_popular_courses(top_n)

        except Exception as e:
            logger.error(f"Error in profile-based recommendations: {e}")
            return []

    def _get_recommendations_from_similar_users(self, user_id: int,
                                              similar_users: List[int],
                                              user_ratings: np.ndarray,
                                              top_n: int) -> List[Dict[str, Any]]:
        """Get recommendations from similar users' preferences"""
        try:
            recommendations = {}

            for similar_user_id in similar_users:
                similar_ratings = self.preprocessor.get_user_ratings(similar_user_id)

                if similar_ratings is None:
                    continue

                # Find courses that similar user rated highly but target user hasn't rated
                for course_idx, rating in enumerate(similar_ratings):
                    if rating >= 4.0 and user_ratings[course_idx] == 0:  # Not rated by target user
                        course_id = self.preprocessor.item_inv_mapper.get(course_idx)
                        if course_id is not None:
                            if course_id not in recommendations:
                                recommendations[course_id] = {'score': 0, 'count': 0}
                            recommendations[course_id]['score'] += rating
                            recommendations[course_id]['count'] += 1

            # Calculate average scores
            for course_id in recommendations:
                recommendations[course_id]['avg_score'] = (
                    recommendations[course_id]['score'] / recommendations[course_id]['count']
                )

            # Sort by average score
            sorted_recs = sorted(
                recommendations.items(),
                key=lambda x: x[1]['avg_score'],
                reverse=True
            )

            result = []
            for course_id, data in sorted_recs[:top_n]:
                course_data = self._get_course_details(course_id)
                if course_data:
                    course_data['recommendation_score'] = data['avg_score']
                    course_data['recommendation_reason'] = f"Liked by {data['count']} similar users"
                    result.append(course_data)

            return result

        except Exception as e:
            logger.error(f"Error getting recommendations from similar users: {e}")
            return []

    def _get_course_details(self, course_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific course"""
        try:
            if self.preprocessor.courses_df is None:
                return None

            if 0 <= course_id < len(self.preprocessor.courses_df):
                return self.preprocessor.courses_df.iloc[course_id].to_dict()
            else:
                logger.warning(f"Course ID {course_id} out of range")
                return None

        except Exception as e:
            logger.error(f"Error getting course details: {e}")
            return None

    def _get_popular_courses(self, top_n: int) -> List[Dict[str, Any]]:
        """Get popular courses as fallback recommendations"""
        try:
            if self.preprocessor.courses_df is None:
                return []

            # Sort by rating and number of students (popularity proxy)
            popular_df = self.preprocessor.courses_df.copy()

            if 'rating' in popular_df.columns and 'students' in popular_df.columns:
                popular_df['popularity_score'] = (
                    popular_df['rating'] * np.log1p(popular_df['students'])
                )
                popular_df = popular_df.sort_values('popularity_score', ascending=False)

            popular_courses = popular_df.head(top_n).to_dict('records')

            # Add recommendation metadata
            for course in popular_courses:
                course['recommendation_score'] = course.get('popularity_score', 0)
                course['recommendation_reason'] = "Popular course"

            return popular_courses

        except Exception as e:
            logger.error(f"Error getting popular courses: {e}")
            return []