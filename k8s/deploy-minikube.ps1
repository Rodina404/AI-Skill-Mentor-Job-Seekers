# deploy-minikube.ps1
# Deploys the full AI Skill Mentor stack to Minikube.
# Run from repo root AFTER filling in k8s/secrets.yaml with real base64 values.

$ErrorActionPreference = "Stop"

Write-Host "=== AI Skill Mentor - Minikube Deploy ===" -ForegroundColor Cyan

# ── 1. Start Minikube if not running ─────────────────────────────────────
$status = ""
$oldPreference = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
try {
    $status = minikube status --format='{{.Host}}' 2>$null
    if ($status -is [array]) { $status = $status -join "" }
} catch {
    $status = "Stopped"
}
$ErrorActionPreference = $oldPreference

if ([string]$status -notlike "*Running*") {
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    minikube start --memory=6144 --cpus=4   # ML services need RAM
}

# ── 2. Point Docker to Minikube's daemon (so images are available inside) ─
Write-Host "Switching Docker context to Minikube..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# ── 3. Build all images inside Minikube's Docker ─────────────────────────
Write-Host "Building images inside Minikube..." -ForegroundColor Yellow

docker build -t ai-skill-mentor/m1-extraction:latest       "AI-Microservices/m1_extraction_service"
docker build -t ai-skill-mentor/skill-normalization:latest  "AI-Microservices/skill_normalization_service"
docker build -t ai-skill-mentor/cv-matching:latest          "AI-Microservices/cv_matching_service"
docker build -t ai-skill-mentor/gap-engine:latest           "AI-Microservices/gap-engin-service"
docker build -t ai-skill-mentor/m5-roadmap:latest           "AI-Microservices/m5_roadmap_service"
docker build -t ai-skill-mentor/course-recommendation:latest "AI-Microservices/course_recommendation_service"
docker build -t ai-skill-mentor/job-recommendation:latest   "AI-Microservices/job_recommendation_service"
docker build -t ai-skill-mentor/express-backend:latest      "backend"
docker build -t ai-skill-mentor/frontend:latest             "Frontend-React"

Write-Host "All images built." -ForegroundColor Green

# ── 4. Enable Nginx Ingress addon ─────────────────────────────────────────
Write-Host "Enabling Nginx Ingress addon..." -ForegroundColor Yellow
minikube addons enable ingress

# ── 5. Apply K8s manifests ───────────────────────────────────────────────
Write-Host "Applying Kubernetes manifests..." -ForegroundColor Yellow

# Secrets FIRST (other manifests depend on them)
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy all services
kubectl apply -f k8s/microservices.yaml
kubectl apply -f k8s/backend-frontend.yaml
kubectl apply -f k8s/ingress.yaml

# ── 6. Wait for pods to be ready ─────────────────────────────────────────
Write-Host ""
Write-Host "Waiting for pods to be ready (this may take 2-3 min for ML services)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all --timeout=300s

# ── 7. Get access URL ─────────────────────────────────────────────────────
Write-Host ""
$minikubeIP = minikube ip
Write-Host "=== Deploy complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your app at: http://$minikubeIP" -ForegroundColor Green
Write-Host "API endpoint:       http://$minikubeIP/api" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  kubectl get pods                    <- check pod status" -ForegroundColor Gray
Write-Host "  kubectl logs <pod-name>             <- view logs" -ForegroundColor Gray
Write-Host "  kubectl describe pod <pod-name>     <- debug a failing pod" -ForegroundColor Gray
Write-Host "  minikube dashboard                  <- visual dashboard" -ForegroundColor Gray
