"""
Pytest configuration and fixtures for Skill Normalization Service tests.
"""

import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="session")
def data_dir():
    """Get path to data directory."""
    return Path(__file__).parent.parent / 'data'


@pytest.fixture(scope="session")
def skills_db(data_dir):
    """Load canonical skills database for tests."""
    skills_file = data_dir / 'skills.json'
    with open(skills_file) as f:
        return json.load(f)


@pytest.fixture(scope="session")
def rules(data_dir):
    """Load L1 rule mappings for tests."""
    rules_file = data_dir / 'rules.json'
    with open(rules_file) as f:
        return json.load(f)


@pytest.fixture
def client():
    """FastAPI test client."""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def valid_request():
    """Valid POST /run request body."""
    return {
        "userId": "test_user_123",
        "skills": ["python", "sql"],
        "education": {
            "degree": "BSc",
            "field": "Computer Science",
            "university": "Test University",
            "year": 2022
        },
        "experience": {
            "titles": ["Software Engineer"],
            "years": 2.5
        }
    }


@pytest.fixture
def messy_request():
    """POST /run with raw, unstructured skills."""
    return {
        "userId": "test_user_456",
        "skills": ["python", "ml", "deep learnin", "SQL", "js"],
        "education": {
            "degree": "MSc",
            "field": "Data Science"
        },
        "experience": {
            "titles": ["Data Scientist", "ML Engineer"],
            "years": 3.0
        }
    }
