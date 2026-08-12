# Build all images inside Minikube's Docker daemon
$ErrorActionPreference = "Stop"

Write-Host "Setting Minikube Docker environment..." -ForegroundColor Cyan
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

$images = @(
    @{ Name = "ai-skill-mentor/frontend:latest"; Path = "Frontend-React" },
    @{ Name = "ai-skill-mentor/express-backend:latest"; Path = "backend" },
    @{ Name = "ai-skill-mentor/m1-extraction:latest"; Path = "AI-Microservices/m1_extraction_service" },
    @{ Name = "ai-skill-mentor/skill-normalization:latest"; Path = "AI-Microservices/skill_normalization_service" },
    @{ Name = "ai-skill-mentor/cv-matching:latest"; Path = "AI-Microservices/cv_matching_service" },
    @{ Name = "ai-skill-mentor/gap-engine:latest"; Path = "AI-Microservices/gap-engin-service" },
    @{ Name = "ai-skill-mentor/m5-roadmap:latest"; Path = "AI-Microservices/m5_roadmap_service" },
    @{ Name = "ai-skill-mentor/course-recommendation:latest"; Path = "AI-Microservices/course_recommendation_service" },
    @{ Name = "ai-skill-mentor/job-recommendation:latest"; Path = "AI-Microservices/job_recommendation_service" }
)

$results = @()

foreach ($img in $images) {
    Write-Host "`nBuilding $($img.Name) from $($img.Path)..." -ForegroundColor Yellow
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        docker build -t $($img.Name) $($img.Path)
        $sw.Stop()
        $duration = "$([math]::Round($sw.Elapsed.TotalSeconds, 2))s"
        Write-Host "✅ Successfully built $($img.Name) in $duration" -ForegroundColor Green
        $results += [PSCustomObject]@{ Image = $img.Name; Duration = $duration; Result = "PASS" }
    } catch {
        $sw.Stop()
        $duration = "$([math]::Round($sw.Elapsed.TotalSeconds, 2))s"
        Write-Host "❌ Failed building $($img.Name) after ${duration}: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{ Image = $img.Name; Duration = $duration; Result = "FAIL" }
    }
}

Write-Host "`n=== BUILD SUMMARY ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize
