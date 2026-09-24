Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Launching FoodResQ Platform Services..." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\server`" && npm start"
Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\ai-service`" && py main.py"
Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\client`" && npm run dev"

Write-Host "All services starting! Opening browser in 4 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
