from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_explain():
    payload = {
        "user_id": "test-user-123",
        "skill": "SQL",
        "course_title": "The Complete SQL Bootcamp: Go from Zero to Hero",
        "match_score": 0.95,
        "market_freq": 0.8,
        "job_title": "Data Analyst"
    }
    response = client.post("/run/explain", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    data = res_data["data"]
    assert "why_skill" in data
    assert "why_course" in data
