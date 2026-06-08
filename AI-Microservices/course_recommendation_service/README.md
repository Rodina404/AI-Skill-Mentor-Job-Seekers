# Course Recommendation Microservice

Microservice for computing FAISS vector-based course recommendations for the Node.js/Express backend.
Runs on port `8006`.

## Features

- **State-of-the-Art Architecture**: Powered by `sentence-transformers` and `faiss-cpu`.
- **Hybrid Semantic Search**: Recommends courses using deep semantic vector embeddings of the user's missing skills.
- **Intelligent Progression**: Automatically orders courses by beginner -> intermediate -> advanced levels.
- **Self-Contained**: The massive FAISS indices (`courses.index` and `courses.pkl`) are packaged inside the `/artifacts` folder.
- Fully compatible with the Node.js Main Application API Gateway.

## Endpoints

### GET `/health`
Health check endpoint to verify service is running.
**Response:**
```json
{
  "status": "ok",
  "service": "course_recommendation",
  "version": "1.0.0"
}
```

### POST `/run`
Compute recommendations for a user profile and target role.
**Request:**
```json
{
  "user_id": "string",
  "user_profile": {
    "skills": ["Python", "SQL"],
    "experience_years": 3,
    "education": "BSc",
    "location": "Remote"
  },
  "job_title": "Data Engineer",
  "top_n": 10
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "recommendations": [...],
    "total_count": 10,
    "recommendation_type": "profile-based"
  },
  "meta": {
    "processing_time_ms": 124,
    "user_id": "string"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "PIPELINE_ERROR",
    "message": "Error details"
  }
}
```

## Running the Service
```bash
uvicorn main:app --host 0.0.0.0 --port 8006 --reload
```
