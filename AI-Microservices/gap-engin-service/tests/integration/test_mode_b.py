import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
import pytest
from unittest.mock import patch
from src.pipeline import run_pipeline

def test_fallback_to_error_when_both_fail():
    with patch("src.pipeline._mode_a", return_value=None), \
         patch("src.pipeline._mode_b", return_value=None):
        result = run_pipeline("some obscure niche role xyz")
        assert result.get("error") is True
        assert result.get("errorCode") == "NO_MATCH_FOUND"

def test_mode_b_used_when_mode_a_fails():
    fake_skills = [{"skillId": "S_python", "weight": 1.0}]
    with patch("src.pipeline._mode_a", return_value=None), \
         patch("src.pipeline._mode_b", return_value=fake_skills):
        result = run_pipeline("some niche role")
        assert not result.get("error")
        assert result["source"] == "mode_b"
