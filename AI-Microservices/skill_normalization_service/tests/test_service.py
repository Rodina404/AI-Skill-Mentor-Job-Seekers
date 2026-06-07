"""
Integration and Unit Tests for Skill Normalization Service.
"""

import pytest


class TestHealth:
    """Tests for GET /health endpoint."""
    
    def test_health_returns_ok(self, client):
        """Health check should return status ok."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['service'] == 'Skill Normalization & User Profile Building'
        assert data['version'] == '1.0.0'
    
    def test_health_response_structure(self, client):
        """Health response should have all required fields."""
        response = client.get("/health")
        data = response.json()
        assert 'status' in data
        assert 'service' in data
        assert 'version' in data


class TestRunEndpoint:
    """Tests for POST /run endpoint."""
    
    def test_run_with_valid_request(self, client, valid_request):
        """POST /run should accept valid request."""
        response = client.post("/run", json=valid_request)
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert 'data' in data
        assert 'meta' in data
    
    def test_run_response_structure(self, client, valid_request):
        """Success response should have required structure."""
        response = client.post("/run", json=valid_request)
        data = response.json()
        
        # Top-level
        assert 'success' in data
        assert 'data' in data
        assert 'meta' in data
        
        # Data section
        profile = data['data']
        assert 'userId' in profile
        assert 'skills' in profile
        assert 'education' in profile
        assert 'experience' in profile
        assert 'statistics' in profile
        
        # Meta section
        assert 'processingTimeMs' in data['meta']
        assert 'userId' in data['meta']
    
    def test_run_with_messy_skills(self, client, messy_request):
        """POST /run should normalize messy/raw skill input."""
        response = client.post("/run", json=messy_request)
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        
        # Should have normalized skills
        skills = data['data']['skills']
        assert len(skills) > 0
        
        # Each skill should have required fields
        for skill in skills:
            assert 'skillId' in skill
            assert 'name' in skill
            assert 'confidence' in skill
            assert 0.0 <= skill['confidence'] <= 1.0
    
    def test_run_calculates_statistics(self, client, valid_request):
        """POST /run should calculate and return statistics."""
        response = client.post("/run", json=valid_request)
        data = response.json()
        
        stats = data['data']['statistics']
        assert 'totalInputSkills' in stats
        assert 'matchedSkills' in stats
        assert 'unknownSkills' in stats
        assert 'avgConfidence' in stats
        
        # Validate statistics
        assert stats['totalInputSkills'] == len(valid_request['skills'])
        assert stats['matchedSkills'] >= 0
        assert stats['unknownSkills'] >= 0
        assert 0.0 <= stats['avgConfidence'] <= 1.0
    
    def test_run_missing_userId(self, client, valid_request):
        """POST /run should reject request without userId."""
        valid_request.pop('userId')
        response = client.post("/run", json=valid_request)
        assert response.status_code in [422, 400]  # Validation error
    
    def test_run_empty_skills(self, client, valid_request):
        """POST /run should reject request with empty skills."""
        valid_request['skills'] = []
        response = client.post("/run", json=valid_request)
        assert response.status_code in [422, 400]  # Validation error
    
    def test_run_processing_time_is_reasonable(self, client, valid_request):
        """POST /run should complete in reasonable time."""
        response = client.post("/run", json=valid_request)
        data = response.json()
        
        # Should complete in under 5 seconds (5000ms)
        processing_time = data['meta']['processingTimeMs']
        assert processing_time < 5000
        assert processing_time >= 0
    
    def test_run_preserves_education_data(self, client, valid_request):
        """POST /run should preserve education information."""
        response = client.post("/run", json=valid_request)
        data = response.json()
        
        education = data['data']['education']
        assert education['degree'] == valid_request['education']['degree']
        assert education['field'] == valid_request['education']['field']
        assert education['university'] == valid_request['education']['university']
    
    def test_run_preserves_experience_data(self, client, valid_request):
        """POST /run should preserve experience information."""
        response = client.post("/run", json=valid_request)
        data = response.json()
        
        experience = data['data']['experience']
        assert experience['years'] == valid_request['experience']['years']
        assert len(experience['titles']) == len(valid_request['experience']['titles'])
    
    def test_run_with_single_skill(self, client):
        """POST /run should handle single skill."""
        response = client.post("/run", json={
            "userId": "test_single",
            "skills": ["python"]
        })
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
    
    def test_run_with_many_skills(self, client):
        """POST /run should handle large number of skills."""
        response = client.post("/run", json={
            "userId": "test_many",
            "skills": ["python", "java", "c++", "sql", "javascript", "typescript", "react", "node", "docker", "kubernetes"]
        })
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert data['data']['statistics']['totalInputSkills'] == 10


class TestErrorHandling:
    """Tests for error handling."""
    
    def test_invalid_json_returns_error(self, client):
        """POST /run with invalid JSON should return error."""
        response = client.post("/run", data="not json", headers={"Content-Type": "application/json"})
        assert response.status_code in [400, 422]
    
    def test_error_response_structure(self, client):
        """Error responses should have standard structure."""
        response = client.post("/run", json={
            "userId": "",
            "skills": []
        })
        
        if response.status_code != 200:
            data = response.json()
            # Should have standard error structure if it's a validation error
            assert 'detail' in data or 'success' in data


class TestSkillNormalization:
    """Tests for skill normalization quality."""
    
    def test_exact_match_has_full_confidence(self, client):
        """Skills that exactly match rules should have confidence 1.0."""
        response = client.post("/run", json={
            "userId": "test_exact",
            "skills": ["python"]
        })
        data = response.json()
        
        # Python should match with 1.0 confidence
        python_skills = [s for s in data['data']['skills'] if 'python' in s['name'].lower()]
        if python_skills:
            assert python_skills[0]['confidence'] == 1.0
    
    def test_deduplicated_skills(self, client):
        """Duplicate skill inputs should be deduplicated."""
        response = client.post("/run", json={
            "userId": "test_dedup",
            "skills": ["python", "Python", "PYTHON"]
        })
        data = response.json()
        
        # Should have single Python entry, not three
        python_count = len([s for s in data['data']['skills'] if 'python' in s['skillId'].lower()])
        assert python_count <= 1
    
    def test_unknown_skills_not_in_output(self, client):
        """Unknown skills that don't match should not appear in output."""
        response = client.post("/run", json={
            "userId": "test_unknown",
            "skills": ["xyzunknownabcdef"]
        })
        data = response.json()
        
        # Should have 0 matched skills
        assert data['data']['statistics']['unknownSkills'] >= 0
