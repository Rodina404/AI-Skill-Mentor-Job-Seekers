from unittest.mock import patch

from src.llm import extract_skills_from_evidence
from src.pipeline import run_pipeline
from src.role_library import normalize_skill_name


def test_common_roles_and_aliases_resolve_locally():
    for title in [
        "research scientist",
        "quantitative analyst",
        "technical lead",
        "solutions architect",
        "data architect",
        "tech lead",
        "cloud solutions architect",
    ]:
        assert run_pipeline(title)["source"] == "mode_a"


def test_invalid_title_does_not_call_modes():
    with patch("src.pipeline._mode_a") as mode_a, patch("src.pipeline._mode_b") as mode_b:
        result = run_pipeline("123456")
    assert result["errorCode"] == "INVALID_JOB_TITLE"
    mode_a.assert_not_called()
    mode_b.assert_not_called()


def test_typo_normalization():
    assert normalize_skill_name("pytohn") == "S_python"


def test_llm_unavailable_uses_local_extraction():
    with patch("src.llm._get_groq_client", return_value=None):
        skills = extract_skills_from_evidence("data engineer", "Python SQL Spark Docker")
    assert {skill["skillId"] for skill in skills} >= {"S_python", "S_sql", "S_spark"}
