"""Smoke tests for Gap Engine Service."""


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "gap-engine"


def test_analyze_role_gap_known_role(client):
    """POST /analyze-role-gap with a known role should return a valid response."""
    response = client.post("/analyze-role-gap", json={
        "role": "Data Scientist",
        "skills": ["Python", "SQL", "Machine Learning"],
        "experience": "mid",
        "education": "bachelor",
    })
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "data" in body
    assert body["data"]["source"] in ("mode_a", "mode_b", "none")


def test_analyze_role_gap_empty_role(client):
    """POST /analyze-role-gap with empty role should return validation error."""
    response = client.post("/analyze-role-gap", json={
        "role": "",
        "skills": [],
    })
    assert response.status_code == 422


def test_run_endpoint_known_role(client):
    """POST /run with full RoleGapRequest schema."""
    response = client.post("/run", json={
        "jobTitle": "Machine Learning Engineer",
        "userProfile": {
            "skills": [{"skillId": "S_python"}, {"skillId": "S_machine_learning"}],
            "experienceLevel": "senior",
            "educationLevel": "master",
        }
    })
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
