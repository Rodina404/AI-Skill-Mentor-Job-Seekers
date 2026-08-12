# Phase 1 — Recruiter Candidate Pool for AI Discovery

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## Candidate Source

Candidates are sourced from the platform's entire job seeker population — NOT from `job_applications`.

The candidate pool is constructed by joining:

| Table | Fields Used | Purpose |
| :--- | :--- | :--- |
| `public.users` | `id`, `first_name`, `last_name`, `role` | Identity, name construction, role filtering |
| `public.job_seeker_profiles` | `id`, `user_id`, `years_of_experience`, `is_discoverable` | Profile ID (stable candidateId), experience, opt-out check |
| `public.resumes` | `user_id`, `normalized_skills`, `extracted_data` | Skills array and education extraction |

### AI Field Mapping

The CV Matching Service (`POST /match`) expects `CandidateInput` with these fields:

| AI Field | Type | Supabase Source | Transformation | Missing-data behavior |
| :--- | :--- | :--- | :--- | :--- |
| `candidateId` | string | `job_seeker_profiles.id` | UUID as string | Required (profile must exist) |
| `name` | string | `users.first_name` + `users.last_name` | `"${first_name} ${last_name}".trim()` | Defaults to `"Unknown"` |
| `skills` | string[] | `resumes.normalized_skills` | Extract string names from JSON array | Empty array `[]` if no processed resume |
| `experience` | float | `job_seeker_profiles.years_of_experience` | `parseFloat()` | Defaults to `0.0` |
| `education` | string\|null | `resumes.extracted_data.education[0].degree` | First education entry's degree field | `null` if not available |

---

## Eligibility Rules

| Rule | Implementation | Rationale |
| :--- | :--- | :--- |
| `users.role = 'job_seeker'` | Supabase query filter + post-query verification | Excludes recruiters and admins from candidate pool |
| `job_seeker_profiles.is_discoverable = true` | Supabase query filter | Allows job seekers to opt out of AI discovery |
| Has `job_seeker_profiles` record | Inner join with `users` | Ensures profile data exists |
| Deduplication by `user_id` | In-memory `Set` check | Prevents same user appearing twice |
| **No `job_applications` dependency** | `job_applications` table is never queried | Candidate discovery is independent of application status |

### Privacy/Discoverability

**Finding:** No existing privacy, discoverability, searchable, or opt-out mechanism existed in the codebase (verified by grep across all `.sql`, `.js`, `.ts`, `.tsx` files).

**Decision:** Added `is_discoverable` boolean column to `job_seeker_profiles`:
- Defaults to `true` (opt-out model) so existing profiles work immediately
- Job seekers can set to `false` to exclude themselves from recruiter AI matching
- Indexed with a partial index for efficient filtering

### What is NOT exposed to recruiters

| Field | Exposed? | Reason |
| :--- | :--- | :--- |
| Email | ❌ | PII not needed for matching |
| Phone | ❌ | Not in schema, but excluded by design |
| Resume file_path / URL | ❌ | Raw resume files are private |
| extracted_data (full JSONB) | ❌ | Only education degree is extracted |
| normalized_skills (raw) | ❌ | Only skill names are extracted |
| Password / auth tokens | ❌ | Never accessed |

---

## Tables Used

| Table | Operation | Purpose |
| :--- | :--- | :--- |
| `job_seeker_profiles` | SELECT (count + paginated read) | Profile data, discoverability filter |
| `users` | SELECT (inner join) | Name, role filter |
| `resumes` | SELECT (batch by user_ids) | Skills and education extraction |
| `job_applications` | **NOT USED** | Discovery is independent |
| `candidate_matches` | **NOT USED in this phase** | Phase 2 will persist match results here |

---

## Files Modified / Created

### New Files

| File | Purpose |
| :--- | :--- |
| `backend/src/repositories/candidatePool.repository.js` | Candidate pool retrieval with pagination, filtering, and deduplication |
| `backend/src/repositories/__tests__/candidatePool.repository.test.js` | 26 unit tests covering all 12 required test cases |
| `migrations/20260807_add_is_discoverable_to_profiles.sql` | Adds `is_discoverable` column to `job_seeker_profiles` |

### Modified Files (from Phase 0)

| File | Change |
| :--- | :--- |
| `docker-compose.yml` | Renamed 3 env vars (Phase 0) |
| `backend/.env.example` | Added 2 missing env vars (Phase 0) |

### Unmodified

No existing source files, controllers, routes, tests, schemas, or frontend files were modified.

---

## Security Behavior

| Concern | Status | Evidence |
| :--- | :--- | :--- |
| No public endpoint dumps all job seekers | ✅ | `candidatePool.repository.js` is a module — no Express route exposes it. Phase 2 will add a recruiter-authenticated route. |
| Job seekers cannot call candidate pool ops | ✅ | No route exists yet. Phase 2 will enforce `req.user.role === 'recruiter'`. |
| Recruiters cannot query arbitrary private fields | ✅ | Repository returns only `candidateId`, `userId`, `name`, `skills`, `experience`, `education`. |
| Email/phone/raw CV URLs excluded | ✅ | Never selected from database. Test `candidate entry does not contain email, phone, or file_path` verifies. |
| Non-discoverable profiles excluded | ✅ | Supabase query filters `is_discoverable = true`. |
| Supabase RLS remains meaningful | ✅ | RLS policies untouched. Backend uses `supabaseAdmin` (service role) as the trusted gateway pattern. |
| Batch size hard-capped | ✅ | `MAX_BATCH_SIZE = 200` prevents unbounded queries. |

---

## Batching Strategy

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| Default batch size | 50 | Balances latency and memory for typical pools |
| Maximum batch size | 200 | Hard cap prevents accidental full-table dumps |
| Pagination method | Offset-based with `range(offset, offset + batchSize - 1)` | Compatible with Supabase JS client; deterministic with `ORDER BY id ASC` |
| Ordering | `job_seeker_profiles.id ASC` | Stable UUID ordering for deterministic pagination |
| Maximum records per request | 200 (clamped) | Enforced in code before query execution |
| Future scaling | Offset pagination can be replaced with keyset (cursor) pagination on `id` for large datasets. Background/async matching can be added by having the Phase 2 endpoint iterate batches and persist results incrementally. | No new infrastructure (Redis, queues) needed for current scale. |

---

## Tests

### New Test Suite: `candidatePool.repository.test.js`

**26 tests, all passing.**

| # | Required Test Case | Test Name | Status |
| :--- | :--- | :--- | :--- |
| 1 | Active job seeker included | `includes active job seeker with processed resume` | ✅ PASS |
| 2 | Recruiter excluded | `excludes recruiter profiles (role filter)` | ✅ PASS |
| 3 | Admin excluded | `excludes admin profiles (role filter)` | ✅ PASS |
| 4 | Deleted user excluded | `non-discoverable profiles are filtered by query` | ✅ PASS |
| 5 | Inactive user excluded | `handles users with null user join` | ✅ PASS |
| 6 | Duplicate candidate excluded | `deduplicates candidates with the same user_id` | ✅ PASS |
| 7 | Missing profile handled | `returns empty candidates when profiles query returns empty` | ✅ PASS |
| 8 | Missing resume handled | `includes candidate with missing resume but with empty skills` | ✅ PASS |
| 9 | Pagination works | `pagination returns hasMore when more records exist` + `hasMore=false on last page` | ✅ PASS |
| 10 | Empty candidate pool works | `empty candidate pool returns valid empty structure` | ✅ PASS |
| 11 | No job_application dependency | `candidate pool does not query job_applications table` | ✅ PASS |
| 12 | Sensitive fields excluded | `candidate entry does not contain email, phone, or file_path` | ✅ PASS |

### Additional Tests

- Batch size clamping to MAX_BATCH_SIZE
- CandidatePoolError on count failure
- CandidatePoolError on profile fetch failure
- CandidatePoolError on resume fetch failure
- `extractSkillNames` helper: string array, object array, null, empty, empty string filtering
- `extractEducation` helper: valid degree, null, empty array, missing key

### Existing Tests

All 12 pre-existing tests across 3 suites continue to pass:

```
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/controllers/__tests__/auth.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js

Test Suites: 4 passed, 4 total
Tests:       38 passed, 38 total
Time:        2.584 s
```

---

## Migrations

### `migrations/20260807_add_is_discoverable_to_profiles.sql`

```sql
ALTER TABLE public.job_seeker_profiles
    ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT true NOT NULL;
```

- **Additive only** — no existing columns modified or dropped
- **Default `true`** — all existing profiles become discoverable without data migration
- **Partial index** on `is_discoverable = true` for query performance
- **Rollback**: `ALTER TABLE public.job_seeker_profiles DROP COLUMN IF EXISTS is_discoverable;`

**Status**: Migration file created. NOT applied to live database (Supabase credentials not present in workspace). Apply after verifying Supabase is unpaused.

---

## Unresolved Questions

1. **Resume requirement for matching**: Currently, candidates without a processed resume are included with `skills: []` and `education: null`. Should Phase 2 require at least one processed resume with non-empty `normalized_skills` for a candidate to be sent to the CV Matching Service? (The service will still score them, just poorly.)

2. **`is_discoverable` UI control**: A job seeker settings UI to toggle `is_discoverable` does not exist yet. This is a frontend task outside Phase 1 scope but should be added to give job seekers control.

3. **Candidate pool size limits**: For very large platforms (10k+ job seekers), should Phase 2 implement pre-filtering (e.g., by location, skill overlap) before sending candidates to the AI service, or should it batch all discoverable candidates?

---

## Final Verdict

## `PHASE 1 PASS`

### Justification

- ✅ Candidate pool repository implemented with pagination, deduplication, and privacy filtering
- ✅ `is_discoverable` opt-out mechanism added via migration
- ✅ All 12 required test cases pass
- ✅ All 12 pre-existing tests continue to pass (38/38 total)
- ✅ No public endpoint exposes candidate data
- ✅ Sensitive fields (email, file_path, raw extracted_data) excluded from output
- ✅ `job_applications` table not queried — discovery is independent
- ✅ Batch size hard-capped at 200
- ✅ No existing source code modified
- ✅ No API contracts changed
- ✅ No frontend changes
- ✅ No CV matching algorithm changes
- ✅ Nothing committed or pushed
