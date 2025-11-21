"""
Database Models (ORM)
SQLAlchemy models for all database tables with complete relationships
"""

from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from app.db import Base


class User(Base):
    """
    User model for authentication and profile management.
    Stores user credentials, profile info, and timestamps.
    """
    __tablename__ = "users"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile Information
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Account Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships (one-to-many)
    interviews: Mapped[List["Interview"]] = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    admin: Mapped[Optional["Admin"]] = relationship("Admin", back_populates="user", cascade="all, delete-orphan", uselist=False)
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, name={self.full_name})>"


class Admin(Base):
    """
    Admin model for users with elevated permissions.
    Links to User table with one-to-one relationship.
    """
    __tablename__ = "admin"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Key to User (one-to-one)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Admin Details
    role: Mapped[str] = mapped_column(String(50), default="admin", nullable=False)  # admin, super_admin, moderator
    permissions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # JSON array of permissions
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="admin")
    
    def __repr__(self) -> str:
        return f"<Admin(id={self.id}, user_id={self.user_id}, role={self.role})>"


class Interview(Base):
    """
    Interview model to store interview sessions.
    Tracks interview metadata, status, and overall results.
    """
    __tablename__ = "interviews"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Key to User
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Interview Metadata
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_role: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)  # easy, medium, hard
    
    # Interview Status
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, in_progress, completed, cancelled
    
    # Duration (in seconds)
    duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Results & Scoring (Decimal for precision)
    overall_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)  # 0-100
    technical_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    communication_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # AI Feedback
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strengths: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # Store as JSONB
    weaknesses: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # Store as JSONB
    
    # Timestamps
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="interviews")
    questions: Mapped[List["QuestionResult"]] = relationship("QuestionResult", back_populates="interview", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Interview(id={self.id}, title={self.title}, status={self.status})>"


class InterviewQuestion(Base):
    """
    InterviewQuestion model for the question library.
    Stores predefined interview questions by category.
    """
    __tablename__ = "interview_questions"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Question Content
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # technical, behavioral, situational, coding, system_design
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Difficulty and Metadata
    difficulty_level: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)  # easy, medium, hard
    expected_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_keywords: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # JSON array of keywords
    
    # Scoring Criteria
    max_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), default=100.00, nullable=True)
    time_limit_seconds: Mapped[Optional[int]] = mapped_column(Integer, default=180, nullable=True)
    
    # Question Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    usage_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Tags for filtering
    tags: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # JSON array of tags
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    question_results: Mapped[List["QuestionResult"]] = relationship("QuestionResult", back_populates="question")
    
    def __repr__(self) -> str:
        return f"<InterviewQuestion(id={self.id}, type={self.question_type}, category={self.category})>"


class QuestionResult(Base):
    """
    QuestionResult model to store individual question responses.
    Each question in an interview has one result entry.
    """
    __tablename__ = "question_results"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    interview_id: Mapped[int] = mapped_column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("interview_questions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Question Details (copied for historical record)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # technical, behavioral, situational
    question_number: Mapped[int] = mapped_column(Integer, nullable=False)  # Order in interview
    
    # User Response
    user_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audio_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    video_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Transcription (from speech-to-text)
    transcription: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transcription_confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # AI Analysis
    ai_evaluation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Scoring (0-100) with Decimal precision
    score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    relevance_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    completeness_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    clarity_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    technical_accuracy_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Sentiment Analysis
    sentiment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # positive, neutral, negative, mixed
    confidence_level: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)  # 0-100
    emotion_detected: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Keywords Analysis
    keywords_matched: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    keywords_missed: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    # Timing
    time_taken: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # seconds
    
    # Timestamps
    answered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    interview: Mapped["Interview"] = relationship("Interview", back_populates="questions")
    question: Mapped[Optional["InterviewQuestion"]] = relationship("InterviewQuestion", back_populates="question_results")
    analysis: Mapped[Optional["AnalysisScore"]] = relationship("AnalysisScore", back_populates="question_result", cascade="all, delete-orphan", uselist=False)
    
    def __repr__(self) -> str:
        return f"<QuestionResult(id={self.id}, question_number={self.question_number}, score={self.score})>"


class AnalysisScore(Base):
    """
    AnalysisScore model for detailed analysis metrics.
    Stores comprehensive scoring for each question result.
    """
    __tablename__ = "analysis_scores"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    question_result_id: Mapped[int] = mapped_column(Integer, ForeignKey("question_results.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    interview_id: Mapped[int] = mapped_column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Communication Metrics (0-100)
    fluency_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    grammar_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    vocabulary_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    pronunciation_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Content Metrics (0-100)
    depth_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    accuracy_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    creativity_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    problem_solving_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Behavioral Metrics (0-100)
    confidence_indicator: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    enthusiasm_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    professionalism_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Advanced Analysis
    filler_words_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pause_analysis: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    speaking_rate_wpm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tone_analysis: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    # AI Model Info
    ai_model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    analysis_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    processing_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    question_result: Mapped["QuestionResult"] = relationship("QuestionResult", back_populates="analysis")
    interview: Mapped["Interview"] = relationship("Interview")
    
    def __repr__(self) -> str:
        return f"<AnalysisScore(id={self.id}, question_result_id={self.question_result_id}, fluency={self.fluency_score})>"


class Resume(Base):
    """
    Resume model to store uploaded resume files and extracted data.
    Supports AI-powered resume analysis.
    """
    __tablename__ = "resumes"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Key to User
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # File Information
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)  # bytes
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf, doc, docx
    
    # Extracted Information
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Parsed Resume Data (stored as JSONB)
    parsed_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # Example structure:
    # {
    #   "name": "John Doe",
    #   "email": "john@example.com",
    #   "phone": "+1234567890",
    #   "skills": ["Python", "FastAPI", "React"],
    #   "experience": [...],
    #   "education": [...],
    #   "certifications": [...]
    # }
    
    # AI Analysis
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skill_analysis: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    experience_years: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 1), nullable=True)
    
    # Resume Scores (0-100)
    resume_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    completeness_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    format_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_analyzed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Timestamps
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resumes")
    
    def __repr__(self) -> str:
        return f"<Resume(id={self.id}, file_name={self.file_name}, user_id={self.user_id})>"
