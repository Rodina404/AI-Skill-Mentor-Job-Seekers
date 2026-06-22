import pytest
import os
from unittest.mock import MagicMock, patch

# Ensure dummy environment variables for tests
os.environ["SUPABASE_URL"] = "https://mockproject.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mockservicekey"

class MockQueryBuilder:
    def __init__(self, table_name, db_data):
        self.table_name = table_name
        self.db_data = db_data
        self.is_single = False
        
    def select(self, *args, **kwargs): return self
    def insert(self, *args, **kwargs): return self
    def update(self, *args, **kwargs): return self
    def eq(self, *args, **kwargs): return self
    def order(self, *args, **kwargs): return self
    def limit(self, *args, **kwargs): return self
    def in_(self, *args, **kwargs): return self
    
    def single(self, *args, **kwargs):
        self.is_single = True
        return self
        
    def execute(self):
        res = MagicMock()
        raw_data = self.db_data.get(self.table_name, [])
        if self.is_single:
            res.data = raw_data[0] if isinstance(raw_data, list) and raw_data else raw_data
        else:
            res.data = raw_data
        return res

@pytest.fixture
def mock_db_data():
    return {
        "roadmaps": [
            {
                "id": "mock-roadmap-123",
                "user_id": "test-user-123",
                "roadmap_data": {
                    "weeks": [],
                    "courses_used": []
                },
                "explanation": "Test explanation",
                "created_at": "2026-06-23T00:00:00"
            }
        ],
        "job_seeker_profiles": [
            {
                "id": "profile-123",
                "user_id": "test-user-123",
                "hours_per_week": 10.0,
                "deadline_weeks": 8
            }
        ],
        "learning_progress": [
            {
                "course_recommendation_id": "rec-123",
                "completion_percentage": 50.0,
                "status": "in_progress",
                "course_recommendations": {
                    "id": "rec-123",
                    "title": "Microsoft Power BI Desktop for Business Intelligence"
                }
            }
        ],
        "notifications": [],
        "skill_gaps": [],
    }

@pytest.fixture(autouse=True)
def mock_supabase_client(mock_db_data):
    from db.client import get_supabase
    get_supabase.cache_clear()
    
    with patch("db.client.create_client") as mock_create:
        mock_client = MagicMock()
        
        def table_side_effect(table_name):
            return MockQueryBuilder(table_name, mock_db_data)
            
        mock_client.table.side_effect = table_side_effect
        mock_create.return_value = mock_client
        yield mock_client
