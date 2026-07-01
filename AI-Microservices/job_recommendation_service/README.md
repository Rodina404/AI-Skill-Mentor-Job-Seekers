# Job Recommendation Microservice

Microservice for computing job recommendations for the Node.js/Express backend.
Runs on port `8007`.

When `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are set, `/run` fetches live jobs from Adzuna and ranks them against the user's skills. If Adzuna is not configured or returns no results, the service falls back to the local TF-IDF recommender using `./models` or `./data`.

Optional semantic ranking can be enabled with `ENABLE_SEMANTIC_RANKING=true`. When enabled and the model is available, the service blends sentence-transformer similarity into the final job ranking. If the model cannot load, the service keeps using the keyword/alias ranking.

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

## Environment
```bash
PORT=8007
ALLOWED_ORIGIN=http://localhost:3000
DATA_PATH=./data
MODEL_PATH=./models
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=us
ENABLE_SEMANTIC_RANKING=true
SEMANTIC_MODEL=sentence-transformers/all-MiniLM-L6-v2
SEMANTIC_WEIGHT=0.40
MIN_JOB_QUALITY_SCORE=0.28
```
