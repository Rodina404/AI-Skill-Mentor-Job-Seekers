import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
import pytest
from unittest.mock import patch, MagicMock
from src.llm import _clean_llm_response, extract_skills_from_evidence

def test_clean_llm_response_valid():
    raw = '[{"skillId": "S_python", "weight": 0.5, "confidence": 0.9}]'
    result = _clean_llm_response(raw)
    assert len(result) == 1
    assert result[0]["skillId"] == "S_python"

def test_clean_llm_response_filters_generic():
    raw = '[{"skillId": "S_communication", "weight": 0.5, "confidence": 0.9}]'
    result = _clean_llm_response(raw)
    assert len(result) == 0

def test_clean_llm_response_invalid_json():
    result = _clean_llm_response("not json at all")
    assert result == []

def test_extract_skills_no_api_key():
    with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
        result = extract_skills_from_evidence("data analyst", "some evidence")
        assert result == []
