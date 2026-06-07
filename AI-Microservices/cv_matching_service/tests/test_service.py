"""
Integration & unit tests for CV Matching & Job Scoring Service.

Embeddings and FAISS are mocked at the correct import paths so no
sentence-transformer model download is needed.
"""
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_fake_vector_db(candidate_metadata):
    """Return a minimal FAISS-shaped mock returning one scored document."""
    fake_doc = MagicMock()
    fake_doc.metadata = candidate_metadata

    fake_db = MagicMock()
    fake_db.similarity_search_with_score.return_value = [(fake_doc, 0.8)]
    return fake_db


# Patch targets — must match the name used INSIDE the importing module
_PATCH_VS   = "core.matcher.build_vector_store"   # used in core/matcher.py
_PATCH_EMB  = "core.vector_store.get_embeddings"  # called inside vector_store


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    from main import app
    with TestClient(app) as c:
        yield c


CANDIDATE_META = {
    "candidateId": "C001",
    "name": "Jane Doe",
    "skills": ["Python", "FastAPI", "Machine Learning"],
    "experience": 4.0,
    "education": "BSc Computer Science",
    "tools": [],
}

REQUEST_PAYLOAD = {
    "jobId": "J001",
    "jobDescription": (
        "Looking for a Python backend engineer with FastAPI "
        "and 2+ years of experience."
    ),
    "candidates": [{
        "candidateId": "C001",
        "name": "Jane Doe",
        "skills": ["Python", "FastAPI", "Machine Learning"],
        "experience": 4.0,
        "education": "BSc Computer Science",
    }],
}


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        assert client.get("/health").status_code == 200

    def test_health_status_ok(self, client):
        assert client.get("/health").json()["status"] == "ok"

    def test_health_service_name(self, client):
        assert client.get("/health").json()["service"] == "CV Matching & Job Scoring Service"

    def test_health_version(self, client):
        assert client.get("/health").json()["version"] == "1.0.0"


# ---------------------------------------------------------------------------
# POST /match — happy path
# ---------------------------------------------------------------------------

class TestMatchEndpoint:

    def _post(self, client, payload=None):
        return client.post("/match", json=payload or REQUEST_PAYLOAD)

    @patch(_PATCH_VS)
    def test_match_returns_200(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        assert self._post(client).status_code == 200

    @patch(_PATCH_VS)
    def test_match_success_true(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        assert self._post(client).json()["success"] is True

    @patch(_PATCH_VS)
    def test_match_echoes_job_id(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        data = self._post(client).json()
        assert data["data"]["jobId"] == "J001"

    @patch(_PATCH_VS)
    def test_match_returns_one_ranked_candidate(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        ranked = self._post(client).json()["data"]["rankedCandidates"]
        assert len(ranked) == 1

    @patch(_PATCH_VS)
    def test_match_candidate_name(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        ranked = self._post(client).json()["data"]["rankedCandidates"]
        assert ranked[0]["name"] == "Jane Doe"

    @patch(_PATCH_VS)
    def test_match_score_in_range(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        score = self._post(client).json()["data"]["rankedCandidates"][0]["score"]
        assert 0 <= score <= 100

    @patch(_PATCH_VS)
    def test_match_has_processing_time(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        meta = self._post(client).json()["meta"]
        assert "processingTimeMs" in meta
        assert meta["processingTimeMs"] >= 0

    # ── skill breakdown ──────────────────────────────────────────────────────

    @patch(_PATCH_VS)
    def test_match_skill_fields_present(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        c = self._post(client).json()["data"]["rankedCandidates"][0]
        for field in ("matching_skills", "missing_skills",
                      "skill_match_count", "skill_total_required"):
            assert field in c, f"Missing field: {field}"

    @patch(_PATCH_VS)
    def test_match_skill_counts_consistent(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(CANDIDATE_META)
        c = self._post(client).json()["data"]["rankedCandidates"][0]
        assert c["skill_match_count"] == len(c["matching_skills"])
        assert (
            c["skill_match_count"] + len(c["missing_skills"])
            == c["skill_total_required"]
        )

    # ── validation errors ────────────────────────────────────────────────────

    def test_missing_job_description_returns_422(self, client):
        assert client.post("/match", json={"jobId": "J001"}).status_code == 422

    def test_missing_job_id_returns_422(self, client):
        assert client.post(
            "/match", json={"jobDescription": "Python engineer"}
        ).status_code == 422

    def test_empty_body_returns_422(self, client):
        assert client.post("/match", json={}).status_code == 422

    # ── fallback to local candidates ─────────────────────────────────────────

    FALLBACK_CANDIDATE = {
        "candidateId": "F001",
        "name": "Fallback Frank",
        "skills": ["SQL"],
        "experience": 2.0,
        "education": "BSc",
        "tools": [],
    }

    @patch(_PATCH_VS)
    @patch("routes.match.fallback_candidates", [FALLBACK_CANDIDATE])
    def test_uses_fallback_when_no_candidates_provided(self, mock_vs, client):
        mock_vs.return_value = _make_fake_vector_db(self.FALLBACK_CANDIDATE)
        payload = {
            "jobId": "J999",
            "jobDescription": "SQL analyst needed",
        }
        data = client.post("/match", json=payload).json()
        assert data["success"] is True
        assert data["data"]["rankedCandidates"][0]["name"] == "Fallback Frank"
