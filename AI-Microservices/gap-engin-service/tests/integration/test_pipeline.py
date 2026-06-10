"""
test_pipeline.py - Basic pipeline integration tests.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from src.pipeline import run_pipeline


class TestPipelineBasic:
    def test_known_title_returns_result(self):
        result = run_pipeline("data analyst")
        assert not result.get("error")
        assert result["jobTitle"] == "data analyst"
        assert len(result["requiredSkills"]) > 0

    def test_result_has_required_fields(self):
        result = run_pipeline("software engineer")
        for field in ["jobTitle", "source", "requiredSkills", "matchedSkills",
                      "missingSkills", "readinessScore", "roleConfidence", "unknownSkills"]:
            assert field in result, f"Missing field: {field}"

    def test_readiness_score_range(self):
        result = run_pipeline("data analyst")
        assert 0.0 <= result["readinessScore"] <= 1.0

    def test_confidence_range(self):
        result = run_pipeline("data analyst")
        assert 0.0 <= result["roleConfidence"] <= 1.0

    def test_with_user_skills(self):
        result = run_pipeline("data analyst", user_skills=["python", "sql"])
        assert not result.get("error")
        matched_ids = [s["skillId"] for s in result["matchedSkills"]]
        assert "S_python" in matched_ids or "S_sql" in matched_ids

    def test_without_user_skills_all_missing(self):
        result = run_pipeline("data analyst", user_skills=None)
        assert not result.get("error")
        assert len(result["matchedSkills"]) == 0
        assert len(result["missingSkills"]) == len(result["requiredSkills"])

    def test_experience_score_affects_readiness(self):
        result_high = run_pipeline("data analyst", user_skills=["python"], experience_score=1.0)
        result_low = run_pipeline("data analyst", user_skills=["python"], experience_score=0.3)
        assert result_high["readinessScore"] >= result_low["readinessScore"]

    def test_mode_a_source(self):
        result = run_pipeline("data analyst")
        assert result["source"] == "mode_a"
