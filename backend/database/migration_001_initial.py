-- ============================================================================
-- ALEMBIC MIGRATION SCRIPT
-- Initial database schema creation
-- Generated for AI Interview Platform
-- ============================================================================

"""Initial database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create all tables and indexes for the AI Interview Platform.
    """
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    
    # Create admin table
    op.create_table(
        'admin',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('permissions', postgresql.JSONB(), nullable=True, server_default="'[]'::jsonb"),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('idx_admin_user_id', 'admin', ['user_id'])
    op.create_index('idx_admin_role', 'admin', ['role'])
    
    # Create interviews table
    op.create_table(
        'interviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('job_role', sa.String(length=255), nullable=False),
        sa.Column('difficulty_level', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('overall_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('technical_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('communication_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('confidence_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('ai_feedback', sa.Text(), nullable=True),
        sa.Column('strengths', postgresql.JSONB(), nullable=True),
        sa.Column('weaknesses', postgresql.JSONB(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_interviews_user_id', 'interviews', ['user_id'])
    op.create_index('idx_interviews_status', 'interviews', ['status'])
    op.create_index('idx_interviews_created_at', 'interviews', ['created_at'])
    op.create_index('idx_interviews_job_role', 'interviews', ['job_role'])
    op.create_index('idx_interviews_difficulty', 'interviews', ['difficulty_level'])
    
    # Create interview_questions table
    op.create_table(
        'interview_questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('subcategory', sa.String(length=100), nullable=True),
        sa.Column('difficulty_level', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('expected_answer', sa.Text(), nullable=True),
        sa.Column('answer_keywords', postgresql.JSONB(), nullable=True),
        sa.Column('max_score', sa.Numeric(precision=5, scale=2), nullable=True, server_default='100.00'),
        sa.Column('time_limit_seconds', sa.Integer(), nullable=True, server_default='180'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('usage_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('tags', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_questions_type', 'interview_questions', ['question_type'])
    op.create_index('idx_questions_category', 'interview_questions', ['category'])
    op.create_index('idx_questions_difficulty', 'interview_questions', ['difficulty_level'])
    op.create_index('idx_questions_is_active', 'interview_questions', ['is_active'])
    
    # Create question_results table
    op.create_table(
        'question_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('interview_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(length=50), nullable=False),
        sa.Column('question_number', sa.Integer(), nullable=False),
        sa.Column('user_answer', sa.Text(), nullable=True),
        sa.Column('audio_file_path', sa.String(length=500), nullable=True),
        sa.Column('video_file_path', sa.String(length=500), nullable=True),
        sa.Column('transcription', sa.Text(), nullable=True),
        sa.Column('transcription_confidence', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('ai_evaluation', sa.Text(), nullable=True),
        sa.Column('expected_answer', sa.Text(), nullable=True),
        sa.Column('score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('relevance_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('completeness_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('clarity_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('technical_accuracy_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('sentiment', sa.String(length=50), nullable=True),
        sa.Column('confidence_level', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('emotion_detected', sa.String(length=50), nullable=True),
        sa.Column('keywords_matched', postgresql.JSONB(), nullable=True),
        sa.Column('keywords_missed', postgresql.JSONB(), nullable=True),
        sa.Column('time_taken', sa.Integer(), nullable=True),
        sa.Column('answered_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['interview_id'], ['interviews.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['interview_questions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_results_interview_id', 'question_results', ['interview_id'])
    op.create_index('idx_results_question_id', 'question_results', ['question_id'])
    op.create_index('idx_results_question_type', 'question_results', ['question_type'])
    
    # Create analysis_scores table
    op.create_table(
        'analysis_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_result_id', sa.Integer(), nullable=False),
        sa.Column('interview_id', sa.Integer(), nullable=False),
        sa.Column('fluency_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('grammar_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('vocabulary_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('pronunciation_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('depth_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('accuracy_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('creativity_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('problem_solving_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('confidence_indicator', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('enthusiasm_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('professionalism_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('filler_words_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('pause_analysis', postgresql.JSONB(), nullable=True),
        sa.Column('speaking_rate_wpm', sa.Integer(), nullable=True),
        sa.Column('tone_analysis', postgresql.JSONB(), nullable=True),
        sa.Column('ai_model_used', sa.String(length=100), nullable=True),
        sa.Column('analysis_version', sa.String(length=50), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('analyzed_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['question_result_id'], ['question_results.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['interview_id'], ['interviews.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question_result_id')
    )
    op.create_index('idx_analysis_question_result_id', 'analysis_scores', ['question_result_id'])
    op.create_index('idx_analysis_interview_id', 'analysis_scores', ['interview_id'])
    
    # Create resumes table
    op.create_table(
        'resumes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('parsed_data', postgresql.JSONB(), nullable=True),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('skill_analysis', postgresql.JSONB(), nullable=True),
        sa.Column('experience_years', sa.Numeric(precision=4, scale=1), nullable=True),
        sa.Column('resume_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('completeness_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('format_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_analyzed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('analyzed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_resumes_user_id', 'resumes', ['user_id'])
    op.create_index('idx_resumes_is_active', 'resumes', ['is_active'])
    op.create_index('idx_resumes_uploaded_at', 'resumes', ['uploaded_at'])


def downgrade() -> None:
    """
    Drop all tables in reverse order.
    """
    op.drop_table('resumes')
    op.drop_table('analysis_scores')
    op.drop_table('question_results')
    op.drop_table('interview_questions')
    op.drop_table('interviews')
    op.drop_table('admin')
    op.drop_table('users')
