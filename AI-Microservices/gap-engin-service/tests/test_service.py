"""
test_service.py - API endpoint tests (17 cases).
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

# Health
def test_health_returns_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_health_service_name():
    r = client.get("/health")
    assert r.json()["service"] == "gradrag"

def test_root_endpoint():
    r = client.get("/")
    assert r.status_code == 200
    assert "gradrag" in r.json()["service"]

# Basic /run
def test_run_minimal_request():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    assert r.status_code == 200
    assert r.json()["success"] is True

def test_run_has_required_fields():
    r = client.post("/run", json={"jobTitle": "software engineer"})
    data = r.json()["data"]
    for field in ["jobTitle", "source", "requiredSkills", "matchedSkills", "missingSkills", "readinessScore"]:
        assert field in data

def test_run_empty_title_rejected():
    r = client.post("/run", json={"jobTitle": ""})
    assert r.status_code == 422

def test_run_missing_title_rejected():
    r = client.post("/run", json={})
    assert r.status_code == 422

# With user profile
def test_run_with_skills():
    r = client.post("/run", json={
        "jobTitle": "data analyst",
        "userProfile": {"skills": [{"skillId": "S_python"}, {"skillId": "S_sql"}]}
    })
    assert r.status_code == 200
    data = r.json()["data"]
    matched = [s["skillId"] for s in data["matchedSkills"]]
    assert "S_python" in matched or "S_sql" in matched

def test_run_with_experience_score():
    r = client.post("/run", json={
        "jobTitle": "data analyst",
        "userProfile": {"skills": [], "experienceScore": 0.5}
    })
    assert r.status_code == 200

def test_run_experience_score_out_of_range():
    r = client.post("/run", json={
        "jobTitle": "data analyst",
        "userProfile": {"experienceScore": 1.5}
    })
    assert r.status_code == 422

# Response structure
def test_meta_present():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    assert "meta" in r.json()
    assert "processing_time_ms" in r.json()["meta"]

def test_mode_a_for_known_title():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    assert r.json()["data"]["source"] == "mode_a"

def test_skill_enrichment_has_name():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    skills = r.json()["data"]["requiredSkills"]
    for s in skills:
        assert "skill" in s
        assert len(s["skill"]) > 0

def test_readiness_score_range():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    score = r.json()["data"]["readinessScore"]
    assert 0.0 <= score <= 1.0

def test_role_confidence_range():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    conf = r.json()["data"]["roleConfidence"]
    assert 0.0 <= conf <= 1.0

def test_multiple_titles():
    titles = ["machine learning engineer", "devops engineer", "frontend developer"]
    for title in titles:
        r = client.post("/run", json={"jobTitle": title})
        assert r.status_code == 200, f"Failed for: {title}"

def test_unknown_skills_field_present():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    assert "unknownSkills" in r.json()["data"]

def test_required_skills_non_empty():
    r = client.post("/run", json={"jobTitle": "data analyst"})
    assert len(r.json()["data"]["requiredSkills"]) > 0
