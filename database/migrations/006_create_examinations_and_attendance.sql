-- =========================================================
-- MIGRATION 006: EXAMINATIONS, QUESTIONS, RESULTS & ATTENDANCE
-- =========================================================

CREATE TABLE IF NOT EXISTS examination_papers (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    grade INT NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    exam_category ENUM('FIRST_TERM', 'SECOND_TERM', 'THIRD_TERM', 'MODEL_PAPERS', 'MONTHLY_TESTS', 'REVISION_PAPERS', 'PAST_PAPERS') NOT NULL,
    term ENUM('FIRST', 'SECOND', 'THIRD', 'ALL') DEFAULT 'ALL',
    academic_year INT NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    duration_minutes INT NOT NULL DEFAULT 60,
    scheduled_date DATE,
    instructions TEXT,
    pdf_file_url TEXT,
    has_online_quiz BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ep_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ep_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS examination_questions (
    id VARCHAR(36) PRIMARY KEY,
    paper_id VARCHAR(36) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY') NOT NULL,
    options JSON,
    correct_answer TEXT,
    allocated_marks INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_eq_paper FOREIGN KEY (paper_id) REFERENCES examination_papers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS examination_submissions (
    id VARCHAR(36) PRIMARY KEY,
    paper_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    obtained_marks DECIMAL(5,2),
    status ENUM('SUBMITTED', 'MARKED', 'PENDING') DEFAULT 'SUBMITTED',
    feedback TEXT,
    submission_file_url TEXT,
    CONSTRAINT fk_es_paper FOREIGN KEY (paper_id) REFERENCES examination_papers(id) ON DELETE CASCADE,
    CONSTRAINT fk_es_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_paper (paper_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS examination_answers (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    student_answer TEXT,
    is_correct BOOLEAN,
    awarded_marks DECIMAL(5,2),
    CONSTRAINT fk_ea_submission FOREIGN KEY (submission_id) REFERENCES examination_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_question FOREIGN KEY (question_id) REFERENCES examination_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS examination_results (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL UNIQUE,
    student_id VARCHAR(36) NOT NULL,
    paper_id VARCHAR(36) NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    grade_letter VARCHAR(5) NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_er_submission FOREIGN KEY (submission_id) REFERENCES examination_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_er_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    session_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') DEFAULT 'PRESENT',
    marked_by VARCHAR(36) NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_att_class_student_date (class_id, student_id, session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
