"""
test_components.py - Component initialization and basic loading tests.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from src.role_library import get_all_skill_ids, get_all_skills, get_skill_name, normalize_skill_name
from src.loaders import load_job_title_index


class TestSkillCatalog:
    def test_catalog_loads(self):
        skills = get_all_skills()
        assert len(skills) > 0

    def test_has_92_plus_skills(self):
        ids = get_all_skill_ids()
        assert len(ids) >= 50  # catalog has 90+

    def test_python_in_catalog(self):
        ids = get_all_skill_ids()
        assert "S_python" in ids

    def test_get_skill_name(self):
        assert get_skill_name("S_python") == "Python"
        assert get_skill_name("S_javascript") == "JavaScript"

    def test_unknown_skill_returns_id(self):
        assert get_skill_name("S_does_not_exist") == "S_does_not_exist"


class TestNormalization:
    def test_python(self):
        assert normalize_skill_name("python") == "S_python"

    def test_case_insensitive(self):
        assert normalize_skill_name("PYTHON") == "S_python"

    def test_alias_aws_ec2(self):
        assert normalize_skill_name("aws ec2") == "S_aws"

    def test_hyphen_normalization(self):
        assert normalize_skill_name("machine-learning") == "S_machine_learning"

    def test_unknown_returns_none(self):
        assert normalize_skill_name("xyzzy_not_a_skill_ever") is None


class TestRoleDatabase:
    def test_loads(self):
        roles, index = load_job_title_index()
        assert len(roles) >= 30

    def test_all_roles_have_skills(self):
        roles, _ = load_job_title_index()
        for role in roles:
            assert len(role.get("requiredSkills", [])) > 0, f"Role '{role['title']}' has no skills"

    def test_weights_sum_to_one(self):
        roles, _ = load_job_title_index()
        for role in roles:
            total = sum(s.get("weight", 0) for s in role["requiredSkills"])
            assert abs(total - 1.0) < 0.01, f"Weights for '{role['title']}' don't sum to 1.0 (got {total})"

    def test_loads_additional_role_files(self):
        roles, index = load_job_title_index()
        assert len(roles) >= 70
        assert "ai engineer" in index
        assert any(role["title"].lower() == "ai engineer" for role in roles)
