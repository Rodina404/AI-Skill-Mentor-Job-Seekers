# k8s-port-forward-all.ps1
# Starts port-forwarding for all Kubernetes services in Minikube to localhost

$ErrorActionPreference = "Continue"

# Kill existing kubectl port-forward processes
Get-Process kubectl -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$forwards = @(
    @{ svc="svc/frontend-service"; ports="3000:80" },
    @{ svc="svc/express-backend-service"; ports="5000:5000" },
    @{ svc="svc/m1-extraction-service"; ports="8001:8001" },
    @{ svc="svc/skill-normalization-service"; ports="8002:8002" },
    @{ svc="svc/cv-matching-service"; ports="8003:8003" },
    @{ svc="svc/gap-engine-service"; ports="8004:8004" },
    @{ svc="svc/m5-roadmap-service"; ports="8005:8005" },
    @{ svc="svc/course-recommendation-service"; ports="8006:8006" },
    @{ svc="svc/job-recommendation-service"; ports="8007:8007" }
)

Write-Host "Starting port-forwards for all Kubernetes services..." -ForegroundColor Cyan

foreach ($f in $forwards) {
    Write-Host "Forwarding $($f.svc) on $($f.ports)..." -ForegroundColor Yellow
    Start-Process -FilePath "kubectl" -ArgumentList "port-forward", "$($f.svc)", "$($f.ports)", "--address", "0.0.0.0" -NoNewWindow
}

Start-Sleep -Seconds 3
Write-Host "Port-forwards active." -ForegroundColor Green
