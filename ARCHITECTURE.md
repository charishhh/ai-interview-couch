# 🏗️ System Architecture - AI Interview Assistant

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Tailwind CSS                        │  │
│  │  - Interview UI  - Dashboard  - Analytics  - Settings    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI (Python 3.11+)                                   │  │
│  │  - REST API  - WebSocket  - Auth Middleware              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │   Interview  │   Analysis   │   Scoring    │   Resume    │  │
│  │   Service    │   Service    │   Engine     │   Service   │  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                 │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │   Gemini AI  │  HuggingFace │   OpenAI     │   Speech    │  │
│  │   (Primary)  │  (Sentiment) │  (Fallback)  │   Models    │  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │  PostgreSQL  │    Redis     │     S3       │   Vector    │  │
│  │  (Primary)   │   (Cache)    │  (Files)     │    DB       │  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture (React)

```
src/
├── features/
│   ├── auth/                 # Authentication
│   ├── interview/            # Interview session management
│   ├── dashboard/            # Analytics dashboard
│   ├── resume/               # Resume analyzer
│   └── results/              # Results & feedback
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── charts/               # Chart components
│   └── layouts/              # Layout components
├── hooks/                    # Custom React hooks
├── services/                 # API services
├── store/                    # State management (Zustand/Redux)
└── utils/                    # Helper functions
```

### 2. Backend Architecture (FastAPI)

```
app/
├── api/
│   ├── v1/
│   │   ├── endpoints/        # API endpoints
│   │   └── router.py         # API router
├── core/
│   ├── config.py             # Configuration
│   ├── security.py           # Authentication
│   └── dependencies.py       # Dependencies
├── services/
│   ├── ai/                   # AI services
│   ├── interview/            # Interview logic
│   ├── analysis/             # Analysis engine
│   └── scoring/              # Scoring system
├── models/                   # Database models
├── schemas/                  # Pydantic schemas
└── db/                       # Database utilities
```

### 3. AI/ML Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  Input (Audio/Text) → Preprocessing → Model Inference   │
│                                                          │
│  1. Speech-to-Text (Whisper/Google Speech)             │
│  2. Sentiment Analysis (HuggingFace Transformers)       │
│  3. Content Analysis (Gemini AI/GPT-4)                  │
│  4. Performance Scoring (Custom ML Model)               │
│  5. Feedback Generation (Gemini AI)                     │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Interview Session Flow
```
1. User starts interview
   ↓
2. Frontend captures audio → WebSocket
   ↓
3. Backend receives audio → Speech-to-Text
   ↓
4. Text sent to Gemini AI for analysis
   ↓
5. Real-time feedback sent back → WebSocket
   ↓
6. Frontend displays feedback + scores
   ↓
7. Session data saved to PostgreSQL
   ↓
8. Generate final report & analytics
```

### Resume Analysis Flow
```
1. User uploads resume (PDF/DOCX)
   ↓
2. Backend extracts text (PyPDF2/python-docx)
   ↓
3. Text sent to Gemini AI for analysis
   ↓
4. AI generates:
   - Strengths/weaknesses
   - Keyword matching
   - ATS score
   - Improvement suggestions
   ↓
5. Results saved + displayed
```

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand or Redux Toolkit
- **API**: Axios + React Query
- **Charts**: Chart.js + Recharts
- **Audio**: Web Audio API + MediaRecorder
- **WebSocket**: Socket.io-client

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Validation**: Pydantic v2
- **Auth**: JWT + OAuth2
- **Cache**: Redis
- **Task Queue**: Celery + Redis
- **WebSocket**: python-socketio

### AI/ML
- **Primary AI**: Google Gemini AI (gemini-pro)
- **Sentiment**: HuggingFace Transformers (RoBERTa)
- **Speech-to-Text**: Whisper (OpenAI) or Google Speech
- **Fallback**: OpenAI GPT-4
- **Vector Store**: Pinecone or Qdrant (for embeddings)

### Database
- **Primary**: PostgreSQL 15+
- **Cache**: Redis 7+
- **File Storage**: AWS S3 or MinIO
- **Search**: PostgreSQL Full-Text Search

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Security Architecture

### Authentication & Authorization
```
JWT-based authentication
├── Access Token (15 min expiry)
├── Refresh Token (7 days)
├── Role-based access control (RBAC)
└── OAuth2 integration (Google, LinkedIn)
```

### Data Security
- **Encryption at Rest**: AES-256
- **Encryption in Transit**: TLS 1.3
- **Password Hashing**: Bcrypt
- **API Rate Limiting**: Redis-based
- **CORS**: Configured for frontend domain
- **Input Validation**: Pydantic schemas

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: CDN (CloudFront/CloudFlare)
- **Backend**: Multiple FastAPI instances behind load balancer
- **Database**: Read replicas for analytics
- **Cache**: Redis Cluster
- **File Storage**: S3 with CloudFront

### Performance Optimization
- **Caching Strategy**:
  - User sessions: Redis
  - Static assets: CDN
  - API responses: Redis (5-15 min TTL)
  - Database queries: Query optimization + indexes

- **Async Processing**:
  - Audio transcription: Celery task queue
  - AI analysis: Background jobs
  - Email notifications: Async tasks
  - Report generation: Scheduled jobs

## API Design

### RESTful Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/interviews
POST   /api/v1/interviews
GET    /api/v1/interviews/{id}
DELETE /api/v1/interviews/{id}

POST   /api/v1/interviews/{id}/start
POST   /api/v1/interviews/{id}/answer
POST   /api/v1/interviews/{id}/complete

POST   /api/v1/resume/upload
POST   /api/v1/resume/analyze
GET    /api/v1/resume/analysis/{id}

GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/progress
GET    /api/v1/analytics/history

GET    /api/v1/questions/generate
GET    /api/v1/questions/by-type/{type}
```

### WebSocket Events
```
// Client → Server
- interview:start
- interview:answer
- interview:pause
- interview:resume

// Server → Client
- interview:question
- interview:feedback
- interview:score
- interview:complete
```

## Database Schema (Core Tables)

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── full_name (VARCHAR)
├── role (ENUM)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

interviews
├── id (UUID, PK)
├── user_id (UUID, FK)
├── type (ENUM: technical, behavioral, hr, communication)
├── status (ENUM: pending, in_progress, completed)
├── overall_score (INTEGER)
├── duration (INTEGER)
├── created_at (TIMESTAMP)
└── completed_at (TIMESTAMP)

interview_questions
├── id (UUID, PK)
├── interview_id (UUID, FK)
├── question_text (TEXT)
├── answer_text (TEXT)
├── answer_audio_url (VARCHAR)
├── score (INTEGER)
├── feedback (TEXT)
└── created_at (TIMESTAMP)

interview_analytics
├── id (UUID, PK)
├── interview_id (UUID, FK)
├── fluency_score (INTEGER)
├── confidence_score (INTEGER)
├── clarity_score (INTEGER)
├── content_score (INTEGER)
├── filler_word_count (INTEGER)
├── emotion_data (JSONB)
└── created_at (TIMESTAMP)

resumes
├── id (UUID, PK)
├── user_id (UUID, FK)
├── file_url (VARCHAR)
├── target_role (VARCHAR)
├── analysis_result (JSONB)
├── match_score (INTEGER)
└── created_at (TIMESTAMP)
```

## Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────┐
│  CloudFlare CDN                          │
│  (Static Assets + DDoS Protection)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Load Balancer (AWS ALB/Nginx)          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Frontend (React)                        │
│  - Vercel or AWS S3 + CloudFront        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Backend (FastAPI)                       │
│  - AWS ECS/EC2 or DigitalOcean          │
│  - Auto-scaling (2-10 instances)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Database Cluster                        │
│  - PostgreSQL (AWS RDS)                  │
│  - Redis (AWS ElastiCache)               │
└─────────────────────────────────────────┘
```

## Cost Estimation (Monthly)

| Service | Estimated Cost |
|---------|----------------|
| Gemini AI API | $50-200 |
| AWS/Cloud Hosting | $100-300 |
| PostgreSQL (RDS) | $50-150 |
| Redis (ElastiCache) | $30-80 |
| S3 Storage | $10-50 |
| CDN (CloudFlare) | $20-100 |
| Domain + SSL | $2-10 |
| **Total** | **$262-890/month** |

---

**This architecture supports:**
- ✅ 1000+ concurrent users
- ✅ Sub-second response times
- ✅ 99.9% uptime
- ✅ Horizontal scalability
- ✅ Real-time analytics
- ✅ Enterprise-grade security
