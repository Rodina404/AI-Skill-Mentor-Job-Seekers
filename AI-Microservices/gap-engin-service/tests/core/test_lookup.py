"""
test_lookup.py - Tests for Mode A title matching (loaders.py).
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from src.loaders import find_best_match, load_job_title_index, _normalize_title


class TestTitleNormalization:
    def test_lowercase(self):
        assert _normalize_title("Data Analyst") == "data analyst"

    def test_strip_spaces(self):
        assert _normalize_title("  machine learning engineer  ") == "machine learning engineer"

    def test_remove_punctuation(self):
        assert _normalize_title("Node.js Developer") == "node js developer"


class TestExactMatch:
    def test_exact_match_data_analyst(self):
        result = find_best_match("data analyst")
        assert result is not None
        role, conf, match_type = result
        assert match_type == "exact"
        assert conf == 1.0
        assert role["title"] == "data analyst"

    def test_exact_match_case_insensitive(self):
        result = find_best_match("Data Analyst")
        assert result is not None
        _, _, match_type = result
        assert match_type == "exact"

    def test_exact_match_software_engineer(self):
        result = find_best_match("software engineer")
        assert result is not None

    def test_no_match_gibberish(self):
        result = find_best_match("xyzzy frobnicator 9000", semantic_threshold=0.99)
        # Either None or very low confidence
        if result is not None:
            _, conf, _ = result
            assert conf < 0.74


class TestRoleIndex:
    def test_index_loads(self):
        roles, index = load_job_title_index()
        assert len(roles) > 0
        assert len(index) > 0

    def test_index_has_data_analyst(self):
        _, index = load_job_title_index()
        assert "data analyst" in index

    def test_role_has_required_skills(self):
        roles, _ = load_job_title_index()
        for role in roles:
            assert "title" in role
            assert "requiredSkills" in role
            assert len(role["requiredSkills"]) > 0
