from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_roadmap():
    payload = {
        "user_id": "test-user-123",
        "missing_skills": ["SQL", "Power BI"],
        "hours_per_week": 10,
        "deadline_weeks": 8,
        "job_title": "Data Analyst",
        "resume_id": "resume-123",
        "job_id": "job-123"
    }
    response = client.post("/run/roadmap", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "roadmap_id" in res_data["data"]
    assert "roadmap" in res_data["data"]
    assert "timeline_svg" in res_data["data"]
    assert "cards_svg" in res_data["data"]
