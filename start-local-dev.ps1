# start-local-dev.ps1
# Launches all backend, frontend, and AI microservices in the background, redirecting logs to a folder.
# Prints a live status monitoring dashboard.
# Run from repository root.

$ErrorActionPreference = "Continue"

# 1. Port cleanup configuration
$ports = @(5000, 3000, 8001, 8002, 8003, 8004, 8005, 8006, 8007)

Write-Host "=== Checking and Freeing Ports ===" -ForegroundColor Cyan
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $pids = $connection.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            if ($p -gt 0) {
                Write-Host "Port $port in use by PID $p. Terminating process..." -ForegroundColor Yellow
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# 2. Create logs directory
$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
Write-Host "Logs directory configured at: $logDir" -ForegroundColor Gray

# 3. Service Definitions
$services = @(
    @{ name="m1-extraction";        port=8001; path="AI-Microservices/m1_extraction_service";        url="http://127.0.0.1:8001/health" },
    @{ name="skill-normalization";  port=8002; path="AI-Microservices/skill_normalization_service";  url="http://127.0.0.1:8002/health" },
    @{ name="cv-matching";           port=8003; path="AI-Microservices/cv_matching_service";           url="http://127.0.0.1:8003/health" },
    @{ name="gap-engine";            port=8004; path="AI-Microservices/gap-engin-service";            url="http://127.0.0.1:8004/health" },
    @{ name="roadmap-service";       port=8005; path="AI-Microservices/m5_roadmap_service";            url="http://127.0.0.1:8005/health" },
    @{ name="course-recommendation"; port=8006; path="AI-Microservices/course_recommendation_service"; url="http://127.0.0.1:8006/health" },
    @{ name="job-recommendation";    port=8007; path="AI-Microservices/job_recommendation_service";    url="http://127.0.0.1:8007/health" },
    @{ name="express-backend";       port=5000; path="backend";                                       url="http://127.0.0.1:5000/api/health"; isNode=$true },
    @{ name="react-frontend";        port=3000; path="Frontend-React";                                url="http://127.0.0.1:3000"; isNode=$true }
)

# 4. Launch Services
Write-Host ""
Write-Host "=== Launching All Services in Background ===" -ForegroundColor Cyan
foreach ($s in $services) {
    $name = $s.name
    $port = $s.port
    $path = Join-Path $PSScriptRoot $s.path
    $stdout = Join-Path $logDir "$name.log"
    $stderr = Join-Path $logDir "$name.err"
    
    Write-Host "Launching $name on port $port..." -ForegroundColor Yellow
    
    if ($s.isNode) {
        # Launch Node/NPM service
        Start-Process "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $path -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    } else {
        # Launch Python FastAPI service
        $uvicornPath = "uvicorn"
        # Check for virtual environment uvicorn first
        $localVenvUvicorn = Join-Path $path ".venv\Scripts\uvicorn.exe"
        $localVenvUvicorn2 = Join-Path $path "venv\Scripts\uvicorn.exe"
        if (Test-Path $localVenvUvicorn) {
            $uvicornPath = $localVenvUvicorn
        } elseif (Test-Path $localVenvUvicorn2) {
            $uvicornPath = $localVenvUvicorn2
        }
        Start-Process $uvicornPath -ArgumentList "main:app --host 0.0.0.0 --port $port" -WorkingDirectory $path -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    }
}

Write-Host ""
Write-Host "Waiting 5 seconds for initial server bindings..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 5. Live Dashboard Loop
Write-Host "Launching status dashboard..." -ForegroundColor Gray
Start-Sleep -Seconds 1

try {
    while ($true) {
        Clear-Host
        Write-Host "============================================================" -ForegroundColor Cyan
        Write-Host "           AI Skill Mentor - Service Dashboard" -ForegroundColor Cyan
        Write-Host "============================================================" -ForegroundColor Cyan
        Write-Host " [Port]  Service Name          Status      Details" -ForegroundColor Cyan
        Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
        
        foreach ($s in $services) {
            $status = "OFFLINE"
            $details = "Connection failed"
            $color = "Red"
            
            try {
                $res = Invoke-WebRequest -Uri $s.url -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                if ($res.StatusCode -eq 200) {
                    $status = "ONLINE"
                    $details = "200 OK"
                    $color = "Green"
                } else {
                    $status = "UNHEALTHY"
                    $details = "HTTP $($res.StatusCode)"
                    $color = "Yellow"
                }
            } catch {
                # Check if port is open to differentiate starting vs dead
                $connection = Get-NetTCPConnection -LocalPort $s.port -ErrorAction SilentlyContinue
                if ($connection) {
                    $status = "STARTING"
                    $details = "Port open, awaiting response"
                    $color = "Yellow"
                }
            }
            
            $portStr = "[$($s.port)]".PadRight(8)
            $nameStr = "$($s.name)".PadRight(22)
            
            Write-Host -NoNewline $portStr
            Write-Host -NoNewline $nameStr
            Write-Host -NoNewline $status -ForegroundColor $color
            Write-Host "   $details"
        }
        
        Write-Host "============================================================" -ForegroundColor Cyan
        Write-Host "Logs are stored in: $logDir" -ForegroundColor Gray
        Write-Host "Press Ctrl+C to terminate dashboard (services remain active)." -ForegroundColor Gray
        
        Start-Sleep -Seconds 3
    }
} catch {
    Write-Host "`nDashboard exited." -ForegroundColor Gray
}
