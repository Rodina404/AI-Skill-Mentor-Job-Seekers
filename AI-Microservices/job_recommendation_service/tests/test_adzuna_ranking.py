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
