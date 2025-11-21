# Database Setup Guide

This guide covers setting up the PostgreSQL database for the AI Resume Builder project with **two options**:

1. **SQLAlchemy + Alembic** (Python-native ORM, recommended for FastAPI)
2. **Prisma** (Alternative TypeScript-style ORM with Python client)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: SQLAlchemy + Alembic Setup](#option-1-sqlalchemy--alembic-setup)
- [Option 2: Prisma Setup](#option-2-prisma-setup)
- [Database Schema Overview](#database-schema-overview)
- [Seed Data](#seed-data)
- [Troubleshooting](#troubleshooting)
- [Comparison: SQLAlchemy vs Prisma](#comparison-sqlalchemy-vs-prisma)

---

## Prerequisites

### Install PostgreSQL

**Windows:**
```powershell
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql15

# Start PostgreSQL service
Start-Service postgresql-x64-15
```

**Create Database:**
```powershell
# Open psql or pgAdmin
psql -U postgres

# Inside psql:
CREATE DATABASE ai_resume_builder;
CREATE USER resume_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_resume_builder TO resume_user;
\q
```

### Configure Environment Variables

Update your `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://resume_user:your_secure_password@localhost:5432/ai_resume_builder
```

For **Prisma** (without asyncpg):
```env
DATABASE_URL=postgresql://resume_user:your_secure_password@localhost:5432/ai_resume_builder
```

---

## Option 1: SQLAlchemy + Alembic Setup

### Step 1: Initialize Alembic

```powershell
cd backend

# Initialize Alembic (creates alembic/ directory)
alembic init alembic
```

### Step 2: Configure Alembic

**Edit `alembic.ini`:**
```ini
# Find the line:
sqlalchemy.url = driver://user:pass@localhost/dbname

# Replace with:
sqlalchemy.url = postgresql+asyncpg://resume_user:your_secure_password@localhost:5432/ai_resume_builder

# Or use environment variable (recommended):
# sqlalchemy.url = 
# (then configure in env.py)
```

**Edit `alembic/env.py`:**
```python
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.db import Base
from app.models import User, Interview, InterviewQuestion, QuestionResult, AnalysisScore, Resume, Admin
from app.config import settings

# this is the Alembic Config object
config = context.config

# Override sqlalchemy.url with environment variable
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Step 3: Copy Migration Script

```powershell
# Copy the migration script to alembic/versions/
Copy-Item database\migration_001_initial.py alembic\versions\001_initial_schema.py
```

**Edit `alembic/versions/001_initial_schema.py`:**
- Ensure the filename matches: `001_initial_schema.py`
- Update the revision ID if needed: `revision = '001'`

### Step 4: Run Migrations

```powershell
# Check current database version
alembic current

# View pending migrations
alembic history

# Run all migrations (creates all tables)
alembic upgrade head

# Verify tables were created
# In psql:
# \dt
```

### Step 5: Seed the Database

```powershell
# Option A: Use psql
psql -U resume_user -d ai_resume_builder -f database/seed.sql

# Option B: Use pgAdmin
# Open pgAdmin -> Query Tool -> Load database/seed.sql -> Execute

# Option C: Python script (create seed.py)
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings

async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        with open('database/seed.sql', 'r') as f:
            sql = f.read()
        await conn.execute(sql)
    await engine.dispose()

asyncio.run(seed())
"
```

### Step 6: Verify Setup

```powershell
# Check if tables exist
psql -U resume_user -d ai_resume_builder -c "\dt"

# Check user count
psql -U resume_user -d ai_resume_builder -c "SELECT COUNT(*) FROM users;"

# Should return: 5 users

# Check interview questions count
psql -U resume_user -d ai_resume_builder -c "SELECT COUNT(*) FROM interview_questions;"

# Should return: 10 questions
```

### Creating New Migrations

```powershell
# Auto-generate migration from model changes
alembic revision --autogenerate -m "add new field"

# Create empty migration (manual)
alembic revision -m "custom migration"

# Apply migration
alembic upgrade head

# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

---

## Option 2: Prisma Setup

### Step 1: Install Prisma Client

```powershell
cd backend

# Install prisma-client-py
pip install prisma

# Or add to requirements.txt:
# prisma==0.11.0
# pip install -r requirements.txt
```

### Step 2: Copy Prisma Schema

```powershell
# Prisma schema is already created at:
# database/schema.prisma

# Copy to root directory (Prisma convention)
Copy-Item database\schema.prisma .\schema.prisma
```

### Step 3: Generate Prisma Client

```powershell
# Generate Python client from schema
prisma generate

# This creates prisma/ directory with client code
```

### Step 4: Create Database Schema

```powershell
# Option A: Use Prisma Migrate (recommended)
# Creates migration files and applies them
prisma migrate dev --name init

# Option B: Push schema without migration history
prisma db push

# Verify tables
prisma db execute --stdin < "SELECT tablename FROM pg_tables WHERE schemaname='public';"
```

### Step 5: Seed the Database

**Create `prisma/seed.py`:**
```python
import asyncio
from prisma import Prisma
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    db = Prisma()
    await db.connect()
    
    # Clear existing data (optional)
    await db.user.delete_many()
    
    # Create users
    users = [
        {
            "email": "john.doe@example.com",
            "passwordHash": pwd_context.hash("Password123!"),
            "fullName": "John Doe",
            "role": "admin",
        },
        {
            "email": "jane.smith@example.com",
            "passwordHash": pwd_context.hash("Password123!"),
            "fullName": "Jane Smith",
            "role": "user",
        },
        # Add more users...
    ]
    
    for user_data in users:
        await db.user.create(data=user_data)
    
    print("✅ Seeded users successfully!")
    
    # Create interview questions
    questions = [
        {
            "questionText": "Explain the concept of Object-Oriented Programming...",
            "questionType": "technical",
            "category": "Python",
            "difficultyLevel": "medium",
        },
        # Add more questions...
    ]
    
    for question_data in questions:
        await db.interviewquestion.create(data=question_data)
    
    print("✅ Seeded interview questions successfully!")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

**Run seed script:**
```powershell
python prisma/seed.py
```

### Step 6: Update FastAPI Application

**Replace SQLAlchemy imports with Prisma in routes:**

```python
# Instead of:
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db

# Use:
from prisma import Prisma

# Dependency:
async def get_prisma():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

# Route example:
@router.get("/users")
async def list_users(db: Prisma = Depends(get_prisma)):
    users = await db.user.find_many()
    return users
```

### Prisma Client Usage Examples

```python
from prisma import Prisma

db = Prisma()
await db.connect()

# Create user
user = await db.user.create(
    data={
        "email": "test@example.com",
        "passwordHash": "hashed_password",
        "fullName": "Test User",
    }
)

# Find user with relations
user = await db.user.find_unique(
    where={"email": "test@example.com"},
    include={"interviews": True, "resumes": True}
)

# Update user
user = await db.user.update(
    where={"id": 1},
    data={"fullName": "Updated Name"}
)

# Delete user
await db.user.delete(where={"id": 1})

# Complex query
interviews = await db.interview.find_many(
    where={
        "userId": 1,
        "status": "completed",
    },
    include={
        "questionResults": {
            "include": {
                "analysis": True
            }
        }
    },
    order_by={"createdAt": "desc"},
    take=10
)

await db.disconnect()
```

---

## Database Schema Overview

### Tables

1. **users** - User accounts and profiles
2. **admin** - Admin users with elevated permissions
3. **interviews** - Interview sessions
4. **interview_questions** - Question library
5. **question_results** - User answers and responses
6. **analysis_scores** - Detailed AI analysis metrics
7. **resumes** - Resume uploads and parsed data

### Key Relationships

```
User (1) ─→ (N) Interview
User (1) ─→ (N) Resume
User (1) ─→ (1) Admin

Interview (1) ─→ (N) QuestionResult
Interview (1) ─→ (N) AnalysisScore

InterviewQuestion (1) ─→ (N) QuestionResult

QuestionResult (1) ─→ (1) AnalysisScore
```

### Indexes

- **users**: `email` (unique)
- **interviews**: `user_id`, `status`, `created_at`
- **interview_questions**: `category`, `difficulty_level`, `is_active`
- **question_results**: `interview_id`, `question_id`
- **analysis_scores**: `question_result_id` (unique), `interview_id`
- **resumes**: `user_id`

---

## Seed Data

The `seed.sql` script includes:

### 5 Sample Users

| Email | Password | Role |
|-------|----------|------|
| john.doe@example.com | Password123! | admin |
| jane.smith@example.com | Password123! | user |
| mike.wilson@example.com | Password123! | user |
| sarah.johnson@example.com | Password123! | user |
| alex.brown@example.com | Password123! | user |

### 10 Interview Questions

**Technical (5):**
1. Object-Oriented Programming in Python
2. SQL Query Optimization
3. RESTful API Design
4. Data Structures & Algorithms
5. Cloud Platforms (AWS/Azure/GCP)

**Behavioral (5):**
1. Leadership Experience
2. Teamwork Challenges
3. Conflict Resolution
4. Deadline Pressure
5. Continuous Learning

---

## Troubleshooting

### Common Issues

#### 1. Connection Error

**Error:** `Connection refused` or `role does not exist`

**Solution:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Start if stopped
Start-Service postgresql-x64-15

# Verify connection
psql -U postgres -c "SELECT version();"

# Create missing user
psql -U postgres -c "CREATE USER resume_user WITH PASSWORD 'your_password';"
```

#### 2. Alembic Migration Fails

**Error:** `Target database is not up to date`

**Solution:**
```powershell
# Check current version
alembic current

# Stamp database to specific version
alembic stamp head

# Or start fresh (CAUTION: drops all tables)
alembic downgrade base
alembic upgrade head
```

#### 3. Prisma Generate Fails

**Error:** `Binary 'prisma' not found`

**Solution:**
```powershell
# Reinstall Prisma
pip uninstall prisma
pip install prisma --no-cache-dir

# Generate again
prisma generate
```

#### 4. Seed Script Fails

**Error:** `Foreign key constraint violation`

**Solution:**
- Ensure tables are created first
- Check insertion order (users → interviews → questions → results)
- Verify IDs match in seed data

```powershell
# Truncate all tables and re-seed
psql -U resume_user -d ai_resume_builder -c "
TRUNCATE users, admin, interviews, interview_questions, 
         question_results, analysis_scores, resumes 
         RESTART IDENTITY CASCADE;
"

# Then re-run seed script
psql -U resume_user -d ai_resume_builder -f database/seed.sql
```

#### 5. AsyncPG SSL Error

**Error:** `SSL connection has been closed unexpectedly`

**Solution:**
```env
# Add SSL mode to DATABASE_URL
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db?ssl=false
```

---

## Comparison: SQLAlchemy vs Prisma

| Feature | SQLAlchemy + Alembic | Prisma |
|---------|---------------------|--------|
| **Language** | Python-native | TypeScript-style (Python client) |
| **Learning Curve** | Moderate (ORM syntax) | Easy (intuitive API) |
| **Type Safety** | Manual typing | Auto-generated types |
| **Migrations** | Alembic (powerful) | Prisma Migrate (simple) |
| **Async Support** | ✅ Yes (AsyncSession) | ✅ Yes (native) |
| **Query Complexity** | High (raw SQL support) | Moderate (query builder) |
| **Community** | Large (Python) | Growing (multi-language) |
| **Documentation** | Extensive | Excellent |
| **FastAPI Integration** | Native | Requires adapter |
| **Best For** | Complex queries, Python devs | Rapid development, TypeScript devs |

### When to Use SQLAlchemy

- Complex SQL queries with CTEs, window functions
- Deep customization of database interactions
- Existing Python/SQLAlchemy expertise
- Need for raw SQL fallback

### When to Use Prisma

- Rapid prototyping
- TypeScript/JavaScript background
- Prefer declarative schema (schema.prisma)
- Want auto-generated client with type safety
- Simple CRUD operations

---

## Next Steps

1. **Choose your ORM**: SQLAlchemy (recommended) or Prisma
2. **Run migrations**: Create database schema
3. **Seed data**: Insert sample users and questions
4. **Test API**: Use `COMMANDS.md` for testing endpoints
5. **Start developing**: Build your interview features!

For more information:
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Python Client](https://prisma-client-py.readthedocs.io/)

---

**Questions?** Check the main `README.md` or open an issue on GitHub.
