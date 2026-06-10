import pytest


def test_pipeline_mode_a_lookup(monkeypatch):
    import src.pipeline as pipeline

    # Prepare a fake role returned by Mode A lookup
    role = {
        "title": "Data Scientist",
        "requiredSkills": [
            {"skillId": "S_sql", "weight": 0.22},
            {"skillId": "S_powerbi", "weight": 0.15},
        ],
    }

    def fake_find_best_match(title):
        return (role, 0.92, "exact")

    # Patch the pipeline's find_best_match reference to our fake
    monkeypatch.setattr(pipeline, "find_best_match", fake_find_best_match)

    # Call pipeline with userProfile.skills[].skillId
    res = pipeline.run_pipeline(
        job_title="Data Scientist",
        user_profile={"skills": [{"skillId": "S_sql"}]},
        experience_score=1.0,
        education_score=1.0,
    )

    assert res["roleConfidence"] == pytest.approx(0.92, rel=1e-3)
    assert any(s["skillId"] == "S_sql" for s in res["matchedSkills"]) is True
    assert any(s["skillId"] == "S_powerbi" for s in res["missingSkills"]) is True
    assert "requiredSkills" in res and isinstance(res["requiredSkills"], list)
