# AI Service Wrapping Prompt - Skill Normalization System

Copy and paste this entire prompt to an AI to regenerate/refactor your FastAPI service.

---

## Role: You are a Python backend engineer wrapping an existing AI module as a production-ready FastAPI microservice that will be called by a Node.js/Express backend.

## Service identity:

**Service name:** Skill Normalization & User Profile Building

**Port:** 8003

**What it does in one sentence:** Normalizes raw, unstructured skill data through a 4-layer intelligent pipeline (rule mapping → decision logic → embedding matching → deduplication) and returns a structured UserProfile with canonical skills and confidence scores.

---

## Existing files to incorporate:

```
modules/embedding_engine.py      ← computes skill embeddings using sentence-transformers (all-MiniLM-L6-v2 model)
modules/normalizer.py            ← implements L1-L4 pipeline: rule mapping (170+ synonyms), embedding matching (cosine similarity), deduplication (keeps highest confidence)
modules/profile_builder.py       ← structures final UserProfile with userId, normalized skills[], education, experience
modules/rule_engine.py           ← legacy rule application engine (referenced by normalizer)
modules/info_extractor.py        ← legacy extraction utilities (available if needed)
skills.json                      ← database of 95 canonical skills with metadata (skillId, name, category, description)
rules.json                       ← 170+ L1 rule mappings: user input → canonical skill (e.g., {"ml": "S_machine_learning", "python": "S_python"})
```

---

## Primary callable(s) in the existing code:

```python
# From modules/normalizer.py - THE CORE FUNCTION
def normalize_skills(
    skills: List[str],
    skills_db: Dict[str, Any],
    rules: Dict[str, str],
    skill_embeddings: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    4-layer pipeline:
    L1: Rule-based mapping (synonyms) → fast exact matches
    L2: Decision logic (matched vs unknown)
    L3: Embedding matching (cosine similarity, threshold 0.7)
    L4: Deduplication (keep highest confidence for each skill)
    
    Returns:
        [{
            "skillId": "S_python",
            "name": "Python",
            "confidence": 1.0
        }, ...]
    """

# From modules/profile_builder.py - FINAL STRUCTURE
def build_user_profile(
    user_id: str,
    normalized_skills: List[Dict[str, Any]],
    education: Dict[str, Any],
    experience: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Structure normalized skills into UserProfile object
    
    Returns:
        {
            "userId": "USER_123",
            "skills": [...],  # normalized, deduplicated
            "education": {...},
            "experience": {...}
        }
    """

# From modules/embedding_engine.py - INITIALIZATION
def compute_embeddings(skills_db: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pre-compute embeddings for all canonical skills on startup
    Used by L3 embedding matching layer
    """
```

---

## Request / response contract (what Node will send and expects back):

```json
// POST /run — request body
{
  "userId": "string, required (unique user identifier)",
  "skills": "array of strings, required (raw skill names, may contain typos/variations)",
  "education": {
    "degree": "string, optional (e.g., 'BSc', 'MSc', 'PhD')",
    "field": "string, optional (e.g., 'Computer Science')",
    "university": "string, optional (institution name)",
    "year": "integer, optional (graduation year)"
  },
  "experience": {
    "titles": "array of strings, optional (job titles held)",
    "years": "float, optional (total years of experience)"
  }
}

// POST /run — success response (HTTP 200)
{
  "success": true,
  "data": {
    "userId": "string (echoed from request)",
    "skills": [
      {
        "skillId": "string (e.g., 'S_python')",
        "name": "string (canonical name, e.g., 'Python')",
        "confidence": "float 0.0–1.0 (1.0 = exact/L1 match, 0.7+ = semantic/L3 match)"
      }
    ],
    "education": {
      "degree": "string",
      "field": "string",
      "university": "string",
      "year": "integer"
    },
    "experience": {
      "titles": "array of strings",
      "years": "float"
    },
    "statistics": {
      "totalInputSkills": "integer",
      "matchedSkills": "integer",
      "unknownSkills": "integer",
      "avgConfidence": "float 0.0–1.0"
    }
  },
  "meta": {
    "processingTimeMs": "integer (execution time in milliseconds)",
    "userId": "string (echoed)"
  }
}

// POST /run — error response (HTTP 422 validation or HTTP 500 server error)
{
  "success": false,
  "error": {
    "code": "string (e.g., 'VALIDATION_ERROR', 'EMBEDDING_FAILED', 'INTERNAL_SERVER_ERROR')",
    "message": "string (human-readable error description, never a Python traceback)"
  }
}

// GET /health — response (HTTP 200)
{
  "status": "ok",
  "service": "Skill Normalization & User Profile Building",
  "version": "1.0.0"
}

// GET /docs — auto-generated Swagger UI
// GET /redoc — auto-generated ReDoc documentation
```

---

## Task: Generate the complete file contents for this exact structure:

```
skill_normalization_service/
├── main.py                          ← FastAPI app init, startup/shutdown, CORS, exception handlers
├── schemas.py                       ← Pydantic models for requests/responses (EducationInput, ExperienceInput, ProfileBuildRequest, ProfileBuildResponse, etc.)
├── routes/
│   ├── __init__.py
│   ├── run.py                       ← POST /run route (calls core/pipeline.py, wraps in try/except, returns StandardResponse)
│   └── health.py                    ← GET /health route
├── core/
│   ├── __init__.py
│   ├── pipeline.py                  ← orchestrates normalize_skills() → build_user_profile() in sequence
│   ├── embedding_engine.py          ← moved from modules/
│   ├── normalizer.py                ← moved from modules/
│   ├── profile_builder.py           ← moved from modules/
│   ├── rule_engine.py               ← moved from modules/
│   └── info_extractor.py            ← moved from modules/
├── data/
│   ├── skills.json                  ← copied from parent directory
│   └── rules.json                   ← copied from parent directory
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  ← pytest fixtures, test database paths
│   └── test_service.py              ← unit + integration tests (health, POST /run with 5+ scenarios)
├── .env.example                     ← template for environment variables
├── requirements.txt                 ← dependency pins (fastapi, uvicorn[standard], python-dotenv, pydantic, sentence-transformers, scikit-learn)
├── README.md                        ← port, endpoints, full request/response shapes, run command
└── start.sh                         ← startup script for Unix/Mac
```

---

## Non-negotiable rules — follow all of them:

1. **core/ files must have zero FastAPI imports** — pure Python only (no FastAPI, no Starlette, no HTTPException)
2. **routes/run.py has zero business logic** — it calls `core.pipeline.run()` and returns a `StandardResponse`
3. **All API keys and secrets loaded from .env via python-dotenv** — never hardcoded
4. **Every route is wrapped in try/except** — on any exception return `{"success": false, "error": {...}}` with HTTP 500, never let a traceback reach the caller
5. **GET /health returns exactly:** `{"status": "ok", "service": "Skill Normalization & User Profile Building", "version": "1.0.0"}` — Node calls this on startup to confirm service is running
6. **CORS must allow** `http://localhost:3000` and `os.getenv("ALLOWED_ORIGIN", "")` — this is what the Node.js frontend uses
7. **Service starts with:** `uvicorn main:app --host 0.0.0.0 --port 8003 --reload`
8. **requirements.txt must include:** `fastapi`, `uvicorn[standard]`, `python-dotenv`, `pydantic` — plus `sentence-transformers==2.7.0`, `scikit-learn==1.3.2`
9. **README.md must document:**
   - Port (8003)
   - All endpoints (GET /health, POST /run, GET /docs)
   - Full request/response JSON shapes (copy from section above)
   - Exact run command: `uvicorn main:app --host 0.0.0.0 --port 8003 --reload`
   - How to integrate with Node.js backend (import axios, call http://localhost:8003/run)
10. **Output complete file contents for every file** — no placeholders, no `# TODO`, no `...`, every file must be production-ready

---

## Additional Context (for AI understanding):

- **Module 3 of 5-module system:** This service sits between resume extraction (Module 2) and job matching (Module 4)
- **4-Layer Pipeline:** 
  - L1: Dict lookup (< 1ms) using 170+ synonym rules
  - L2: Route unknown skills to L3
  - L3: Embedding similarity (50ms) using all-MiniLM-L6-v2 model, cosine similarity, threshold 0.7
  - L4: Deduplication, select highest confidence
- **Database:** 95 canonical skills in skills.json
- **Input:** Pre-extracted skills array (not raw PDF text) — already parsed by Module 2
- **Output:** Structured UserProfile ready for job matching

---

**NOW GENERATE ALL FILES COMPLETE WITH NO PLACEHOLDERS.**
