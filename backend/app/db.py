"""
Database Module
Handles SQLAlchemy async connection to PostgreSQL
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from app.config import settings


# Create async engine for PostgreSQL
# echo=True will log all SQL queries (useful for debugging)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Allow up to 20 overflow connections
)

# Create async session factory
# expire_on_commit=False prevents SQLAlchemy from expiring objects after commit
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    All models should inherit from this class.
    """
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    
    Usage in FastAPI route:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...
    
    Yields:
        AsyncSession: Database session that will be automatically closed
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database by creating all tables.
    This should be called on application startup.
    
    Note: In production, use Alembic migrations instead of this.
    """
    async with engine.begin() as conn:
        # Import all models here to ensure they're registered
        from app.models import User, Interview, QuestionResult, Resume
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")


async def close_db() -> None:
    """
    Close database connections.
    This should be called on application shutdown.
    """
    await engine.dispose()
    print("✅ Database connections closed")
