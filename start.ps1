# AI Interview Coach - Project Startup Script
# Run this script to start both frontend and backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Interview Coach - Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project directory verified" -ForegroundColor Green
Write-Host ""

# Frontend status
Write-Host "[1/2] Checking Frontend..." -ForegroundColor Yellow
$frontendRunning = Get-Process -Name node -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "✓ Frontend is already running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "⚠ Frontend not running. Starting now..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "✓ Frontend started on http://localhost:3000" -ForegroundColor Green
}

Write-Host ""

# Backend status  
Write-Host "[2/2] Checking Backend (Optional)..." -ForegroundColor Yellow
if (Test-Path "backend/app/main.py") {
    Write-Host "⚠ Backend found but not running (emotion detection will be disabled)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To enable emotion detection:" -ForegroundColor Cyan
    Write-Host "  1. Install dependencies: .\install-emotion-detection.ps1" -ForegroundColor White
    Write-Host "  2. Start backend: Set-Location backend; uvicorn app.main:app --reload --port 8000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ℹ Backend not configured (optional for basic features)" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your AI Interview Coach is ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "📖 API Docs: http://localhost:8000/docs (if backend running)" -ForegroundColor White
Write-Host ""
Write-Host "Features Available:" -ForegroundColor Yellow
Write-Host "  ✓ User Authentication (Clerk)" -ForegroundColor Green
Write-Host "  ✓ Interview Practice" -ForegroundColor Green
Write-Host "  ✓ Voice Recording" -ForegroundColor Green
Write-Host "  ✓ Speech-to-Text" -ForegroundColor Green
Write-Host "  ✓ AI Answer Analysis (OpenAI)" -ForegroundColor Green
Write-Host "  ✓ Resume-Based Questions" -ForegroundColor Green
Write-Host "  ✓ Interview History" -ForegroundColor Green
Write-Host "  ⚠ Emotion Detection (requires backend)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  2. Sign up or sign in with Clerk" -ForegroundColor White
Write-Host "  3. Go to Dashboard → Start Interview" -ForegroundColor White
Write-Host "  4. Choose interview type and begin!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
