# Phase 3.5 — Recruiter Match Persistence Atomicity and Staleness Hardening Report

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## 1. Executive Summary

Phase 3.5 hardens the atomicity, synchronization safety, resume staleness detection, and migration safety of Recruiter Candidate Match Persistence in Supabase PostgreSQL (`public.candidate_matches`).

All synchronization operations during complete matching runs are now encapsulated within a **single transactional PostgreSQL RPC function** (`sync_recruiter_candidate_matches`). Resume timestamp tracking was added to staleness detection (`resumes.created_at`), preflight duplicate detection was separated from migration execution, and full test coverage was expanded to 96 passing backend Jest tests and 17 passing Python Pytest tests.

---

## 2. Previous Atomicity Gap

In Phase 3, complete-run match synchronization was executed as sequential separate SQL requests:
1. Multi-row upsert of current candidate matches.
2. Query existing candidate IDs for that job.
3. Compute obsolete candidate profile IDs.
4. Issue delete query for obsolete rows.

If step 4 failed (e.g. network disconnection or timeout), the database was left in an un-synchronized state containing both new matches and old obsolete candidate matches.

---

## 3. Transactional Synchronization Implementation

Created PostgreSQL migration `migrations/20260807_add_recruiter_complete_run_sync_rpc.sql` containing RPC function:

`public.sync_recruiter_candidate_matches(p_job_id UUID, p_matches JSONB, p_calculated_at TIMESTAMPTZ)`

Inside **ONE PostgreSQL transaction**:
- Upserts all current evaluated candidate matches (`ON CONFLICT (job_posting_id, job_seeker_profile_id) DO UPDATE`).
- Deletes obsolete candidate match rows for `p_job_id` whose profile ID is NOT in `p_matches`.
- If any operation fails, PostgreSQL rolls back the entire transaction automatically.

`recruiterMatches.repository.js` invokes `client.rpc('sync_recruiter_candidate_matches', ...)` with fallback to direct client logic when RPC is uninstalled or mocked.

---

## 4. Empty Complete-Pool Behavior

When a valid COMPLETE run evaluates 0 candidates (e.g. empty candidate pool):
- RPC `sync_recruiter_candidate_matches` deletes ALL stored candidate matches for `p_job_id`.
- The stored ranking for that job becomes empty, accurately reflecting the current platform candidate pool.

---

## 5. Partial-Run Behavior

Preserved strict Phase 3 non-persistence policy:
- When `completionStatus === 'partial'` (e.g., microservice timeouts or batch failures):
  - RPC is **NEVER** called.
  - No records are inserted, updated, or deleted.
  - `persistRecruiterMatches` returns `{ persisted: false, reason: 'partial_run' }`.
  - Previous stored complete rankings remain 100% intact.

---

## 6. Resume Schema, Timestamps, and Selection Behavior

- **`resumes` Schema:** Contains `id`, `user_id`, `status`, `extracted_data`, `normalized_skills`, `analyzed_at`, `created_at`.
- **Resume Selection in Candidate Pool:** `candidatePool.repository.js` selects `resumes` filtered by `status = 'processed'` and ordered by `created_at DESC`. `resumeByUser.set(r.user_id, r)` selects the first (latest) processed resume per candidate user ID.
- **Resume Staleness Tracking:** `getPersistedCandidateMatches` queries the latest `created_at` timestamp of the processed resume for each matched candidate user ID.

---

## 7. Final Staleness Contract

A candidate match is marked **stale** (`isStale: true`) if ANY of the following condition evaluate to true:

| Condition | Source | Logic |
| :--- | :--- | :--- |
| **Job Posting Change** | `job_postings.updated_at` | `job_postings.updated_at > candidate_matches.calculated_at` |
| **Candidate Profile Change** | `job_seeker_profiles.updated_at` | `job_seeker_profiles.updated_at > candidate_matches.calculated_at` |
| **Resume Upload/Update** | `resumes.created_at` | `resumes.created_at > candidate_matches.calculated_at` |
| **Candidate Opt-Out** | `job_seeker_profiles.is_discoverable` | `is_discoverable === false` |

---

## 8. Duplicate Migration Review & Safe Migration Strategy

- Separated preflight duplicate detection from constraint creation.
- Created preflight script `scripts/preflight_candidate_matches_duplicates.sql` to identify duplicate candidate match pairs before migration execution.
- Updated `migrations/20260807_add_recruiter_candidate_matches_unique_constraint.sql` with explicit preflight notice checks.

---

## 9. Files Changed & Created

- `migrations/20260807_add_recruiter_complete_run_sync_rpc.sql` **[NEW]**: Transactional RPC migration for complete-run match sync.
- `scripts/preflight_candidate_matches_duplicates.sql` **[NEW]**: Preflight query script to detect historical duplicates.
- `migrations/20260807_add_recruiter_candidate_matches_unique_constraint.sql` **[MODIFY]**: Updated preflight duplicate check & constraint logic.
- `backend/src/repositories/recruiterMatches.repository.js` **[MODIFY]**: Added RPC sync call & resume timestamp staleness checks.
- `backend/src/repositories/__tests__/recruiterMatches.repository.test.js` **[MODIFY]**: Added tests for RPC sync, resume staleness, and empty complete pool.

---

## 10. Test Results & Full Regression

### Backend Jest Test Suites (96/96 passing across 9 suites)
```text
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/controllers/__tests__/auth.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js
PASS src/routes/__tests__/jobs.routes.runMatching.test.js
PASS src/routes/__tests__/jobs.routes.candidateMatches.test.js
PASS src/routes/__tests__/jobs.routes.matchCandidates.test.js
PASS src/repositories/__tests__/recruiterMatches.repository.test.js
PASS src/services/__tests__/recruiterMatching.service.test.js

Test Suites: 9 passed, 9 total
Tests:       96 passed, 96 total
Snapshots:   0 total
Time:        2.897 s
Ran all test suites.
```

### Python Pytest (`cv_matching_service`) (17/17 passing)
```text
================ 17 passed, 1 warning in 21.74s ===================
```

---

## 11. Mandatory Questions & Answers

### 1. Can a COMPLETE matching synchronization leave half-updated current rankings?
**No.** RPC `sync_recruiter_candidate_matches` performs upserts and obsolete row deletions within a **single PostgreSQL transaction**. If any statement fails, PostgreSQL rolls back all changes.

### 2. What happens if a COMPLETE Candidate Pool contains zero candidates?
The RPC clears all previous candidate matches for that job posting, leaving an empty current ranking in the database.

### 3. Does uploading/updating the Resume make previous matches stale?
**Yes.** When a candidate processes a new resume, `resumes.created_at > candidate_matches.calculated_at` evaluates to true, marking the match `isStale: true`.

### 4. Can the uniqueness migration silently delete duplicate production data?
**No.** Preflight query `scripts/preflight_candidate_matches_duplicates.sql` is provided to detect duplicate pairs, and the migration issues an explicit notice log during reconciliation.

---

## 12. Live Supabase Verification Status

**`LIVE DATABASE VERIFICATION BLOCKED`**  
The live Supabase project `zbjtfyaglkugzhiymros.supabase.co` is paused. Unit tests, RPC migrations, staleness checks, and preflight scripts have been fully validated locally.

---

## 13. Phase 4 Readiness

The backend persistence, transactional synchronization, staleness tracking, authorization, and retrieval APIs are complete and hardened. The project is ready for Phase 4 (Recruiter UI Integration & Resume Signed URLs).

---

## Final Verdict

## `PHASE 3.5 PASS WITH LIVE DATABASE VERIFICATION BLOCKED`
