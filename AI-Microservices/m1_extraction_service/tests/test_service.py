"""Basic smoke tests for CV Extraction Service."""


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_run_missing_input(client):
    """POST /run with no file or text should return 400."""
    response = client.post("/run")
    assert response.status_code == 400


def test_run_text_input(client):
    """POST /run with plain resume text should return extracted data."""
    response = client.post("/run", data={
        "resumeText": "John Doe\nSkills: Python, SQL\nExperience: Software Engineer at ACME 2022-2024"
    })
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "extractedData" in body
