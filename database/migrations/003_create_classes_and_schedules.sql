-- =========================================================
-- MIGRATION 003: CLASSES, SCHEDULES & LIVE INTEGRATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    subject_id VARCHAR(36) NOT NULL,
    grade INT NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    fee_lkr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN DEFAULT FALSE,
    capacity INT NOT NULL DEFAULT 100,
    enrolled_count INT NOT NULL DEFAULT 0,
    status ENUM('AVAILABLE', 'FULLY_BOOKED', 'UPCOMING', 'ONGOING', 'COMPLETED') DEFAULT 'AVAILABLE',
    medium ENUM('SINHALA', 'TAMIL', 'ENGLISH') DEFAULT 'ENGLISH',
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_type ENUM('BUILT_IN', 'EXTERNAL') DEFAULT 'BUILT_IN',
    external_link TEXT,
    external_platform ENUM('ZOOM', 'GOOGLE_MEET', 'MS_TEAMS'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_class_grade (grade),
    INDEX idx_class_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_schedules (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic VARCHAR(150),
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
