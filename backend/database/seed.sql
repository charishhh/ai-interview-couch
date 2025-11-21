-- ============================================================================
-- SEED DATA FOR AI INTERVIEW PLATFORM
-- Populates database with sample users and interview questions
-- ============================================================================

-- ============================================================================
-- PART 1: SEED USERS
-- Insert 5 sample users with hashed passwords
-- ============================================================================

-- Note: Passwords are hashed using bcrypt
-- Plain text passwords for reference (DO NOT use in production):
-- User1: Password123!
-- User2: SecurePass456!
-- User3: TestUser789!
-- User4: DemoPass321!
-- User5: SamplePass654!

INSERT INTO users (email, hashed_password, full_name, phone, is_active, is_verified, created_at, last_login) VALUES
-- User 1: John Doe (verified, active)
('john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5tz0.N/5hH7U2', 'John Doe', '+1-555-0101', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- User 2: Jane Smith (verified, active)
('jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5tz0.N/5hH7U2', 'Jane Smith', '+1-555-0102', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- User 3: Michael Johnson (verified, active)
('michael.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5tz0.N/5hH7U2', 'Michael Johnson', '+1-555-0103', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- User 4: Emily Davis (not verified, active)
('emily.davis@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5tz0.N/5hH7U2', 'Emily Davis', '+1-555-0104', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL),

-- User 5: Robert Wilson (verified, active)
('robert.wilson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5tz0.N/5hH7U2', 'Robert Wilson', '+1-555-0105', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Create one admin user (John Doe becomes admin)
INSERT INTO admin (user_id, role, permissions, created_at) VALUES
(1, 'super_admin', '["manage_users", "manage_questions", "view_analytics", "manage_admins"]'::jsonb, CURRENT_TIMESTAMP);

-- ============================================================================
-- PART 2: SEED INTERVIEW QUESTIONS
-- Insert 10 sample questions across different categories
-- ============================================================================

-- TECHNICAL QUESTIONS (5)
-- -------------------------

-- 1. Python/Backend Technical
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    max_score,
    time_limit_seconds,
    tags
) VALUES (
    'Explain the difference between synchronous and asynchronous programming in Python. When would you use async/await?',
    'technical',
    'Programming',
    'Python',
    'medium',
    'Synchronous programming executes code sequentially, blocking until each operation completes. Asynchronous programming allows concurrent execution using async/await, enabling non-blocking I/O operations. Use async for I/O-bound tasks like API calls, database queries, or file operations where waiting time can be utilized for other tasks.',
    '["async", "await", "non-blocking", "I/O", "concurrent", "coroutines", "event loop"]'::jsonb,
    100.00,
    240,
    '["python", "async", "programming", "backend"]'::jsonb
);

-- 2. JavaScript/Frontend Technical
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    max_score,
    time_limit_seconds,
    tags
) VALUES (
    'What is the Virtual DOM in React, and how does it improve performance?',
    'technical',
    'Frontend Development',
    'React',
    'medium',
    'The Virtual DOM is a lightweight copy of the actual DOM. React uses it to minimize direct DOM manipulations by first updating the Virtual DOM, then comparing it with the real DOM (diffing), and finally applying only the necessary changes (reconciliation). This batching and selective updating significantly improves performance.',
    '["virtual DOM", "reconciliation", "diffing", "performance", "batching", "actual DOM"]'::jsonb,
    100.00,
    180,
    '["react", "javascript", "frontend", "performance"]'::jsonb
);

-- 3. Database/SQL Technical
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    max_score,
    time_limit_seconds,
    tags
) VALUES (
    'Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL. Provide use cases for each.',
    'technical',
    'Database',
    'SQL',
    'easy',
    'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULL if no match). RIGHT JOIN returns all rows from the right table and matching rows from the left. Use INNER JOIN for strict matches, LEFT JOIN when you need all records from the primary table regardless of matches, and RIGHT JOIN (less common) when you need all records from the secondary table.',
    '["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "matching rows", "NULL", "primary table"]'::jsonb,
    100.00,
    180,
    '["sql", "database", "joins", "queries"]'::jsonb
);

-- 4. System Design Technical
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    max_score,
    time_limit_seconds,
    tags
) VALUES (
    'Design a rate limiting system for an API. What strategies would you use, and how would you implement it?',
    'technical',
    'System Design',
    'API Design',
    'hard',
    'Common strategies include: 1) Token Bucket - allows burst traffic while maintaining average rate, 2) Sliding Window - tracks requests in a time window, 3) Fixed Window - simpler but can have edge case bursts. Implementation can use Redis with INCR and EXPIRE commands, storing user_id:timestamp as keys. Include IP-based limiting, user-based limiting, and different tiers. Return 429 status when limit exceeded with Retry-After header.',
    '["token bucket", "sliding window", "fixed window", "Redis", "rate limit", "429", "burst traffic"]'::jsonb,
    100.00,
    300,
    '["system design", "api", "scalability", "redis"]'::jsonb
);

-- 5. Algorithms Technical
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    max_score,
    time_limit_seconds,
    tags
) VALUES (
    'Explain the time complexity of common sorting algorithms (Bubble Sort, Quick Sort, Merge Sort). Which would you choose for different scenarios?',
    'technical',
    'Algorithms',
    'Sorting',
    'medium',
    'Bubble Sort: O(n²) average/worst, O(n) best - simple but inefficient for large datasets. Quick Sort: O(n log n) average, O(n²) worst - fast in-place sorting, good for most cases. Merge Sort: O(n log n) all cases - stable sort, good for linked lists and when stability matters. Choose Quick Sort for general purpose, Merge Sort when stability is required, and consider built-in sorts (Timsort in Python) for production.',
    '["time complexity", "O(n²)", "O(n log n)", "Quick Sort", "Merge Sort", "stable sort", "in-place"]'::jsonb,
    100.00,
    240,
    '["algorithms", "sorting", "big-o", "complexity"]'::jsonb
);

-- BEHAVIORAL QUESTIONS (5)
-- -------------------------

-- 6. Teamwork Behavioral
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    time_limit_seconds,
    tags
) VALUES (
    'Tell me about a time when you had a conflict with a team member. How did you resolve it?',
    'behavioral',
    'Teamwork',
    'Conflict Resolution',
    'medium',
    'Expected to use STAR method (Situation, Task, Action, Result). Should demonstrate: active listening, empathy, clear communication, willingness to compromise, focus on project goals rather than personal issues, and positive outcome.',
    '["STAR method", "communication", "compromise", "resolution", "team", "listening"]'::jsonb,
    180,
    '["behavioral", "teamwork", "conflict", "soft skills"]'::jsonb
);

-- 7. Leadership Behavioral
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    time_limit_seconds,
    tags
) VALUES (
    'Describe a situation where you had to lead a project or team. What was your approach and what was the outcome?',
    'behavioral',
    'Leadership',
    'Project Management',
    'medium',
    'Should demonstrate: clear vision and goal setting, delegation skills, motivation of team members, handling challenges, tracking progress, adapting to changes, and measurable positive outcomes. Use STAR method.',
    '["leadership", "delegation", "goals", "motivation", "outcome", "project management", "team"]'::jsonb,
    180,
    '["behavioral", "leadership", "management", "soft skills"]'::jsonb
);

-- 8. Problem Solving Behavioral
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    time_limit_seconds,
    tags
) VALUES (
    'Tell me about a time when you faced a challenging technical problem. How did you approach it and what was the solution?',
    'behavioral',
    'Problem Solving',
    'Technical Challenges',
    'medium',
    'Should include: problem breakdown, research methodology, considering multiple solutions, testing approaches, collaboration with others if needed, learning from the experience, and successful resolution with impact measurement.',
    '["problem solving", "analysis", "research", "solution", "testing", "impact", "learning"]'::jsonb,
    180,
    '["behavioral", "problem-solving", "technical", "critical thinking"]'::jsonb
);

-- 9. Failure/Learning Behavioral
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    time_limit_seconds,
    tags
) VALUES (
    'Tell me about a time when you failed or made a mistake. What did you learn from it?',
    'behavioral',
    'Learning & Growth',
    'Self-Improvement',
    'medium',
    'Should demonstrate: taking responsibility, honest reflection, specific lessons learned, concrete actions taken to prevent recurrence, growth mindset, and how the experience made them better professionally.',
    '["responsibility", "learning", "growth", "improvement", "reflection", "accountability", "mistake"]'::jsonb,
    180,
    '["behavioral", "learning", "failure", "growth mindset"]'::jsonb
);

-- 10. Time Management Behavioral
INSERT INTO interview_questions (
    question_text, 
    question_type, 
    category, 
    subcategory,
    difficulty_level, 
    expected_answer, 
    answer_keywords,
    time_limit_seconds,
    tags
) VALUES (
    'Describe a situation where you had to manage multiple competing priorities. How did you handle it?',
    'behavioral',
    'Time Management',
    'Prioritization',
    'medium',
    'Should show: prioritization framework (urgent vs important), communication with stakeholders about tradeoffs, time management techniques, ability to say no when necessary, delegation if possible, and successful delivery of most critical items.',
    '["prioritization", "time management", "urgent", "important", "stakeholders", "communication", "delivery"]'::jsonb,
    180,
    '["behavioral", "time management", "prioritization", "productivity"]'::jsonb
);

-- ============================================================================
-- PART 3: CREATE SAMPLE INTERVIEW SESSIONS (OPTIONAL)
-- ============================================================================

-- Sample interview for John Doe
INSERT INTO interviews (
    user_id,
    title,
    job_role,
    difficulty_level,
    status,
    duration,
    overall_score,
    technical_score,
    communication_score,
    confidence_score,
    ai_feedback,
    strengths,
    weaknesses,
    started_at,
    completed_at,
    created_at
) VALUES (
    1,
    'Senior Full Stack Developer Position',
    'Full Stack Developer',
    'hard',
    'completed',
    2400,
    85.50,
    88.00,
    84.00,
    84.50,
    'Strong technical knowledge with excellent problem-solving skills. Communication was clear and concise. Demonstrated good understanding of system design principles.',
    '["Technical expertise", "Problem solving", "Clear communication", "System design knowledge"]'::jsonb,
    '["Could improve on explaining trade-offs", "More specific examples would help"]'::jsonb,
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '40 minutes',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
);

-- Sample interview for Jane Smith
INSERT INTO interviews (
    user_id,
    title,
    job_role,
    difficulty_level,
    status,
    duration,
    overall_score,
    technical_score,
    communication_score,
    confidence_score,
    ai_feedback,
    strengths,
    weaknesses,
    started_at,
    completed_at,
    created_at
) VALUES (
    2,
    'Frontend Developer Interview',
    'Frontend Developer',
    'medium',
    'completed',
    1800,
    92.00,
    90.00,
    95.00,
    91.00,
    'Excellent communication skills and strong grasp of React concepts. Very articulate in explaining technical decisions. Great enthusiasm and confidence.',
    '["Excellent communication", "React expertise", "Enthusiasm", "Clear explanations"]'::jsonb,
    '["Could dive deeper into performance optimization"]'::jsonb,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '30 minutes',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
);

-- Sample in-progress interview for Michael Johnson
INSERT INTO interviews (
    user_id,
    title,
    job_role,
    difficulty_level,
    status,
    started_at,
    created_at
) VALUES (
    3,
    'Backend Engineer Position',
    'Backend Engineer',
    'medium',
    'in_progress',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
);

-- ============================================================================
-- DISPLAY SUMMARY
-- ============================================================================

DO $$ 
DECLARE
    user_count INTEGER;
    question_count INTEGER;
    interview_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO question_count FROM interview_questions;
    SELECT COUNT(*) INTO interview_count FROM interviews;
    
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - Users created: %', user_count;
    RAISE NOTICE '   - Interview questions created: %', question_count;
    RAISE NOTICE '   - Sample interviews created: %', interview_count;
    RAISE NOTICE '';
    RAISE NOTICE '👥 Sample Users (email / password):';
    RAISE NOTICE '   1. john.doe@example.com / Password123!';
    RAISE NOTICE '   2. jane.smith@example.com / SecurePass456!';
    RAISE NOTICE '   3. michael.johnson@example.com / TestUser789!';
    RAISE NOTICE '   4. emily.davis@example.com / DemoPass321!';
    RAISE NOTICE '   5. robert.wilson@example.com / SamplePass654!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Admin User: john.doe@example.com (super_admin role)';
END $$;
