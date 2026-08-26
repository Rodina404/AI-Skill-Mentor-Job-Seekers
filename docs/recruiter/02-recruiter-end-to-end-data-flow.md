# Recruiter End-to-End Data Flow

This document details the step-by-step technical lifecycle for every operation in the Recruiter workflow, tracing execution from user interaction through frontend components, network transport, Express controllers, services, repositories, microservices, and database persistence.

Related Documents:
- [System Architecture](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/01-recruiter-system-architecture.md)
- [API Specification](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/03-recruiter-api-specification.md)
- [Feature Architecture](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/04-recruiter-feature-architecture.md)
- [Security & Authorization](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/07-recruiter-security-authorization.md)

---

## Complete Recruiter Lifecycle Index

1. [Registration & Signup](#1-recruiter-signup)
2. [Authentication & Login](#2-recruiter-login)
3. [Session Restoration & Verification](#3-session-restoration--verification)
4. [Company Profile Management](#4-company-profile-management)
5. [Recruiter Dashboard & My Jobs](#5-recruiter-dashboard--my-jobs)
6. [Job Creation](#6-create-job-posting)
7. [Job Update / Edit](#7-update--edit-job-posting)
8. [Job Deletion](#8-delete-job-posting)
9. [AI Candidate Discovery & Matching](#9-ai-candidate-discovery--matching)
10. [Candidate Match Retrieval](#10-fetch-persisted-candidate-matches)
11. [Candidate Resume Access](#11-candidate-resume-access-signed-url)
12. [Candidate Outreach / Contact](#12-contact-candidate)
13. [Inbound Applicant Review](#13-inbound-applicant-review)
14. [Notification Polling](#14-notifications-polling)
15. [Logout & Session Invalidation](#15-logout--session-invalidation)

---

### 1. Recruiter Signup
```text
Actor: Prospective Recruiter
Frontend Component: SignUp.tsx
API Endpoint: POST /api/auth/signup
Controller: auth.controller.js -> signup()
Database: auth.users -> public.users (via trigger)
Response: HTTP 201 Created
```
- **Flow**:
  1. Recruiter fills `full_name`, `email`, `password`, and selects `role = 'recruiter'`.
  2. Frontend sends payload to `POST /api/auth/signup`.
  3. Controller invokes `supabase.auth.signUp()`, setting `user_metadata = { full_name, role: 'recruiter' }`.
  4. Database trigger `on_auth_user_created` writes the new user into `public.users` with the `recruiter` role.
  5. Returns `HTTP 201 Created` with user metadata and session tokens.

---

### 2. Recruiter Login
```text
Actor: Registered Recruiter
Frontend Component: Login.tsx
API Endpoint: POST /api/auth/login
Controller: auth.controller.js -> login()
Database: auth.users (GoTrue validation)
Response: HTTP 200 OK (access_token, refresh_token, user metadata)
```
- **Flow**:
  1. Recruiter submits email and password.
  2. Controller executes `supabase.auth.signInWithPassword()`.
  3. Upon verification, backend returns JWT access token, refresh token, and user role.
  4. Frontend stores tokens in `localStorage` and redirects to `/recruiter/profile`.

---

### 3. Session Restoration & Verification
```text
Actor: Authenticated Browser Session
Frontend Component: App.tsx / AuthContext.tsx
API Endpoint: GET /api/auth/me
Controller: auth.controller.js -> getMe()
Middleware: auth.middleware.js -> protect()
Response: HTTP 200 OK ({ user, profile })
```
- **Flow**:
  1. On page load/reload, `AuthContext` reads the stored token.
  2. Sends `GET /api/auth/me` with `Authorization: Bearer <token>`.
  3. `protect` middleware verifies JWT authenticity.
  4. Controller fetches user role from `public.users` and returns enriched user state.

---

### 4. Company Profile Management
```text
Actor: Authenticated Recruiter
Frontend Component: RecruiterProfile.tsx (Company Profile Modal)
API Endpoints:
  - GET /api/recruiter/company-profile
  - PUT /api/recruiter/company-profile
Controller: companyProfile.controller.js
Database Table: public.company_profiles
Response: HTTP 200 OK ({ success: true, data: companyProfile })
```
- **Flow**:
  1. Recruiter views dashboard; frontend requests `GET /api/recruiter/company-profile`.
  2. Recruiter modifies company details (name, description, email, phone, location) and clicks "Save".
  3. Frontend sends `PUT /api/recruiter/company-profile`.
  4. Controller upserts the record into `public.company_profiles` on conflict `recruiter_id`.

---

### 5. Recruiter Dashboard & My Jobs
```text
Actor: Authenticated Recruiter
Frontend Component: RecruiterProfile.tsx
API Endpoint: GET /api/jobs/recruiter/my-jobs?status=all
Controller: jobs.controller.js -> getRecruiterJobs()
Database Table: public.job_postings
Response: HTTP 200 OK ({ success: true, data: { jobs: [...] } })
```
- **Flow**:
  1. Controller enforces `req.user.role === 'recruiter' || 'admin'`.
  2. Queries `public.job_postings` filtered by `recruiter_id = req.user.id`.
  3. Multi-tenant isolation guarantees Recruiter 1 cannot see Recruiter 2's jobs.

---

### 6. Create Job Posting
```text
Actor: Authenticated Recruiter
Frontend Component: JobPosting.tsx
API Endpoint: POST /api/jobs
Controller: jobs.controller.js -> createJob()
Database Table: public.job_postings
Response: HTTP 201 Created ({ success: true, data: createdJob })
```
- **Flow**:
  1. Recruiter enters title, company, location, salary, required skills, description, and requirements.
  2. Backend validates that title and description are present.
  3. Inserts record with `recruiter_id = req.user.id` and `status = 'open'`.

---

### 7. Update / Edit Job Posting
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx (Edit Job Modal)
API Endpoint: PUT /api/jobs/:jobId
Controller: jobs.controller.js -> updateJob()
Database Table: public.job_postings
Response: HTTP 200 OK ({ success: true, data: updatedJob })
```
- **Flow**:
  1. Recruiter clicks "Manage" -> "Edit Job".
  2. Edit modal pre-populates existing job values.
  3. Recruiter saves changes; controller checks `job.recruiter_id === req.user.id`.
  4. Returns `HTTP 403 Forbidden` if another user attempts to update the job.
  5. Updates database record and returns `HTTP 200 OK`.

---

### 8. Delete Job Posting
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx (Manage Job Modal)
API Endpoint: DELETE /api/jobs/:jobId
Controller: jobs.controller.js -> deleteJob()
Database Table: public.job_postings
Response: HTTP 200 OK ({ success: true, message: "Job deleted successfully" })
```
- **Flow**:
  1. Recruiter clicks "Delete Job Post".
  2. Controller validates ownership (`job.recruiter_id === req.user.id`).
  3. Deletes record from `public.job_postings`.

---

### 9. AI Candidate Discovery & Matching
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx (AI Matches Modal)
API Endpoint: POST /api/jobs/:jobId/match-candidates
Controller: jobs.controller.js -> matchCandidatesForJob()
Service: recruiterMatching.service.js -> runRecruiterJobMatching()
Repository: candidatePool.repository.js & recruiterMatches.repository.js
Microservice: cv-matching-service (:8003) -> POST /match
Database: CALL sync_recruiter_candidate_matches() RPC
Response: HTTP 200 OK ({ success: true, data: { rankedCandidates: [...] } })
```
- **Flow**:
  1. Recruiter clicks "AI Matches" -> "Run Candidate Matching".
  2. Service retrieves target job posting and verifies recruiter ownership.
  3. `candidatePool.repository.js` queries `public.job_seeker_profiles` where `is_discoverable = true` and candidate has an analyzed resume.
  4. Batches candidates (50/batch) and calls `cv-matching-service:8003/match`.
  5. AI microservice calculates similarity and returns candidate scores.
  6. Service clamps scores to `[0.0, 100.0]`, validates candidate identity, and performs global sorting.
  7. `recruiterMatches.repository.js` executes `sync_recruiter_candidate_matches` RPC to atomically upsert new matches and remove obsolete records.
  8. Returns formatted ranked candidate payload.

---

### 10. Fetch Persisted Candidate Matches
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx (AI Matches Modal)
API Endpoint: GET /api/jobs/:jobId/candidate-matches?page=1&limit=10
Controller: jobs.controller.js -> getCandidateMatchesForJob()
Repository: recruiterMatches.repository.js -> getPersistedCandidateMatches()
Database Table: public.candidate_matches
Response: HTTP 200 OK ({ success: true, data: { matches, total, page, limit } })
```
- **Flow**:
  1. When opening the AI Matches modal, frontend loads previously saved matches.
  2. Repository fetches matches joined with `job_seeker_profiles` and `users`.
  3. Returns paginated candidate match records.

---

### 11. Candidate Resume Access (Signed URL)
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx ("View Resume" Button)
API Endpoint: GET /api/jobs/:jobId/candidates/:candidateId/resume-url
Controller: jobs.controller.js -> getCandidateResumeUrl()
Storage: Supabase Storage S3 (resumes bucket)
Response: HTTP 200 OK ({ success: true, data: { url: "...", expiresIn: 300 } })
```
- **Flow**:
  1. Recruiter clicks "View Resume".
  2. Controller checks that recruiter owns `jobId`.
  3. Resolves candidate's active resume file path from `public.resumes`.
  4. Invokes `supabaseAdmin.storage.from('resumes').createSignedUrl(path, 300)`.
  5. Returns tokenized signed URL valid for 300 seconds.

---

### 12. Contact Candidate
```text
Actor: Authenticated Recruiter
Frontend Component: RecruiterProfile.tsx (Contact Candidate Modal)
API Endpoint: POST /api/jobs/:jobId/candidates/:candidateId/contact
Controller: jobs.controller.js (or candidate outreach handler)
Response: HTTP 200 OK ({ success: true, message: "Outreach logged successfully" })
```
- **Flow**:
  1. Recruiter submits message to candidate.
  2. System validates job ownership and logs contact request.
  3. *Implementation Note*: The platform records the contact request in the database without claiming external SMTP email delivery.

---

### 13. Inbound Applicant Review
```text
Actor: Authenticated Recruiter (Job Owner)
Frontend Component: RecruiterProfile.tsx (Applicants Modal)
API Endpoint: GET /api/jobs/:jobId/applicants
Controller: jobs.controller.js -> getJobApplicants()
Database Table: public.job_applications
Response: HTTP 200 OK ({ success: true, data: { candidates: [...] } })
```
- **Flow**:
  1. Recruiter clicks "Applicants" on an active job listing.
  2. Backend validates ownership (`job.recruiter_id === req.user.id`).
  3. Queries `public.job_applications` where `job_posting_id = jobId`.
  4. Combines application data with candidate metadata.
  5. Returns direct applicant list.

---

### 14. Notifications Polling
```text
Actor: Authenticated Recruiter
Frontend Component: Navigation.tsx
API Endpoint: GET /api/notifications
Controller: notifications.controller.js -> getUserNotifications()
Database Table: public.notifications
Response: HTTP 200 OK ([...])
```
- **Flow**:
  1. `Navigation.tsx` queries notifications every 30 seconds.
  2. If unauthenticated (HTTP 401), polling silently resets without triggering continuous error loops.

---

### 15. Logout & Session Invalidation
```text
Actor: Authenticated Recruiter
Frontend Component: Navigation.tsx / RecruiterProfile.tsx
API Endpoint: POST /api/auth/logout
Controller: auth.controller.js -> logout()
Database / Auth: supabaseAdmin.auth.admin.signOut(token)
Response: HTTP 200 OK ({ message: "Logged out successfully" })
```
- **Flow**:
  1. Recruiter clicks "Logout".
  2. Express backend invalidates the token with Supabase Admin.
  3. Frontend clears `localStorage` and `sessionStorage`.
  4. Application navigates to `/signin` and blocks access to protected routes.
