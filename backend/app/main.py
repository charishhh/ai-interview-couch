"""
FastAPI Application Entry Point
Main application with CORS, routers, and lifecycle events
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
from typing import AsyncIterator

from app.config import settings
from app.db import init_db, close_db
from app.utils.file_storage import ensure_upload_directory
from app.routes import auth_router, interview_router, dashboard_router


# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


# ============================================================================
# Application Lifecycle Management
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # ===== STARTUP =====
    logger.info("🚀 Starting AI Interview Platform API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    
    try:
        # Initialize database
        await init_db()
        logger.info("✅ Database initialized")
        
        # Ensure upload directories exist
        ensure_upload_directory()
        logger.info("✅ Upload directories created")
        
        # TODO: Initialize AI services
        # await initialize_gemini_client()
        # await initialize_openai_client()
        # logger.info("✅ AI services initialized")
        
        # TODO: Initialize Redis connection
        # await initialize_redis()
        # logger.info("✅ Redis connection established")
        
        logger.info("✅ Application startup complete")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise
    
    yield  # Application runs here
    
    # ===== SHUTDOWN =====
    logger.info("🛑 Shutting down AI Interview Platform API...")
    
    try:
        # Close database connections
        await close_db()
        logger.info("✅ Database connections closed")
        
        # TODO: Close AI service connections
        # await close_ai_services()
        # logger.info("✅ AI services closed")
        
        # TODO: Close Redis connection
        # await close_redis()
        # logger.info("✅ Redis connection closed")
        
        logger.info("✅ Application shutdown complete")
        
    except Exception as e:
        logger.error(f"❌ Shutdown error: {str(e)}")


# ============================================================================
# Create FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Virtual Interview Assistant API",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    openapi_url="/openapi.json",
    lifespan=lifespan,
    debug=settings.DEBUG,
)


# ============================================================================
# CORS Middleware
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers to frontend
)

logger.info(f"✅ CORS enabled for origins: {settings.cors_origins}")


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with detailed error messages.
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(f"Validation error on {request.url.path}: {errors}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected errors gracefully.
    """
    logger.error(f"Unexpected error on {request.url.path}: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# ============================================================================
# Include Routers
# ============================================================================

# Authentication routes (/api/auth/...)
app.include_router(auth_router, prefix="/api")

# Interview routes (/api/interviews/...)
app.include_router(interview_router, prefix="/api")

# Dashboard routes (/api/dashboard/...)
app.include_router(dashboard_router, prefix="/api")

logger.info("✅ All routers registered")


# ============================================================================
# Root Endpoints
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check.
    
    Returns:
        dict: API information and status
    """
    return {
        "message": "Welcome to AI Interview Platform API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns:
        dict: API health status
        
    Use Case:
        - Load balancer health checks
        - Monitoring systems
        - Kubernetes readiness/liveness probes
    """
    return {
        "status": "healthy",
        "timestamp": "2024-01-15T10:00:00Z",
        "database": "connected",  # TODO: Add actual DB health check
        "environment": settings.ENVIRONMENT
    }


@app.get("/api", tags=["Root"])
async def api_info():
    """
    API information endpoint.
    
    Returns:
        dict: Available API endpoints and documentation links
    """
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "endpoints": {
            "authentication": "/api/auth",
            "interviews": "/api/interviews",
            "dashboard": "/api/dashboard"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        }
    }


# ============================================================================
# Middleware (Optional - Add as needed)
# ============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests (optional).
    """
    logger.info(f"📨 {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"✅ {request.method} {request.url.path} - Status: {response.status_code}")
    return response


# ============================================================================
# Additional Notes
# ============================================================================

"""
Production Enhancements to Add:

1. **Rate Limiting**:
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

2. **Authentication Middleware**:
   from fastapi.security import HTTPBearer
   
   security = HTTPBearer()
   
   @app.middleware("http")
   async def authenticate_requests(request: Request, call_next):
       # Validate JWT tokens for protected routes
       ...

3. **Database Connection Pooling**:
   - Already implemented in db.py with pool_size=10

4. **Caching with Redis**:
   from redis import asyncio as aioredis
   
   @app.on_event("startup")
   async def init_redis():
       app.state.redis = await aioredis.from_url(settings.REDIS_URL)

5. **Background Tasks with Celery**:
   from celery import Celery
   
   celery_app = Celery("tasks", broker=settings.REDIS_URL)

6. **API Versioning**:
   app.include_router(auth_router, prefix="/api/v1")

7. **Request ID Tracking**:
   import uuid
   
   @app.middleware("http")
   async def add_request_id(request: Request, call_next):
       request.state.request_id = str(uuid.uuid4())
       response = await call_next(request)
       response.headers["X-Request-ID"] = request.state.request_id
       return response

8. **Prometheus Metrics**:
   from prometheus_fastapi_instrumentator import Instrumentator
   
   Instrumentator().instrument(app).expose(app)

9. **Security Headers**:
   from fastapi.middleware.trustedhost import TrustedHostMiddleware
   from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
   
   app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.example.com"])
   if not settings.DEBUG:
       app.add_middleware(HTTPSRedirectMiddleware)

10. **WebSocket Support** (for real-time interview):
    from fastapi import WebSocket
    
    @app.websocket("/ws/interview/{interview_id}")
    async def websocket_endpoint(websocket: WebSocket, interview_id: int):
        await websocket.accept()
        # Handle real-time interview communication
"""
