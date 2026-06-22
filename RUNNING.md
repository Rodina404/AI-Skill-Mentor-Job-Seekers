# AI Skill Mentor Platform - Running Guide

This document describes how to configure, start, verify, and run manual demos for the AI Skill Mentor platform.

---

## 1. Prerequisites

Before starting, ensure you have the following installed and configured on your machine:
- **Node.js**: version `18.0.0` or higher (tested on Node v24)
- **Python**: version `3.10.0` or higher
- **Local Ports**: The following ports must be free and not in use:
  - `3000` (React Frontend)
  - `5000` (Express Backend)
  - `8001` to `8007` (Python Microservices)

---

## 2. Required Configuration (.env files)

Verify that the following environment configuration files exist with the corresponding keys:

### Backend Configuration (`backend/.env` or root `.env`)
```ini
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Microservices Configuration

#### 1. M1 Resume Extraction Service (`AI-Microservices/m1_extraction_service/.env`)
```ini
GROQ_API_KEY=gsk_...
```

#### 2. M4 Skill Gap Engine (`AI-Microservices/gap-engin-service/.env`)
```ini
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
GROQ_API_KEY=gsk_...
```

#### 3. M5 Roadmap Service (`AI-Microservices/m5_roadmap_service/.env`)
```ini
# Add at least one of these keys depending on configured LLM model provider
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

## 3. Starting the Platform

Run the local dev orchestrator script from PowerShell at the project root to check port availability, start all services, and log output.

```powershell
.\start-local-dev.ps1
```

All process logs are redirected to the `logs/` directory in the root workspace (e.g. `logs/express-backend.log`, `logs/react-frontend.log`).

---

## 4. Verifying the System

To automatically verify end-to-end integration and confirm that all services communicate properly:

```bash
node test-integration.js
```

This runs both seeker and recruiter flow scenarios and prints `✅` for each step. All steps must succeed.

---

## 5. Demo Accounts

Use these pre-configured accounts for testing the UI:
- **Job Seeker**:
  - **Email**: `test_seeker@example.com`
  - **Password**: `TestPass123`
- **Recruiter**:
  - **Email**: `test_recruiter@example.com`
  - **Password**: `TestPass123`

---

## 6. Manual Demo Checklist

### Job Seeker Flow
1. **Login**: Go to [http://localhost:3000/](http://localhost:3000/) and click **Sign In**. Log in using the Job Seeker credentials.
2. **Profile Dashboard**: Verify you land on the dashboard displaying your profile details.
3. **Edit Profile**: Click **Edit Profile**, update details (e.g. change full name or location), and save. The name will update in the profile header and navigation instantly.
4. **Analyze Skills**: Navigate to **Analyze Skills**, choose **Software Engineer** as your target title, upload a PDF resume, and click **Analyze Resume**.
5. **Polled Results**: Wait for the background analysis to complete. Confirm that the readiness score, matching skills, and missing skills populate.
6. **Learning Path & Recommendations**: View the generated AI learning roadmap and check the curated list of recommended courses.

### Recruiter Flow
1. **Login**: Sign out of the seeker account and log in using the Recruiter credentials.
2. **Post a Job**: Click **Post a Job**, fill out the job posting form (e.g., Job Title, Description, Company, Required Skills), and click **Post Job**.
3. **View Applicants**: Go back to the dashboard, select the newly posted job, and click **View Applicants** to verify that candidates are ranked automatically by AI matching scores.

---

## 7. Common Errors and Troubleshooting

| Status Code / Error | Description | Resolution |
| :--- | :--- | :--- |
| **401 Unauthorized** | Token issue or expired session | Log out and log back in to renew your JWT token in localStorage. |
| **422 Unprocessable Entity** | Microservice pipeline validation failure | Check if one of the 7 Python microservices went down or failed to parse inputs. |
| **500 Internal Server Error** | General server crash or database connection issue | Open the corresponding log file in the `logs/` folder to inspect backend stacks. |
