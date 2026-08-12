# Phase 2.5 — Recruiter AI Matching Correctness & Integration Hardening Report

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## 1. Previous 500-Candidate Limitation

In Phase 2, candidate discovery contained a hard cap: `maxCandidatesCap = 500`. 

### Conflict with Product Requirement
If the platform has 2,000 discoverable Job Seekers, capping discovery at the first 500 candidates means the true best candidate (e.g., at index 600) would never be evaluated. Presenting a truncated 500-candidate result as "platform-wide candidate discovery" produced mathematically incomplete candidate ranking.

---

## 2. Final Candidate Pool Exhaustion Behavior

In Phase 2.5, the silent 500-candidate cap has been **completely removed**.

The candidate pool retrieval loop in `recruiterMatching.service.js` now iterates through Candidate Pool pages until:
```javascript
hasMorePages === false
```
or until no further records are returned by `candidatePool.repository.js`.

### Execution Flow
$$\text{All Eligible Candidates} \xrightarrow{\text{Page size 50}} \text{Candidate Pool Page} \xrightarrow{\text{Batch size 50}} \text{AI Microservice Call} \xrightarrow{\text{Repeat until pool exhausted}}$$

---

## 3. Batch Strategy

For $N$ eligible discoverable candidates:
$$\text{AI Microservice HTTP Calls} = \left\lceil \frac{N}{\text{AI\_BATCH\_SIZE}} \right\rceil$$

Where $\text{AI\_BATCH\_SIZE} = 50$.

### Example Calculations
- $N = 200$ candidates $\rightarrow$ 4 AI calls.
- $N = 650$ candidates $\rightarrow$ 13 AI calls.
- $N = 2,000$ candidates $\rightarrow$ 40 AI calls.

Each batch request carries a 30-second (`30000 ms`) HTTP timeout.

---

## 4. Memory & Scalability Limitations

### Memory Safety
To prevent Node.js heap exhaustion on large candidate pools, `recruiterMatching.service.js` projects only the fields required for identity correlation and AI input (`candidateId`, `userId`, `name`, `skills`, `experience`, `education`). Heavy objects (such as full resume JSON, file blobs, or PII) are excluded.

### Scalability Warning
Synchronous HTTP processing scales linearly with candidate pool size ($O(N)$ HTTP requests). While suitable for small-to-medium pools (up to ~1,000 candidates), extremely large pools (e.g., $N > 5,000$) will exceed standard Gateway HTTP timeout limits (e.g., 60s Nginx / Ingress timeouts). 

*Recommendation:* Future high-scale iterations should migrate background matching to an asynchronous job queue (e.g. Redis + BullMQ or Celery worker) as documented for post-Phase 3 architecture.

---

## 5. Exact AI Score Contract

Inspected from authoritative source code (`AI-Microservices/cv_matching_service/core/scorer.py`, `schemas.py`):

1. **Scoring Formula:**
   $$\text{Final Score} = (0.40 \times \text{Semantic}) + (0.35 \times \text{Skills}) + (0.15 \times \text{Tools}) + (0.10 \times \text{Experience})$$
2. **Microservice Output Field:** `score` in `RankedCandidate` schema.
3. **Numeric Type & Bounds:** Float in range `[0.0, 100.0]`.
4. **Backend Normalization:** Integers in range `[0, 100]` derived via `Math.round(score)`.

---

## 6. Invalid-Score Behavior

Strict score validation has been implemented in `recruiterMatching.service.js`:

- **Rejection Criteria:** `score === null`, `score === undefined`, `isNaN(score)`, `!Number.isFinite(score)`, or `score < 0 || score > 100`.
- **Handling:** Candidates with malformed scores are **rejected** from the result set. The backend logs a warning and **never fabricates a fake fallback score (e.g., 0 or 75)**.
- **Batch Impact:** If all candidates in an AI batch return malformed scores, the batch is treated as failed.

---

## 7. Candidate Identity Correlation

1. **Schema Enhancement:** `RankedCandidate` in `cv_matching_service/schemas.py` and `core/matcher.py` now explicitly passes `candidateId` (`job_seeker_profiles.id`).
2. **Correlation Logic:**
   - For each AI result, the backend checks if `aiResult.candidateId` belongs to the submitted batch (`submittedBatchMap.has(candidateId)`).
   - If missing or unindexed, it falls back to batch array index correlation.
   - Unknown candidate IDs returned by AI are rejected.
   - Evaluated candidates are stored in a `Map<candidateId, CandidateEntry>` to prevent duplicate overwrite or candidate multiplication.

---

## 8. Route-Level Authorization Tests

Created dedicated integration test suite at `backend/src/routes/__tests__/jobs.routes.matchCandidates.test.js` testing the Express route `POST /api/jobs/:jobId/match-candidates`:

| # | Test Scenario | Expected Status | Result |
| :--- | :--- | :--- | :--- |
| 1 | Missing Authorization header | `401 Unauthorized` | ✅ PASS |
| 2 | Invalid authentication token | `401 Unauthorized` | ✅ PASS |
| 3 | Job Seeker role (`role = 'job_seeker'`) | `403 Forbidden` | ✅ PASS |
| 4 | Recruiter matching owned job | `200 OK` | ✅ PASS |
| 5 | Recruiter matching unowned job | `403 Forbidden` | ✅ PASS |
| 6 | Non-existent job ID | `404 Not Found` | ✅ PASS |

---

## 9. >500 Candidate Regression Test

Added Test 22 to `recruiterMatching.service.test.js`:

- **Test Fixture:** Candidate pool containing **650 candidates** across 13 pages of 50.
- **Test Condition:** Candidate 600 (located on page 12, well past the old 500 limit) is given the highest score (`0.99`).
- **Verifications:**
  - `candidatePoolFn` called 13 times (all 13 pages retrieved).
  - `axiosPostFn` called 13 times (all 13 AI batches executed).
  - `candidatesConsidered === 650`.
  - Candidate `profile-0600` appears at **index 0** of the global ranking with `score = 99`.

---

## 10. Partial Failure Behavior

- **Partial Success:** If 2 batches succeed and 1 fails, response sets `completionStatus = "partial"`, includes `batchErrors` array, and returns all successfully evaluated candidates sorted globally.
- **Complete Failure:** If 100% of batches fail (or microservice is unreachable), returns `502 Bad Gateway` with error code `AI_MATCHING_SERVICE_FAILED`. Never returns a `200 OK` with an empty list on service failure.

---

## 11. Files Changed

### Backend Files
- `backend/src/services/recruiterMatching.service.js` — Removed 500 cap, implemented strict score validation and candidateId identity correlation.
- `backend/src/services/__tests__/recruiterMatching.service.test.js` — Added >500 candidate test (650 candidates), malformed score tests.
- `backend/src/routes/__tests__/jobs.routes.matchCandidates.test.js` — Created route-level Express integration tests.

### AI Microservice Files
- `AI-Microservices/cv_matching_service/schemas.py` — Added optional `candidateId` to `RankedCandidate` schema.
- `AI-Microservices/cv_matching_service/core/matcher.py` — Passed `candidateId` in match results dictionary.

---

## 12. Test Results

### Backend Jest Test Suites
```text
PASS src/controllers/__tests__/auth.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js
PASS src/services/__tests__/recruiterMatching.service.test.js
PASS src/routes/__tests__/jobs.routes.matchCandidates.test.js

Test Suites: 6 passed, 6 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        6.205 s
Ran all test suites.
```

### Pytest (`cv_matching_service`)
```text
================ 17 passed, 1 warning in 22.00s ===================
```

---

## 13. Regression Results

- Job Seeker matching flow (`matches.controller.js` `POST /api/matches/run`) remains untouched and fully passing.
- All candidate pool repository tests remain 100% passing.

---

## 14. Phase 3 Readiness

The backend AI matching pipeline is hardened, fully tested, and ready for Phase 3:
- Response contract provides stable `rankedCandidates` (`candidateId`, `userId`, `matchScore`, `matchedSkills`, `missingSkills`).
- Phase 3 can consume these ranked results to write idempotent upserts to `public.candidate_matches`.

---

## Final Verdict

## `PHASE 2.5 PASS WITH SCALABILITY WARNING`

### Justification

- ✅ Silent 500-candidate cap completely removed; candidate pool is fully exhausted.
- ✅ Tested with 650 candidates across 13 pages; top candidate from index 600 ranked at #1 globally.
- ✅ Strict AI score validation implemented; NaN, null, and out-of-range scores rejected without fake fallback scores.
- ✅ Identity correlation enforced using `candidateId`.
- ✅ Route-level integration tests added (6/6 passing with Express/supertest).
- ✅ 65/65 backend Jest tests and 17/17 pytest tests passing.
- ⚠️ **Scalability Warning:** Synchronous HTTP matching for extremely large candidate pools ($N > 5,000$) will encounter Gateway/Ingress HTTP timeouts. Asynchronous worker queue processing is recommended for post-Phase 3 scale.
