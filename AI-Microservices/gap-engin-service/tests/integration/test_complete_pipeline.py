import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from src.pipeline import run_pipeline

def test_full_pipeline_ml_engineer():
    result = run_pipeline("machine learning engineer", user_skills=["python", "pytorch"])
    assert not result.get("error")
    assert result["source"] == "mode_a"

def test_full_pipeline_with_all_scores():
    result = run_pipeline("data scientist", user_skills=["python", "sql"], experience_score=0.8, education_score=0.9)
    assert not result.get("error")
    assert 0.0 <= result["readinessScore"] <= 1.0

def test_unknown_skills_tracked():
    result = run_pipeline("data analyst", user_skills=["python", "unknowntool_xyz"])
    assert not result.get("error")
    assert "unknowntool_xyz" in result["unknownSkills"]
