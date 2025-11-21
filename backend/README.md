# 🚀 AI Interview Platform - Backend API

FastAPI-based backend for the AI-Powered Virtual Interview Assistant platform.

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration & environment variables
│   ├── db.py                # Database connection & session management
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication (register, login, JWT)
│   │   ├── interview.py     # Interview management endpoints
│   │   └── dashboard.py     # Analytics & dashboard endpoints
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── jwt.py           # JWT token creation & verification
│       └── file_storage.py  # File upload & storage handling
├── uploads/                 # User-uploaded files (auto-created)
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+ with AsyncPG
- **ORM**: SQLAlchemy 2.0 (async)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **AI Services**: Google Gemini AI, OpenAI, HuggingFace
- **File Storage**: Local filesystem (easily adaptable to S3)
- **Validation**: Pydantic v2

## 📋 Prerequisites

- Python 3.11 or higher
- PostgreSQL 15 or higher
- Redis (optional, for caching)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate virtual environment (Command Prompt)
.\venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Database

```powershell
# Install PostgreSQL (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE ai_interview_db;
\q
```

### 3. Configure Environment

```powershell
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
notepad .env
```

**Required settings in `.env`:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/ai_interview_db
SECRET_KEY=your-super-secret-key-min-32-characters-change-this
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. Initialize Database

```powershell
# The application will auto-create tables on first run
# For production, use Alembic migrations:
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5. Run the Server

```powershell
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Server will start at: **http://localhost:8000**

- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout user |

### Interviews (`/api/interviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/start` | Start new interview |
| GET | `/api/interviews` | List all interviews |
| GET | `/api/interviews/{id}` | Get interview details |
| GET | `/api/interviews/{id}/next-question` | Get next question |
| POST | `/api/interviews/{id}/questions/{qid}/submit-audio` | Submit audio answer |
| POST | `/api/interviews/{id}/questions/{qid}/submit-text` | Submit text answer |
| GET | `/api/interviews/{id}/results` | Get interview results |
| PATCH | `/api/interviews/{id}/status` | Update interview status |
| DELETE | `/api/interviews/{id}` | Delete interview |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard stats |
| GET | `/api/dashboard/analytics` | Get comprehensive analytics |
| GET | `/api/dashboard/performance-trend` | Get performance over time |
| GET | `/api/dashboard/skill-breakdown` | Get skill performance |
| GET | `/api/dashboard/interview-history` | Get interview history |
| GET | `/api/dashboard/recent-activity` | Get recent activities |
| GET | `/api/dashboard/statistics` | Get detailed statistics |

## 🧪 Testing

```powershell
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

## 📝 Example Usage

### Register User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "phone": "+1234567890"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Start Interview

```bash
curl -X POST "http://localhost:8000/api/interviews/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Senior React Developer Interview",
    "job_role": "React Developer",
    "difficulty_level": "medium"
  }'
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key (min 32 chars) | Required |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration time | 60 |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000 |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `UPLOAD_DIR` | File upload directory | uploads |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 52428800 (50MB) |

## 🚀 Production Deployment

### Using Gunicorn

```powershell
gunicorn app.main:app `
  --workers 4 `
  --worker-class uvicorn.workers.UvicornWorker `
  --bind 0.0.0.0:8000 `
  --access-logfile - `
  --error-logfile -
```

### Using Docker

```powershell
# Build image
docker build -t ai-interview-api .

# Run container
docker run -d -p 8000:8000 `
  --env-file .env `
  --name ai-interview-api `
  ai-interview-api
```

### Using Docker Compose

```powershell
docker-compose up -d
```

## 🔒 Security Best Practices

1. **Change SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Enable rate limiting** (implement with slowapi)
4. **Validate all inputs** (Pydantic handles this)
5. **Use strong passwords** (enforced in UserCreate schema)
6. **Implement CORS properly** (configure ALLOWED_ORIGINS)
7. **Regular security audits** (use safety, bandit)

## 📊 Database Migrations

```powershell
# Initialize Alembic (if not done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🐛 Troubleshooting

### Issue: Database connection failed

**Solution**: Check PostgreSQL is running and credentials are correct
```powershell
# Check PostgreSQL status
Get-Service postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-15
```

### Issue: Module not found

**Solution**: Ensure virtual environment is activated and dependencies installed
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: Port already in use

**Solution**: Change port or kill process
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

## 📈 Performance Optimization

1. **Connection Pooling**: Already configured (pool_size=10)
2. **Async Operations**: All DB operations are async
3. **Caching**: Implement Redis for frequently accessed data
4. **Database Indexing**: Add indexes to frequently queried columns
5. **CDN**: Use CDN for static file uploads

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/yourusername/ai-interview-platform/issues)
- Email: support@aiinterview.com

---

**Built with ❤️ using FastAPI**
