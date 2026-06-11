from unittest.mock import patch

from src.pipeline import run_pipeline
from src.vectorstore import retrieve_similar_roles


def test_local_vector_evidence_is_available():
    chunks = retrieve_similar_roles("data engineering with python and spark", n_results=3)
    assert chunks


def test_mode_b_works_without_live_external_apis():
    with patch("src.pipeline._mode_a", return_value=None):
        result = run_pipeline("data engineering with python and spark")
    assert result["source"] == "mode_b"
    assert result["requiredSkills"]
