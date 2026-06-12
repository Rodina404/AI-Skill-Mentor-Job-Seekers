# test-local.ps1
# Builds and smoke-tests all Docker images locally.
# Run from repo root: .\test-local.ps1
# Requires Docker Desktop to be running.

$ErrorActionPreference = "Stop"

Write-Host "=== Building all Docker images ===" -ForegroundColor Cyan

# ── Build all images ──────────────────────────────────────────────────────
$builds = @(
    @{ name="ai-skill-mentor/m1-extraction";     path="AI-Microservices/m1_extraction_service" },
    @{ name="ai-skill-mentor/skill-normalization"; path="AI-Microservices/skill_normalization_service" },
    @{ name="ai-skill-mentor/cv-matching";        path="AI-Microservices/cv_matching_service" },
    @{ name="ai-skill-mentor/gap-engine";         path="AI-Microservices/gap-engin-service" },
    @{ name="ai-skill-mentor/m5-roadmap";         path="AI-Microservices/m5_roadmap_service" },
    @{ name="ai-skill-mentor/course-recommendation"; path="AI-Microservices/course_recommendation_service" },
    @{ name="ai-skill-mentor/job-recommendation";   path="AI-Microservices/job_recommendation_service" },
    @{ name="ai-skill-mentor/express-backend";    path="backend" },
    @{ name="ai-skill-mentor/frontend";           path="Frontend-React" }
)

foreach ($b in $builds) {
    Write-Host ""
    Write-Host "Building $($b.name)..." -ForegroundColor Yellow
    docker build -t $b.name "$($b.path)"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $($b.name)" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: $($b.name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== All images built. Starting smoke test ===" -ForegroundColor Cyan

# ── Start all containers ──────────────────────────────────────────────────
# Copy your .env files first, then run this script
docker run -d --name m1-extraction     -p 8001:8001 --env-file AI-Microservices/m1_extraction_service/.env     ai-skill-mentor/m1-extraction
docker run -d --name skill-norm        -p 8002:8002 --env-file "AI-Microservices/skill_normalization_service/.env" ai-skill-mentor/skill-normalization
docker run -d --name cv-matching       -p 8003:8003 --env-file AI-Microservices/cv_matching_service/.env       ai-skill-mentor/cv-matching
docker run -d --name gap-engine        -p 8004:8004 --env-file AI-Microservices/gap-engin-service/.env        ai-skill-mentor/gap-engine
docker run -d --name m5-roadmap        -p 8005:8005 --env-file AI-Microservices/m5_roadmap_service/.env        ai-skill-mentor/m5-roadmap
docker run -d --name course-rec        -p 8006:8006 --env-file AI-Microservices/course_recommendation_service/.env ai-skill-mentor/course-recommendation
docker run -d --name job-rec           -p 8007:8007 --env-file AI-Microservices/job_recommendation_service/.env   ai-skill-mentor/job-recommendation
docker run -d --name express-backend   -p 5000:5000 --env-file backend/.env                                    ai-skill-mentor/express-backend
docker run -d --name frontend          -p 3000:80                                                               ai-skill-mentor/frontend

Write-Host "Waiting 25s for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 25

# ── Health checks ─────────────────────────────────────────────────────────
$checks = @(
    @{ name="m1-extraction";   url="http://localhost:8001/health" },
    @{ name="skill-norm";      url="http://localhost:8002/health" },
    @{ name="cv-matching";     url="http://localhost:8003/health" },
    @{ name="gap-engine";      url="http://localhost:8004/health" },
    @{ name="m5-roadmap";      url="http://localhost:8005/health" },
    @{ name="course-rec";      url="http://localhost:8006/health" },
    @{ name="job-rec";         url="http://localhost:8007/health" },
    @{ name="express-backend"; url="http://localhost:5000/api/health" },
    @{ name="frontend";        url="http://localhost:3000" }
)

$allPassed = $true
foreach ($c in $checks) {
    try {
        $response = Invoke-WebRequest -Uri $c.url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS: $($c.name) -> $($c.url)" -ForegroundColor Green
        } else {
            Write-Host "FAIL: $($c.name) -> HTTP $($response.StatusCode)" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "FAIL: $($c.name) -> $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed) {
    Write-Host "=== All services healthy! Ready for Kubernetes. ===" -ForegroundColor Cyan
} else {
    Write-Host "=== Some services failed. Check docker logs <container-name> ===" -ForegroundColor Red
}

# ── Cleanup prompt ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "To stop and remove all test containers:" -ForegroundColor Gray
Write-Host "  docker rm -f m1-extraction skill-norm cv-matching gap-engine m5-roadmap course-rec job-rec express-backend frontend" -ForegroundColor Gray

