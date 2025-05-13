# PowerShell script to start both backend and frontend servers
Write-Host "🚀 Starting Todo App..." -ForegroundColor Cyan

# Function to check if port is in use
function Test-PortInUse {
    param(
        [int] $Port
    )
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return ($null -ne $connections)
}

# Check if backend is already running
if (Test-PortInUse -Port 8000) {
    Write-Host "✅ Backend server already running on port 8000" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting Django backend server..." -ForegroundColor Yellow
    # Start backend server in a new window
    Start-Process powershell -ArgumentList "-Command cd $PSScriptRoot/backend; python manage.py runserver"
    
    # Wait for backend to start
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Start frontend in this window
Write-Host "🔄 Starting Next.js frontend..." -ForegroundColor Yellow
npm run dev

Write-Host "✨ Application started successfully!" -ForegroundColor Green 