# Job Recommendation Microservice

Microservice for computing TF-IDF job gaps for the Node.js/Express backend.
Runs on port `8007`.

## Endpoints

### GET `/health`
Health check endpoint to verify service is running.
**Response:**
```json
{
  "status": "ok",
  "service": "job_recommendation",
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
    "total_count": 10
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
uvicorn main:app --host 0.0.0.0 --port 8007 --reload
```
