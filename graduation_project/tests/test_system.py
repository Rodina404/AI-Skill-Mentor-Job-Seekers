"""
Comprehensive Tests for AI Skill Mentor Graduation Project
Tests both job and course recommendation systems
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
import numpy as np
import pandas as pd
from pathlib import Path
import sys
import os

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from main_app.app import app
from job_recommendation.core.job_recommender import JobRecommender
from course_recommendation.core.course_recommender import CollaborativeCourseRecommender
from utils.groq_service import GroqService

# Test client
client = TestClient(app)

class TestJobRecommendationSystem:
    """Test cases for job recommendation system"""

    def test_job_recommender_initialization(self):
        """Test that job recommender initializes correctly"""
        recommender = JobRecommender()
        assert recommender.initialize() == True
        assert recommender.is_initialized == True

    def test_job_recommendations_with_skills(self):
        """Test job recommendations with user skills"""
        recommender = JobRecommender()

        if not recommender.initialize():
            pytest.skip("Job recommender initialization failed")

        user_skills = ["python", "machine learning", "data analysis"]
        recommendations = recommender.recommend_jobs(user_skills=user_skills, top_n=5)

        assert isinstance(recommendations, list)
        assert len(recommendations) <= 5

        if recommendations:
            # Check recommendation structure
            rec = recommendations[0]
            assert "title" in rec
            assert "similarity_score" in rec
            assert "relevance_explanation" in rec

    def test_job_recommendations_api(self):
        """Test job recommendations API endpoint"""
        test_data = {
            "skills": ["python", "javascript", "react"],
            "experience_years": 2,
            "education": "Bachelor's in Computer Science",
            "top_n": 3
        }

        response = client.post("/api/v1/recommend-job", json=test_data)

        # Should return 200 even if no recommendations (fallback to popular jobs)
        assert response.status_code in [200, 503]  # 503 if not initialized

        if response.status_code == 200:
            data = response.json()
            assert "recommendations" in data
            assert "total_count" in data
            assert isinstance(data["recommendations"], list)

    def test_job_details_api(self):
        """Test job details API endpoint"""
        response = client.get("/api/v1/job/0")

        # Should return 200 or 404
        assert response.status_code in [200, 404, 503]

        if response.status_code == 200:
            data = response.json()
            assert "job" in data

class TestCourseRecommendationSystem:
    """Test cases for course recommendation system"""

    def test_course_recommender_initialization(self):
        """Test that course recommender initializes correctly"""
        recommender = CollaborativeCourseRecommender()
        assert recommender.initialize() == True
        assert recommender.is_initialized == True

    def test_course_recommendations_popular(self):
        """Test popular course recommendations"""
        recommender = CollaborativeCourseRecommender()

        if not recommender.initialize():
            pytest.skip("Course recommender initialization failed")

        recommendations = recommender.recommend_courses(top_n=5)

        assert isinstance(recommendations, list)
        assert len(recommendations) <= 5

        if recommendations:
            rec = recommendations[0]
            assert "title" in rec
            assert "recommendation_score" in rec

    def test_course_recommendations_user_based(self):
        """Test user-based course recommendations"""
        recommender = CollaborativeCourseRecommender()

        if not recommender.initialize():
            pytest.skip("Course recommender initialization failed")

        # Test with user ID 0 (should exist in synthetic data)
        recommendations = recommender.recommend_courses(user_id=0, top_n=5)

        assert isinstance(recommendations, list)
        # May return fewer recommendations if user has rated many courses

    def test_course_recommendations_item_based(self):
        """Test item-based course recommendations"""
        recommender = CollaborativeCourseRecommender()

        if not recommender.initialize():
            pytest.skip("Course recommender initialization failed")

        # Test with some user ratings
        user_ratings = {0: 5.0, 1: 4.0, 2: 3.0}
        recommendations = recommender.recommend_courses(
            user_ratings=user_ratings, top_n=5
        )

        assert isinstance(recommendations, list)

    def test_course_recommendations_api(self):
        """Test course recommendations API endpoint"""
        # Test popular courses
        response = client.post("/api/v1/recommend-course", json={"top_n": 3})

        assert response.status_code in [200, 503]

        if response.status_code == 200:
            data = response.json()
            assert "recommendations" in data
            assert "total_count" in data
            assert "recommendation_type" in data

        # Test user-based recommendations
        test_data = {"user_id": 0, "top_n": 3}
        response = client.post("/api/v1/recommend-course", json=test_data)

        assert response.status_code in [200, 503]

        # Test item-based recommendations
        test_data = {"user_ratings": {0: 5.0, 1: 4.0}, "top_n": 3}
        response = client.post("/api/v1/recommend-course", json=test_data)

        assert response.status_code in [200, 503]

    def test_course_details_api(self):
        """Test course details API endpoint"""
        response = client.get("/api/v1/course/0")

        assert response.status_code in [200, 404, 503]

        if response.status_code == 200:
            data = response.json()
            assert "course" in data

class TestGroqIntegration:
    """Test cases for Groq API integration"""

    def test_groq_service_initialization(self):
        """Test Groq service initialization"""
        # Skip if no API key
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            pytest.skip("GROQ_API_KEY not set")

        groq_service = GroqService(api_key=api_key)
        assert groq_service is not None
        assert groq_service.client is not None

    def test_skill_analysis_generation(self):
        """Test skill analysis generation"""
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            pytest.skip("GROQ_API_KEY not set")

        groq_service = GroqService(api_key=api_key)

        user_skills = ["python", "sql", "tableau"]
        job_data = {
            "title": "Data Analyst",
            "description": "Analyze business data and create reports",
            "requirements": "Python, SQL, Excel, Tableau"
        }

        analysis = groq_service.generate_skill_analysis(user_skills, job_data)

        assert isinstance(analysis, str)
        assert len(analysis) > 0
        assert "python" in analysis.lower() or "sql" in analysis.lower()

class TestSystemIntegration:
    """Test cases for system integration"""

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert "endpoints" in data

    def test_job_statistics(self):
        """Test job statistics endpoint"""
        response = client.get("/api/v1/job-stats")

        assert response.status_code in [200, 503]

        if response.status_code == 200:
            data = response.json()
            assert "total_jobs" in data

    def test_course_statistics(self):
        """Test course statistics endpoint"""
        response = client.get("/api/v1/course-stats")

        assert response.status_code in [200, 503]

        if response.status_code == 200:
            data = response.json()
            assert "total_courses" in data

class TestDataValidation:
    """Test cases for data validation and preprocessing"""

    def test_job_data_loading(self):
        """Test job data loading and preprocessing"""
        from job_recommendation.core.data_preprocessor import JobDataPreprocessor

        preprocessor = JobDataPreprocessor()

        # Test data loading
        assert preprocessor.load_data() == True
        assert preprocessor.jobs_df is not None
        assert len(preprocessor.jobs_df) > 0

        # Test preprocessing
        assert preprocessor.preprocess_jobs_data() == True
        assert 'combined_text' in preprocessor.jobs_df.columns

        # Test TF-IDF creation
        assert preprocessor.create_tfidf_matrix() == True
        assert preprocessor.tfidf_matrix is not None

    def test_course_data_loading(self):
        """Test course data loading and preprocessing"""
        from course_recommendation.core.data_preprocessor import CourseDataPreprocessor

        preprocessor = CourseDataPreprocessor()

        # Test data loading
        assert preprocessor.load_data() == True
        assert preprocessor.courses_df is not None
        assert len(preprocessor.courses_df) > 0

        # Test preprocessing
        assert preprocessor.preprocess_courses_data() == True

        # Test user-item matrix creation
        assert preprocessor.create_user_item_matrix() == True
        assert preprocessor.user_item_matrix is not None

# Run tests if executed directly
if __name__ == "__main__":
    # Run basic functionality tests
    print("Running AI Skill Mentor Graduation Project Tests...")

    # Test health check
    response = client.get("/health")
    if response.status_code == 200:
        print("✓ Health check passed")
    else:
        print("✗ Health check failed")

    # Test root endpoint
    response = client.get("/")
    if response.status_code == 200:
        print("✓ Root endpoint passed")
    else:
        print("✗ Root endpoint failed")

    # Test job recommender initialization
    try:
        job_recommender = JobRecommender()
        if job_recommender.initialize():
            print("✓ Job recommender initialization passed")
        else:
            print("✗ Job recommender initialization failed")
    except Exception as e:
        print(f"✗ Job recommender initialization error: {e}")

    # Test course recommender initialization
    try:
        course_recommender = CollaborativeCourseRecommender()
        if course_recommender.initialize():
            print("✓ Course recommender initialization passed")
        else:
            print("✗ Course recommender initialization failed")
    except Exception as e:
        print(f"✗ Course recommender initialization error: {e}")

    print("\nBasic tests completed. Run 'pytest' for comprehensive testing.")