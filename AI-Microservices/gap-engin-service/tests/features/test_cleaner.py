import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from src.llm import _clean_llm_response

def test_strips_markdown_fences():
    raw = '```json\n[{"skillId": "S_python", "weight": 0.5, "confidence": 0.8}]\n```'
    result = _clean_llm_response(raw)
    assert len(result) == 1

def test_filters_zero_weight():
    raw = '[{"skillId": "S_python", "weight": 0.0, "confidence": 0.9}]'
    result = _clean_llm_response(raw)
    assert len(result) == 0

def test_adds_s_prefix_if_missing():
    raw = '[{"skillId": "python", "weight": 0.5, "confidence": 0.9}]'
    result = _clean_llm_response(raw)
    assert len(result) == 1
    assert result[0]["skillId"].startswith("S_")
