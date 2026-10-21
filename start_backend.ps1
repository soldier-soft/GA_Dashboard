Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Stellantis GA Dashboard Backend (FastAPI)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"
py -3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
