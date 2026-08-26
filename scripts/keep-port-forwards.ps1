# scripts/keep-port-forwards.ps1
$services = @(
    @{ svc="svc/frontend-service"; port="3000:80" },
    @{ svc="svc/express-backend-service"; port="5000:5000" },
    @{ svc="svc/m1-extraction-service"; port="8001:8001" },
    @{ svc="svc/skill-normalization-service"; port="8002:8002" },
    @{ svc="svc/cv-matching-service"; port="8003:8003" },
    @{ svc="svc/gap-engine-service"; port="8004:8004" },
    @{ svc="svc/m5-roadmap-service"; port="8005:8005" },
    @{ svc="svc/course-recommendation-service"; port="8006:8006" },
    @{ svc="svc/job-recommendation-service"; port="8007:8007" }
)

$jobs = @()
foreach ($s in $services) {
    Write-Host "Starting port-forward for $($s.svc) on $($s.port)..."
    $j = Start-Job -ScriptBlock {
        param($svc, $port)
        kubectl port-forward $svc $port --address 0.0.0.0
    } -ArgumentList $s.svc, $s.port
    $jobs += $j
}

Write-Host "All port-forwards started in background jobs. Keeping process alive..."
while ($true) {
    Start-Sleep -Seconds 5
}
