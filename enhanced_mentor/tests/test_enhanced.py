import unittest
from fastapi.testclient import TestClient
from enhanced_mentor.api_v2 import router
from enhanced_mentor.skill_processor import SkillProcessor
from fastapi import FastAPI

# Setup Test App
app = FastAPI()
app.include_router(router)
client = TestClient(app)

class TestEnhancedMentor(unittest.TestCase):
    
    def setUp(self):
        self.processor = SkillProcessor()

    def test_skill_extraction(self):
        text = "I am an expert in Python, React, and AWS."
        skills = self.processor.extract_skills(text)
        self.assertIn("Python", skills)
        self.assertIn("React", skills)
        self.assertIn("AWS", skills)
        self.assertEqual(len(skills), 3)

    def test_readiness_score(self):
        user_skills = ["Python", "SQL"]
        job_skills = ["Python", "SQL", "Docker"]
        result = self.processor.calculate_readiness_score(user_skills, job_skills)
        self.assertEqual(result["score"], 0.67)
        self.assertIn("Docker", result["missing"])
        self.assertEqual(len(result["matched"]), 2)

    def test_api_health(self):
        response = client.get("/api/v2/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["engine"], "active")

    def test_api_extract_skills(self):
        response = client.post("/api/v2/extract-skills", json={"text": "Deep Learning and TensorFlow expert."})
        self.assertEqual(response.status_code, 200)
        skills = response.json()["skills"]
        self.assertIn("Deep Learning", skills)
        self.assertIn("TensorFlow", skills)

    def test_semantic_skill_extraction(self):
        response = client.post("/api/v2/extract-skills", json={"text": "I am a Machine Learning Engineer with expertise in Python and data modeling."})
        self.assertEqual(response.status_code, 200)
        skills = response.json()["skills"]
        self.assertIn("Machine Learning", skills)
        self.assertIn("Python", skills)

    def test_computer_science_degree_extraction(self):
        response = client.post("/api/v2/extract-skills", json={"text": "Graduated with a Bachelor of Computer Science and strong software engineering skills."})
        self.assertEqual(response.status_code, 200)
        skills = response.json()["skills"]
        self.assertIn("Computer Science", skills)
        self.assertIn("Software Engineering", skills)

if __name__ == "__main__":
    unittest.main()
