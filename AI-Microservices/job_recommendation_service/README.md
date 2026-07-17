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

## Setup

```powershell
cd AI-Microservices/job_recommendation_service

python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your Adzuna credentials to the local `.env` file. Never commit `.env` or real API credentials.

## Running the Service

```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8007 --reload
```

Available URLs:

- Service information: `http://localhost:8007/`
- Health check: `http://localhost:8007/health`
- Interactive API documentation: `http://localhost:8007/docs`

## Recommendation Sources

The service uses the following order:

1. Fetch live job listings from Adzuna when credentials are configured.
2. Rank listings using the requested role, user skills, title relevance, and posting recency.
3. Use the local TF-IDF recommender if Adzuna is unavailable or returns no suitable results.
4. Return a controlled `PIPELINE_ERROR` if neither source is available.

Adzuna recommendations include `source: "adzuna"` and an external application URL.

## Local data setup
The service uses a local TF-IDF fallback when Adzuna is not configured or returns no results. That fallback depends on the local dataset at `./data` and the trained TF-IDF artifacts in `./models`.

If these files are absent and Adzuna returns no jobs, the endpoint returns a controlled `PIPELINE_ERROR` explaining that no recommendation source is available.

To create sample data locally:
```bash
python scripts/prepare_sample_data.py
```

After creating `./data`, start the service and allow it to generate `./models` automatically. The `data/` and `models/` directories are local generated artifacts and should not be committed.

## Environment
```bash
PORT=8007
ALLOWED_ORIGIN=http://localhost:3000
DATA_PATH=./data
MODEL_PATH=./models
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=us
ADZUNA_TIMEOUT_SECONDS=8
ENABLE_SEMANTIC_RANKING=true
SEMANTIC_MODEL=sentence-transformers/all-MiniLM-L6-v2
SEMANTIC_WEIGHT=0.40
MIN_JOB_QUALITY_SCORE=0.28
```

For `.env.example`, keep `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` empty. Real values belong only in `.env` or deployment secrets.

## Running Tests

```powershell
python -m pytest -q
```

## Security

- Never commit `.env` or real API credentials.
- Keep `.env.example` limited to empty credential placeholders.
- Use deployment secrets for production credentials.
- Rotate credentials immediately if they appear in logs or Git history.
- Adzuna errors are logged without credential-bearing request URLs.
