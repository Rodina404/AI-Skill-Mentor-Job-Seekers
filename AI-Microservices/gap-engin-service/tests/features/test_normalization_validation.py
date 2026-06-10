import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from src.role_library import normalize_skill_name, normalize_skills_list

MAPPINGS = [
    ("python", "S_python"), ("aws ec2", "S_aws"),
    ("robot operating system", "S_ros"), ("nlp", "S_nlp"),
    ("machine-learning", "S_machine_learning"), ("k8s", "S_kubernetes"),
    ("pyspark", "S_spark"), ("postgres", "S_postgresql"),
]

def test_all_aliases_resolve():
    for raw, expected in MAPPINGS:
        assert normalize_skill_name(raw) == expected, f"Failed: {raw!r}"

def test_normalize_skills_list():
    mapped, unmapped = normalize_skills_list(["python", "aws ec2", "notarealskillxyz"])
    assert "S_python" in mapped
    assert "S_aws" in mapped
    assert "notarealskillxyz" in unmapped

def test_no_duplicates():
    mapped, _ = normalize_skills_list(["python", "Python", "python3"])
    assert mapped.count("S_python") == 1
