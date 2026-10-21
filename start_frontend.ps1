Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Stellantis GA Dashboard Frontend (Vite)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"
npm run dev
