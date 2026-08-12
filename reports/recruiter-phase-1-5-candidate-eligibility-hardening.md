# Phase 1.5 — Candidate Pool Eligibility Hardening

**Date:** August 7, 2026  
**Repository:** `AI-Skill-Mentor-Job-Seekers`  
**Branch:** `main`  

---

## 1. Actual Account Status Fields

A comprehensive inspection of `base_schema.sql`, `database_setup.sql`, and all migration files reveals the following actual field structure for user and profile records in Supabase PostgreSQL:

| Account State Aspect | Actual Field | Table | Existing Meaning / Behavior |
| :--- | :--- | :--- | :--- |
| **User Role** | `role` | `public.users` | Enum/Text (`'job_seeker'`, `'recruiter'`, `'admin'`). Default `'job_seeker'`. |
| **Discoverability** | `is_discoverable` | `public.job_seeker_profiles` | Added in Phase 1 (`BOOLEAN DEFAULT true NOT NULL`). Opt-out flag for AI discovery. |
| **Account Active State** | **NONE** | `public.users` / `public.job_seeker_profiles` | No `is_active`, `status`, or `disabled` column exists in the database schema. |
| **Soft Deletion State** | **NONE** | `public.users` / `public.job_seeker_profiles` | No `deleted_at` or `is_deleted` column exists in the database schema. |
| **Hard Deletion Cascade** | `id` / `user_id` FK | `public.users`, `public.job_seeker_profiles` | `id REFERENCES auth.users(id) ON DELETE CASCADE`. Hard deletion of an `auth.users` record cascades automatically. |

### Key Finding
The database schema does **NOT** use soft-deletion or account-status flags (`is_active`, `deleted_at`, `status`) on `users` or `job_seeker_profiles`. Account deletion in Supabase is performed by removing the user from `auth.users`, which triggers a database-level `ON DELETE CASCADE` that automatically removes their records from `public.users` and `public.job_seeker_profiles`.

---

## 2. Eligibility Filters

Candidate Pool eligibility is enforced in `candidatePool.repository.js` using the following exact criteria:

```sql
-- Step 1 (Count):
SELECT id, users!inner(role) FROM public.job_seeker_profiles
WHERE is_discoverable = true AND users.role = 'job_seeker';

-- Step 2 (Paginated Fetch):
SELECT id, user_id, years_of_experience, is_discoverable, users!inner(id, first_name, last_name, role)
FROM public.job_seeker_profiles
WHERE is_discoverable = true AND users.role = 'job_seeker'
ORDER BY id ASC RANGE offset TO (offset + batch_size - 1);
```

### Eligibility Decision Matrix

| Candidate Condition | Included? | Filter Mechanism |
| :--- | :--- | :--- |
| Job Seeker (`role = 'job_seeker'`), `is_discoverable = true` | ✅ **INCLUDED** | Matches query criteria |
| Recruiter (`role = 'recruiter'`) | ❌ **EXCLUDED** | Filtered by `users!inner(role) = 'job_seeker'` |
| Admin (`role = 'admin'`) | ❌ **EXCLUDED** | Filtered by `users!inner(role) = 'job_seeker'` |
| Opted out (`is_discoverable = false`) | ❌ **EXCLUDED** | Filtered by `is_discoverable = true` |
| Deleted user (removed from `auth.users`) | ❌ **EXCLUDED** | Record no longer exists due to `ON DELETE CASCADE` |
| Job seeker without resume | ✅ **INCLUDED** | Valid profile returned with `skills: []`, `education: null` |
| Applied vs unapplied candidates | ✅ **INCLUDED** | `job_applications` table is never queried |

---

## 3. Code Changes

### `backend/src/repositories/candidatePool.repository.js`

1. **Aligned Count Query with Fetch Query**:
   Updated `getCandidatePool` Step 1 (count query) to include `users!inner(role)` and `.eq('users.role', 'job_seeker')`. Previously, Step 1 counted profiles based only on `is_discoverable = true`. Now both count and fetch queries strictly filter by `users.role = 'job_seeker'`.

2. **Resume Behavior Maintained**:
   Candidates without processed resumes are safely included with default empty values (`skills: []`, `education: null`), preventing null dereference crashes when passed to downstream consumers.

---

## 4. Tests Added & Refined

### `backend/src/repositories/__tests__/candidatePool.repository.test.js`

1. **Role Filtering (`recruiter` & `admin`)**:
   - `excludes recruiter profiles (role filter)` — verifies candidates with `role = 'recruiter'` are filtered out.
   - `excludes admin profiles (role filter)` — verifies candidates with `role = 'admin'` are filtered out.

2. **Discoverability Filtering (`is_discoverable`)**:
   - `excludes non-discoverable profiles where is_discoverable = false` — verifies `is_discoverable = false` profiles are excluded.

3. **Schema Deletion / Inactive Behavior**:
   - `handles missing or deleted user profile gracefully (no candidate returned)` — documents and verifies that when a user record is absent or cascade-deleted, zero candidates are returned.

4. **Active Job Seeker Inclusion**:
   - `includes active job seeker with processed resume` — verifies complete candidate structure (`candidateId`, `name`, `skills`, `experience`, `education`).

5. **No Resume Safety**:
   - `includes candidate with missing resume but with empty skills` — verifies candidates without resumes return `skills: []`, `education: null` without throwing errors.

6. **Isolation from `job_applications`**:
   - `candidate pool does not query job_applications table` — asserts `job_applications` table is never called during candidate pool extraction.

---

## 5. Privacy Default Review

### Current Setting
`is_discoverable BOOLEAN DEFAULT true NOT NULL`

### Evaluation
- **Why Chosen:** Setting the default to `true` ensures backward compatibility so existing job seekers are discoverable by recruiters without breaking current functionality or requiring manual opt-in data migrations.
- **Privacy Implications:** Job seekers are discoverable by default. However, **no sensitive contact details (email, phone, raw resume file paths, full extracted JSONB)** are ever returned by the candidate pool. The repository projects only generic professional matching criteria (`candidateId`, `name`, `skills`, `experience`, `education`).
- **Required UI Action:** An explicit user setting toggle in `Frontend-React` (Job Seeker profile/settings) should be built in a future UX task to allow job seekers to flip `is_discoverable` to `false`.
- **Verdict on Default:** Retained `DEFAULT true` as safe and non-breaking.

---

## 6. Remaining Limitations

1. **No Soft-Deletion Column:** If an application feature requires soft-deleting users without dropping database rows (e.g., setting `status = 'suspended'`), an `is_active` or `status` column will need to be added to `public.users` in a future migration.
2. **Supabase Auth Ban Status:** Supabase Auth maintains account ban metadata inside `auth.users`. Because `candidatePool.repository.js` queries `public.users` directly for performance, banned users whose `public.users` records remain intact would still be fetched unless hard-deleted or synced via triggers.

---

## 7. Exact Test Results

```text
> backend@1.0.0 test
> jest

PASS src/controllers/__tests__/auth.controller.test.js
PASS src/controllers/__tests__/companyProfile.controller.test.js
PASS src/repositories/__tests__/jobRecommendations.repository.test.js
PASS src/repositories/__tests__/candidatePool.repository.test.js

Test Suites: 4 passed, 4 total
Tests:       38 passed, 38 total
Snapshots:   0 total
Time:        3.307 s
Ran all test suites.
```

---

## Final Verdict

## `PHASE 1.5 PASS WITH SCHEMA LIMITATION`

### Justification

- ✅ **Account status schema verified:** Schema relies on `users.role` and `is_discoverable`. No `is_active` or `deleted_at` columns exist; hard deletion is handled via `ON DELETE CASCADE` from `auth.users`.
- ✅ **Eligibility enforced:** `getCandidatePool` count and fetch queries now both strictly enforce `users.role = 'job_seeker'` and `is_discoverable = true`.
- ✅ **Resume behavior safe:** Candidates without resumes return valid default values (`skills: []`, `education: null`) without crashing.
- ✅ **Tests passing:** All 38 backend Jest tests pass cleanly.
- ⚠️ **Schema limitation documented:** The database schema lacks soft-deletion (`deleted_at`) and account-suspension (`is_active`) flags, relying entirely on Supabase `auth.users` cascade hard-deletion.
