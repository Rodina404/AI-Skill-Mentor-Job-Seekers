# AI Skill Mentor — Deployment Guide

## Architecture Overview

```
Browser
  └── Nginx Ingress (Minikube)
        ├── /          → frontend-service (React, port 80)
        └── /api/*     → express-backend-service (Node.js, port 5000)
                              ├── m1-extraction-service      :8001
                              ├── skill-normalization-service :8002
                              ├── cv-matching-service         :8003
                              ├── gap-engine-service          :8004
                              ├── m5-roadmap-service          :8005
                              ├── course-recommendation-service :8006
                              └── job-recommendation-service  :8007
                              
All services read/write to Supabase (external, cloud-hosted)
```

## Service → Branch Map

| Branch | What goes in it |
|--------|----------------|
| `main` | Production only. Never commit directly. |
| `dev` | Integration. All branches merge here first. |
| `infra/kubernetes` | All Dockerfiles + k8s/ YAMLs |
| `service/express-backend` | backend/ folder |
| `service/frontend-react` | Frontend React/ folder |
| `service/m1-extraction` | AI-Microservices/m1_extraction_service/ |
| `service/skill-normalization` | AI-Microservices/skills' System/skill_normalization_service/ |
| `service/cv-matching` | AI-Microservices/cv_matching_service/ |
| `service/gap-engine` | AI-Microservices/gap_engine_service/ |
| `service/m5-roadmap` | AI-Microservices/m5_roadmap_service/ |
| `service/course-recommendation` | AI-Microservices/course_recommendation_service/ |
| `service/job-recommendation` | AI-Microservices/job_recommendation_service/ |

---

## Step-by-Step Deployment

### Prerequisites
- Docker Desktop running
- Minikube installed (`winget install minikube`)
- kubectl installed (`winget install kubectl`)

---

### Step 1 — Set up branches
```powershell
.\setup-branches.ps1
```

---

### Step 2 — Fill in secrets
Copy each service's `.env.example` to `.env` and fill in real values.

For Kubernetes, fill in `k8s/secrets.yaml` with base64-encoded values:
```powershell
# How to base64-encode on Windows:
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your-value-here"))
```

Fill these in `k8s/secrets.yaml`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

---

### Step 3 — Test locally with Docker
```powershell
.\test-local.ps1
```
All 6 health checks should pass before proceeding.

---

### Step 4 — Deploy to Minikube
```powershell
.\deploy-minikube.ps1
```

---

### Step 5 — Verify end-to-end
1. Open `http://<minikube-ip>` in browser
2. Register a new account
3. Upload a resume (PDF)
4. Wait ~30s for analysis
5. View matched jobs and skill gaps
6. Check roadmap generation

---

## Adding the 3 Missing Services

When teammates push their services, add their Dockerfiles following this template:

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --prefix=/install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
RUN useradd -m appuser && chown -R appuser /app
USER appuser
EXPOSE <PORT>
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "<PORT>"]
```

Then add a Deployment + Service block to `k8s/services/microservices.yaml` following the existing pattern.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Pod stuck in `Pending` | `kubectl describe pod <name>` — usually memory limit |
| Pod stuck in `CrashLoopBackOff` | `kubectl logs <name>` — check env vars |
| Ingress not working | `minikube addons enable ingress` then wait 2min |
| ML service slow to start | Normal — sentence-transformers loads models. Wait 30s. |
| Image not found | You forgot to build inside Minikube's Docker context. Re-run `deploy-minikube.ps1` |
