-- =========================================================================
-- 1. DATABASE SETUP
-- This drops the entire database if it exists, creates a fresh one, 
-- and tells MySQL Workbench to use it for the following tables.
-- =========================================================================
DROP DATABASE IF EXISTS ai_adoption_tracker;
CREATE DATABASE ai_adoption_tracker;
USE ai_adoption_tracker;

-- =========================================================================
-- 2. CORE PEOPLE TABLES (Employees, Mentors, Security)
-- =========================================================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    age INT,
    gender VARCHAR(50),
    department VARCHAR(100),
    years_in_company INT,
    education_level VARCHAR(100),
    technical_role BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    competence_level INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. TRAINING & MENTORSHIP (Courses and M:N Bridge)
-- =========================================================================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    skill_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_mentors (
    mentor_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (mentor_id, course_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =========================================================================
-- 4. SURVEYS & ANALYTICS (Data Collection for Power BI)
-- =========================================================================
CREATE TABLE survey_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    wave ENUM('t0', 't1', 't2', 't3') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    campaign_id INT NOT NULL,
    ai_usage_frequency INT,
    uses_chatgpt BOOLEAN DEFAULT FALSE,
    uses_copilot BOOLEAN DEFAULT FALSE,
    prefers_human_vs_ai INT,
    open_feedback TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES survey_campaigns(id) ON DELETE CASCADE
);

CREATE TABLE roi_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    baseline_score DECIMAL(5,2),
    current_score DECIMAL(5,2),
    estimated_productivity_gain DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =========================================================================
-- 5. CHATBOT INTEGRATION (Conversations and Outcomes)
-- =========================================================================
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY, 
    employee_id INT NOT NULL,
    primary_goal VARCHAR(255),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE chat_turns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE TABLE recommendation_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    course_id INT,
    mentor_id INT,
    course_accepted BOOLEAN DEFAULT FALSE,
    time_saved_hours DECIMAL(5,2),
    cost_saved_eur DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);