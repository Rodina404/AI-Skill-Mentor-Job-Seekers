"""
test_gap_engine.py - Tests for skill gap computation (gap_engine.py).
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from src.gap_engine import compute_skill_gap, compute_readiness_score, run_gap_analysis


REQUIRED = [
    {"skillId": "S_python", "weight": 0.5},
    {"skillId": "S_sql", "weight": 0.3},
    {"skillId": "S_docker", "weight": 0.2},
]


class TestComputeSkillGap:
    def test_all_matched(self):
        result = compute_skill_gap(REQUIRED, ["S_python", "S_sql", "S_docker"])
        assert len(result["matchedSkills"]) == 3
        assert len(result["missingSkills"]) == 0
        assert result["skillScore"] == pytest.approx(1.0)

    def test_none_matched(self):
        result = compute_skill_gap(REQUIRED, [])
        assert len(result["matchedSkills"]) == 0
        assert len(result["missingSkills"]) == 3
        assert result["skillScore"] == pytest.approx(0.0)

    def test_partial_match(self):
        result = compute_skill_gap(REQUIRED, ["S_python"])
        assert result["skillScore"] == pytest.approx(0.5)
        assert len(result["matchedSkills"]) == 1
        assert len(result["missingSkills"]) == 2

    def test_extra_user_skills_ignored(self):
        result = compute_skill_gap(REQUIRED, ["S_python", "S_react", "S_aws"])
        assert result["skillScore"] == pytest.approx(0.5)


class TestComputeReadinessScore:
    def test_full_readiness(self):
        score = compute_readiness_score(1.0, 1.0, 1.0)
        assert score == pytest.approx(1.0)

    def test_zero_skill_score(self):
        score = compute_readiness_score(0.0, 1.0, 1.0)
        assert score == pytest.approx(0.0)

    def test_compound_scores(self):
        # 0.5 * 0.8 * 0.75 = 0.30
        score = compute_readiness_score(0.5, 0.8, 0.75)
        assert score == pytest.approx(0.30, abs=0.01)

    def test_capped_at_one(self):
        score = compute_readiness_score(1.5, 1.0, 1.0)
        assert score <= 1.0


class TestRunGapAnalysis:
    def test_full_analysis(self):
        result = run_gap_analysis(REQUIRED, ["S_python"], experience_score=0.8)
        assert "matchedSkills" in result
        assert "missingSkills" in result
        assert "readinessScore" in result
        assert 0.0 <= result["readinessScore"] <= 1.0
