-- ===================================================================
-- QuizTrack Database Schema
-- Dialect: MySQL 8.0+
-- Description: Production-ready relational schema for Online Quiz Tracker
-- ===================================================================

DROP DATABASE IF EXISTS quiztrack_db;
CREATE DATABASE quiztrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiztrack_db;

-- 1. ROLES TABLE
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    xp_points INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_active_date DATE DEFAULT NULL,
    reset_password_token VARCHAR(100) DEFAULT NULL,
    reset_password_expiry TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_xp (xp_points DESC),
    INDEX idx_users_streak (current_streak DESC)
) ENGINE=InnoDB;

-- 3. USER_ROLES JUNCTION TABLE
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Folder',
    color_code VARCHAR(20) DEFAULT '#6366F1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. QUIZZES TABLE
CREATE TABLE quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    duration_minutes INT NOT NULL DEFAULT 15,
    pass_percentage DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    negative_marking BOOLEAN NOT NULL DEFAULT FALSE,
    negative_marking_deduction DECIMAL(4,2) NOT NULL DEFAULT 0.25,
    per_question_timer_seconds INT DEFAULT 0, -- 0 means disabled
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
    shuffle_options BOOLEAN NOT NULL DEFAULT TRUE,
    max_violations_allowed INT NOT NULL DEFAULT 3, -- Anti-cheat: tab-switches allowed before auto-submit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_quizzes_author FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_quizzes_published_difficulty (is_published, difficulty),
    INDEX idx_quizzes_category (category_id)
) ENGINE=InnoDB;

-- 6. QUIZ TAGS (Many-to-Many Tags)
CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE quiz_tags (
    quiz_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (quiz_id, tag_id),
    CONSTRAINT fk_quiz_tags_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. QUESTIONS TABLE
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('SINGLE', 'MULTI') NOT NULL DEFAULT 'SINGLE',
    marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    explanation TEXT,
    image_url VARCHAR(500) DEFAULT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
    INDEX idx_questions_quiz (quiz_id)
) ENGINE=InnoDB;

-- 8. OPTIONS TABLE
CREATE TABLE question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    INDEX idx_options_question (question_id)
) ENGINE=InnoDB;

-- 9. ATTEMPTS TABLE
CREATE TABLE attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TERMINATED_CHEATING') NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    total_time_seconds INT NOT NULL DEFAULT 0,
    score_obtained DECIMAL(6,2) DEFAULT 0.00,
    total_marks DECIMAL(6,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    is_passed BOOLEAN DEFAULT FALSE,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    skipped_count INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    violation_count INT NOT NULL DEFAULT 0,
    certificate_code VARCHAR(64) UNIQUE DEFAULT NULL,
    xp_awarded INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
    INDEX idx_attempts_user_status (user_id, status),
    INDEX idx_attempts_quiz_score (quiz_id, score_obtained DESC),
    INDEX idx_attempts_created (created_at DESC)
) ENGINE=InnoDB;

-- 10. ATTEMPT ANSWERS TABLE
CREATE TABLE attempt_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_ids JSON NULL, -- Array of selected option IDs e.g. [12, 14]
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN DEFAULT FALSE,
    marks_awarded DECIMAL(5,2) DEFAULT 0.00,
    time_spent_seconds INT DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_answers_attempt FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_answers_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    UNIQUE KEY uk_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB;

-- 11. BADGES TABLE
CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    xp_reward INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. USER BADGES JUNCTION TABLE
CREATE TABLE user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges (id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_badge (user_id, badge_id)
) ENGINE=InnoDB;

-- 13. ACTIVITY LOG TABLE
CREATE TABLE activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g. 'QUIZ_COMPLETED', 'BADGE_EARNED', 'LOGIN', 'PROFILE_UPDATED'
    description TEXT NOT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_activity_user_date (user_id, created_at DESC)
) ENGINE=InnoDB;

-- 14. LEADERBOARD VIEW
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    u.id AS user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.avatar_url,
    u.xp_points,
    u.current_level,
    u.current_streak,
    COUNT(DISTINCT a.id) AS total_quizzes_taken,
    COALESCE(AVG(a.percentage), 0.00) AS average_score,
    COALESCE(MAX(a.percentage), 0.00) AS best_score,
    DENSE_RANK() OVER (ORDER BY u.xp_points DESC, COALESCE(AVG(a.percentage), 0.00) DESC) AS `rank`
FROM users u
LEFT JOIN attempts a ON u.id = a.user_id AND a.status = 'COMPLETED'
WHERE u.is_blocked = FALSE AND u.is_active = TRUE
GROUP BY u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.xp_points, u.current_level, u.current_streak;
