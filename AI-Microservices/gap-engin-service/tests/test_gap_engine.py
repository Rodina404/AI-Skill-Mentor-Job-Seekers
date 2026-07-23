import pytest

from src.gap_engine import run_gap_analysis


def test_compute_skill_gap_and_readiness():
    required = [
        {"skillId": "S_sql", "weight": 0.22},
        {"skillId": "S_powerbi", "weight": 0.15},
    ]
    user = ["S_sql"]

    res = run_gap_analysis(required_skills=required, user_skill_ids=user, experience_score=1.0, education_score=1.0)

    # skillScore = 0.22 / (0.22 + 0.15) = 0.594594... rounded to 4 decimals -> 0.5946
    assert res["skillScore"] == pytest.approx(0.5946, rel=1e-3)

    # Readiness = skillScore*0.5 + experience*0.3 + education*0.2
    # = 0.5946*0.5 + 1.0*0.3 + 1.0*0.2 = 0.7973
    assert res["readinessScore"] == pytest.approx(0.7973, rel=1e-3)

    assert any(s["skillId"] == "S_sql" for s in res["matchedSkills"]) is True
    assert any(s["skillId"] == "S_powerbi" for s in res["missingSkills"]) is True
