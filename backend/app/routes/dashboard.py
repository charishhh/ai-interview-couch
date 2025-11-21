"""
Dashboard Routes
Endpoints for analytics, statistics, and user dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.db import get_db
from app.models import Interview, QuestionResult, Resume, User
from app.schemas import (
    DashboardStats,
    InterviewSummary,
    SkillBreakdown,
    PerformanceTrend,
    AnalyticsResponse
)


# Create router
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ============================================================================
# Helper function (placeholder for getting current user from JWT)
# ============================================================================

async def get_current_user_id() -> int:
    """
    Placeholder: Extract user ID from JWT token.
    In production, implement proper JWT validation.
    """
    return 1  # Placeholder


# ============================================================================
# Dashboard Summary Endpoints
# ============================================================================

@router.get("/summary", response_model=DashboardStats)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get dashboard summary statistics for current user.
    
    **Returns:**
    - **total_interviews**: Total number of interviews
    - **completed_interviews**: Number of completed interviews
    - **average_score**: Average score across all interviews
    - **total_time_spent**: Total time spent in interviews (seconds)
    - **recent_interviews**: List of 5 most recent interviews
    
    **Example Response:**
    ```json
    {
      "total_interviews": 15,
      "completed_interviews": 10,
      "average_score": 78.5,
      "total_time_spent": 45000,
      "recent_interviews": [...]
    }
    ```
    """
    
    # Get total interviews count
    result = await db.execute(
        select(func.count(Interview.id)).where(Interview.user_id == user_id)
    )
    total_interviews = result.scalar() or 0
    
    # Get completed interviews count
    result = await db.execute(
        select(func.count(Interview.id)).where(
            and_(
                Interview.user_id == user_id,
                Interview.status == "completed"
            )
        )
    )
    completed_interviews = result.scalar() or 0
    
    # Get average score
    result = await db.execute(
        select(func.avg(Interview.overall_score)).where(
            and_(
                Interview.user_id == user_id,
                Interview.overall_score.isnot(None)
            )
        )
    )
    average_score = result.scalar()
    average_score = round(average_score, 2) if average_score else None
    
    # Get total time spent
    result = await db.execute(
        select(func.sum(Interview.duration)).where(
            and_(
                Interview.user_id == user_id,
                Interview.duration.isnot(None)
            )
        )
    )
    total_time_spent = result.scalar() or 0
    
    # Get recent interviews (last 5)
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(desc(Interview.created_at))
        .limit(5)
    )
    recent_interviews = result.scalars().all()
    
    return {
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "average_score": average_score,
        "total_time_spent": total_time_spent,
        "recent_interviews": recent_interviews
    }


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get comprehensive analytics for the user.
    
    **Parameters:**
    - **days**: Number of days to include in analytics (default: 30)
    
    **Returns:**
    - **dashboard_stats**: Summary statistics
    - **skill_breakdown**: Performance by skill/topic
    - **performance_trend**: Score trends over time
    - **strengths**: Top 5 strengths
    - **areas_for_improvement**: Top 5 areas to improve
    
    **Example Response:**
    ```json
    {
      "dashboard_stats": {...},
      "skill_breakdown": [
        {"skill_name": "Python", "score": 85, "count": 10},
        {"skill_name": "React", "score": 78, "count": 8}
      ],
      "performance_trend": [
        {"date": "2024-01-15", "average_score": 75, "interview_count": 2}
      ],
      "strengths": ["Problem solving", "Code quality"],
      "areas_for_improvement": ["Time management", "Communication"]
    }
    ```
    """
    
    # Get dashboard stats
    dashboard_stats = await get_dashboard_summary(db, user_id)
    
    # Calculate date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get skill breakdown (placeholder - implement based on question types)
    # In production, parse skills from questions or job roles
    skill_breakdown = await _get_skill_breakdown(user_id, start_date, db)
    
    # Get performance trend
    performance_trend = await _get_performance_trend(user_id, start_date, db)
    
    # Get strengths and weaknesses (placeholder)
    strengths = await _get_user_strengths(user_id, db)
    areas_for_improvement = await _get_areas_for_improvement(user_id, db)
    
    return {
        "dashboard_stats": dashboard_stats,
        "skill_breakdown": skill_breakdown,
        "performance_trend": performance_trend,
        "strengths": strengths,
        "areas_for_improvement": areas_for_improvement
    }


@router.get("/performance-trend")
async def get_performance_trend(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get performance trend over time.
    
    **Parameters:**
    - **days**: Number of days to analyze (default: 30)
    
    **Returns:**
    - List of daily performance data with average scores and interview counts
    
    **Use Case:**
    - Display line chart showing score improvement over time
    - Show interview frequency
    """
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    performance_trend = await _get_performance_trend(user_id, start_date, db)
    
    return performance_trend


@router.get("/skill-breakdown")
async def get_skill_breakdown(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get performance breakdown by skills/topics.
    
    **Returns:**
    - List of skills with average scores and question counts
    
    **Use Case:**
    - Display radar chart or bar chart of skill performance
    - Identify strong and weak areas
    
    **Example:**
    ```json
    [
      {"skill_name": "Algorithms", "score": 85.5, "count": 12},
      {"skill_name": "System Design", "score": 72.0, "count": 8},
      {"skill_name": "Behavioral", "score": 90.0, "count": 15}
    ]
    ```
    """
    
    start_date = datetime.utcnow() - timedelta(days=90)
    skill_breakdown = await _get_skill_breakdown(user_id, start_date, db)
    
    return skill_breakdown


@router.get("/interview-history")
async def get_interview_history(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get paginated interview history with details.
    
    **Parameters:**
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum records to return (default: 20)
    
    **Returns:**
    - List of interviews ordered by date (newest first)
    
    **Use Case:**
    - Display interview history table
    - Show progress over time
    """
    
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(desc(Interview.created_at))
        .offset(skip)
        .limit(limit)
    )
    interviews = result.scalars().all()
    
    return interviews


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get recent activity feed for the user.
    
    **Parameters:**
    - **limit**: Number of activities to return (default: 10)
    
    **Returns:**
    - List of recent activities (interviews started, completed, etc.)
    
    **Example Response:**
    ```json
    [
      {
        "type": "interview_completed",
        "interview_id": 15,
        "title": "Senior Developer Interview",
        "score": 85.5,
        "timestamp": "2024-01-15T10:30:00"
      },
      {
        "type": "interview_started",
        "interview_id": 16,
        "title": "Frontend Interview",
        "timestamp": "2024-01-15T14:00:00"
      }
    ]
    ```
    """
    
    activities = []
    
    # Get recent interviews
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == user_id)
        .order_by(desc(Interview.updated_at))
        .limit(limit)
    )
    interviews = result.scalars().all()
    
    for interview in interviews:
        activity = {
            "interview_id": interview.id,
            "title": interview.title,
            "job_role": interview.job_role,
            "status": interview.status,
            "timestamp": interview.updated_at,
        }
        
        if interview.status == "completed":
            activity["type"] = "interview_completed"
            activity["score"] = interview.overall_score
        elif interview.status == "in_progress":
            activity["type"] = "interview_in_progress"
        else:
            activity["type"] = "interview_started"
        
        activities.append(activity)
    
    return activities


@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get detailed statistics and metrics.
    
    **Returns:**
    - Comprehensive statistics including:
      - Total interviews by status
      - Average scores by difficulty level
      - Question type performance
      - Time statistics
      - Improvement rate
    
    **Example Response:**
    ```json
    {
      "by_status": {
        "completed": 10,
        "in_progress": 2,
        "pending": 3
      },
      "by_difficulty": {
        "easy": {"count": 5, "avg_score": 88.5},
        "medium": {"count": 7, "avg_score": 75.2},
        "hard": {"count": 3, "avg_score": 65.8}
      },
      "question_types": {
        "technical": {"count": 45, "avg_score": 78.5},
        "behavioral": {"count": 30, "avg_score": 85.0}
      },
      "time_stats": {
        "total_time_minutes": 750,
        "avg_interview_minutes": 50
      }
    }
    ```
    """
    
    stats = {}
    
    # Interviews by status
    result = await db.execute(
        select(
            Interview.status,
            func.count(Interview.id).label("count")
        )
        .where(Interview.user_id == user_id)
        .group_by(Interview.status)
    )
    stats["by_status"] = {row.status: row.count for row in result}
    
    # Performance by difficulty level
    result = await db.execute(
        select(
            Interview.difficulty_level,
            func.count(Interview.id).label("count"),
            func.avg(Interview.overall_score).label("avg_score")
        )
        .where(
            and_(
                Interview.user_id == user_id,
                Interview.overall_score.isnot(None)
            )
        )
        .group_by(Interview.difficulty_level)
    )
    stats["by_difficulty"] = {
        row.difficulty_level: {
            "count": row.count,
            "avg_score": round(row.avg_score, 2) if row.avg_score else None
        }
        for row in result
    }
    
    # Question type performance
    result = await db.execute(
        select(
            QuestionResult.question_type,
            func.count(QuestionResult.id).label("count"),
            func.avg(QuestionResult.score).label("avg_score")
        )
        .join(Interview)
        .where(
            and_(
                Interview.user_id == user_id,
                QuestionResult.score.isnot(None)
            )
        )
        .group_by(QuestionResult.question_type)
    )
    stats["question_types"] = {
        row.question_type: {
            "count": row.count,
            "avg_score": round(row.avg_score, 2) if row.avg_score else None
        }
        for row in result
    }
    
    # Time statistics
    result = await db.execute(
        select(
            func.sum(Interview.duration).label("total_time"),
            func.avg(Interview.duration).label("avg_time")
        )
        .where(
            and_(
                Interview.user_id == user_id,
                Interview.duration.isnot(None)
            )
        )
    )
    row = result.one_or_none()
    if row:
        stats["time_stats"] = {
            "total_time_minutes": round(row.total_time / 60, 2) if row.total_time else 0,
            "avg_interview_minutes": round(row.avg_time / 60, 2) if row.avg_time else 0
        }
    else:
        stats["time_stats"] = {
            "total_time_minutes": 0,
            "avg_interview_minutes": 0
        }
    
    return stats


# ============================================================================
# Helper Functions
# ============================================================================

async def _get_skill_breakdown(
    user_id: int,
    start_date: datetime,
    db: AsyncSession
) -> List[SkillBreakdown]:
    """
    Calculate skill breakdown from interviews and questions.
    
    In production, extract skills from:
    - Job roles
    - Question content (using NLP)
    - User-defined tags
    """
    
    # Placeholder: Group by question_type as "skills"
    result = await db.execute(
        select(
            QuestionResult.question_type.label("skill"),
            func.count(QuestionResult.id).label("count"),
            func.avg(QuestionResult.score).label("avg_score")
        )
        .join(Interview)
        .where(
            and_(
                Interview.user_id == user_id,
                Interview.created_at >= start_date,
                QuestionResult.score.isnot(None)
            )
        )
        .group_by(QuestionResult.question_type)
    )
    
    breakdown = []
    for row in result:
        breakdown.append({
            "skill_name": row.skill.title(),
            "score": round(row.avg_score, 2) if row.avg_score else 0,
            "count": row.count
        })
    
    return breakdown


async def _get_performance_trend(
    user_id: int,
    start_date: datetime,
    db: AsyncSession
) -> List[PerformanceTrend]:
    """
    Calculate performance trend over time (daily aggregation).
    """
    
    result = await db.execute(
        select(
            func.date(Interview.completed_at).label("date"),
            func.avg(Interview.overall_score).label("avg_score"),
            func.count(Interview.id).label("count")
        )
        .where(
            and_(
                Interview.user_id == user_id,
                Interview.completed_at >= start_date,
                Interview.overall_score.isnot(None)
            )
        )
        .group_by(func.date(Interview.completed_at))
        .order_by(func.date(Interview.completed_at))
    )
    
    trend = []
    for row in result:
        trend.append({
            "date": row.date.strftime("%Y-%m-%d") if row.date else "",
            "average_score": round(row.avg_score, 2) if row.avg_score else 0,
            "interview_count": row.count
        })
    
    return trend


async def _get_user_strengths(user_id: int, db: AsyncSession) -> List[str]:
    """
    Identify user's top strengths based on high-scoring areas.
    """
    
    # Placeholder: Get question types with score > 80
    result = await db.execute(
        select(
            QuestionResult.question_type,
            func.avg(QuestionResult.score).label("avg_score")
        )
        .join(Interview)
        .where(
            and_(
                Interview.user_id == user_id,
                QuestionResult.score.isnot(None)
            )
        )
        .group_by(QuestionResult.question_type)
        .having(func.avg(QuestionResult.score) > 80)
    )
    
    strengths = [f"{row.question_type.title()} Questions" for row in result]
    
    # Add generic strengths if none found
    if not strengths:
        strengths = ["Communication", "Problem Solving", "Quick Thinking"]
    
    return strengths[:5]  # Top 5


async def _get_areas_for_improvement(user_id: int, db: AsyncSession) -> List[str]:
    """
    Identify areas where user needs improvement (low scores).
    """
    
    # Placeholder: Get question types with score < 70
    result = await db.execute(
        select(
            QuestionResult.question_type,
            func.avg(QuestionResult.score).label("avg_score")
        )
        .join(Interview)
        .where(
            and_(
                Interview.user_id == user_id,
                QuestionResult.score.isnot(None)
            )
        )
        .group_by(QuestionResult.question_type)
        .having(func.avg(QuestionResult.score) < 70)
        .order_by(func.avg(QuestionResult.score))
    )
    
    areas = [f"{row.question_type.title()} Questions" for row in result]
    
    # Add generic areas if none found
    if not areas:
        areas = ["Time Management", "Code Optimization", "System Design"]
    
    return areas[:5]  # Top 5
