import os
import json
from pathlib import Path

import pytest
import pandas as pd
from fastapi.testclient import TestClient

from main import app
from core.pipeline import JobPipeline
from core.job_recommender import JobRecommender
from core.adzuna_client import AdzunaJobProvider
from routes.run import recommender


@pytest.fixture(autouse=True)
def ensure_env_clean(monkeypatch, tmp_path):
    # Ensure Adzuna is not configured for these tests unless explicitly set
    monkeypatch.delenv("ADZUNA_APP_ID", raising=False)
    monkeypatch.delenv("ADZUNA_APP_KEY", raising=False)
    monkeypatch.delenv("ADZUNA_COUNTRY", raising=False)
    yield


@pytest.fixture
def temp_data_dir(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    jobs_path = data_dir / "jobs.csv"
    jobs_path.write_text(
        "id,title,company,description,requirements,location,salary\n1,Software Engineer,Acme,Develop APIs with Python and SQL,Python;SQL,Remote,100000\n"
    )
    monkeypatch.setenv("DATA_PATH", str(data_dir))
    monkeypatch.setenv("MODEL_PATH", str(tmp_path / "models"))
    return data_dir


def test_pipeline_falls_back_to_local_recommender(temp_data_dir):
    local_recommender = JobRecommender(data_path=os.getenv("DATA_PATH"), model_path=os.getenv("MODEL_PATH"))
    assert local_recommender.initialize()

    pipeline = JobPipeline(local_recommender)
    request = {
        "user_id": "user-1",
        "user_profile": {
            "skills": ["Python", "SQL"],
            "experience_years": 3,
            "education": "BSc",
            "location": "Remote"
        },
        "job_title": "Software Engineer",
        "top_n": 1
    }

    response = TestClient(app).post("/run", json=request)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_count"] >= 1


def test_local_recommender_initialization_failure_when_data_missing():
    local_recommender = JobRecommender(data_path="./nonexistent_data", model_path="./nonexistent_models")
    assert not local_recommender.initialize()
    assert local_recommender.initialization_error is not None


def test_run_endpoint_returns_error_when_no_data_and_no_adzuna(monkeypatch, tmp_path):
    monkeypatch.setenv("DATA_PATH", str(tmp_path / "missing-data"))
    monkeypatch.setenv("MODEL_PATH", str(tmp_path / "missing-models"))
    request = {
        "user_id": "user-1",
        "user_profile": {
            "skills": ["Python"],
            "experience_years": 1,
            "education": "BSc",
            "location": "Remote"
        },
        "job_title": "Backend Engineer",
        "top_n": 1
    }

    response = TestClient(app).post("/run", json=request)
    assert response.status_code == 500
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == "PIPELINE_ERROR"


def test_popular_fallback_ranks_engagement_instead_of_csv_order():
    local_recommender = JobRecommender()
    local_recommender.is_initialized = True
    local_recommender.preprocessor.jobs_df = pd.DataFrame([
        {"title": "First Job", "application_count": 1, "view_count": 2},
        {"title": "Popular Job", "application_count": 50, "view_count": 100},
    ])

    recommendations = local_recommender.get_popular_jobs(top_n=1)

    assert recommendations[0]["title"] == "Popular Job"
    assert recommendations[0]["fallback_score"] > 0
