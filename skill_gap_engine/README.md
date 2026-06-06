# Course Recommender Microservice

Takes a list of missing skills and user study constraints, and recommends courses using vector search and hybrid reranking.

## Endpoints

### `GET /health`
Returns health status for Node.js startup.
```json
{
  "status": "ok",
  "service": "m4_course_recommender",
  "version": "1.0.0"
}
```

### `POST /run`
Main workflow endpoint to recommend courses.

**Request**
```json
{
  "user_id": "string",
  "missing_skills": [
    {
      "skill_id": "S_powerbi",
      "skill_name": "Power BI"
    }
  ],
  "user_constraints": {
    "level": "beginner",
    "language": "en",
    "hours_per_week": 5
  }
}
```

**Response (Success)**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "skill_id": "S_powerbi",
        "skill_name": "Power BI",
        "courses": [
           {"course_id": "C11", "title": "Power BI for Beginners", "score": 0.89, "duration": 8, "provider": "X"}
        ]
      }
    ]
  },
  "meta": {
    "processing_time_ms": 123,
    "user_id": "string"
  }
}
```

**Response (Error)**
```json
{
  "success": false,
  "error": {
     "code": "SERVER_ERROR",
     "message": "Error details..."
  }
}
```

### `GET /test-ui`
Browser-based test interface.

## How to run

1. `pip install -r requirements.txt`
2. `cp .env.example .env`
3. Start the service:
```bash
uvicorn main:app --host 0.0.0.0 --port 8004 --reload
```
