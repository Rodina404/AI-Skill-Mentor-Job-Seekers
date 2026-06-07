def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data

def test_run_recommendations_success(client):
    payload = {
        "user_id": "u123",
        "missing_skills": [
            {"skill_id": "S_python", "skill_name": "Python"},
            {"skill_id": "S_powerbi", "skill_name": "Power BI"}
        ],
        "user_constraints": {
            "level": "beginner",
            "language": "en",
            "hours_per_week": 10,
            "max_duration_hours": 15
        }
    }
    
    response = client.post("/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] is True
    assert "data" in data
    assert "recommendations" in data["data"]
    
    recs = data["data"]["recommendations"]
    assert len(recs) == 2  # One for Python, one for Power BI
    
    for r in recs:
        assert r["skill_id"] in ["S_python", "S_powerbi"]
        # Ensure courses exist
        if r["skill_id"] == "S_python":
            assert len(r["courses"]) > 0
            # Test constraints: level=beginner, duration <= 15
            for c in r["courses"]:
                assert c["level"] == "beginner"
                assert c["duration"] <= 15
                assert c["language"] == "en"

def test_run_recommendations_error(client):
    # Invalid payload (missing user_id, which is required)
    payload = {
        "missing_skills": [
            {"skill_id": "S_python", "skill_name": "Python"}
        ]
    }
    
    response = client.post("/run", json=payload)
    # FastAPI returns 422 for validation error by default before hitting our handler
    assert response.status_code == 422
