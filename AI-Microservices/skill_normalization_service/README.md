# Skill Normalization & User Profile Building Service

FastAPI microservice for normalizing raw, unstructured skill data through a 4-layer intelligent pipeline. Part of the 5-module AI-Skill-Mentor graduation job-seeker recommendation system (Module 3).

## Overview

Takes pre-extracted user data (skills array, education, experience) and:
- **L1:** Maps raw skill input to canonical names using 170+ synonym rules (< 1ms)
- **L2:** Routes unknown skills for semantic matching
- **L3:** Uses embedding similarity (all-MiniLM model) to match semantic variants (50ms)
- **L4:** Deduplicates results, keeps highest confidence score

**Input:** `["python", "ml", "deep learnin"]`  
**Output:** `[{skillId: S_python, name: Python, confidence: 1.0}, ...]`

## Features

✓ No module refactoring — pure HTTP wrapper around existing Python code  
✓ Fast processing — 50-100ms per request (20+ skills)  
✓ Robust matching — handles typos, abbreviations, synonyms, semantic similarity  
✓ Confidence scoring — quantifies match certainty (1.0 = exact, 0.7+ = semantic)  
✓ Auto-deduplication — removes duplicates, keeps best match  
✓ Interactive API docs — auto-generated Swagger UI at `/docs`  
✓ Error handling — proper HTTP codes (422 validation, 500 server errors)  
✓ Production-ready — Docker support, environment variables, logging  

---

## Installation

### Requirements

- Python 3.8+
- pip

### Steps

```bash
cd skill_normalization_service

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Running the Service

### Development Mode (with auto-reload)

```bash
uvicorn main:app --host 0.0.0.0 --port 8003 --reload
```

Or use the startup script:

```bash
# Unix/Mac
./start.sh

# Windows
start.bat
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4
```

Service will be available at: **http://localhost:8003**

### Interactive API Documentation

Open in browser: **http://localhost:8003/docs** (Swagger UI)  
Alternative docs: **http://localhost:8003/redoc** (ReDoc)

---

## Environment Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available variables:

```
SERVICE_PORT=8003                    # Port to run on
ENV=development                      # development or production
LOG_LEVEL=INFO                       # Logging level
ALLOWED_ORIGIN=http://localhost:3000 # Additional CORS origin
EMBEDDING_MODEL=all-MiniLM-L6-v2     # Sentence transformer model
SIMILARITY_THRESHOLD=0.7             # L3 embedding similarity threshold
```

---

## API Endpoints

### GET /health

Health check — called by Node.js backend on startup.

**Response:**
```json
{
  "status": "ok",
  "service": "Skill Normalization & User Profile Building",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://localhost:8003/health
```

---

### POST /run

Normalize skills and build user profile.

**Request Body:**
```json
{
  "userId": "USER_123",
  "skills": ["python", "sql", "machine learning"],
  "education": {
    "degree": "BSc",
    "field": "Computer Science",
    "university": "MIT",
    "year": 2023
  },
  "experience": {
    "titles": ["Software Engineer", "Data Analyst"],
    "years": 2.5
  }
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "userId": "USER_123",
    "skills": [
      {
        "skillId": "S_python",
        "name": "Python",
        "confidence": 1.0
      },
      {
        "skillId": "S_sql",
        "name": "SQL",
        "confidence": 1.0
      },
      {
        "skillId": "S_machine_learning",
        "name": "Machine Learning",
        "confidence": 0.92
      }
    ],
    "education": {
      "degree": "BSc",
      "field": "Computer Science",
      "university": "MIT",
      "year": 2023
    },
    "experience": {
      "titles": ["Software Engineer", "Data Analyst"],
      "years": 2.5
    },
    "statistics": {
      "totalInputSkills": 3,
      "matchedSkills": 3,
      "unknownSkills": 0,
      "avgConfidence": 0.97
    }
  },
  "meta": {
    "processingTimeMs": 87,
    "userId": "USER_123"
  }
}
```

**Error Response (HTTP 422 or 500):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "userId cannot be empty"
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8003/run \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_123",
    "skills": ["python", "sql"],
    "education": {"degree": "BSc", "field": "CS"},
    "experience": {"titles": ["Developer"], "years": 2}
  }'
```

**Example Python:**
```python
import requests

response = requests.post('http://localhost:8003/run', json={
    "userId": "USER_123",
    "skills": ["python", "sql"],
    "education": {"degree": "BSc", "field": "CS"},
    "experience": {"titles": ["Developer"], "years": 2}
})

profile = response.json()['data']
print(f"Normalized skills: {profile['skills']}")
```

**Example Node.js:**
```javascript
const axios = require('axios');

async function normalizeSkills() {
  const response = await axios.post('http://localhost:8003/run', {
    userId: 'USER_123',
    skills: ['python', 'sql'],
    education: { degree: 'BSc', field: 'CS' },
    experience: { titles: ['Developer'], years: 2 }
  });

  const profile = response.data.data;
  console.log('Normalized skills:', profile.skills);
}

normalizeSkills();
```

---

## Integration with Node.js/Express Backend

### Setup Service Health Check

On server startup, verify skill service is running:

```javascript
const axios = require('axios');

async function checkSkillService() {
  try {
    const response = await axios.get('http://localhost:8003/health');
    console.log('✓ Skill service is up:', response.data);
  } catch (error) {
    console.error('✗ Skill service unavailable');
    process.exit(1);
  }
}
```

### Create Express Route to Call Service

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/api/profile/normalize', async (req, res) => {
  try {
    // Extract pre-extracted data from request
    const { userId, skills, education, experience } = req.body;

    // Call skill normalization service
    const response = await axios.post('http://localhost:8003/run', {
      userId,
      skills,
      education,
      experience
    });

    // Return normalized profile to frontend
    res.json(response.data);

  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Failed to normalize skills'
        }
      });
    }
  }
});

module.exports = router;
```

### Call from Frontend (React)

```javascript
async function buildUserProfile(userId, skills, education, experience) {
  const response = await fetch('/api/profile/normalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, skills, education, experience })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Normalized profile:', result.data);
    return result.data;
  } else {
    console.error('Error:', result.error.message);
    throw new Error(result.error.message);
  }
}
```

---

## Testing

Run pytest test suite:

```bash
pytest tests/ -v

# Run specific test
pytest tests/test_service.py::TestRunEndpoint::test_run_with_valid_request -v

# With coverage
pytest tests/ --cov=core --cov=routes
```

Test files:
- `tests/conftest.py` — Pytest fixtures (client, test data)
- `tests/test_service.py` — 30+ integration and unit tests

---

## Project Structure

```
skill_normalization_service/
├── main.py                    # FastAPI app, startup/shutdown, CORS
├── schemas.py                 # Pydantic models (request/response)
├── routes/
│   ├── __init__.py
│   ├── health.py              # GET /health
│   └── run.py                 # POST /run (zero business logic)
├── core/                      # Pure Python, zero FastAPI imports
│   ├── __init__.py
│   ├── pipeline.py            # Orchestrates L1-L4 pipeline
│   ├── embedding_engine.py    # L3 embedding computation
│   ├── normalizer.py          # L1-L4 normalization logic
│   ├── profile_builder.py     # L4 profile building
│   ├── rule_engine.py         # L1 rule application
│   └── info_extractor.py      # Data extraction utilities
├── data/
│   ├── skills.json            # 95 canonical skills
│   └── rules.json             # 170+ L1 rule mappings
├── tests/
│   ├── conftest.py            # Pytest fixtures
│   └── test_service.py        # Test suite
├── .env.example               # Environment variable template
├── requirements.txt           # Python dependencies
├── README.md                  # This file
└── start.sh                   # Startup script
```

---

## Architecture

```
Request from Node.js
        ↓
    main.py (FastAPI)
        ↓
    routes/run.py (validation, error handling)
        ↓
    core/pipeline.py (orchestration)
        ↓
    normalize_skills() [L1-L4 pipeline]
        ├─ L1: Rule mapping (170+ rules)
        ├─ L2: Decision logic
        ├─ L3: Embedding matching (cosine similarity)
        └─ L4: Deduplication (highest confidence)
        ↓
    build_user_profile() (structure output)
        ↓
    Response (JSON)
```

---

## Data Sources

**skills.json** — 95 canonical skills with:
- `skillId`: Unique identifier (e.g., S_python)
- `name`: Canonical name (e.g., Python)
- `category`: Skill category (e.g., Programming Language)
- `description`: Brief description

**rules.json** — 170+ mappings:
- Key: User input variations (e.g., "ml", "machine learning")
- Value: skillId (e.g., "S_machine_learning")

---

## Performance

| Layer | Name | Speed | Details |
|-------|------|-------|---------|
| L1 | Rule Mapping | < 1ms | Dictionary lookup (170+ rules) |
| L2 | Decision Logic | < 1ms | Route unknown skills |
| L3 | Embedding Match | ~50ms | Cosine similarity, all-MiniLM model |
| L4 | Deduplication | < 1ms | Highest confidence selection |
| **Total** | **Full Pipeline** | **50-100ms** | For 20+ skills |

**Startup time:** 10-15 seconds (embedding model loading)  
**Memory:** ~500MB (model + data)

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Invalid request format |
| `INTERNAL_SERVER_ERROR` | 500 | Service error (bad data, missing files) |
| `EMBEDDING_FAILED` | 500 | Embedding model failed |

All errors return standard JSON with `{success: false, error: {code, message}}`

---

## CORS

By default, allows:
- `http://localhost:3000` (Node.js frontend)
- `http://localhost:8003` (This service)

Add custom origin via `.env`:
```
ALLOWED_ORIGIN=http://myserver.com
```

---

## Logs

View logs from stdout. Configured with Python's logging module:

```
2026-04-14 10:15:23,456 - main - INFO - Starting Skill Normalization Service...
2026-04-14 10:15:23,789 - main - INFO - ✓ Loaded 95 canonical skills
2026-04-14 10:15:23,834 - main - INFO - ✓ Loaded 170 L1 rule mappings
2026-04-14 10:15:35,123 - main - INFO - ✓ Computed embeddings for 95 skills
2026-04-14 10:15:35,124 - main - INFO - ✓ Pipeline initialized and ready
2026-04-14 10:15:35,125 - main - INFO - ✓ Service startup complete
```

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr 8003
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8003
kill -9 <PID>
```

### Dependencies Not Installing

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Embedding Model Not Downloading

The first run downloads the `all-MiniLM-L6-v2` model (~50MB). May take time:

```bash
# Pre-download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Service Doesn't Start

Check logs for errors:
- Missing files: `data/skills.json`, `data/rules.json`
- Port in use
- Python version < 3.8
- Missing dependencies

---

## Deployment

### Docker

```bash
docker build -t skill-normalization .
docker run -p 8003:8003 skill-normalization
```

### Docker Compose

```bash
docker-compose up -d
```

### Cloud (AWS Lambda, Google Cloud, etc.)

Use ASGI-compatible deployment (Zappa, serverless-wsgi, etc.).

---

## Support

For issues or questions, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** April 14, 2026  
**Status:** Production-Ready ✓
