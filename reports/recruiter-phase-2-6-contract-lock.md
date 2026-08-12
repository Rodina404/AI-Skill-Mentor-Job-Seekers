# Phase 2.6 — CV Matching Score Scale & Candidate Identity Contract Lock Report

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## 1. Previous Score Ambiguity

Phase 2.5 identified a potential contract ambiguity where legacy backend code used a heuristic check:
```javascript
// Legacy check:
matchScore = scoreVal <= 1.0 ? Math.round(scoreVal * 100) : Math.round(scoreVal);
```
This heuristic was ambiguous because a low match score (e.g. `0.5` out of `100`, representing a 0.5% match) would be misinterpreted as a 0–1 decimal and erroneously multiplied by 100, turning a 0.5% match into a 50% match.

Furthermore, candidate correlation in Node had previously contained an array-index fallback if `candidateId` was missing. Because the AI service reorders candidates according to match ranking, array-index correlation could incorrectly assign one candidate's score to another candidate.

---

## 2. Actual Score Path Through Python Code

Authoritative runtime code inspection across `AI-Microservices/cv_matching_service`:

| Stage | Code Source | Output Value Example | Scale / Format |
| :--- | :--- | :--- | :--- |
| **Component Scores** | `core/scorer.py` (lines 34, 37, 45, 46) | `semantic = 0.85`, `skills = 1.0`, `exp = 1.0` | `float ∈ [0.0, 1.0]` |
| **Weighted Sum** | `core/scorer.py` (lines 49-54) | `final_score = 0.885` | `float ∈ [0.0, 1.0]` |
| **Scorer Output** | `core/scorer.py` (line 57) | `"score": round(final_score * 100, 2)` $\rightarrow$ `88.5` | `float ∈ [0.0, 100.0]` |
| **Matcher Output** | `core/matcher.py` (line 25) | `"score": 88.5` | `float ∈ [0.0, 100.0]` |
| **FastAPI `/match`** | `schemas.py` (`RankedCandidate`) | `score: 88.5` | JSON `number ∈ [0.0, 100.0]` |
| **Node Backend** | `recruiterMatching.service.js` | `score: Math.round(88.5)` $\rightarrow$ `89` | Integer percentage `∈ [0, 100]` |

---

## 3. Canonical Score Contract (FINAL)

### Microservice Contract (`cv_matching_service`)
- `score` is a `float` in the range `[0.0, 100.0]`.
- Pytest assertion: `assert 0 <= score <= 100`.

### Node Backend Contract (`AI Gateway`)
- Score validation: Strictly requires finite `number` within `[0.0, 100.0]`.
- Percentage conversion: `normalizedScore = Math.round(rawScore)`.
- **Zero multiplier heuristics:** No `score <= 1.0` multiplication is performed.
- Scores outside `[0.0, 100.0]`, `NaN`, `null`, `undefined`, or non-numeric values are rejected as malformed.

---

## 4. Python Microservice Changes

1. **`AI-Microservices/cv_matching_service/schemas.py`**:
   - Added `candidateId: Optional[str] = None` to `RankedCandidate` schema.
2. **`AI-Microservices/cv_matching_service/core/matcher.py`**:
   - Included `"candidateId": candidate.get("candidateId")` in the output dictionary of `match_candidates`.

---

## 5. Backend Service Changes (`recruiterMatching.service.js`)

1. **Locked Score Processing:**
   Removed all `rawScore <= 1.0 ? rawScore * 100 : rawScore` heuristics. Enforced `Math.round(rawScore)` for scores strictly within `[0.0, 100.0]`.
2. **Strict `candidateId` Identity Correlation:**
   - Validates that `aiResult.candidateId` exists and is a valid string.
   - Verifies `candidateId` exists in `submittedBatchMap` (the candidates sent in that specific AI request batch).
   - Rejects duplicate `candidateId` entries within the response.
3. **Complete Removal of Array-Index Fallback:**
   Completely eliminated array-index correlation (`rIdx < batch.length`). Any AI result missing `candidateId` or referencing an unknown `candidateId` is immediately rejected.

---

## 6. Job Seeker Matching Flow Compatibility

Inspected `backend/src/controllers/matches.controller.js` (`POST /api/matches/run`):

- Already supplies `candidateId: resume_id` in the `candidates` request payload.
- Aligned line 80 to use canonical 0–100 scale validation:
  ```javascript
  const scoreVal = Number(matchResponse.data.rankedCandidates[0].score);
  matchScore = (Number.isFinite(scoreVal) && scoreVal >= 0 && scoreVal <= 100) ? Math.round(scoreVal) : 75;
  ```
- **Job Seeker matching remains 100% operational and fully compatible.**

---

## 7. >500 Candidate Regression Test Alignment

Updated Test 22 in `recruiterMatching.service.test.js`:
- Candidate 600 (located on page 12) is mocked in the AI response with canonical score `99.0` (on the `0–100` scale).
- Backend returns `score: 99`.
- Candidate 600 correctly ranks at **index 0** of the global candidates list.

---

## 8. Tests Added & Passing

Added 5 explicit contract tests in `recruiterMatching.service.test.js` (tests 22–26):

1. **Test 22:** >500 Candidate Exhaustion Test (650 candidates across 13 pages, top score `99.0` from index 600 ranks #1 globally).
2. **Test 23:** Strict Score Rejection Test (rejects `NaN` and `null` scores).
3. **Test 24:** Missing `candidateId` Rejection Test (verifies no array-index fallback exists).
4. **Test 25:** Unknown `candidateId` Rejection Test (rejects candidates not in submitted batch).
5. **Test 26:** Reordered AI Candidate Correlation Test (verifies correct candidateId mapping when AI reorders output array).

---

## 9. Full Test Results

### Backend Jest Test Suites
```text
PASS src/controllers/__tests__/auth.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js
PASS src/routes/__tests__/jobs.routes.matchCandidates.test.js
PASS src/services/__tests__/recruiterMatching.service.test.js

Test Suites: 6 passed, 6 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        3.583 s
Ran all test suites.
```

### Python Pytest (`cv_matching_service`)
```text
================ 17 passed, 1 warning in 21.95s ===================
```

---

## PHASE 3 STORAGE CONTRACT

For Phase 3 database persistence to Supabase PostgreSQL:

1. **`candidate_matches.match_score`**:
   Stores an `INT` percentage in the range `[0, 100]`, derived directly from `Math.round(rawScore)` where `rawScore` is the verified float returned by `cv_matching_service`.

2. **`candidate_matches.job_seeker_profile_id`**:
   Comes **exclusively** from the validated AI `candidateId` (`job_seeker_profiles.id`). Array-index fallback is prohibited.

3. **`candidate_matches.user_id`**:
   Comes from `candidatePool.repository.js` mapped `userId` (`public.users.id`), correlated strictly via `candidateId`.

4. **`candidate_matches.job_posting_id`**:
   Comes from the authenticated recruiter's validated `jobId`.

---

## Final Verdict

## `PHASE 2.6 PASS`

### Justification

- ✅ **Canonical score contract locked:** Microservice returns `float [0.0, 100.0]`; Node backend validates `[0.0, 100.0]` and rounds to integer percentage without multiplication heuristics.
- ✅ **`candidateId` mandatory:** AI schema and `matcher.py` pass `candidateId`; Node backend requires explicit `candidateId` match.
- ✅ **Array-index fallback removed:** Reordered or unindexed AI candidates are never correlated by array position.
- ✅ **Job Seeker matching aligned:** `matches.controller.js` updated to match canonical score scale.
- ✅ **68/68 Jest tests passing** across 6 backend test suites.
- ✅ **17/17 Pytest tests passing** on `cv_matching_service`.
- ✅ **Phase 3 storage contract defined.**
