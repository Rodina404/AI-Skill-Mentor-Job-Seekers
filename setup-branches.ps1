# setup-branches.ps1
# Run this from your repo root: .\setup-branches.ps1
# Creates all branches, puts Dockerfiles in the right place, and pushes.

$ErrorActionPreference = "Stop"

function Checkout-Branch($branchName) {
    # Check if branch exists locally
    $localBranch = git branch --list $branchName
    if ($localBranch) {
        git checkout $branchName
    } else {
        # Check if it exists on origin
        $remoteBranch = git branch -r --list "origin/$branchName"
        if ($remoteBranch) {
            git checkout $branchName
        } else {
            git checkout -b $branchName
        }
    }
}

Write-Host "=== AI Skill Mentor - Branch Setup ===" -ForegroundColor Cyan

# ── 1. Make sure we're on main and up to date ─────────────────────────────
git checkout main
git pull origin main

# ── 2. Create dev branch (integration branch) ────────────────────────────
Checkout-Branch "dev"
git push -u origin dev

# ── 3. Branch: infra/kubernetes (all Dockerfiles + K8s manifests) ─────────
Checkout-Branch "infra/kubernetes"
Write-Host "Created infra/kubernetes branch" -ForegroundColor Green
git push -u origin infra/kubernetes

# ── 4. Branch: service/express-backend ────────────────────────────────────
git checkout dev
Checkout-Branch "service/express-backend"
Write-Host "Created service/express-backend branch" -ForegroundColor Green
git push -u origin service/express-backend

# ── 5. Branch: service/frontend-react ────────────────────────────────────
git checkout dev
Checkout-Branch "service/frontend-react"
Write-Host "Created service/frontend-react branch" -ForegroundColor Green
git push -u origin service/frontend-react

# ── 6. Branch: service/m1-extraction ─────────────────────────────────────
git checkout dev
Checkout-Branch "service/m1-extraction"
Write-Host "Created service/m1-extraction branch" -ForegroundColor Green
git push -u origin service/m1-extraction

# ── 7. Branch: service/skill-normalization ────────────────────────────────
git checkout dev
Checkout-Branch "service/skill-normalization"
Write-Host "Created service/skill-normalization branch" -ForegroundColor Green
git push -u origin service/skill-normalization

# ── 8. Branch: service/cv-matching ───────────────────────────────────────
git checkout dev
Checkout-Branch "service/cv-matching"
Write-Host "Created service/cv-matching branch" -ForegroundColor Green
git push -u origin service/cv-matching

# ── 9. Branch: service/gap-engine ────────────────────────────────────────
git checkout dev
Checkout-Branch "service/gap-engine"
Write-Host "Created service/gap-engine branch" -ForegroundColor Green
git push -u origin service/gap-engine
Write-Host "  -> Tell your teammate to push their gap engine to this branch" -ForegroundColor Yellow

# ── 10. Branch: service/m5-roadmap ───────────────────────────────────────
git checkout dev
Checkout-Branch "service/m5-roadmap"
Write-Host "Created service/m5-roadmap branch" -ForegroundColor Green
git push -u origin service/m5-roadmap

# ── 11. Branch: service/course-recommendation ────────────────────────────
git checkout dev
Checkout-Branch "service/course-recommendation"
Write-Host "Created service/course-recommendation branch" -ForegroundColor Green
git push -u origin service/course-recommendation

# ── 12. Branch: service/job-recommendation ───────────────────────────────
git checkout dev
Checkout-Branch "service/job-recommendation"
Write-Host "Created service/job-recommendation branch" -ForegroundColor Green
git push -u origin service/job-recommendation

# ── Done ─────────────────────────────────────────────────────────────────
git checkout dev
Write-Host ""
Write-Host "=== All branches created! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Branch structure:" -ForegroundColor White
Write-Host "  main                          <- production only" -ForegroundColor Gray
Write-Host "  dev                           <- integration (merge everything here first)" -ForegroundColor Gray
Write-Host "  infra/kubernetes              <- Dockerfiles + K8s YAMLs" -ForegroundColor Gray
Write-Host "  service/express-backend       <- Node.js backend" -ForegroundColor Gray
Write-Host "  service/frontend-react        <- React frontend" -ForegroundColor Gray
Write-Host "  service/m1-extraction         <- Resume parser" -ForegroundColor Gray
Write-Host "  service/skill-normalization   <- Skill normalizer" -ForegroundColor Gray
Write-Host "  service/cv-matching           <- CV matcher + scorer" -ForegroundColor Gray
Write-Host "  service/gap-engine            <- Gap analysis (teammate)" -ForegroundColor Gray
Write-Host "  service/m5-roadmap            <- Roadmap + progress + LLM" -ForegroundColor Gray
Write-Host "  service/course-recommendation <- Course recommender" -ForegroundColor Gray
Write-Host "  service/job-recommendation    <- Job recommender" -ForegroundColor Gray
