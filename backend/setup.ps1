# Quick Start Script for AI Interview Platform Backend
# Run this script in PowerShell to set up and start the backend

Write-Host "🚀 AI Interview Platform - Backend Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "📋 Checking Python version..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "🔧 Creating virtual environment..." -ForegroundColor Yellow
if (!(Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "🔓 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host ""
Write-Host "🔑 Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. IMPORTANT: Edit .env with your settings!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Required settings to update:" -ForegroundColor Cyan
    Write-Host "   - DATABASE_URL (PostgreSQL connection)" -ForegroundColor White
    Write-Host "   - SECRET_KEY (JWT secret, min 32 characters)" -ForegroundColor White
    Write-Host "   - GEMINI_API_KEY (optional)" -ForegroundColor White
    Write-Host "   - OPENAI_API_KEY (optional)" -ForegroundColor White
    Write-Host ""
    Write-Host "   Opening .env file for editing..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    notepad .env
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

# Check PostgreSQL
Write-Host ""
Write-Host "🗄️  Checking PostgreSQL..." -ForegroundColor Yellow
$postgresService = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($postgresService) {
    if ($postgresService.Status -eq "Running") {
        Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL is installed but not running. Starting..." -ForegroundColor Yellow
        Start-Service $postgresService.Name
        Write-Host "✅ PostgreSQL started" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  PostgreSQL not found. Please install PostgreSQL 15+" -ForegroundColor Yellow
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "   Or use Chocolatey: choco install postgresql" -ForegroundColor Cyan
}

# Create uploads directory
Write-Host ""
Write-Host "📁 Creating upload directories..." -ForegroundColor Yellow
if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    New-Item -ItemType Directory -Path "uploads/audio" | Out-Null
    New-Item -ItemType Directory -Path "uploads/video" | Out-Null
    New-Item -ItemType Directory -Path "uploads/resumes" | Out-Null
    New-Item -ItemType Directory -Path "uploads/documents" | Out-Null
    Write-Host "✅ Upload directories created" -ForegroundColor Green
} else {
    Write-Host "✅ Upload directories already exist" -ForegroundColor Green
}

# Final instructions
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure you've configured .env file with:" -ForegroundColor White
Write-Host "   - DATABASE_URL" -ForegroundColor Gray
Write-Host "   - SECRET_KEY" -ForegroundColor Gray
Write-Host "   - API keys (optional)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host "   CREATE DATABASE ai_interview_db;" -ForegroundColor Gray
Write-Host "   \q" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the server:" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Access the API:" -ForegroundColor White
Write-Host "   - API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   - Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to start development!" -ForegroundColor Green
Write-Host ""
