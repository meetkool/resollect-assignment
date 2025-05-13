# PowerShell script to start Django backend
Write-Host "🚀 Starting Django backend server..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path (Join-Path $PSScriptRoot "../backend")

# Activate virtual environment if it exists
$venvPath = "./venv/Scripts/Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & $venvPath
} else {
    Write-Host "Virtual environment not found." -ForegroundColor Red
}

# Start Django server
Write-Host "Starting Django development server..." -ForegroundColor Green
python manage.py runserver 