# AI Skill Mentor & Recruiter Platform

[![Release Status](https://img.shields.io/badge/Release%20Status-READY%20FOR%20DEPLOYMENT-success?style=for-the-badge)](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/reports/final-release-validation.md)
[![E2E Validation](https://img.shields.io/badge/Browser%20E2E-16%2F16%20PASS-brightgreen?style=for-the-badge)](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/09-recruiter-testing-validation.md)
[![Backend Tests](https://img.shields.io/badge/Backend%20Jest-113%2F113%20PASS-blue?style=for-the-badge)](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/09-recruiter-testing-validation.md)
[![AI Tests](https://img.shields.io/badge/FastAPI%20Pytest-19%2F19%20PASS-blueviolet?style=for-the-badge)](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/09-recruiter-testing-validation.md)

---

## 1. Project Overview

**AI Skill Mentor** is an enterprise career and talent acquisition platform designed for both **Job Seekers** and **Recruiters**:
- **For Job Seekers**: Parses resumes (CVs), identifies skill gaps against target roles, generates personalized multi-phase learning roadmaps, and recommends tailored courses and open jobs.
- **For Recruiters**: Provides an end-to-end recruitment management suite with company profile administration, job posting CRUD, on-demand AI candidate matching, inbound applicant review, and secure short-lived resume access.

The system integrates a React 18 single-page application, an Express.js API gateway, a mesh of 7 Python FastAPI AI/NLP microservices, and Supabase (PostgreSQL 15, GoTrue Auth, and S3 Storage), fully orchestrated on Kubernetes.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer"]
        Browser["User Browser (Recruiter / Seeker)"]
    end

    subgraph IngressLayer["Kubernetes Ingress (Minikube / Cluster)"]
        Ingress["NGINX Ingress Controller<br/>(http://localhost:8080)"]
    end

    subgraph AppServices["Application Workloads"]
        Frontend["React 18 SPA (Vite + Tailwind)<br/>(frontend-service :80)"]
        Backend["Express.js API Gateway<br/>(express-backend-service :5000)"]
    end

    subgraph AIMesh["AI / NLP Microservices Mesh (FastAPI)"]
        M1["m1-extraction (:8001)"]
        M2["skill-normalization (:8002)"]
        M3["cv-matching (:8003)"]
        M4["gap-engine (:8004)"]
        M5["m5-roadmap (:8005)"]
        M6["course-recommendation (:8006)"]
        M7["job-recommendation (:8007)"]
    end

    subgraph DataLayer["Persistence & Storage (Supabase)"]
        PostgresDB[(PostgreSQL Database<br/>RLS + RPC)]
        AuthService["Supabase GoTrue Auth"]
        Storage["Private S3 Storage (Resumes)"]
    end

    Browser -->|HTTP Traffic| Ingress
    Ingress -->|/| Frontend
    Ingress -->|/api/*| Backend
    Backend -->|Internal REST| M1 & M2 & M3 & M4 & M5 & M6 & M7
    Backend -->|JWT Auth Verification| AuthService
    Backend -->|SQL Queries & RPC Sync| PostgresDB
    Backend -->|Presigned Resume URLs (300s)| Storage
```

---

## 3. Recruiter Module & Documentation Suite

A complete software-engineering documentation suite for the Recruiter cycle is available in the [`docs/recruiter/`](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter) directory:

| Document | Description |
| :--- | :--- |
| **[01. System Architecture](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/01-recruiter-system-architecture.md)** | Subsystems, components, network topology, and runtime architecture. |
| **[02. End-to-End Data Flow](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/02-recruiter-end-to-end-data-flow.md)** | Full 15-step recruiter lifecycle from registration to candidate outreach. |
| **[03. API Specification](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/03-recruiter-api-specification.md)** | Comprehensive reference for all auth, profile, job, matching, and applicant endpoints. |
| **[04. Feature Architecture](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/04-recruiter-feature-architecture.md)** | Functional specifications, invariants, and application vs match pool rules. |
| **[05. Database & Data Model](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/05-recruiter-database-data-model.md)** | Schema definitions, ERD, foreign keys, stored procedures (RPC), and RLS policies. |
| **[06. AI Architecture & Pipeline](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/06-recruiter-ai-architecture.md)** | AI candidate matching, candidate pool batching, scoring taxonomy, and invariants. |
| **[07. Security & Authorization](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/07-recruiter-security-authorization.md)** | RBAC, multi-tenant BOLA/IDOR defenses, JWT session handling, and signed URLs. |
| **[08. Deployment & Infrastructure](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/08-recruiter-deployment-infrastructure.md)** | Kubernetes manifests, Ingress routing, health probes, and self-healing metrics. |
| **[09. Testing & Validation](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/09-recruiter-testing-validation.md)** | Complete 16/16 browser E2E test matrix, Jest/Pytest results, and release gate report. |

### Visual Diagrams
- **[System Architecture Diagram](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/system-architecture.md)**
- **[Recruiter Lifecycle Flow](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/recruiter-lifecycle.md)**
- **[Authentication Sequence](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/authentication-sequence.md)**
- **[Job Management Sequence](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/job-management-sequence.md)**
- **[AI Matching Sequence](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/ai-matching-sequence.md)**
- **[Applicant Flow Sequence](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/applicant-sequence.md)**
- **[Resume Access Sequence](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/resume-access-sequence.md)**
- **[Authorization Flow & Boundaries](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/docs/recruiter/diagrams/authorization-flow.md)**

---

## 4. Tech Stack Reference

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Backend Gateway** | Node.js (v24), Express.js, `@supabase/supabase-js`, `express-rate-limit` |
| **Database & Auth** | Supabase PostgreSQL 15, GoTrue Auth, Private S3 Storage Buckets |
| **AI / NLP Services** | Python 3.13, FastAPI, Uvicorn, SentenceTransformers, FuzzyWuzzy, LangChain, Groq API |
| **Container & Orchestration** | Docker, Kubernetes (Minikube v1.35), NGINX Ingress Controller |
| **Testing Frameworks** | Jest (Backend), Pytest (AI Microservices), Puppeteer (E2E Browser Validation) |

---

## 5. Prerequisites & Environment Setup

Ensure you have the following installed:
- **Node.js** (v18 or higher, v24 recommended)
- **Python** (v3.10 or higher, v3.13 supported)
- **Docker Desktop** (running and healthy)
- **Minikube** & **kubectl** (for Kubernetes deployment)

### 1. Configure Environment Variables
- Copy `.env.example` in the root folder to `.env` and populate your API credentials.
- Copy `backend/.env.example` to `backend/.env` (requires `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`).
- For AI microservices, configure `.env` files in:
  - `AI-Microservices/m1_extraction_service/.env` (`GROQ_API_KEY`)
  - `AI-Microservices/gap-engin-service/.env` (`GROQ_API_KEY`, optional `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`)
  - `AI-Microservices/m5_roadmap_service/.env` (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`)

### 2. Install Node Dependencies
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../Frontend-React && npm install
```

---

## 6. Running the Application

### Option A: Kubernetes Deployment on Minikube (Production Environment)
```powershell
# From repository root
.\k8s\deploy-minikube.ps1
```
This automated deployment script:
1. Provisions Minikube with required CPU and memory allocations.
2. Builds all container images inside the Minikube Docker environment.
3. Enables the `ingress-nginx` controller addon.
4. Applies all Kubernetes Secrets, ConfigMaps, Deployments, Services, and Ingress manifests.

**Forward Ingress Traffic**:
```powershell
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
```
Access the application immediately at: **`http://localhost:8080`**

---

### Option B: Native Process Developer Dashboard (Local Development)
```powershell
# From repository root
.\start-local-dev.ps1
```
- Starts all 9 services concurrently with live process monitoring and log redirection.
- Frontend available at `http://localhost:3000`, Backend API at `http://localhost:5000`.

---

### Option C: Docker Compose
```bash
docker-compose up --build
```

---

## 7. Verification & Automated Test Suites

### Execute Backend Unit & Repository Tests
```bash
cd backend
npm test -- --runInBand
# Result: 12 test suites passed, 113 tests passed (100%)
```

### Execute AI CV Matching Tests
```bash
cd AI-Microservices/cv_matching_service
pytest tests
# Result: 19 test cases passed (100%)
```

### Verify Frontend Production Build
```bash
cd Frontend-React
npm run build
# Result: 0 errors, 0 warnings
```

---

## 8. Release Verification Summary

The Recruiter Web Application has successfully passed all acceptance gates:
- **Application Entrypoint**: `http://localhost:8080` via Kubernetes NGINX Ingress
- **Browser E2E Workflow**: **16 / 16 Tests Passed (100%)**
- **Multi-Tenant Security**: Verified with complete cross-recruiter BOLA/IDOR isolation
- **AI Matching Pipeline**: Batch inference, canonical percentage scaling, and atomic RPC persistence verified
- **Current Status**: **`READY FOR DEPLOYMENT`**
