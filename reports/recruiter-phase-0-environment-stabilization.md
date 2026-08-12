# Phase 0 — Recruiter Cycle Environment Stabilization Report

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  
**Head Commit (before changes):** `77418d26d29bfa6209fd7058a66f3f5e2afd69f5`  

---

## 1. Files Inspected

### Backend Source Code (Environment Variable Usage)

| File | Variables Referenced | Evidence |
| :--- | :--- | :--- |
| `backend/src/controllers/matches.controller.js` (L6-10) | `CV_MATCHING_URL`, `GAP_ENGINE_URL`, `M5_ROADMAP_URL`, `COURSE_REC_URL`, `JOB_REC_URL` | SERVICES object |
| `backend/src/controllers/resumes.controller.js` (L6-10) | `M1_EXTRACTION_URL`, `SKILL_NORM_URL`, `GAP_ENGINE_URL`, `M5_ROADMAP_URL`, `COURSE_REC_URL` | SERVICES object |
| `backend/src/controllers/jobs.controller.js` (L518) | `JOB_REC_URL` | Inline reference |
| `backend/src/controllers/roadmap.controller.js` (L4) | `M5_ROADMAP_URL` | Inline reference |
| `backend/src/controllers/courses.controller.js` (L362) | `M5_ROADMAP_URL` | Inline reference |
| `backend/src/config/supabase.js` (L3-16) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` | Client creation |
| `backend/src/config/env.js` (L4-11) | `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `JWT_ACCESS_SECRET` | Config export |
| `backend/src/server.js` (L12, 39) | `CORS_ORIGIN`, `PORT` | App setup |

### Configuration Files

| File | Purpose |
| :--- | :--- |
| `docker-compose.yml` | Docker Compose service definitions and environment variables |
| `backend/.env.example` | Local development environment template |
| `k8s/configmap.yaml` | Kubernetes ConfigMap with microservice URLs |
| `k8s/backend-frontend.yaml` | Backend deployment referencing ConfigMap and Secrets |
| `k8s/secrets.yaml` | Kubernetes Secrets template |
| `k8s/microservices.yaml` | Microservice Deployments and Services |

### Frontend

| File | Variables Referenced |
| :--- | :--- |
| All `Frontend-React/src/api/*.js` files (14 files) | `VITE_API_URL` via `import.meta.env.VITE_API_URL` with fallback `http://localhost:5000/api` |
| Several `.tsx` component files | Same pattern |

---

## 2. Configuration Inconsistencies Found

### CONFIRMED: Docker Compose Environment Variable Name Drift

Three environment variable names in `docker-compose.yml` **did not match** the names the backend source code reads from `process.env`. The backend controllers never read the Docker-supplied variables, causing every containerized call to these three services to fall back to `http://localhost:<port>`, which **fails inside a Docker container** because `localhost` refers to the container itself, not the target service container.

| Service | Backend Expects (`process.env`) | Docker Compose Had (BEFORE) | K8s ConfigMap Has | `.env.example` Had |
| :--- | :--- | :--- | :--- | :--- |
| Skill Normalization (8002) | `SKILL_NORM_URL` | `SKILL_NORMALIZATION_URL` ❌ | `SKILL_NORM_URL` ✅ | `SKILL_NORM_URL` ✅ |
| Course Recommendation (8006) | `COURSE_REC_URL` | `COURSE_RECOMMENDATION_URL` ❌ | `COURSE_REC_URL` ✅ | `COURSE_REC_URL` ✅ |
| Job Recommendation (8007) | `JOB_REC_URL` | `JOB_RECOMMENDATION_URL` ❌ | `JOB_REC_URL` ✅ | (missing) ❌ |

### CONFIRMED: Missing Entries in `.env.example`

Two microservice URLs were absent from `.env.example`:

| Missing Variable | Port | Used By |
| :--- | :--- | :--- |
| `CV_MATCHING_URL` | 8003 | `matches.controller.js` |
| `JOB_REC_URL` | 8007 | `matches.controller.js`, `jobs.controller.js` |

### CONFIRMED: Correct (No Change Needed)

| Service | Backend Expects | Docker Compose | K8s ConfigMap | `.env.example` | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 Extraction (8001) | `M1_EXTRACTION_URL` | `M1_EXTRACTION_URL` | `M1_EXTRACTION_URL` | `M1_EXTRACTION_URL` | ✅ Aligned |
| CV Matching (8003) | `CV_MATCHING_URL` | `CV_MATCHING_URL` | `CV_MATCHING_URL` | (was missing) | ✅ Aligned (now fixed) |
| Gap Engine (8004) | `GAP_ENGINE_URL` | `GAP_ENGINE_URL` | `GAP_ENGINE_URL` | `GAP_ENGINE_URL` | ✅ Aligned |
| M5 Roadmap (8005) | `M5_ROADMAP_URL` | `M5_ROADMAP_URL` | `M5_ROADMAP_URL` | `M5_ROADMAP_URL` | ✅ Aligned |

### Service Address Verification (TASK 3)

All Docker Compose service addresses use Docker DNS names (not `localhost`):

| Docker Compose Env Var | Value | Correct? |
| :--- | :--- | :--- |
| `M1_EXTRACTION_URL` | `http://m1-extraction:8001` | ✅ |
| `SKILL_NORM_URL` | `http://skill-normalization:8002` | ✅ |
| `CV_MATCHING_URL` | `http://cv-matching:8003` | ✅ |
| `GAP_ENGINE_URL` | `http://gap-engine:8004` | ✅ |
| `M5_ROADMAP_URL` | `http://m5-roadmap:8005` | ✅ |
| `COURSE_REC_URL` | `http://course-recommendation:8006` | ✅ |
| `JOB_REC_URL` | `http://job-recommendation:8007` | ✅ |

All K8s ConfigMap addresses use Kubernetes Service DNS and match the Service names in `k8s/microservices.yaml`:

| K8s ConfigMap Key | Value | Matches K8s Service? |
| :--- | :--- | :--- |
| `M1_EXTRACTION_URL` | `http://m1-extraction-service:8001` | ✅ |
| `SKILL_NORM_URL` | `http://skill-normalization-service:8002` | ✅ |
| `CV_MATCHING_URL` | `http://cv-matching-service:8003` | ✅ |
| `GAP_ENGINE_URL` | `http://gap-engine-service:8004` | ✅ |
| `M5_ROADMAP_URL` | `http://m5-roadmap-service:8005` | ✅ |
| `COURSE_REC_URL` | `http://course-recommendation-service:8006` | ✅ |
| `JOB_REC_URL` | `http://job-recommendation-service:8007` | ✅ |

---

## 3. Changes Made

Only **two files** were modified. Zero application code changes. Zero schema changes. Zero test modifications. Zero frontend changes.

### Change 1: `docker-compose.yml` — Rename 3 environment variables

**Rationale:** The backend source code reads `SKILL_NORM_URL`, `COURSE_REC_URL`, and `JOB_REC_URL` from `process.env`. Docker Compose was injecting them under different names (`SKILL_NORMALIZATION_URL`, `COURSE_RECOMMENDATION_URL`, `JOB_RECOMMENDATION_URL`), so the values were never consumed and the backend fell back to `localhost` URLs that fail inside Docker containers.

**Risk:** None. The old variable names were never read by any backend code.

### Change 2: `backend/.env.example` — Add 2 missing entries

**Rationale:** `CV_MATCHING_URL` (port 8003) and `JOB_REC_URL` (port 8007) are read by `matches.controller.js` and `jobs.controller.js` respectively, but were not documented in `.env.example`.

**Risk:** None. `.env.example` is a documentation/template file only.

---

## 4. Exact Files Changed

```
 backend/.env.example | 2 ++     (2 lines added)
 docker-compose.yml   | 6 +++--- (3 lines changed)
 2 files changed, 5 insertions(+), 3 deletions(-)
```

No other files were modified. Verified via `git diff --stat`.

---

## 5. Before/After Environment Variable Mapping

### Complete Final Mapping (All 7 Microservice URLs)

| # | Service | Port | Backend `process.env` | Docker Compose (BEFORE) | Docker Compose (AFTER) | K8s ConfigMap | `.env.example` (BEFORE) | `.env.example` (AFTER) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | M1 Extraction | 8001 | `M1_EXTRACTION_URL` | `M1_EXTRACTION_URL` ✅ | `M1_EXTRACTION_URL` ✅ | `M1_EXTRACTION_URL` ✅ | `M1_EXTRACTION_URL` ✅ | `M1_EXTRACTION_URL` ✅ |
| 2 | Skill Normalization | 8002 | `SKILL_NORM_URL` | `SKILL_NORMALIZATION_URL` ❌ | `SKILL_NORM_URL` ✅ | `SKILL_NORM_URL` ✅ | `SKILL_NORM_URL` ✅ | `SKILL_NORM_URL` ✅ |
| 3 | CV Matching | 8003 | `CV_MATCHING_URL` | `CV_MATCHING_URL` ✅ | `CV_MATCHING_URL` ✅ | `CV_MATCHING_URL` ✅ | ❌ Missing | `CV_MATCHING_URL` ✅ |
| 4 | Gap Engine | 8004 | `GAP_ENGINE_URL` | `GAP_ENGINE_URL` ✅ | `GAP_ENGINE_URL` ✅ | `GAP_ENGINE_URL` ✅ | `GAP_ENGINE_URL` ✅ | `GAP_ENGINE_URL` ✅ |
| 5 | M5 Roadmap | 8005 | `M5_ROADMAP_URL` | `M5_ROADMAP_URL` ✅ | `M5_ROADMAP_URL` ✅ | `M5_ROADMAP_URL` ✅ | `M5_ROADMAP_URL` ✅ | `M5_ROADMAP_URL` ✅ |
| 6 | Course Recommendation | 8006 | `COURSE_REC_URL` | `COURSE_RECOMMENDATION_URL` ❌ | `COURSE_REC_URL` ✅ | `COURSE_REC_URL` ✅ | `COURSE_REC_URL` ✅ | `COURSE_REC_URL` ✅ |
| 7 | Job Recommendation | 8007 | `JOB_REC_URL` | `JOB_RECOMMENDATION_URL` ❌ | `JOB_REC_URL` ✅ | `JOB_REC_URL` ✅ | ❌ Missing | `JOB_REC_URL` ✅ |

**Result: All 7 microservice URL variables are now aligned across all 4 configuration sources.**

---

## 6. Supabase Connectivity Status

| Check | Result | Evidence |
| :--- | :--- | :--- |
| **DNS Resolution** | ✅ **RESOLVES** | `nslookup zbjtfyaglkugzhiymros.supabase.co` returns `172.64.149.246`, `104.18.38.10` |
| **HTTP Reachability** | ✅ **REACHABLE** | `Invoke-WebRequest` to REST API returns HTTP `401 Unauthorized` (expected with placeholder key) |
| **Live Database Verification** | ⚠️ **BLOCKED** | No `.env` file with valid credentials present in workspace |

### Verification Command for After Credentials Are Available

```powershell
# From backend/ directory with valid .env:
node src/utils/verify-recruiter-tables.js
```

This script checks for the existence of `job_postings`, `job_applications`, `candidate_matches`.

### Supabase Configuration Summary

| Configuration | File | Variable | Status |
| :--- | :--- | :--- | :--- |
| Supabase URL | `backend/src/config/supabase.js` | `SUPABASE_URL` | Required (throws on missing) ✅ |
| Anon Key | `backend/src/config/supabase.js` | `SUPABASE_ANON_KEY` | Required (throws on missing) ✅ |
| Service Key | `backend/src/config/supabase.js` | `SUPABASE_SERVICE_KEY` | Required (throws on missing) ✅ |
| Docker Compose | `docker-compose.yml` L16-18 | `${SUPABASE_URL}`, `${SUPABASE_ANON_KEY}`, `${SUPABASE_SERVICE_KEY}` | Interpolated from host env ✅ |
| K8s Secrets | `k8s/secrets.yaml` L17-23 | Base64-encoded values | Template present ✅ |

### SQL Schema and RLS Files Inspected (Read-Only)

| File | Content | Status |
| :--- | :--- | :--- |
| `base_schema.sql` | Tables: `job_postings`, `job_applications`, `candidate_matches`, `job_seeker_profiles`, `resumes`, `users` | ✅ Present |
| `rls_policies.sql` | RLS policies for recruiter/job_seeker access control | ✅ Present |
| `migrations/20260804_create_company_profiles.sql` | `company_profiles` table migration | ✅ Present |

---

## 7. Test Results

### Backend Jest Unit Tests

```
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/controllers/__tests__/auth.controller.test.js

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Time:        3.718 s
```

**Verdict: PASS**

### Frontend Production Build

```
vite v6.3.5 building for production...
✓ 1634 modules transformed.
build/index.html                   0.54 kB │ gzip:  0.34 kB
build/assets/index-D6Lc8KDq.css  122.69 kB │ gzip: 18.87 kB
build/assets/index-C2OBWaDR.js   391.79 kB │ gzip: 92.54 kB
✓ built in 10.13s
```

**Verdict: PASS** — Zero TypeScript errors, zero bundling errors.

### CV Matching Service Pytest

```
17 passed, 1 warning in 33.14s
```

All 17 tests passed. 1 warning (fuzzywuzzy pure-Python SequenceMatcher fallback) is non-blocking.

**Verdict: PASS**

### Docker Compose Validation

```
docker-compose config → Successfully parsed
```

All 7 microservice env vars now match backend code. Warnings for unset host env vars (`SUPABASE_URL`, etc.) are expected without a `.env` file.

**Verdict: PASS**

### Kubernetes Validation

`kubectl apply --dry-run=client` requires a running Kubernetes API server. No cluster is currently active. YAML syntax and ConfigMap key names were verified by manual inspection.

**Verdict: BLOCKED (no running cluster)**

---

## 8. Remaining Blockers

| Blocker | Type | Impact | Resolution |
| :--- | :--- | :--- | :--- |
| No `.env` with valid Supabase credentials | External / Manual | Cannot run live database verification | Create `backend/.env` with real keys from Supabase dashboard |
| No running Kubernetes cluster | External / Infrastructure | Cannot validate K8s manifests with `kubectl --dry-run` | Start minikube or connect to a cluster |
| `version: '3.8'` in `docker-compose.yml` | Non-blocking cosmetic warning | Docker Compose logs a deprecation warning | Remove `version: '3.8'` line (optional) |

---

## 9. Rollback Instructions

Both changes are trivially reversible with a single git command:

```powershell
cd d:\Grad\Repo\AI-Skill-Mentor-Job-Seekers
git checkout -- docker-compose.yml backend/.env.example
```

This restores both files to their state at commit `77418d26`.

### Manual Rollback

**`docker-compose.yml`** lines 23, 27, 28:
```diff
-      - SKILL_NORM_URL=http://skill-normalization:8002
+      - SKILL_NORMALIZATION_URL=http://skill-normalization:8002
-      - COURSE_REC_URL=http://course-recommendation:8006
+      - COURSE_RECOMMENDATION_URL=http://course-recommendation:8006
-      - JOB_REC_URL=http://job-recommendation:8007
+      - JOB_RECOMMENDATION_URL=http://job-recommendation:8007
```

**`backend/.env.example`** — Remove two added lines:
```diff
-CV_MATCHING_URL=http://localhost:8003
-JOB_REC_URL=http://localhost:8007
```

---

## 10. Final Verdict

## `PHASE 0 PASS WITH EXTERNAL BLOCKER`

### Justification

- ✅ All environment variable names standardized across backend, Docker Compose, K8s ConfigMap, and `.env.example`.
- ✅ All containerized service addresses use DNS names, not `localhost`.
- ✅ Backend tests pass (12/12).
- ✅ Frontend builds cleanly (0 errors).
- ✅ CV Matching Service tests pass (17/17).
- ✅ Docker Compose config validates successfully.
- ✅ Supabase host is DNS-resolvable and HTTP-reachable.
- ✅ Changes are minimal (2 files, 5 insertions, 3 deletions) and trivially reversible.
- ⚠️ **External blocker:** Live Supabase database verification requires valid credentials in `backend/.env`.
- ⚠️ **External blocker:** Kubernetes manifest dry-run validation requires a running cluster.

**No application code was changed. No tests were modified. No API contracts were changed. No schemas were altered. Nothing was committed or pushed.**
