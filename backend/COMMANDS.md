# ============================================================================
# AI Interview Platform Backend - Quick Reference
# ============================================================================

# 1. Setup (First Time Only)
# ---------------------------

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # PowerShell
# OR
.\venv\Scripts\activate.bat  # Command Prompt

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your settings
notepad .env


# 2. Database Setup
# -----------------

# Install PostgreSQL (using Chocolatey)
choco install postgresql

# Create database
psql -U postgres
CREATE DATABASE ai_interview_db;
\q


# 3. Run Development Server
# --------------------------

# Start server with auto-reload
uvicorn app.main:app --reload

# Start on custom host/port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start with multiple workers (production)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4


# 4. Access API
# -------------

# API Root
http://localhost:8000

# Interactive API Docs (Swagger)
http://localhost:8000/docs

# Alternative API Docs (ReDoc)
http://localhost:8000/redoc

# OpenAPI JSON Schema
http://localhost:8000/openapi.json


# 5. Testing
# ----------

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_auth.py -v


# 6. Database Migrations (Alembic)
# ---------------------------------

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1


# 7. Code Quality
# ---------------

# Format code with Black
black app/

# Sort imports
isort app/

# Check code style
flake8 app/

# Type checking
mypy app/


# 8. Production Deployment
# ------------------------

# Using Gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Using Docker
docker build -t ai-interview-api .
docker run -d -p 8000:8000 --env-file .env ai-interview-api

# Using Docker Compose
docker-compose up -d


# 9. Useful Commands
# ------------------

# Check Python version
python --version

# List installed packages
pip list

# Update all packages
pip install --upgrade -r requirements.txt

# Generate requirements.txt
pip freeze > requirements.txt

# Check PostgreSQL status
Get-Service postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-15

# Stop PostgreSQL
Stop-Service postgresql-x64-15


# 10. API Examples (PowerShell)
# ------------------------------

# Register user
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"Test1234","full_name":"Test User"}'

# Login
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"Test1234"}'
$token = $response.access_token

# Get dashboard summary (with auth)
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8000/api/dashboard/summary" -Method GET -Headers $headers


# ============================================================================
# Troubleshooting
# ============================================================================

# Issue: Module not found
# Solution: Activate virtual environment and install dependencies
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Issue: Database connection error
# Solution: Check PostgreSQL is running and .env has correct DATABASE_URL
Get-Service postgresql*
Start-Service postgresql-x64-15

# Issue: Port already in use
# Solution: Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Issue: Import errors
# Solution: Make sure you're running from backend directory
cd backend
python -m app.main
