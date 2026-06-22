from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_notifications():
    payload = {
        "user_id": "test-user-123",
        "last_active_iso": "2026-06-23T00:00:00",
        "progress_pct": 50.0,
        "roadmap_id": "mock-roadmap-123"
    }
    response = client.post("/run/notify", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    data = res_data["data"]
    assert "alerts" in data
