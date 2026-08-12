# Phase 2.7 — Final CV Matching Contract Consistency Report

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## 1. Previous Job Seeker Fake Score Behavior

Previously, `backend/src/controllers/matches.controller.js` in the Job Seeker flow contained a fallback when `cv_matching_service` failed or returned malformed/empty data:

```javascript
// Old logic:
} catch (err) {
  console.error('[Pipeline] cv_matching_service error:', err.message);
  errors.push({ step: 'cv_matching_service', message: err.message });
  matchScore = 75; // Fallback fake score!
}
```

This caused malformed AI outputs (such as `null`, `NaN`, out-of-range scores, or microservice timeouts) to silently invent a fake `75%` match score and pass it downstream to the Gap Engine, Roadmap generator, Course Recommendation service, and database persistence layers.

---

## 2. Corrected Job Seeker Failure Behavior

In `backend/src/controllers/matches.controller.js`:

1. **Strict Score & Identity Validation**:
   - `topCandidate` must exist and `topCandidate.candidateId === resume_id`.
   - `topCandidate.score` must not be `null` or `undefined`.
   - `scoreVal = Number(topCandidate.score)` must be a finite number within `[0.0, 100.0]`.
2. **Immediate Pipeline Termination**:
   - If any validation check fails or the HTTP call throws, execution halts immediately.
   - Returns an HTTP `502 Bad Gateway` error response:
     ```javascript
     return res.status(502).json({
       error: 'CV Matching Service failure',
       detail: err.message || 'CV matching service returned invalid or malformed output'
     });
     ```
3. **Zero Fabricated Scores**:
   - The fake `75%` score fallback has been **completely eliminated**.

---

## 3. Downstream Pipeline Protection

The Job Seeker pipeline sequence is now strictly guarded:

$$\text{Fetch Details} \rightarrow \text{CV Matching} \xrightarrow{\text{VALIDATED}} \text{Skill Gap Engine} \rightarrow \text{DB Save} \rightarrow \text{Course Rec} \rightarrow \text{Roadmap} \rightarrow \text{Job Rec}$$

If CV Matching fails or returns a malformed score:
- **Skill Gap Engine is NOT called.**
- **`candidate_matches` DB table is NOT written.**
- **`readiness_scores` DB table is NOT written.**
- **`skill_gaps` DB table is NOT written.**
- **Course Recommendation & Roadmap services are NOT invoked.**

---

## 4. Final `candidateId` Pydantic Contract

In `AI-Microservices/cv_matching_service/schemas.py`:

```python
class RankedCandidate(BaseModel):
    candidateId: str  # Mandatory string, non-optional
    name: str
    score: float
    ...
```

`candidateId` is now a mandatory string field in the Pydantic schema contract for all ranked candidate outputs returned by the microservice.

---

## 5. CandidateId Semantics by Caller

| Caller | `candidateId` Currently Represents | Microservice Handling | Phase 3 Persistence Mapping |
| :--- | :--- | :--- | :--- |
| **Recruiter Candidate Discovery** (`recruiterMatching.service.js`) | `job_seeker_profiles.id` (Profile UUID) | Opaque string passed through in `RankedCandidate` output | **Mandatory:** `candidate_matches.job_seeker_profile_id` |
| **Job Seeker Matching** (`matches.controller.js`) | `resumes.id` (Resume UUID) | Opaque string passed through in `RankedCandidate` output | Correlation ID for single request-response pipeline |

`cv_matching_service` treats `candidateId` strictly as an **opaque string identifier** to correlate input batch items with output ranked items. This caller distinction does not compromise data integrity.

---

## 6. Recruiter Persistence Identity Guarantee

For Phase 3 Recruiter Candidate Discovery:
- Every evaluated candidate ID comes exclusively from `candidatePool.repository.js` where `candidateId` is explicitly set to `job_seeker_profiles.id`.
- The backend verifies that every returned AI `candidateId` matches a submitted batch profile ID.
- No resume IDs or index positions can leak into Recruiter candidate persistence.

---

## 7. Files Changed

- `backend/src/controllers/matches.controller.js`: Removed fake score 75 fallback; enforced strict score/identity validation and HTTP 502 pipeline halt.
- `AI-Microservices/cv_matching_service/schemas.py`: Made `candidateId: str` mandatory in `RankedCandidate`.
- `backend/src/routes/__tests__/matches.routes.runMatching.test.js`: Added 11 unit/integration tests for Job Seeker matching contract.

---

## 8. Tests Added & Full Results

### Backend Jest Test Suites (79/79 passing)
```text
PASS src/controllers/__tests__/auth.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js
PASS src/routes/__tests__/jobs.routes.matchCandidates.test.js
PASS src/routes/__tests__/matches.routes.runMatching.test.js
PASS src/services/__tests__/recruiterMatching.service.test.js

Test Suites: 7 passed, 7 total
Tests:       79 passed, 79 total
Snapshots:   0 total
Time:        4.593 s
Ran all test suites.
```

### Python Pytest (`cv_matching_service`) (17/17 passing)
```text
================ 17 passed, 1 warning in 21.19s ===================
```

---

## FINAL SCORE CONTRACT

1. `cv_matching_service.score` is a `float` strictly in the range `[0.0, 100.0]`.
2. The Node backend (both Recruiter and Job Seeker flows) validates `score` as a finite number in `[0.0, 100.0]` and rounds to integer percentage using `Math.round(score)`.
3. **No multiplication heuristics exist.**
4. Any `null`, `undefined`, `NaN`, `Infinity`, out-of-range, or non-numeric score causes an explicit HTTP 502 failure.

---

## RECRUITER IDENTITY CONTRACT

`Recruiter candidate_matches.job_seeker_profile_id` derives **only** from the validated Recruiter Candidate Pool `candidateId` representing `job_seeker_profiles.id`.

Array-index correlation fallbacks are strictly prohibited.

---

## Final Verdict

## `PHASE 2.7 PASS`
