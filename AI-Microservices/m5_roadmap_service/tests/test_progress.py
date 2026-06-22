from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_update_progress():
    payload = {
        "user_id": "test-user-123",
        "roadmap_id": "mock-roadmap-123",
        "completed_items": [],
        "last_active_iso": "2026-06-23T00:00:00"
    }
    response = client.post("/run/progress", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    data = res_data["data"]
    assert "overall_pct" in data
    assert "completed_milestones" in data
    assert "eta_weeks" in data
