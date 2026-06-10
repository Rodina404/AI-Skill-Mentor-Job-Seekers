from src.loaders import load_job_title_index
from src.role_library import get_all_skill_ids


def test_loaded_roles_have_unique_canonical_skills_and_normalized_weights():
    roles, _ = load_job_title_index()
    canonical_ids = set(get_all_skill_ids())

    for role in roles:
        skills = role["requiredSkills"]
        ids = [skill["skillId"] for skill in skills]
        assert set(ids) <= canonical_ids, role["title"]
        assert len(ids) == len(set(ids)), role["title"]
        assert all(skill["weight"] > 0 for skill in skills), role["title"]
        assert abs(sum(skill["weight"] for skill in skills) - 1.0) <= 0.01, role["title"]
