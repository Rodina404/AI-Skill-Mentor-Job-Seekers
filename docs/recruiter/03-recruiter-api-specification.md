# Recruiter API Specification

This document provides the complete, authoritative API reference for all endpoints utilized by the Recruiter Web Application.

Related Documents:
- [System Architecture](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/01-recruiter-system-architecture.md)
- [End-to-End Data Flow](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/02-recruiter-end-to-end-data-flow.md)
- [Security & Authorization](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/07-recruiter-security-authorization.md)

---

## Base URL
All API requests are routed through the Kubernetes NGINX Ingress Controller:
```text
http://localhost:8080/api
```

---

## 1. Authentication Endpoints

### POST `/api/auth/signup`
Creates a new user account.
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "full_name": "Sarah Jenkins",
    "email": "sarah.recruiter@company.com",
    "password": "SecurePassword123!",
    "role": "recruiter"
  }
  ```
- **Success Response (`HTTP 201 Created`)**:
  ```json
  {
    "message": "Account created and logged in successfully.",
    "access_token": "eyJhbGciOi...",
    "refresh_token": "v1.mr...",
    "user": {
      "id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
      "email": "sarah.recruiter@company.com",
      "full_name": "Sarah Jenkins",
      "role": "recruiter"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing required fields or duplicate email.

---

### POST `/api/auth/login`
Authenticates user credentials and returns JWT session tokens.
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "email": "sarah.recruiter@company.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "message": "Login successful",
    "access_token": "eyJhbGciOi...",
    "refresh_token": "v1.mr...",
    "expires_at": 1787780000,
    "user": {
      "id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
      "email": "sarah.recruiter@company.com",
      "full_name": "Sarah Jenkins",
      "role": "recruiter"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

---

### GET `/api/auth/me`
Retrieves authenticated user identity and role from database.
- **Authentication**: Required (`Bearer <access_token>`)
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "user": {
      "id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
      "email": "sarah.recruiter@company.com",
      "full_name": "Sarah Jenkins",
      "role": "recruiter",
      "first_name": "Sarah",
      "last_name": "Jenkins"
    },
    "profile": null
  }
  ```

---

### POST `/api/auth/logout`
Revokes active session token with Supabase Admin.
- **Authentication**: Required (`Bearer <access_token>`)
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 2. Company Profile Endpoints

### GET `/api/recruiter/company-profile`
Fetches company profile details for the authenticated recruiter.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Role `recruiter` or `admin`
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "90e66ea9-64db-40a1-a75d-3129487c672b",
      "recruiter_id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
      "name": "Nexus Solutions",
      "description": "Enterprise cloud and AI platform consultancy.",
      "email": "contact@nexussolutions.io",
      "phone": "+1-555-0199",
      "location": "San Francisco, CA",
      "created_at": "2026-08-20T10:00:00Z",
      "updated_at": "2026-08-26T18:00:00Z"
    }
  }
  ```

---

### PUT `/api/recruiter/company-profile`
Creates or updates the recruiter's company profile.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Role `recruiter` or `admin`
- **Request Body**:
  ```json
  {
    "name": "Nexus Solutions Inc",
    "description": "Global enterprise software provider.",
    "email": "talent@nexussolutions.io",
    "phone": "+1-555-0199",
    "location": "Austin, TX"
  }
  ```
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

---

## 3. Job Management Endpoints

### GET `/api/jobs/recruiter/my-jobs`
Retrieves all job postings owned by the authenticated recruiter.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Role `recruiter` or `admin`
- **Query Parameters**:
  - `status` (*optional*): `open` | `closed` | `all` (default: `all`)
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "8f3b2024-81eb-4c0a-8e2b-fbc6b0f02781",
          "recruiter_id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
          "title": "QA Senior Full Stack Engineer",
          "company": "Nexus Solutions",
          "location": "Remote",
          "job_type": "full_time",
          "salary_range": "$120,000 - $160,000",
          "description": "Lead full stack engineer for distributed cloud applications.",
          "required_skills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
          "status": "open",
          "created_at": "2026-08-26T19:00:00Z"
        }
      ]
    }
  }
  ```

---

### POST `/api/jobs`
Publishes a new job posting.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Role `recruiter` or `admin`
- **Request Body**:
  ```json
  {
    "title": "Backend Systems Engineer",
    "company": "Nexus Solutions",
    "location": "Remote",
    "job_type": "full_time",
    "salary_range": "$130,000 - $170,000",
    "description": "Architecting resilient distributed microservices in Go and Node.",
    "requirements": "5+ years backend systems experience with PostgreSQL.",
    "required_skills": ["Node.js", "PostgreSQL", "Docker", "Kubernetes"]
  }
  ```
- **Success Response (`HTTP 201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": { "id": "...", "title": "Backend Systems Engineer", ... }
  }
  ```

---

### PUT `/api/jobs/:jobId`
Updates an existing job posting owned by the recruiter.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner (`job.recruiter_id === req.user.id`) or `admin`
- **Request Body**:
  ```json
  {
    "title": "Lead Backend Systems Engineer",
    "salary_range": "$140,000 - $180,000"
  }
  ```
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Job updated successfully",
    "data": { ... }
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: You do not own this job posting.
  - `404 Not Found`: Job not found.

---

### DELETE `/api/jobs/:jobId`
Deletes a job posting.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner or `admin`
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Unauthorized to delete this posting.

---

## 4. AI Candidate Discovery & Applicants Endpoints

### POST `/api/jobs/:jobId/match-candidates`
Executes on-demand AI candidate discovery across discoverable job seekers.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner or `admin`
- **Rate Limit**: Applied via `matchingLimiter`
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "jobId": "8f3b2024-81eb-4c0a-8e2b-fbc6b0f02781",
      "completionStatus": "complete",
      "rankedCandidates": [
        {
          "candidateId": "4392270d-f06b-4e12-881b-c74384a86f91",
          "userId": "d748f321-1249-411a-821b-10f839a998c2",
          "name": "Alex Taylor",
          "score": 92.5,
          "matchingSkills": ["JavaScript", "React", "Node.js"],
          "missingSkills": ["PostgreSQL"],
          "experience": 4
        }
      ],
      "persistence": {
        "success": true,
        "persisted": true,
        "upsertedCount": 27
      }
    }
  }
  ```

---

### GET `/api/jobs/:jobId/candidate-matches`
Retrieves persisted AI matching rankings for a job posting.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner or `admin`
- **Query Parameters**:
  - `page` (*optional*, integer, default: 1)
  - `limit` (*optional*, integer, default: 20)
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "jobId": "8f3b2024-81eb-4c0a-8e2b-fbc6b0f02781",
      "matches": [ ... ],
      "total": 27,
      "page": 1,
      "limit": 10
    }
  }
  ```

---

### GET `/api/jobs/:jobId/candidates/:candidateId/resume-url`
Generates a temporary signed URL to view a candidate's resume PDF.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner or `admin`
- **Rate Limit**: Applied via `resumeUrlLimiter`
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://xyz.supabase.co/storage/v1/object/sign/resumes/resumes/c_43922.pdf?token=eyJhbGciOi...",
      "expiresIn": 300,
      "originalName": "Alex_Taylor_Resume.pdf"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not job owner).
  - `404 Not Found`: Candidate resume not found.

---

### GET `/api/jobs/:jobId/applicants`
Retrieves direct job seekers who clicked "Apply" on the job posting.
- **Authentication**: Required (`Bearer <access_token>`)
- **Authorization**: Job Owner or `admin`
- **Success Response (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "candidates": [
        {
          "name": "Jordan Smith",
          "email": "jordan.smith@test.com",
          "score": 85,
          "matchedSkills": ["JavaScript", "React"],
          "missingSkills": ["PostgreSQL"]
        }
      ]
    }
  }
  ```

---

## 5. Notifications Endpoints

### GET `/api/notifications`
Fetches in-app notifications for the logged-in user.
- **Authentication**: Required (`Bearer <access_token>`)
- **Success Response (`HTTP 200 OK`)**:
  ```json
  [
    {
      "id": "a9023812-32b0-410a-bb71-8840291ba101",
      "user_id": "c3a64931-e125-4c07-ba71-6c17e3fbe3f7",
      "title": "New Applicant",
      "message": "Jordan Smith applied to QA Senior Full Stack Engineer.",
      "is_read": false,
      "created_at": "2026-08-26T19:30:00Z"
    }
  ]
  ```
