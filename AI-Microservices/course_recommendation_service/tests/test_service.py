def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_run_endpoint_validation_error(client):
    # Missing required fields
    response = client.post("/run", json={"user_id": "123"})
    assert response.status_code == 422
