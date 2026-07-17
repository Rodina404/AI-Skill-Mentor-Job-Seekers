from core.adzuna_client import AdzunaJobProvider


def test_front_end_title_normalizes_to_frontend():
    provider = AdzunaJobProvider()

    assert provider._score_title("UI Front-End Developer", "Frontend Developer") == 1.0


def test_expected_role_skills_are_used_for_backend_roles():
    provider = AdzunaJobProvider()

    skills = provider._expected_skills_for_role("Backend Engineer", "Senior API Engineer")

    assert "REST API" in skills
    assert "SQL" in skills


def test_quality_filter_prefers_jobs_with_skill_evidence():
    provider = AdzunaJobProvider()
    provider.min_quality_score = 0.28

    weak = {
        "title": "Generic Developer",
        "quality_score": 0.1,
        "readiness_score": 0,
        "role_skill_score": 0,
        "title_score": 0.5,
    }
    strong = {
        "title": "Frontend Developer",
        "quality_score": 0.7,
        "readiness_score": 0.5,
        "role_skill_score": 0.5,
        "title_score": 1.0,
    }

    result = provider._filter_quality_jobs([weak, strong], top_n=1)

    assert result == [strong]


def test_hybrid_score_caps_weak_semantic_only_jobs():
    provider = AdzunaJobProvider()
    provider.semantic_weight = 0.4

    score = provider._hybrid_score(
        readiness_score=0,
        role_skill_score=0,
        title_score=0.5,
        recency_boost=1.0,
        semantic_score=0.8,
        has_skill_evidence=False,
    )

    assert score <= 0.24


def test_final_score_uses_upstream_readiness_and_recency():
    provider = AdzunaJobProvider()
    provider.skill_extractor.extract = lambda description: ["Python", "Kubernetes"]
    provider._days_since_posted = lambda created: 5
    mapped = provider._build_recommendation(
        {"title": "Backend Engineer", "description": "Python APIs", "created": "2026-07-17T10:00:00Z"},
        ["Python"],
        "Backend Engineer",
        "Backend Engineer Python",
        80,
    )
    assert mapped["readinessScore"] == 0.8
    assert mapped["recencyScore"] == 1.0
    assert mapped["finalScore"] == 0.86
    assert mapped["matchedExtractedSkills"] == ["Python"]
    assert mapped["unmatchedExtractedSkills"] == ["Kubernetes"]


def test_recommendations_are_sorted_by_final_score(monkeypatch):
    monkeypatch.setenv("ADZUNA_APP_ID", "test-id")
    monkeypatch.setenv("ADZUNA_APP_KEY", "test-key")
    provider = AdzunaJobProvider()
    provider.skill_extractor.extract = lambda description: ["Python"]
    provider._days_since_posted = lambda created: {"new": 3, "old": 120}[created]
    provider._search = lambda query, location: {
        "results": [
            {"id": "old", "title": "Old Backend Job", "description": "Python", "created": "old"},
            {"id": "new", "title": "New Backend Job", "description": "Python", "created": "new"},
        ]
    }
    jobs = provider.recommend_jobs(["Python"], "Backend Engineer", top_n=2, readiness_score=80)
    assert [job["id"] for job in jobs] == ["new", "old"]
    assert jobs[0]["finalScore"] > jobs[1]["finalScore"]
