-- ============================================================================
-- AI Interview Platform - PostgreSQL Schema
-- Complete database schema with tables, indexes, foreign keys, and constraints
-- ============================================================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS analysis_scores CASCADE;
DROP TABLE IF EXISTS question_results CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- Stores user authentication and profile information
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- ADMIN TABLE
-- Stores admin users with elevated permissions
-- ============================================================================
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_admin_role CHECK (role IN ('admin', 'super_admin', 'moderator'))
);

-- Indexes for admin table
CREATE INDEX idx_admin_user_id ON admin(user_id);
CREATE INDEX idx_admin_role ON admin(role);

-- ============================================================================
-- INTERVIEWS TABLE
-- Stores interview sessions and overall results
-- ============================================================================
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Interview Metadata
    title VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(50) DEFAULT 'medium' NOT NULL,
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    
    -- Duration in seconds
    duration INTEGER,
    
    -- Overall Scores (0-100)
    overall_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    confidence_score DECIMAL(5,2),
    
    -- AI Feedback
    ai_feedback TEXT,
    strengths JSONB,
    weaknesses JSONB,
    
    -- Timestamps
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_difficulty_level CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    CONSTRAINT chk_interview_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT chk_overall_score CHECK (overall_score >= 0 AND overall_score <= 100),
    CONSTRAINT chk_technical_score CHECK (technical_score >= 0 AND technical_score <= 100),
    CONSTRAINT chk_communication_score CHECK (communication_score >= 0 AND communication_score <= 100),
    CONSTRAINT chk_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- Indexes for interviews table
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX idx_interviews_job_role ON interviews(job_role);
CREATE INDEX idx_interviews_difficulty ON interviews(difficulty_level);
CREATE INDEX idx_interviews_completed_at ON interviews(completed_at DESC);

-- ============================================================================
-- INTERVIEW_QUESTIONS TABLE
-- Stores predefined interview questions by category
-- ============================================================================
CREATE TABLE interview_questions (
    id SERIAL PRIMARY KEY,
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Difficulty and Metadata
    difficulty_level VARCHAR(50) DEFAULT 'medium' NOT NULL,
    expected_answer TEXT,
    answer_keywords JSONB,
    
    -- Scoring Criteria
    max_score DECIMAL(5,2) DEFAULT 100.00,
    time_limit_seconds INTEGER DEFAULT 180,
    
    -- Question Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    
    -- Tags for filtering
    tags JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_question_type CHECK (question_type IN ('technical', 'behavioral', 'situational', 'coding', 'system_design')),
    CONSTRAINT chk_question_difficulty CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    CONSTRAINT chk_max_score CHECK (max_score > 0 AND max_score <= 100)
);

-- Indexes for interview_questions table
CREATE INDEX idx_questions_type ON interview_questions(question_type);
CREATE INDEX idx_questions_category ON interview_questions(category);
CREATE INDEX idx_questions_difficulty ON interview_questions(difficulty_level);
CREATE INDEX idx_questions_is_active ON interview_questions(is_active);
CREATE INDEX idx_questions_tags ON interview_questions USING GIN(tags);

-- ============================================================================
-- QUESTION_RESULTS TABLE
-- Stores individual question responses and analysis
-- ============================================================================
CREATE TABLE question_results (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES interview_questions(id) ON DELETE SET NULL,
    
    -- Question Details (copied for historical record)
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_number INTEGER NOT NULL,
    
    -- User Response
    user_answer TEXT,
    audio_file_path VARCHAR(500),
    video_file_path VARCHAR(500),
    
    -- Transcription
    transcription TEXT,
    transcription_confidence DECIMAL(5,2),
    
    -- AI Analysis
    ai_evaluation TEXT,
    expected_answer TEXT,
    
    -- Scoring (0-100)
    score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    technical_accuracy_score DECIMAL(5,2),
    
    -- Sentiment Analysis
    sentiment VARCHAR(50),
    confidence_level DECIMAL(5,2),
    emotion_detected VARCHAR(50),
    
    -- Keywords Analysis
    keywords_matched JSONB,
    keywords_missed JSONB,
    
    -- Timing
    time_taken INTEGER,
    
    -- Timestamps
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_question_result_type CHECK (question_type IN ('technical', 'behavioral', 'situational', 'coding', 'system_design')),
    CONSTRAINT chk_sentiment CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
    CONSTRAINT chk_result_score CHECK (score >= 0 AND score <= 100),
    CONSTRAINT chk_relevance_score CHECK (relevance_score >= 0 AND relevance_score <= 100),
    CONSTRAINT chk_completeness_score CHECK (completeness_score >= 0 AND completeness_score <= 100),
    CONSTRAINT chk_clarity_score CHECK (clarity_score >= 0 AND clarity_score <= 100),
    CONSTRAINT chk_technical_accuracy_score CHECK (technical_accuracy_score >= 0 AND technical_accuracy_score <= 100),
    CONSTRAINT chk_confidence_level CHECK (confidence_level >= 0 AND confidence_level <= 100),
    CONSTRAINT chk_transcription_confidence CHECK (transcription_confidence >= 0 AND transcription_confidence <= 100)
);

-- Indexes for question_results table
CREATE INDEX idx_results_interview_id ON question_results(interview_id);
CREATE INDEX idx_results_question_id ON question_results(question_id);
CREATE INDEX idx_results_question_type ON question_results(question_type);
CREATE INDEX idx_results_answered_at ON question_results(answered_at);
CREATE INDEX idx_results_score ON question_results(score);

-- ============================================================================
-- ANALYSIS_SCORES TABLE
-- Stores detailed analysis metrics for each question result
-- ============================================================================
CREATE TABLE analysis_scores (
    id SERIAL PRIMARY KEY,
    question_result_id INTEGER UNIQUE NOT NULL REFERENCES question_results(id) ON DELETE CASCADE,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    
    -- Communication Metrics
    fluency_score DECIMAL(5,2),
    grammar_score DECIMAL(5,2),
    vocabulary_score DECIMAL(5,2),
    pronunciation_score DECIMAL(5,2),
    
    -- Content Metrics
    depth_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    creativity_score DECIMAL(5,2),
    problem_solving_score DECIMAL(5,2),
    
    -- Behavioral Metrics
    confidence_indicator DECIMAL(5,2),
    enthusiasm_score DECIMAL(5,2),
    professionalism_score DECIMAL(5,2),
    
    -- Advanced Analysis
    filler_words_count INTEGER DEFAULT 0,
    pause_analysis JSONB,
    speaking_rate_wpm INTEGER,
    tone_analysis JSONB,
    
    -- AI Model Info
    ai_model_used VARCHAR(100),
    analysis_version VARCHAR(50),
    processing_time_ms INTEGER,
    
    -- Timestamps
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_fluency_score CHECK (fluency_score >= 0 AND fluency_score <= 100),
    CONSTRAINT chk_grammar_score CHECK (grammar_score >= 0 AND grammar_score <= 100),
    CONSTRAINT chk_vocabulary_score CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
    CONSTRAINT chk_pronunciation_score CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
    CONSTRAINT chk_depth_score CHECK (depth_score >= 0 AND depth_score <= 100),
    CONSTRAINT chk_accuracy_score CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    CONSTRAINT chk_creativity_score CHECK (creativity_score >= 0 AND creativity_score <= 100),
    CONSTRAINT chk_problem_solving_score CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
    CONSTRAINT chk_confidence_indicator CHECK (confidence_indicator >= 0 AND confidence_indicator <= 100),
    CONSTRAINT chk_enthusiasm_score CHECK (enthusiasm_score >= 0 AND enthusiasm_score <= 100),
    CONSTRAINT chk_professionalism_score CHECK (professionalism_score >= 0 AND professionalism_score <= 100)
);

-- Indexes for analysis_scores table
CREATE INDEX idx_analysis_question_result_id ON analysis_scores(question_result_id);
CREATE INDEX idx_analysis_interview_id ON analysis_scores(interview_id);
CREATE INDEX idx_analysis_fluency_score ON analysis_scores(fluency_score);
CREATE INDEX idx_analysis_analyzed_at ON analysis_scores(analyzed_at);

-- ============================================================================
-- RESUMES TABLE
-- Stores uploaded resume files and extracted data
-- ============================================================================
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    
    -- Extracted Information
    extracted_text TEXT,
    
    -- Parsed Resume Data (JSON structure)
    parsed_data JSONB,
    
    -- AI Analysis
    ai_summary TEXT,
    skill_analysis JSONB,
    experience_years DECIMAL(4,1),
    
    -- Resume Quality Score
    resume_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    format_score DECIMAL(5,2),
    
    -- Flags
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_analyzed BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    analyzed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_file_type CHECK (file_type IN ('pdf', 'doc', 'docx', 'txt')),
    CONSTRAINT chk_file_size CHECK (file_size > 0 AND file_size <= 52428800),
    CONSTRAINT chk_resume_score CHECK (resume_score >= 0 AND resume_score <= 100),
    CONSTRAINT chk_completeness_score CHECK (completeness_score >= 0 AND completeness_score <= 100),
    CONSTRAINT chk_format_score CHECK (format_score >= 0 AND format_score <= 100),
    CONSTRAINT chk_experience_years CHECK (experience_years >= 0 AND experience_years <= 99.9)
);

-- Indexes for resumes table
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_is_active ON resumes(is_active);
CREATE INDEX idx_resumes_uploaded_at ON resumes(uploaded_at DESC);
CREATE INDEX idx_resumes_parsed_data ON resumes USING GIN(parsed_data);
CREATE INDEX idx_resumes_skill_analysis ON resumes USING GIN(skill_analysis);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON admin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_questions_updated_at BEFORE UPDATE ON interview_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_results_updated_at BEFORE UPDATE ON question_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_scores_updated_at BEFORE UPDATE ON analysis_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Interview Summary with User Info
CREATE VIEW interview_summary AS
SELECT 
    i.id,
    i.title,
    i.job_role,
    i.status,
    i.overall_score,
    i.created_at,
    i.completed_at,
    u.email,
    u.full_name,
    COUNT(qr.id) as total_questions,
    COUNT(qr.id) FILTER (WHERE qr.user_answer IS NOT NULL) as answered_questions
FROM interviews i
JOIN users u ON i.user_id = u.id
LEFT JOIN question_results qr ON i.id = qr.interview_id
GROUP BY i.id, u.email, u.full_name;

-- View: User Statistics
CREATE VIEW user_statistics AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT i.id) as total_interviews,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'completed') as completed_interviews,
    AVG(i.overall_score) as average_score,
    SUM(i.duration) as total_time_spent,
    MAX(i.completed_at) as last_interview_date
FROM users u
LEFT JOIN interviews i ON u.id = i.user_id
GROUP BY u.id, u.email, u.full_name;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON TABLE admin IS 'Admin users with elevated permissions';
COMMENT ON TABLE interviews IS 'Interview sessions with overall results and feedback';
COMMENT ON TABLE interview_questions IS 'Predefined interview questions library';
COMMENT ON TABLE question_results IS 'Individual question responses and AI analysis';
COMMENT ON TABLE analysis_scores IS 'Detailed scoring metrics for each answer';
COMMENT ON TABLE resumes IS 'Uploaded resumes with AI-powered analysis';

-- ============================================================================
-- GRANT PERMISSIONS (Adjust as needed for your environment)
-- ============================================================================

-- Grant permissions to application user (replace 'app_user' with your username)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, admin, interviews, interview_questions, question_results, analysis_scores, resumes';
    RAISE NOTICE 'Indexes created: 30+ indexes for optimized queries';
    RAISE NOTICE 'Triggers created: Auto-update timestamps on all tables';
    RAISE NOTICE 'Views created: interview_summary, user_statistics';
END $$;
