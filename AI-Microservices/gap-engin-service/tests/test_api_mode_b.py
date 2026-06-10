import pytest
from unittest.mock import patch

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


CASES = [
    ("Edge AI Engineer", "Required skills: Python, C++, embedded systems, quantization."),
    ("AI Safety Engineer", "Required skills: machine learning, verification, interpretability, monitoring."),
    ("Federated Learning Engineer", "Required skills: Python, federated learning, privacy, TensorFlow Federated."),
    ("Observability Engineer", "Required skills: logging, metrics, tracing, Prometheus, Grafana."),
    ("Feature Store Engineer", "Required skills: data pipelines, feature engineering, Spark, Kafka."),
]


@pytest.mark.parametrize("title,evidence", CASES)
def test_api_run_mode_b(title: str, evidence: str):
    """Call the `/run` API and force Mode B via mocks; expect non-empty requiredSkills."""
    with patch("src.pipeline._mode_a", return_value=None), \
         patch("src.pipeline.gather_evidence", return_value=(evidence, True)), \
         patch("src.llm._get_groq_client", return_value=None):
        r = client.post("/run", json={"jobTitle": title})

    assert r.status_code == 200
    payload = r.json()
    assert payload.get("success") is True
    data = payload.get("data", {})
    assert data.get("source") == "mode_b"
    assert isinstance(data.get("requiredSkills"), list) and len(data.get("requiredSkills")) > 0
