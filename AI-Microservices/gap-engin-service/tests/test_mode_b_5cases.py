import pytest
from unittest.mock import patch

from src.pipeline import run_pipeline


CASES = [
    ("Edge AI Engineer", "Required skills: Python, C++, embedded systems, quantization."),
    ("AI Safety Engineer", "Required skills: machine learning, verification, interpretability, monitoring."),
    ("Federated Learning Engineer", "Required skills: Python, federated learning, privacy, TensorFlow Federated."),
    ("Observability Engineer", "Required skills: logging, metrics, tracing, Prometheus, Grafana."),
    ("Feature Store Engineer", "Required skills: data pipelines, feature engineering, Spark, Kafka."),
]


@pytest.mark.parametrize("title,evidence", CASES)
def test_mode_b_returns_required_skills(title: str, evidence: str):
    """Force pipeline into Mode B and ensure a non-empty requiredSkills list is returned."""
    with patch("src.pipeline._mode_a", return_value=None), \
         patch("src.pipeline.gather_evidence", return_value=(evidence, True)), \
         patch("src.llm._get_groq_client", return_value=None):
        res = run_pipeline(job_title=title)

    assert isinstance(res, dict), "Pipeline must return a dict"
    assert res.get("source") == "mode_b", f"Expected source 'mode_b' for {title}, got {res.get('source')}"
    req = res.get("requiredSkills") or []
    assert len(req) > 0, f"Mode B should return at least one required skill for {title}"
