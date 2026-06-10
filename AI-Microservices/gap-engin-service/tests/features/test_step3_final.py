import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from src.pipeline import run_pipeline
from src.role_library import get_skill_name

def test_skill_names_resolvable():
    result = run_pipeline("data analyst")
    for skill in result.get("requiredSkills", []):
        name = get_skill_name(skill["skillId"])
        assert name != "" 

def test_weights_positive():
    result = run_pipeline("software engineer")
    for skill in result.get("requiredSkills", []):
        assert skill["weight"] > 0

def test_matched_subset_of_required():
    result = run_pipeline("data analyst", user_skills=["python"])
    req_ids = {s["skillId"] for s in result["requiredSkills"]}
    matched_ids = {s["skillId"] for s in result["matchedSkills"]}
    assert matched_ids.issubset(req_ids)
