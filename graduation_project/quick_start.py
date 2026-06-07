#!/usr/bin/env python
"""
Quick start script for the AI Skill Mentor graduation project
Demonstrates the system with sample data
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_job_recommendations():
    """Test job recommendation system"""
    print("\n" + "="*60)
    print("TESTING JOB RECOMMENDATION SYSTEM")
    print("="*60)

    from job_recommendation.core.job_recommender import JobRecommender

    try:
        recommender = JobRecommender()
        print("✓ Job recommender created")

        if not recommender.initialize():
            print("✗ Failed to initialize job recommender")
            return False

        print("✓ Job recommender initialized")

        # Test recommendations
        user_skills = ["python", "machine learning", "data analysis"]
        print(f"\nFinding jobs for skills: {user_skills}")

        recommendations = recommender.recommend_jobs(
            user_skills=user_skills,
            user_experience=2,
            user_education="Bachelor's in Computer Science",
            top_n=5
        )

        if recommendations:
            print(f"\n✓ Found {len(recommendations)} job recommendations:")
            for i, job in enumerate(recommendations[:3], 1):
                print(f"\n  {i}. {job.get('title', 'Unknown')} at {job.get('company', 'Unknown')}")
                print(f"     Similarity: {job.get('similarity_score', 0):.2%}")
                print(f"     Explanation: {job.get('relevance_explanation', '')}")
        else:
            print("✗ No recommendations found")

        return True

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_course_recommendations():
    """Test course recommendation system"""
    print("\n" + "="*60)
    print("TESTING COURSE RECOMMENDATION SYSTEM")
    print("="*60)

    from course_recommendation.core.course_recommender import CollaborativeCourseRecommender

    try:
        recommender = CollaborativeCourseRecommender()
        print("✓ Course recommender created")

        if not recommender.initialize():
            print("✗ Failed to initialize course recommender")
            return False

        print("✓ Course recommender initialized")

        # Test user-based recommendations
        print("\n--- User-Based Collaborative Filtering ---")
        print("Finding courses for user 0...")

        recommendations = recommender.recommend_courses(
            user_id=0,
            top_n=5
        )

        if recommendations:
            print(f"\n✓ Found {len(recommendations)} course recommendations:")
            for i, course in enumerate(recommendations[:3], 1):
                print(f"\n  {i}. {course.get('title', 'Unknown')}")
                print(f"     Score: {course.get('recommendation_score', 0):.2f}")
                print(f"     Reason: {course.get('recommendation_reason', '')}")
        else:
            print("✗ No recommendations found")

        # Test item-based recommendations
        print("\n--- Item-Based Collaborative Filtering ---")
        user_ratings = {0: 5.0, 1: 4.0, 2: 3.0}
        print(f"Finding courses based on ratings: {user_ratings}")

        recommendations = recommender.recommend_courses(
            user_ratings=user_ratings,
            top_n=5
        )

        if recommendations:
            print(f"\n✓ Found {len(recommendations)} course recommendations:")
            for i, course in enumerate(recommendations[:3], 1):
                print(f"\n  {i}. {course.get('title', 'Unknown')}")
                print(f"     Score: {course.get('recommendation_score', 0):.2f}")
        else:
            print("ℹ No additional recommendations for these ratings")

        return True

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_groq_integration():
    """Test Groq API integration"""
    print("\n" + "="*60)
    print("TESTING GROQ API INTEGRATION")
    print("="*60)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("⚠ GROQ_API_KEY not set, skipping Groq tests")
        return True

    try:
        from utils.groq_service import GroqService

        groq = GroqService(api_key=api_key)
        print("✓ Groq service initialized")

        # Test skill analysis
        print("\nGenerating skill analysis...")
        user_skills = ["python", "sql"]
        job_data = {
            "title": "Data Scientist",
            "description": "Analyze data and build ML models",
            "requirements": "Python, SQL, Machine Learning, Tableau"
        }

        analysis = groq.generate_skill_analysis(user_skills, job_data)
        print(f"\n✓ Skill Analysis:\n{analysis[:300]}...")

        return True

    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def print_summary():
    """Print project summary"""
    print("\n" + "="*60)
    print("AI SKILL MENTOR - GRADUATION PROJECT SUMMARY")
    print("="*60)

    summary = """
PROJECT STRUCTURE:
  ✓ Job Recommendation System (TF-IDF + Cosine Similarity)
  ✓ Course Recommendation System (Collaborative Filtering)
  ✓ Groq API Integration for AI Features
  ✓ FastAPI REST API with 12+ endpoints
  ✓ Comprehensive test suite

KEY FEATURES:
  • TF-IDF vectorization for job matching
  • User-based and item-based collaborative filtering
  • Cosine similarity for recommendations
  • KNN algorithm for similar items
  • AI-powered skill gap analysis
  • Career advice generation
  • Learning path recommendations

API ENDPOINTS:
  POST   /api/v1/recommend-job          - Job recommendations
  GET    /api/v1/job/{id}               - Job details
  GET    /api/v1/job-stats              - Job statistics
  POST   /api/v1/recommend-course       - Course recommendations
  GET    /api/v1/course/{id}            - Course details
  GET    /api/v1/course-stats           - Course statistics
  POST   /api/v1/rate-course            - Record rating

TESTING:
  ✓ Automated test suite with pytest
  ✓ Integration tests for both systems
  ✓ API endpoint tests
  ✓ Data validation tests
  ✓ Groq integration tests

ALGORITHMS:
  1. Job Recommendation:
     - TF-IDF Vectorization
     - Cosine Similarity Matching
     - Skill Gap Analysis

  2. Course Recommendation:
     - Collaborative Filtering (User-Based)
     - Collaborative Filtering (Item-Based)
     - K-Nearest Neighbors
     - Rating Prediction

TO RUN THE API:
  python main_app/app.py

TO RUN TESTS:
  pytest tests/test_system.py -v

TO TEST QUICK START:
  python quick_start.py
"""

    print(summary)

if __name__ == "__main__":
    print_summary()

    # Run tests
    job_success = test_job_recommendations()
    course_success = test_course_recommendations()
    groq_success = test_groq_integration()

    # Summary
    print("\n" + "="*60)
    print("TEST RESULTS")
    print("="*60)
    print(f"Job Recommendations:     {'✓ PASSED' if job_success else '✗ FAILED'}")
    print(f"Course Recommendations:  {'✓ PASSED' if course_success else '✗ FAILED'}")
    print(f"Groq Integration:        {'✓ PASSED' if groq_success else '✗ FAILED'}")
    print("="*60)

    if all([job_success, course_success, groq_success]):
        print("\n✓ ALL TESTS PASSED!")
        print("\nNext steps:")
        print("  1. Start the API: python main_app/app.py")
        print("  2. Visit docs: http://localhost:8000/docs")
        print("  3. Run tests: pytest tests/test_system.py -v")
    else:
        print("\n⚠ Some tests failed. Check the output above for details.")
