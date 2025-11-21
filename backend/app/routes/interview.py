"""
Interview Routes
Endpoints for managing interview sessions, questions, and responses
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from typing import List, Optional
from app.db import get_db
from app.models import Interview, QuestionResult, User
from app.schemas import (
    InterviewCreate, 
    InterviewResponse, 
    InterviewSummary,
    QuestionResultCreate,
    QuestionResultResponse,
    AnswerSubmission,
    MessageResponse
)
from app.utils.file_storage import save_audio_file, save_video_file


# Create router
router = APIRouter(prefix="/interviews", tags=["Interviews"])


# ============================================================================
# Helper function (placeholder for getting current user from JWT)
# ============================================================================

async def get_current_user_id() -> int:
    """
    Placeholder: Extract user ID from JWT token.
    In production, implement proper JWT validation.
    
    Returns:
        int: Current user's ID
    """
    # TODO: Implement JWT token validation
    # from app.utils.jwt import get_user_id_from_token
    # return get_user_id_from_token(token)
    return 1  # Placeholder - returns user_id 1 for testing


# ============================================================================
# Interview Management Endpoints
# ============================================================================

@router.post("/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(
    interview_data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Start a new interview session.
    
    **Parameters:**
    - **title**: Interview title (e.g., "Frontend Developer Interview")
    - **job_role**: Job position (e.g., "Senior React Developer")
    - **difficulty_level**: easy | medium | hard
    
    **Returns:**
    - Created interview object with ID and initial status
    
    **Process:**
    1. Creates interview record in database
    2. Sets status to "pending"
    3. Generates initial questions (implement AI question generation)
    4. Returns interview details
    """
    
    # Create new interview
    new_interview = Interview(
        user_id=user_id,
        title=interview_data.title,
        job_role=interview_data.job_role,
        difficulty_level=interview_data.difficulty_level,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_interview)
    await db.commit()
    await db.refresh(new_interview)
    
    # TODO: Generate initial questions using AI
    # await generate_interview_questions(new_interview.id, job_role, difficulty_level)
    
    return new_interview


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get interview details by ID.
    
    **Parameters:**
    - **interview_id**: Interview ID
    
    **Returns:**
    - Complete interview details including scores and feedback
    
    **Raises:**
    - **404**: Interview not found
    - **403**: Unauthorized (interview belongs to another user)
    """
    
    # Query interview
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found or access denied"
        )
    
    return interview


@router.get("/", response_model=List[InterviewSummary])
async def list_interviews(
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    List all interviews for current user.
    
    **Parameters:**
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **status_filter**: Filter by status (pending, in_progress, completed, cancelled)
    
    **Returns:**
    - List of interview summaries
    """
    
    # Build query
    query = select(Interview).where(Interview.user_id == user_id)
    
    # Apply status filter if provided
    if status_filter:
        query = query.where(Interview.status == status_filter)
    
    # Apply pagination and ordering
    query = query.order_by(Interview.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    interviews = result.scalars().all()
    
    return interviews


@router.patch("/{interview_id}/status", response_model=InterviewResponse)
async def update_interview_status(
    interview_id: int,
    new_status: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Update interview status.
    
    **Parameters:**
    - **interview_id**: Interview ID
    - **new_status**: New status (pending, in_progress, completed, cancelled)
    
    **Returns:**
    - Updated interview object
    
    **Raises:**
    - **404**: Interview not found
    - **400**: Invalid status transition
    """
    
    # Get interview
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Update status
    interview.status = new_status
    interview.updated_at = datetime.utcnow()
    
    # Set timestamps based on status
    if new_status == "in_progress" and not interview.started_at:
        interview.started_at = datetime.utcnow()
    elif new_status == "completed" and not interview.completed_at:
        interview.completed_at = datetime.utcnow()
        # Calculate duration
        if interview.started_at:
            duration = (interview.completed_at - interview.started_at).total_seconds()
            interview.duration = int(duration)
    
    await db.commit()
    await db.refresh(interview)
    
    return interview


# ============================================================================
# Question & Answer Endpoints
# ============================================================================

@router.post("/{interview_id}/questions", response_model=QuestionResultResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    interview_id: int,
    question_data: QuestionResultCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Add a question to an interview.
    
    **Parameters:**
    - **interview_id**: Interview ID
    - **question_text**: Question text
    - **question_type**: technical | behavioral | situational
    - **question_number**: Order in the interview
    
    **Returns:**
    - Created question result object
    
    **Raises:**
    - **404**: Interview not found
    """
    
    # Verify interview exists and belongs to user
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Create question
    new_question = QuestionResult(
        interview_id=interview_id,
        question_text=question_data.question_text,
        question_type=question_data.question_type,
        question_number=question_data.question_number,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_question)
    await db.commit()
    await db.refresh(new_question)
    
    return new_question


@router.get("/{interview_id}/next-question", response_model=QuestionResultResponse)
async def get_next_question(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get the next unanswered question in the interview.
    
    **Parameters:**
    - **interview_id**: Interview ID
    
    **Returns:**
    - Next question to be answered
    
    **Raises:**
    - **404**: Interview not found or no more questions
    
    **Logic:**
    1. Find first question without user_answer
    2. If all questions answered, return 404
    3. Update interview status to "in_progress" if pending
    """
    
    # Verify interview
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Find next unanswered question
    result = await db.execute(
        select(QuestionResult)
        .where(
            and_(
                QuestionResult.interview_id == interview_id,
                QuestionResult.user_answer == None
            )
        )
        .order_by(QuestionResult.question_number)
    )
    next_question = result.scalars().first()
    
    if not next_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No more questions available"
        )
    
    # Update interview status to in_progress if pending
    if interview.status == "pending":
        interview.status = "in_progress"
        interview.started_at = datetime.utcnow()
        await db.commit()
    
    return next_question


@router.post("/{interview_id}/questions/{question_id}/submit-audio", response_model=QuestionResultResponse)
async def submit_audio_answer(
    interview_id: int,
    question_id: int,
    audio_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Submit audio answer for a question.
    
    **Parameters:**
    - **interview_id**: Interview ID
    - **question_id**: Question ID
    - **audio_file**: Audio file (mp3, wav, webm, m4a)
    
    **Returns:**
    - Updated question result with audio file path
    
    **Process:**
    1. Save audio file to storage
    2. Transcribe audio using speech-to-text (Whisper)
    3. Analyze answer using AI
    4. Calculate score
    5. Update question result
    
    **Raises:**
    - **404**: Interview or question not found
    - **415**: Unsupported audio format
    - **413**: File too large
    """
    
    # Verify question belongs to interview and user
    result = await db.execute(
        select(QuestionResult)
        .join(Interview)
        .where(
            and_(
                QuestionResult.id == question_id,
                QuestionResult.interview_id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Save audio file
    file_path, file_size = await save_audio_file(audio_file, user_id)
    
    # Update question with audio path
    question.audio_file_path = file_path
    question.answered_at = datetime.utcnow()
    question.updated_at = datetime.utcnow()
    
    # TODO: Implement AI processing
    # 1. Transcribe audio: transcription = await transcribe_audio(file_path)
    # 2. Analyze answer: evaluation = await analyze_answer(question.question_text, transcription)
    # 3. Calculate score: score = await calculate_score(evaluation)
    # 4. Update question with results
    
    # Placeholder values
    question.transcription = "Audio transcription will be processed here..."
    question.user_answer = "Transcribed answer..."
    
    await db.commit()
    await db.refresh(question)
    
    return question


@router.post("/{interview_id}/questions/{question_id}/submit-text", response_model=QuestionResultResponse)
async def submit_text_answer(
    interview_id: int,
    question_id: int,
    answer_data: AnswerSubmission,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Submit text answer for a question.
    
    **Parameters:**
    - **interview_id**: Interview ID
    - **question_id**: Question ID
    - **user_answer**: Text answer
    - **time_taken**: Time taken to answer (seconds)
    
    **Returns:**
    - Updated question result with AI evaluation and score
    
    **Process:**
    1. Save text answer
    2. Analyze answer using AI (Gemini/OpenAI)
    3. Calculate relevance, completeness, clarity scores
    4. Perform sentiment analysis
    5. Generate feedback
    """
    
    # Verify question
    result = await db.execute(
        select(QuestionResult)
        .join(Interview)
        .where(
            and_(
                QuestionResult.id == question_id,
                QuestionResult.interview_id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update question with answer
    question.user_answer = answer_data.user_answer
    question.time_taken = answer_data.time_taken
    question.answered_at = datetime.utcnow()
    question.updated_at = datetime.utcnow()
    
    # TODO: Implement AI analysis
    # evaluation, scores = await analyze_text_answer(
    #     question_text=question.question_text,
    #     user_answer=answer_data.user_answer,
    #     question_type=question.question_type
    # )
    # question.ai_evaluation = evaluation
    # question.score = scores['overall']
    # question.relevance_score = scores['relevance']
    # question.completeness_score = scores['completeness']
    # question.clarity_score = scores['clarity']
    # question.sentiment = scores['sentiment']
    
    # Placeholder
    question.score = 75.0
    question.ai_evaluation = "AI evaluation will be generated here..."
    
    await db.commit()
    await db.refresh(question)
    
    return question


@router.get("/{interview_id}/results", response_model=InterviewResponse)
async def get_interview_results(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get complete interview results with all questions and scores.
    
    **Parameters:**
    - **interview_id**: Interview ID
    
    **Returns:**
    - Complete interview with calculated scores and AI feedback
    
    **Process:**
    1. Get interview and all questions
    2. Calculate overall scores (average of all questions)
    3. Calculate category scores (technical, communication, confidence)
    4. Generate AI feedback summary
    5. Identify strengths and weaknesses
    """
    
    # Get interview
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Get all questions
    result = await db.execute(
        select(QuestionResult).where(QuestionResult.interview_id == interview_id)
    )
    questions = result.scalars().all()
    
    # Calculate overall score
    if questions:
        scores = [q.score for q in questions if q.score is not None]
        if scores:
            interview.overall_score = sum(scores) / len(scores)
            
            # TODO: Calculate category-specific scores
            # interview.technical_score = calculate_technical_score(questions)
            # interview.communication_score = calculate_communication_score(questions)
            # interview.confidence_score = calculate_confidence_score(questions)
            
            # Placeholder
            interview.technical_score = interview.overall_score * 0.95
            interview.communication_score = interview.overall_score * 1.05
            interview.confidence_score = interview.overall_score * 0.98
    
    # Generate AI feedback
    # interview.ai_feedback = await generate_interview_feedback(interview, questions)
    interview.ai_feedback = "Overall feedback: Great performance! Continue practicing..."
    
    interview.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(interview)
    
    return interview


@router.delete("/{interview_id}", response_model=MessageResponse)
async def delete_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Delete an interview and all associated data.
    
    **Parameters:**
    - **interview_id**: Interview ID
    
    **Returns:**
    - Success message
    
    **Raises:**
    - **404**: Interview not found
    
    **Note:** This will cascade delete all questions and uploaded files.
    """
    
    # Get interview
    result = await db.execute(
        select(Interview).where(
            and_(
                Interview.id == interview_id,
                Interview.user_id == user_id
            )
        )
    )
    interview = result.scalar_one_or_none()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Delete interview (cascade will handle questions)
    await db.delete(interview)
    await db.commit()
    
    # TODO: Delete associated files from storage
    # for question in interview.questions:
    #     if question.audio_file_path:
    #         delete_file(question.audio_file_path)
    #     if question.video_file_path:
    #         delete_file(question.video_file_path)
    
    return {
        "message": f"Interview {interview_id} deleted successfully",
        "success": True
    }
