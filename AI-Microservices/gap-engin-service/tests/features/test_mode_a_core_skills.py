from unittest.mock import patch

from src.pipeline import _mode_a


def test_mode_a_returns_highest_weight_core_skills():
    role = {
        "requiredSkills": [
            {"skillId": f"S_skill_{index}", "weight": weight}
            for index, weight in enumerate([0.01, 0.30, 0.20, 0.15, 0.12, 0.10, 0.07, 0.05])
        ]
    }
    with patch("src.pipeline.find_best_match", return_value=(role, 1.0, "exact")):
        skills, confidence, match_type = _mode_a("example")

    assert len(skills) == 6
    assert "S_skill_0" not in {skill["skillId"] for skill in skills}
    assert "S_skill_7" not in {skill["skillId"] for skill in skills}
    assert abs(sum(skill["weight"] for skill in skills) - 1.0) < 0.01
    assert confidence == 1.0
    assert match_type == "exact"
