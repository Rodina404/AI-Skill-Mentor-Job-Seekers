# GradRAG — Role-Skill Gap Analyzer

> A two-stage AI pipeline that analyzes any job title and tells you exactly which skills are required, which you already have, which are missing, and how ready you are for the role — in under 15 ms for known roles, under 5 s for anything else.

---

## Table of Contents

- [What Is GradRAG?](#what-is-gradrag)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [CLI Interface](#cli-interface)
- [Configuration](#configuration)
- [Readiness Score Formula](#readiness-score-formula)
- [Skill Normalization](#skill-normalization)
- [Data & Knowledge Base](#data--knowledge-base)
- [Testing](#testing)
- [Evaluation & Metrics](#evaluation--metrics)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)

---

## What Is GradRAG?

GradRAG is a **role-skill enrichment platform** built around a two-stage analysis pipeline. Given a job title and an optional user profile (skills, experience level, education level), it returns:

- The **required skills** for that role (with importance weights)
- The **skills you already have** (matched)
- The **skills you are missing** (gap)
- A numeric **readiness score** from 0.0 to 1.0
- A **role confidence** score indicating how certain the match is

The system has two operating modes that run in sequence:

**Mode A — Local Lookup (≈15 ms):** Checks a curated database of 89 pre-indexed roles. If the job title matches, it returns the result instantly at high confidence.

**Mode B — RAG Fallback (≈2–5 s):** If Mode A finds nothing, GradRAG automatically falls back to a Retrieval-Augmented Generation pipeline. It fetches live job postings from the Adzuna API, retrieves semantically similar roles from a ChromaDB vector store, builds a skill consensus summary, and sends all evidence to a Groq-hosted Llama 3.3 70B model for skill extraction.

Both modes produce identically shaped output — the caller always receives the same response schema regardless of which mode ran.

---

## How It Works

### End-to-End Pipeline

```
User Input (job title + optional profile)
        │
        ▼
  Input Validation & Sanitization
  (empty, null, length, character checks)
        │
        ▼
  Skill Normalization
  (raw skill strings → canonical S_* IDs)
        │
        ▼
┌───────────────────────┐
│     MODE A LOOKUP     │  ~15 ms p95
│  Title Index Search   │
│  + Embedding Search   │
│  (all-MiniLM-L6-v2)  │
└───────────────────────┘
        │
   ┌────┴────────────────────────────────────┐
   │ Match found?                            │
   ▼ YES                                     ▼ NO
Return with high confidence (≥0.95)          │
                                    ┌────────────────────────┐
                                    │      MODE B RAG        │  ~2–5 s p95
                                    │  1. Adzuna live fetch  │
                                    │  2. Chroma retrieval   │
                                    │  3. Skill consensus    │
                                    │  4. Groq LLM extract   │
                                    └────────────────────────┘
                                             │
                                    Return with medium confidence (0.65)
        │
        ▼
  Gap Engine
  (matched vs missing, skill_score)
        │
        ▼
  Readiness Score
  (skill_score × experience_score × education_score)
        │
        ▼
  Skill Enrichment
  (S_* IDs → human-readable names + weights)
        │
        ▼
  JSON Response
```

### Mode A: Local Lookup

Mode A uses a two-step matching strategy:

1. **Exact/fuzzy title index** — A normalized title is looked up in a pre-built dictionary of 89 roles. RapidFuzz handles minor typos and spacing differences.
2. **Semantic embedding search** — If the fuzzy match score is below threshold, the title is embedded with `all-MiniLM-L6-v2` and compared to pre-computed role embeddings using cosine similarity.

The top 6 skills (sorted by weight, then normalized to sum to 1.0) are selected and returned.

### Mode B: RAG Fallback

Mode B assembles evidence from three sources before calling the LLM:

1. **Adzuna API** — Up to 5 live job postings for the title are fetched, cleaned, and converted to plain text.
2. **ChromaDB vector store** — Up to 6 semantically similar role chunks are retrieved from the persistent embeddings database. Each chunk is scored by distance.
3. **Skill consensus summary** — A deterministic pass counts how many of the retrieved similar roles mention each canonical `S_*` skill ID. This summary (`S_python: supported by 5/6 similar roles`) is injected into the LLM prompt to bias towards well-supported skills.

The Groq LLM (Llama 3.3 70B) receives the combined evidence and the full list of allowed canonical skill IDs. It returns a JSON array of 4–6 skills with weights and confidence scores. The pipeline then normalizes weights, maps to canonical IDs, and passes results to the Gap Engine.

### Gap Engine

The Gap Engine computes:

```
matched_weight = sum(weight for skill in required_skills if skill in user_skills)
skill_score    = matched_weight / total_weight
readiness      = skill_score × experience_score × education_score
```

All scores are clamped to [0.0, 1.0].

---

## Quick Start

### Prerequisites

- Python 3.11+
- A [Groq API key](https://console.groq.com/) (free tier available)
- Optional: Adzuna API credentials for live job posting enrichment in Mode B

### 1. Clone & Set Up Virtual Environment

```bash
git clone <repo-url>
cd gradrag

# Create virtual environment
python -m venv .venv

# Activate (choose your shell)
.venv\Scripts\Activate.ps1       # PowerShell (Windows)
.venv\Scripts\activate.bat       # Command Prompt (Windows)
source .venv/bin/activate         # macOS / Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# Required — Groq API key for Mode B fallback
GROQ_API_KEY=gsk_...your_key_here...

# Optional — Adzuna job search API (enriches Mode B evidence)
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=gb          # or: us, au, ca, de, fr, in, nl, nz, pl, ru, sg, za

# Optional — CORS origin for your frontend
ALLOWED_ORIGIN=http://localhost:3000

# Optional — Logging verbosity
LOG_LEVEL=INFO

# Optional — Override ChromaDB storage path
CHROMA_DB_PATH=./chroma_db

# Optional — Override embedding model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 4. Verify Environment

```bash
python scripts/check_env.py
```

This script checks that all required environment variables are set and that external API connectivity (Groq, Adzuna) is working.

### 5. Start the API Server

```bash
uvicorn main:app --reload --port 8003
```

The server is now available at:

| URL | Description |
|-----|-------------|
| `http://127.0.0.1:8003/` | Root status |
| `http://127.0.0.1:8003/health` | Health check |
| `http://127.0.0.1:8003/docs` | Swagger UI (interactive) |
| `http://127.0.0.1:8003/redoc` | ReDoc documentation |
| `http://127.0.0.1:8003/openapi.json` | Raw OpenAPI schema |

### 6. Run a Quick Test

```bash
curl -X POST http://127.0.0.1:8003/run \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Machine Learning Engineer",
    "userProfile": {
      "skills": [{"skillId": "S_python"}, {"skillId": "S_pytorch"}],
      "experienceLevel": "senior",
      "educationLevel": "master"
    }
  }'
```

---

## Project Structure

```
gradrag/
│
├── main.py                         # ASGI entry point — `uvicorn main:app`
├── app.py                          # CLI interactive interface
├── test_groq.py                    # Quick standalone Groq API connectivity test
├── requirements.txt                # Python dependencies with version pins
├── .env                            # Your local environment variables (not committed)
│
├── api/                            # FastAPI application layer
│   ├── main.py                     # App factory: CORS, routers, logging config
│   ├── adapter.py                  # Bridge between API layer and pipeline; skill enrichment
│   ├── schemas.py                  # Pydantic request/response models (validation + docs)
│   └── routes/
│       ├── health.py               # GET /health — liveness probe
│       └── role_gap.py             # POST /run, POST /analyze-role-gap
│
├── src/                            # Core business logic
│   ├── pipeline.py                 # Main orchestrator — Mode A → Mode B fallback
│   ├── gap_engine.py               # Skill matching, skill_score, readiness calculation
│   ├── role_library.py             # Canonical skill ID registry (92+ skills, 400+ aliases)
│   ├── vectorstore.py              # ChromaDB wrapper — index, retrieve, auto-rebuild
│   ├── llm.py                      # Groq API client — prompt, extract, validate skills
│   ├── loaders.py                  # Data loading, title index, embedding model cache
│   ├── converters.py               # experience_to_score(), education_to_score()
│   ├── adzuna_client.py            # Adzuna REST API client — fetch & clean job postings
│   └── retrieval_helpers.py        # Evidence assembly — Adzuna + Chroma + consensus
│
├── data/                           # Static knowledge bases
│   ├── roles_dataset_extended_65_roles.json    # 65 roles with required skills (primary Mode A)
│   ├── merged_roles_structured_preserve_all.json  # Extended merged role dataset
│   ├── common_roles_curated.json               # Curated common role mappings
│   ├── skills_catalog.json                     # Master registry of 92+ canonical skills
│   ├── role_skill_library.json                 # Role→skill weight assignments
│   ├── role_skill_library_seed.json            # Seed data for library bootstrap
│   ├── dataroles.txt                           # Raw role text corpus for ChromaDB indexing
│   ├── mode_b_evaluation.json                  # Offline Mode B test cases with ground truth
│   └── final_evaluation_thresholds.json        # Numeric pass/fail thresholds for CI
│
├── tests/                          # Full test suite (95+ test cases)
│   ├── test_service.py             # API endpoint integration tests (17 cases)
│   ├── test_mode_b_5cases.py       # Mode B pipeline unit tests (5 cases, forced RAG)
│   ├── test_api_mode_b.py          # Mode B API tests (5 cases, mock-forced)
│   ├── test_gap_engine.py          # Gap engine unit tests
│   ├── test_pipeline_interface.py  # Pipeline interface contract tests
│   ├── test_service.py             # Full service tests
│   ├── core/
│   │   ├── test_components.py      # Individual component tests
│   │   ├── test_converters.py      # experience/education score conversion
│   │   ├── test_embeddings.py      # Vector store embedding tests
│   │   ├── test_gap_engine.py      # Gap matching logic
│   │   └── test_lookup.py          # Title lookup and fuzzy matching
│   ├── integration/
│   │   ├── test_pipeline.py        # Full pipeline flow tests
│   │   ├── test_complete_pipeline.py  # End-to-end tests
│   │   ├── test_mode_b.py          # Mode B fallback path tests
│   │   ├── test_mode_b_recovery.py # Recovery from Mode B failure
│   │   └── test_groq.py            # Groq client integration tests
│   └── features/
│       ├── test_cleaner.py         # Input cleaning/sanitization
│       ├── test_mode_a_core_skills.py  # Mode A skill selection
│       ├── test_mode_b_quality_filters.py  # Mode B quality filtering
│       ├── test_normalization_validation.py  # Skill alias normalization
│       ├── test_robustness_improvements.py  # Edge case handling
│       ├── test_role_data_integrity.py  # Data file validation
│       └── test_step3_final.py     # Final validation assertions
│
├── scripts/                        # Developer utilities
│   ├── evaluate.py                 # 20-threshold automated evaluation → reports/
│   ├── run_all_tests.py            # Orchestrates all test suites in order
│   ├── validate_normalization.py   # Spot-check skill alias normalization
│   └── check_env.py                # Environment & connectivity verification
│
├── chroma_db/                      # ChromaDB persistent vector storage (production)
├── chroma_db_current/              # ChromaDB current session (recovery fallback)
│
└── reports/                        # Evaluation output artifacts
    ├── evaluation_results.json     # Full machine-readable metrics (all 20 thresholds)
    ├── final_evaluation_report.txt # Human-readable evaluation summary
    ├── mode_quality_comparison.png # Mode A vs B precision/recall/F1
    ├── mode_speed_comparison.png   # Latency distribution visualization
    ├── rag_evidence_quality.png    # RAG evidence relevance breakdown
    ├── consistency_comparison.png  # Cross-run consistency (Mode A vs B)
    ├── normalization_quality.png   # Skill normalization accuracy
    └── mode_b_ranking_quality.png  # P@5, nDCG@5 ranking metrics
```

---

## API Reference

### Authentication

No authentication required. All endpoints are open. CORS is configured for `localhost:3000` and `localhost:5173` by default, plus any additional origin set in `ALLOWED_ORIGIN`.

---

### `GET /`

Root status endpoint.

**Response:**
```json
{
  "status": "running",
  "project": "GradRAG"
}
```

---

### `GET /health`

Liveness probe for deployment health checks.

**Response:**
```json
{
  "status": "ok",
  "service": "gradrag",
  "version": "1.0.0"
}
```

---

### `POST /run`

Full role-gap analysis endpoint. Accepts a rich user profile with structured skills, experience level, and education level.

**Request body:**

```json
{
  "jobTitle": "Machine Learning Engineer",
  "userProfile": {
    "skills": [
      {"skillId": "S_python"},
      {"skillId": "S_pytorch"}
    ],
    "experienceLevel": "senior",
    "educationLevel": "master"
  },
  "seniority": "senior",
  "location": "London",
  "industry": "fintech"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobTitle` | string | Yes | Job title to analyze (1–200 chars) |
| `userProfile.skills` | array | No | List of `{skillId}` objects |
| `userProfile.experienceLevel` | string | No | Free text, e.g. `"junior"`, `"3 years"`, `"senior"` |
| `userProfile.educationLevel` | string | No | Free text, e.g. `"bachelor"`, `"master"`, `"phd"` |
| `userProfile.experienceScore` | float | No | Pre-computed score [0.0–1.0] (overrides experienceLevel) |
| `userProfile.educationScore` | float | No | Pre-computed score [0.0–1.0] (overrides educationLevel) |
| `seniority` | string | No | Enriches Mode A title matching |
| `location` | string | No | Enriches Mode A title matching |
| `industry` | string | No | Enriches Mode A title matching |

**Success response (Mode A):**

```json
{
  "success": true,
  "data": {
    "jobTitle": "Machine Learning Engineer",
    "source": "mode_a",
    "roleConfidence": 0.98,
    "readinessScore": 0.72,
    "requiredSkills": [
      {"skillId": "S_python",  "skill": "Python",  "weight": 0.2833},
      {"skillId": "S_pytorch", "skill": "PyTorch", "weight": 0.2167},
      {"skillId": "S_machine_learning", "skill": "Machine Learning", "weight": 0.2000},
      {"skillId": "S_deep_learning",    "skill": "Deep Learning",    "weight": 0.1667},
      {"skillId": "S_tensorflow",       "skill": "TensorFlow",       "weight": 0.1333}
    ],
    "matchedSkills": [
      {"skillId": "S_python",  "skill": "Python",  "weight": 0.2833},
      {"skillId": "S_pytorch", "skill": "PyTorch", "weight": 0.2167}
    ],
    "missingSkills": [
      {"skillId": "S_machine_learning", "skill": "Machine Learning", "weight": 0.2000},
      {"skillId": "S_deep_learning",    "skill": "Deep Learning",    "weight": 0.1667},
      {"skillId": "S_tensorflow",       "skill": "TensorFlow",       "weight": 0.1333}
    ],
    "unknownSkills": []
  },
  "meta": {
    "processing_time_ms": 12,
    "service": "gradrag"
  }
}
```

**Success response (Mode B):**

```json
{
  "success": true,
  "data": {
    "jobTitle": "Edge AI Engineer",
    "source": "mode_b",
    "roleConfidence": 0.65,
    "readinessScore": 0.44,
    "requiredSkills": [...],
    "matchedSkills": [...],
    "missingSkills": [...],
    "unknownSkills": []
  },
  "meta": {
    "processing_time_ms": 3214,
    "service": "gradrag"
  }
}
```

**Error response (HTTP 422):**

```json
{
  "success": false,
  "error": {
    "code": "NO_MATCH_FOUND",
    "message": "Could not determine required skills for job title: '...'."
  },
  "meta": {
    "processing_time_ms": 5120,
    "service": "gradrag"
  }
}
```

**Error codes:**

| Code | Meaning |
|------|---------|
| `INVALID_JOB_TITLE` | Empty, null, too long (>200 chars), or non-alphabetic input |
| `NO_MATCH_FOUND` | Both Mode A and Mode B failed to find usable skills |
| `PIPELINE_ERROR` | Unexpected internal error |

---

### `POST /analyze-role-gap`

Lightweight endpoint for quick testing and simple integrations. Accepts flat skill ID strings instead of structured objects.

**Request body:**

```json
{
  "role": "Kubernetes Engineer",
  "skills": ["S_kubernetes", "S_docker"],
  "experience": "senior",
  "education": "bachelor"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | Target job title |
| `skills` | array of strings | No | Canonical skill IDs or raw skill names |
| `experience` | string | No | Experience descriptor |
| `education` | string | No | Education descriptor |

**Success response:**

```json
{
  "success": true,
  "data": {
    "source": "mode_a",
    "confidence": 0.97,
    "readiness": 0.81,
    "required_skills": [...],
    "matched_skills": [...],
    "missing_skills": [...]
  },
  "meta": {
    "processing_time_ms": 14,
    "service": "gradrag"
  }
}
```

Both endpoints internally call the same `run_role_gap_analysis()` function and produce identical behavior. The difference is only in the input schema shape.

---

### cURL Examples

```bash
# Health check
curl http://127.0.0.1:8003/health

# Full endpoint — known role (Mode A path)
curl -X POST http://127.0.0.1:8003/run \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "DevOps Engineer",
    "userProfile": {
      "skills": [{"skillId": "S_docker"}, {"skillId": "S_linux"}],
      "experienceLevel": "3 years",
      "educationLevel": "bachelor"
    }
  }'

# Lightweight endpoint — unknown role (triggers Mode B)
curl -X POST http://127.0.0.1:8003/analyze-role-gap \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Quantum Software Engineer",
    "skills": ["S_python", "S_mathematics"],
    "experience": "senior",
    "education": "phd"
  }'
```

---

## CLI Interface

An interactive CLI is available for local exploration without needing an HTTP client.

```bash
python app.py
```

The CLI prompts for:

1. **Job title** — the role you want to analyze
2. **Current skills** — comma-separated list (raw names or `S_*` IDs), optional
3. **Experience level** — e.g. `junior`, `3 years`, `senior`
4. **Education level** — e.g. `bachelor`, `master`, `phd`

Output is color-coded in the terminal:
- Green — matched skills you already have
- Red — missing skills you need to acquire
- Yellow — readiness score and role confidence

---

## Configuration

All configuration is done through environment variables, loaded from `.env` at startup via `python-dotenv`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Groq API key for Mode B LLM inference |
| `ADZUNA_APP_ID` | No | — | Adzuna application ID for live job postings |
| `ADZUNA_APP_KEY` | No | — | Adzuna application key |
| `ADZUNA_COUNTRY` | No | `gb` | Country code for Adzuna job search |
| `ALLOWED_ORIGIN` | No | — | Additional CORS allowed origin (your frontend URL) |
| `LOG_LEVEL` | No | `INFO` | Python logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `CHROMA_DB_PATH` | No | `./chroma_db` | Path to ChromaDB storage directory |
| `EMBEDDING_MODEL` | No | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace embedding model for vector search |

The CORS configuration also always allows `http://localhost:3000` and `http://localhost:5173` (Vite dev server default).

---

## Readiness Score Formula

The readiness score is the core output that tells a user how prepared they are for a given role. It is calculated as a weighted sum:

```
readiness = (skill_score × 0.5) + (experience_score × 0.3) + (education_score × 0.2)
```

Where:

**`skill_score`** = weighted fraction of required skills the user has:
```
skill_score = Σ(weight_i for matched skills) / Σ(weight_i for all required skills)
```

**`experience_score`** is derived from the `experienceLevel` string:

| Input examples | Score |
|----------------|-------|
| `"no experience"`, `"fresher"`, `"0 years"`, `"entry level"` | 0.0 |
| `"junior"`, `"1 year"`, `"2 years"`, `"1-2 years"` | 0.4 |
| `"mid"`, `"3 years"`, `"4 years"`, `"3-4 years"` | 0.7 |
| `"senior"`, `"5 years"`, `"5+ years"`, `"lead"`, `"principal"` | 1.0 |
| Unrecognized / not provided | 0.5 (neutral) |

**`education_score`** is derived from the `educationLevel` string:

| Input examples | Score |
|----------------|-------|
| `"high school"`, `"no degree"`, `"secondary"` | 0.2 |
| `"bootcamp"`, `"diploma"`, `"certificate"`, `"associate"` | 0.5 |
| `"bachelor"`, `"bs"`, `"ba"`, `"undergraduate"` | 0.7 |
| `"master"`, `"ms"`, `"msc"`, `"postgraduate"` | 0.9 |
| `"phd"`, `"doctorate"` | 1.0 |
| Unrecognized / not provided | 0.5 (neutral) |

Pre-computed float scores can be passed directly as `experienceScore` / `educationScore` (0.0–1.0) in the `userProfile` to bypass the text-to-score conversion. All scores are clamped to [0.0, 1.0].

---

## Skill Normalization

GradRAG maps raw user input to canonical `S_*` skill IDs before any comparison. The normalization system covers 92+ canonical skills with 400+ registered aliases.

### How it works

The `role_library.py` module loads `data/skills_catalog.json` at startup and builds an alias → canonical ID lookup table. Matching is exact (case-insensitive) but covers a wide range of common aliases, abbreviations, and common typos.

### Examples

| User Input | Canonical ID |
|------------|-------------|
| `"python"`, `"Python 3"`, `"pytohn"` | `S_python` |
| `"k8s"`, `"Kubernetes"` | `S_kubernetes` |
| `"aws ec2"`, `"Amazon Web Services"` | `S_aws` |
| `"postgres"`, `"PostgreSQL"` | `S_postgresql` |
| `"ci/cd"`, `"cicd"`, `"CI CD"` | `S_cicd` |
| `"pyspark"` | `S_spark` |
| `"power bi"` | `S_data_visualization` |
| `"machine-learning"` | `S_machine_learning` |

### Unknown Skills

Skills that cannot be mapped to any canonical ID are returned in the `unknownSkills` array (Mode A) and excluded from gap calculations. Soft skills like `"communication"`, `"teamwork"`, and `"leadership"` are explicitly excluded as non-technical skills not tracked in the catalog.

### Adding a New Alias

Edit `data/skills_catalog.json` and add the alias string to the relevant skill's `aliases` array:

```json
{
  "skillId": "S_python",
  "name": "Python",
  "aliases": ["python", "Python 3", "py", "pytohn", "your-new-alias"]
}
```

---

## Data & Knowledge Base

### `data/roles_dataset_extended_65_roles.json`

The primary Mode A knowledge base. Contains 65 curated technical roles, each with a list of required skills and their importance weights. This is the first source queried on every request.

### `data/merged_roles_structured_preserve_all.json`

An extended merged dataset of all roles including those added during development. Combined with the 65-role dataset, the Mode A engine covers 89 total roles in the title index.

### `data/skills_catalog.json`

The master skill registry. Every canonical `S_*` skill ID, its human-readable name, and all recognized aliases are defined here. This is the single source of truth for skill normalization across the entire system.

### `data/role_skill_library.json`

Maps roles to their skill IDs with weight assignments. Used for seeding and validation.

### `data/dataroles.txt`

The raw text corpus used to build the ChromaDB vector index. Contains role descriptions and skill mentions that were chunked (500 chars, 50-char overlap) and embedded into the persistent vector store.

### ChromaDB Vector Store

The ChromaDB database lives in `chroma_db/`. It stores role description chunks as 384-dimensional vectors produced by `sentence-transformers/all-MiniLM-L6-v2`. Mode B retrieves the 6 most semantically similar chunks for any given job title query.

The vector store supports automatic rebuild from source data if the database becomes corrupted. A versioned backup is kept at `chroma_db_v{version}/` and a current-session copy at `chroma_db_current/`.

---

## Testing

GradRAG has a structured test suite with 95+ test cases organized in three tiers.

### Run All Tests

```bash
python scripts/run_all_tests.py
```

This runs all test groups in sequence and reports a summary.

### Run Individual Groups

```bash
# Unit tests — component-level
pytest tests/core/ -v

# Feature tests — behaviour-level
pytest tests/features/ -v

# Integration tests — cross-module flows
pytest tests/integration/ -v

# API tests — HTTP endpoint contract
pytest tests/test_service.py -v

# Mode B pipeline (forced RAG, no Mode A fallback)
pytest tests/test_mode_b_5cases.py -v

# Mode B through API (mocked Groq)
pytest tests/test_api_mode_b.py -v
```

### Run a Single File

```bash
pytest tests/core/test_gap_engine.py -v
pytest tests/core/test_converters.py -v
pytest tests/features/test_normalization_validation.py -v
```

### Test Categories

**`tests/core/`** — Unit tests for individual components:
- `test_gap_engine.py` — Skill matching logic, readiness formula edge cases
- `test_converters.py` — Experience and education string-to-score conversion
- `test_embeddings.py` — Vector store initialization and query correctness
- `test_components.py` — Pipeline component contracts
- `test_lookup.py` — Title index fuzzy matching and embedding search

**`tests/features/`** — Behaviour-level tests:
- `test_normalization_validation.py` — All alias → canonical ID mappings
- `test_mode_a_core_skills.py` — Mode A skill selection and weight normalization
- `test_mode_b_quality_filters.py` — Mode B output quality gates
- `test_robustness_improvements.py` — Edge cases: empty input, null values, overlong titles
- `test_role_data_integrity.py` — Validates JSON data files are well-formed and consistent
- `test_cleaner.py` — Input sanitization

**`tests/integration/`** — Cross-module flow tests:
- `test_pipeline.py` — Full Mode A → Mode B orchestration
- `test_complete_pipeline.py` — End-to-end tests with real data
- `test_mode_b.py` — Mode B fallback path isolation
- `test_mode_b_recovery.py` — Recovery when Mode B partially fails
- `test_groq.py` — Groq API client response parsing

---

## Evaluation & Metrics

Run the full automated evaluation suite:

```bash
python scripts/evaluate.py
```

This runs 20 automated checks across 7 dimensions and writes results to `reports/`.

### Last Evaluation Results — All 20 Thresholds Passed ✓

| Metric | Achieved | Target | Status |
|--------|----------|--------|--------|
| Normalization Precision | 1.000 | ≥ 0.950 | ✓ PASS |
| Normalization Recall | 1.000 | ≥ 0.950 | ✓ PASS |
| Normalization Specificity | 1.000 | ≥ 0.950 | ✓ PASS |
| Mode A Role Accuracy | 1.000 | ≥ 0.950 | ✓ PASS |
| Mode A F1 Score | 0.759 | ≥ 0.700 | ✓ PASS |
| Mode A p95 Speed | 15.0 ms | < 500 ms | ✓ PASS |
| Mode B Precision | 0.667 | ≥ 0.650 | ✓ PASS |
| Mode B Recall | 0.722 | ≥ 0.650 | ✓ PASS |
| Mode B F1 Score | 0.689 | ≥ 0.650 | ✓ PASS |
| Mode B Precision@5 | 0.733 | ≥ 0.700 | ✓ PASS |
| Mode B nDCG@5 | 0.835 | ≥ 0.700 | ✓ PASS |
| Offline Mode B F1 | 1.000 | ≥ 0.900 | ✓ PASS |
| Offline Mode B nDCG@5 | 1.000 | ≥ 0.900 | ✓ PASS |
| Mode B p95 Speed | 4789.9 ms | < 5000 ms | ✓ PASS |
| RAG Availability | 1.000 | ≥ 0.950 | ✓ PASS |
| RAG Relevance | 0.783 | ≥ 0.700 | ✓ PASS |
| Live Groq Availability | 1.000 | ≥ 1.000 | ✓ PASS |
| Mode A Consistency | 1.000 | ≥ 0.950 | ✓ PASS |
| Mode B Consistency | 0.833 | ≥ 0.800 | ✓ PASS |
| Mode B Stability | 0.889 | ≥ 0.800 | ✓ PASS |

### What the Evaluation Measures

**Normalization** — Does the alias lookup map the right inputs to the right `S_*` IDs? Tested on positive cases (aliases that should match) and negative cases (strings that should not match any ID).

**Mode A accuracy** — Is the correct role returned for a set of known job titles? F1 is computed against expected skill sets.

**Mode B quality** — For job titles not in the Mode A database, does the RAG pipeline return the right skills? Precision, Recall, F1, Precision@5, and nDCG@5 are measured against ground-truth skill sets.

**Speed** — p95 latency is measured over multiple runs. Mode A must respond in under 500 ms; Mode B in under 5000 ms.

**Consistency** — Running the same title multiple times must produce the same result. Mode A is deterministic (100%); Mode B allows slight variation due to LLM sampling (83.3% consistency, above the 80% threshold).

**RAG quality** — Evidence retrieved from ChromaDB is scored for relevance to the queried job title.

### Generated Reports

```
reports/
├── evaluation_results.json         # All metrics, raw numbers, per-case breakdowns
├── final_evaluation_report.txt     # Human-readable table — pass/fail for all thresholds
├── mode_quality_comparison.png     # Precision / Recall / F1 bar chart for both modes
├── mode_speed_comparison.png       # Latency distribution and p95 markers
├── rag_evidence_quality.png        # Per-query RAG relevance scores
├── consistency_comparison.png      # Consistency rate across repeated runs
├── normalization_quality.png       # TP / FP / FN counts for alias normalization
└── mode_b_ranking_quality.png      # P@5 and nDCG@5 ranking quality
```

---

## Development Guide

### Adding a New Role to Mode A

1. Open `data/roles_dataset_extended_65_roles.json`
2. Add a new entry following this schema:
   ```json
   {
     "role": "your role title",
     "requiredSkills": [
       {"skillId": "S_python", "weight": 0.30},
       {"skillId": "S_sql",    "weight": 0.25},
       {"skillId": "S_docker", "weight": 0.20},
       {"skillId": "S_linux",  "weight": 0.15},
       {"skillId": "S_cicd",   "weight": 0.10}
     ]
   }
   ```
   Weights do not need to sum to 1.0 — the loader normalizes them automatically.
3. Verify the data file is valid:
   ```bash
   python scripts/check_env.py
   ```
4. Restart the server:
   ```bash
   uvicorn main:app --reload --port 8003
   ```

### Adding a New Canonical Skill

1. Open `data/skills_catalog.json`
2. Add a new skill entry:
   ```json
   {
     "skillId": "S_your_skill",
     "name": "Your Skill Name",
     "aliases": ["your skill", "your-skill", "YourSkill", "ys"]
   }
   ```
3. Re-run the evaluation to confirm normalization stats remain passing:
   ```bash
   python scripts/evaluate.py
   ```

### Adding a New Skill Alias

1. Find the relevant entry in `data/skills_catalog.json`
2. Add the new alias string to the `aliases` array
3. Add a test case to `tests/features/test_normalization_validation.py`
4. Run normalization tests:
   ```bash
   pytest tests/features/test_normalization_validation.py -v
   ```

### Running the Normalization Validator

```bash
python scripts/validate_normalization.py
```

Prints a table of alias → canonical ID mappings and flags any that fail to resolve.

### Rebuilding the ChromaDB Vector Index

The ChromaDB index is built from `data/dataroles.txt`. If you add new role text to that file, rebuild the index by deleting the old database and restarting the server:

```bash
# Delete the vector store (it will auto-rebuild on next startup)
rm -rf chroma_db/

# Restart — the server will re-index on boot
uvicorn main:app --reload --port 8003
```

### Running in Different Environments

**Development:**
```bash
uvicorn main:app --reload --port 8003 --log-level debug
```

**Production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8003 --workers 4
```

**Check which port is in use:**
```bash
# Windows
netstat -ano | findstr :8003

# macOS / Linux
lsof -i :8003
```

---

## Troubleshooting

### Server fails to start

```bash
# Confirm Python version (requires 3.11+)
python --version

# Confirm virtual environment is active
which python       # should point to .venv/

# Confirm all packages are installed
pip list | grep fastapi
pip list | grep chromadb

# Re-install if anything is missing
pip install -r requirements.txt

# Check if port 8003 is already occupied
netstat -ano | findstr :8003   # Windows
lsof -i :8003                   # macOS / Linux
```

### Mode A returns nothing for a role I know exists

```bash
# Test the title lookup directly
python -c "
from src.loaders import find_best_match
result = find_best_match('your job title here')
print(result)
"
```

If the result is `None`, the role is not in the Mode A database. Either add it (see [Adding a New Role](#adding-a-new-role-to-mode-a)) or let Mode B handle it.

### Mode B (RAG fallback) fails or returns no skills

```bash
# 1. Check that GROQ_API_KEY is set
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('GROQ_API_KEY', 'NOT SET'))"

# 2. Test Groq connectivity directly
python test_groq.py

# 3. Check the full evaluation report for error details
python scripts/evaluate.py
# Then open reports/evaluation_results.json
```

If the Groq key is correct but Mode B still fails, check that the ChromaDB vector store is intact:

```bash
ls -la chroma_db/
```

If the directory is missing or empty, restart the server — it will auto-rebuild from `data/dataroles.txt`.

### A skill I entered is not being recognized

```bash
# Test normalization for a specific term
python -c "
from src.role_library import normalize_skill_name
result = normalize_skill_name('your skill term here')
print('Canonical ID:', result)
"

# List all known aliases for a skill
python -c "
import json
with open('data/skills_catalog.json') as f:
    catalog = json.load(f)
skills = catalog.get('skills', catalog) if isinstance(catalog, dict) else catalog
for s in skills:
    if 'python' in s['skillId'].lower():
        print(s['skillId'], '→', s.get('aliases', []))
"
```

If the skill is not recognized, add an alias to `data/skills_catalog.json` as described in [Adding a New Skill Alias](#adding-a-new-skill-alias).

### Swagger UI shows no endpoints

Make sure you are accessing `http://127.0.0.1:8003/docs`, not `localhost:8003/docs`. On some systems, `localhost` does not resolve to `127.0.0.1`. Alternatively check that the routers are registered in `api/main.py`.

### Tests fail with import errors

```bash
# Make sure you are running pytest from the project root
cd gradrag
pytest tests/ -v

# If imports still fail, add the project root to PYTHONPATH
PYTHONPATH=. pytest tests/ -v       # macOS / Linux
$env:PYTHONPATH="."; pytest tests/ -v  # PowerShell
```

---

## Dependencies

### Core Framework

| Package | Purpose |
|---------|---------|
| `fastapi` | REST API framework |
| `uvicorn[standard]` | ASGI server with WebSocket & HTTP/2 support |
| `pydantic` | Request/response validation and OpenAPI schema generation |
| `python-dotenv` | `.env` file loading |

### AI & ML

| Package | Purpose |
|---------|---------|
| `chromadb` | Persistent vector store for Mode B semantic retrieval |
| `sentence-transformers` | HuggingFace `all-MiniLM-L6-v2` embedding model |
| `groq` | Groq API client for Llama 3.3 70B inference (Mode B) |
| `scikit-learn` | Cosine similarity scoring for embedding search |
| `numpy` | Numeric operations for embedding vectors |

### Data & Utilities

| Package | Purpose |
|---------|---------|
| `requests` | HTTP client for Adzuna API calls |
| `rapidfuzz` | Fast fuzzy string matching for title lookup |
| `pandas` | Data manipulation in evaluation scripts |
| `matplotlib` | Chart generation in evaluation reports |

### Testing

| Package | Purpose |
|---------|---------|
| `pytest` | Test runner |
| `httpx` | Async HTTP client for FastAPI `TestClient` |
| `unittest.mock` | Mocking for unit and integration tests |

See `requirements.txt` for exact version pins.

---

## License & Attribution

GradRAG uses the following open-source and commercial services:

- **FastAPI** — MIT License
- **ChromaDB** — Apache 2.0 License
- **sentence-transformers / all-MiniLM-L6-v2** — Apache 2.0 License
- **Groq API** — Commercial API (Llama 3.3 70B model)
- **Adzuna API** — Commercial API (job search data)
- **O*NET Technology Skills taxonomy** — Public domain (US Department of Labor)
- **RapidFuzz** — MIT License

See `requirements.txt` for the full dependency list with version constraints.