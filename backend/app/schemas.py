"""
Pydantic Schemas
Request/Response validation models for API endpoints
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums for validation
# ============================================================================

class DifficultyLevel(str, Enum):
    """Interview difficulty levels"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class InterviewStatus(str, Enum):
    """Interview status options"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class QuestionType(str, Enum):
    """Question types"""
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"


class Sentiment(str, Enum):
    """Sentiment analysis results"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator("password")
    def validate_password(cls, v):
        """Ensure password has minimum complexity"""
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class UserResponse(UserBase):
    """Schema for user response (without password)"""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True  # Enable ORM mode for SQLAlchemy models


# ============================================================================
# Authentication Schemas
# ============================================================================

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: int  # user_id
    email: str
    exp: datetime


# ============================================================================
# Interview Schemas
# ============================================================================

class InterviewBase(BaseModel):
    """Base interview schema"""
    title: str = Field(..., min_length=3, max_length=255)
    job_role: str = Field(..., min_length=2, max_length=255)
    difficulty_level: DifficultyLevel = DifficultyLevel.MEDIUM


class InterviewCreate(InterviewBase):
    """Schema for creating a new interview"""
    pass


class InterviewUpdate(BaseModel):
    """Schema for updating interview"""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    status: Optional[InterviewStatus] = None
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    ai_feedback: Optional[str] = None


class InterviewResponse(InterviewBase):
    """Schema for interview response"""
    id: int
    user_id: int
    status: InterviewStatus
    duration: Optional[int]
    overall_score: Optional[float]
    technical_score: Optional[float]
    communication_score: Optional[float]
    confidence_score: Optional[float]
    ai_feedback: Optional[str]
    strengths: Optional[Dict[str, Any]]
    weaknesses: Optional[Dict[str, Any]]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class InterviewSummary(BaseModel):
    """Lightweight interview summary for lists"""
    id: int
    title: str
    job_role: str
    status: InterviewStatus
    overall_score: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============================================================================
# Question Schemas
# ============================================================================

class QuestionResultBase(BaseModel):
    """Base question result schema"""
    question_text: str
    question_type: QuestionType
    question_number: int


class QuestionResultCreate(QuestionResultBase):
    """Schema for creating a question result"""
    interview_id: int


class AnswerSubmission(BaseModel):
    """Schema for submitting an answer"""
    user_answer: Optional[str] = None
    audio_file_path: Optional[str] = None
    video_file_path: Optional[str] = None
    time_taken: Optional[int] = None


class QuestionResultUpdate(BaseModel):
    """Schema for updating question result"""
    user_answer: Optional[str] = None
    transcription: Optional[str] = None
    ai_evaluation: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)
    sentiment: Optional[Sentiment] = None


class RefreshTokenRequest(BaseModel):
    """Request body for token refresh"""
    refresh_token: str


class Token(BaseModel):
    """Token response after login"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800


class QuestionResultResponse(QuestionResultBase):
    """Schema for question result response"""
    id: int
    interview_id: int
    user_answer: Optional[str]
    audio_file_path: Optional[str]
    video_file_path: Optional[str]
    transcription: Optional[str]
    ai_evaluation: Optional[str]
    expected_answer: Optional[str]
    score: Optional[float]
    relevance_score: Optional[float]
    completeness_score: Optional[float]
    clarity_score: Optional[float]
    sentiment: Optional[str]
    confidence_level: Optional[float]
    time_taken: Optional[int]
    answered_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# Resume Schemas
# ============================================================================

class ResumeBase(BaseModel):
    """Base resume schema"""
    file_name: str


class ResumeCreate(ResumeBase):
    """Schema for creating resume record"""
    file_path: str
    file_size: int
    file_type: str


class ResumeUpdate(BaseModel):
    """Schema for updating resume"""
    extracted_text: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    skill_analysis: Optional[Dict[str, Any]] = None
    experience_years: Optional[float] = None
    resume_score: Optional[float] = Field(None, ge=0, le=100)
    is_analyzed: Optional[bool] = None


class ResumeResponse(ResumeBase):
    """Schema for resume response"""
    id: int
    user_id: int
    file_path: str
    file_size: int
    file_type: str
    extracted_text: Optional[str]
    parsed_data: Optional[Dict[str, Any]]
    ai_summary: Optional[str]
    skill_analysis: Optional[Dict[str, Any]]
    experience_years: Optional[float]
    resume_score: Optional[float]
    is_active: bool
    is_analyzed: bool
    uploaded_at: datetime
    analyzed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============================================================================
# Dashboard Schemas
# ============================================================================

class DashboardStats(BaseModel):
    """Dashboard summary statistics"""
    total_interviews: int
    completed_interviews: int
    average_score: Optional[float]
    total_time_spent: int  # in seconds
    recent_interviews: List[InterviewSummary]


class SkillBreakdown(BaseModel):
    """Skill performance breakdown"""
    skill_name: str
    score: float
    count: int


class PerformanceTrend(BaseModel):
    """Performance over time"""
    date: str
    average_score: float
    interview_count: int


class AnalyticsResponse(BaseModel):
    """Complete analytics response"""
    dashboard_stats: DashboardStats
    skill_breakdown: List[SkillBreakdown]
    performance_trend: List[PerformanceTrend]
    strengths: List[str]
    areas_for_improvement: List[str]


# ============================================================================
# Generic Response Schemas
# ============================================================================

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    error_code: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
