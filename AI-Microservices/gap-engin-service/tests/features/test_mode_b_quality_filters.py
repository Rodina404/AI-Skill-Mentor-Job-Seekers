from unittest.mock import MagicMock, patch

from src.llm import filter_evidence_supported_skills
from src.vectorstore import retrieve_similar_roles_with_scores


def test_mode_b_filter_keeps_only_confident_canonical_evidence_supported_skills():
    skills = [
        {"skillId": "S_python", "weight": 0.5, "confidence": 0.9},
        {"skillId": "S_react", "weight": 0.2, "confidence": 0.9},
        {"skillId": "S_invented", "weight": 0.2, "confidence": 0.9},
        {"skillId": "S_sql", "weight": 0.1, "confidence": 0.3},
    ]
    result = filter_evidence_supported_skills(skills, "The role requires Python and SQL.")
    assert [skill["skillId"] for skill in result] == ["S_python"]


def test_scored_retrieval_rejects_distant_documents():
    collection = MagicMock()
    collection.count.return_value = 2
    collection.query.return_value = {
        "documents": [["relevant", "distant"]],
        "distances": [[0.4, 1.8]],
        "metadatas": [[{}, {}]],
    }
    with patch("src.vectorstore.get_or_create_collection", return_value=collection):
        result = retrieve_similar_roles_with_scores("query", n_results=2, max_distance=1.25)
    assert [row["document"] for row in result] == ["relevant"]


def test_mode_b_filter_ranks_repeated_concrete_skills_above_broad_skills():
    skills = [
        {"skillId": "S_automation", "weight": 0.3, "confidence": 0.9},
        {"skillId": "S_terraform", "weight": 0.2, "confidence": 0.8},
        {"skillId": "S_docker", "weight": 0.2, "confidence": 0.8},
    ]
    evidence = """
    === Similar Role Skill Consensus ===
    - S_docker: supported by 5/6 similar roles
    - S_terraform: supported by 4/6 similar roles
    - S_automation: supported by 3/6 similar roles
    Required Skills: S_automation, S_terraform, S_docker
    """
    result = filter_evidence_supported_skills(skills, evidence)
    assert [skill["skillId"] for skill in result] == [
        "S_docker",
        "S_terraform",
        "S_automation",
    ]
