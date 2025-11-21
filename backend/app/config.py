"""
Configuration Module
Loads environment variables and provides app-wide settings
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses pydantic-settings for validation and type safety.
    """
    
    # Application Settings
    APP_NAME: str = "AI Interview Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration
    DATABASE_URL: str
    DATABASE_URL_SYNC: str = ""
    
    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    
    # CORS Settings
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated CORS origins into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_AUDIO_EXTENSIONS: str = ".mp3,.wav,.webm,.m4a"
    ALLOWED_VIDEO_EXTENSIONS: str = ".mp4,.webm,.mov"
    ALLOWED_DOCUMENT_EXTENSIONS: str = ".pdf,.doc,.docx"
    
    @property
    def allowed_audio_exts(self) -> List[str]:
        """Parse allowed audio extensions"""
        return [ext.strip() for ext in self.ALLOWED_AUDIO_EXTENSIONS.split(",")]
    
    @property
    def allowed_video_exts(self) -> List[str]:
        """Parse allowed video extensions"""
        return [ext.strip() for ext in self.ALLOWED_VIDEO_EXTENSIONS.split(",")]
    
    @property
    def allowed_document_exts(self) -> List[str]:
        """Parse allowed document extensions"""
        return [ext.strip() for ext in self.ALLOWED_DOCUMENT_EXTENSIONS.split(",")]
    
    # AI Service Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    HUGGINGFACE_API_KEY: str = ""
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""
    
    # Email Configuration (optional)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@aiinterview.com"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Create and cache settings instance.
    Using lru_cache ensures we only load .env once.
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()


# Export settings instance for easy import
settings = get_settings()
