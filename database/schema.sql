-- ============================================================
-- शहीद राम सिंह विद्यालय — Smart School ERP
-- PostgreSQL Database Schema v1.0
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'student');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE exam_type AS ENUM ('unit_test', 'monthly', 'quarterly', 'half_yearly', 'annual', 'practical');
CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'overdue', 'waived', 'partial');
CREATE TYPE notification_type AS ENUM ('attendance', 'homework', 'fee', 'exam', 'announcement', 'result', 'general');
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app');
CREATE TYPE homework_status AS ENUM ('assigned', 'submitted', 'graded', 'overdue');
CREATE TYPE admission_status AS ENUM ('active', 'inactive', 'transferred', 'graduated', 'suspended');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users (base authentication table for all roles)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    refresh_token   TEXT,
    fcm_token       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- Academic Years
CREATE TABLE academic_years (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(20) NOT NULL,           -- e.g. "2024-25"
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_current  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_academic_years_current ON academic_years(is_current) WHERE is_current = TRUE;

-- Classes (e.g., Class 1, Class 2, ... Class 12)
CREATE TABLE classes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id    UUID REFERENCES academic_years(id),
    name                VARCHAR(50) NOT NULL,    -- "Class 1", "Class 10"
    numeric_level       SMALLINT NOT NULL,       -- 1–12
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_year ON classes(academic_year_id);

-- Sections (e.g., A, B, C per class)
CREATE TABLE sections (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id            UUID NOT NULL REFERENCES classes(id),
    name                VARCHAR(10) NOT NULL,    -- "A", "B"
    capacity            SMALLINT DEFAULT 40,
    room_number         VARCHAR(20),
    class_teacher_id    UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_class ON sections(class_id);

-- Subjects
CREATE TABLE subjects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    name_hindi      VARCHAR(100),
    description     TEXT,
    max_marks       SMALLINT DEFAULT 100,
    passing_marks   SMALLINT DEFAULT 33,
    is_practical    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Class-Subject mapping (which subjects are taught in which class)
CREATE TABLE class_subjects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id        UUID NOT NULL REFERENCES classes(id),
    subject_id      UUID NOT NULL REFERENCES subjects(id),
    teacher_id      UUID REFERENCES users(id),
    weekly_periods  SMALLINT DEFAULT 5,
    UNIQUE(class_id, subject_id)
);

CREATE INDEX idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_teacher ON class_subjects(teacher_id);

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    admission_number    VARCHAR(30) UNIQUE NOT NULL,
    roll_number         VARCHAR(20),
    section_id          UUID REFERENCES sections(id),
    date_of_birth       DATE NOT NULL,
    gender              gender_type NOT NULL,
    blood_group         VARCHAR(5),
    aadhar_number       VARCHAR(20),
    religion            VARCHAR(50),
    caste               VARCHAR(50),
    nationality         VARCHAR(50) DEFAULT 'Indian',
    mother_tongue       VARCHAR(50),
    address             TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    previous_school     VARCHAR(200),
    admission_date      DATE NOT NULL,
    admission_status    admission_status DEFAULT 'active',
    photo_url           TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_students_admission ON students(admission_number);
CREATE INDEX idx_students_status ON students(admission_status);

-- ============================================================
-- TEACHERS
-- ============================================================

CREATE TABLE teachers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    employee_id         VARCHAR(30) UNIQUE NOT NULL,
    date_of_birth       DATE,
    gender              gender_type,
    qualification       VARCHAR(200),
    specialization      VARCHAR(200),
    experience_years    SMALLINT DEFAULT 0,
    joining_date        DATE NOT NULL,
    designation         VARCHAR(100),
    department          VARCHAR(100),
    salary              DECIMAL(10,2),
    address             TEXT,
    emergency_contact   VARCHAR(20),
    photo_url           TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teachers_user ON teachers(user_id);
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);

-- ============================================================
-- PARENTS / GUARDIANS
-- ============================================================

CREATE TABLE parents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    relationship        VARCHAR(50) DEFAULT 'parent',  -- father, mother, guardian
    occupation          VARCHAR(100),
    annual_income       DECIMAL(12,2),
    address             TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parents_user ON parents(user_id);

-- Student-Parent relationship (many-to-many)
CREATE TABLE student_parents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES students(id),
    parent_id       UUID NOT NULL REFERENCES parents(id),
    is_primary      BOOLEAN DEFAULT FALSE,
    UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES students(id),
    section_id      UUID NOT NULL REFERENCES sections(id),
    date            DATE NOT NULL,
    status          attendance_status NOT NULL DEFAULT 'present',
    marked_by       UUID NOT NULL REFERENCES users(id),
    subject_id      UUID REFERENCES subjects(id),      -- NULL = full-day
    remarks         VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_section_date ON attendance(section_id, date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date DESC);

-- ============================================================
-- HOMEWORK
-- ============================================================

CREATE TABLE homework (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id      UUID NOT NULL REFERENCES users(id),
    section_id      UUID NOT NULL REFERENCES sections(id),
    subject_id      UUID NOT NULL REFERENCES subjects(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATE NOT NULL,
    attachment_url  TEXT,
    max_marks       SMALLINT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homework_section ON homework(section_id);
CREATE INDEX idx_homework_teacher ON homework(teacher_id);
CREATE INDEX idx_homework_due ON homework(due_date);

-- Homework submissions
CREATE TABLE homework_submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id     UUID NOT NULL REFERENCES homework(id),
    student_id      UUID NOT NULL REFERENCES students(id),
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    attachment_url  TEXT,
    marks_obtained  SMALLINT,
    feedback        TEXT,
    status          homework_status DEFAULT 'submitted',
    UNIQUE(homework_id, student_id)
);

CREATE INDEX idx_hw_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_hw_submissions_student ON homework_submissions(student_id);

-- ============================================================
-- EXAMS & MARKS
-- ============================================================

CREATE TABLE exams (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id    UUID NOT NULL REFERENCES academic_years(id),
    class_id            UUID NOT NULL REFERENCES classes(id),
    name                VARCHAR(200) NOT NULL,
    exam_type           exam_type NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_published        BOOLEAN DEFAULT FALSE,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_class ON exams(class_id);
CREATE INDEX idx_exams_year ON exams(academic_year_id);
CREATE INDEX idx_exams_type ON exams(exam_type);

-- Exam schedule (which subject on which date)
CREATE TABLE exam_schedules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id         UUID NOT NULL REFERENCES exams(id),
    subject_id      UUID NOT NULL REFERENCES subjects(id),
    exam_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    max_marks       SMALLINT NOT NULL DEFAULT 100,
    passing_marks   SMALLINT NOT NULL DEFAULT 33,
    room_number     VARCHAR(20),
    UNIQUE(exam_id, subject_id)
);

CREATE INDEX idx_exam_schedules_exam ON exam_schedules(exam_id);

-- Marks
CREATE TABLE marks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id),
    student_id          UUID NOT NULL REFERENCES students(id),
    subject_id          UUID NOT NULL REFERENCES subjects(id),
    marks_obtained      DECIMAL(5,2),
    practical_marks     DECIMAL(5,2),
    is_absent           BOOLEAN DEFAULT FALSE,
    remarks             VARCHAR(255),
    entered_by          UUID NOT NULL REFERENCES users(id),
    verified_by         UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id, subject_id)
);

CREATE INDEX idx_marks_exam ON marks(exam_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_student_exam ON marks(student_id, exam_id);

-- ============================================================
-- REPORT CARDS
-- ============================================================

CREATE TABLE report_cards (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id),
    student_id          UUID NOT NULL REFERENCES students(id),
    total_marks         DECIMAL(8,2),
    max_total_marks     DECIMAL(8,2),
    percentage          DECIMAL(5,2),
    grade               VARCHAR(5),
    rank_in_class       SMALLINT,
    rank_in_section     SMALLINT,
    attendance_percent  DECIMAL(5,2),
    teacher_remarks     TEXT,
    principal_remarks   TEXT,
    is_published        BOOLEAN DEFAULT FALSE,
    pdf_url             TEXT,
    generated_at        TIMESTAMPTZ,
    UNIQUE(exam_id, student_id)
);

CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_exam ON report_cards(exam_id);

-- ============================================================
-- FEES
-- ============================================================

CREATE TABLE fee_structures (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id    UUID NOT NULL REFERENCES academic_years(id),
    class_id            UUID NOT NULL REFERENCES classes(id),
    fee_type            VARCHAR(100) NOT NULL,   -- "Tuition", "Transport", "Library", etc.
    amount              DECIMAL(10,2) NOT NULL,
    due_date            DATE,
    is_recurring        BOOLEAN DEFAULT FALSE,
    recurrence_month    SMALLINT,                -- 1-12 if monthly
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_year_class ON fee_structures(academic_year_id, class_id);

CREATE TABLE fees (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES students(id),
    fee_structure_id    UUID NOT NULL REFERENCES fee_structures(id),
    academic_year_id    UUID NOT NULL REFERENCES academic_years(id),
    amount_due          DECIMAL(10,2) NOT NULL,
    amount_paid         DECIMAL(10,2) DEFAULT 0,
    discount            DECIMAL(10,2) DEFAULT 0,
    fine                DECIMAL(10,2) DEFAULT 0,
    due_date            DATE NOT NULL,
    status              fee_status DEFAULT 'pending',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_due_date ON fees(due_date);
CREATE INDEX idx_fees_year ON fees(academic_year_id);

CREATE TABLE fee_transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_id              UUID NOT NULL REFERENCES fees(id),
    student_id          UUID NOT NULL REFERENCES students(id),
    amount              DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(50),             -- cash, upi, bank_transfer, cheque
    transaction_ref     VARCHAR(100),
    receipt_number      VARCHAR(50) UNIQUE,
    payment_date        TIMESTAMPTZ DEFAULT NOW(),
    collected_by        UUID REFERENCES users(id),
    remarks             TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fee_transactions_fee ON fee_transactions(fee_id);
CREATE INDEX idx_fee_transactions_student ON fee_transactions(student_id);
CREATE INDEX idx_fee_transactions_date ON fee_transactions(payment_date DESC);

-- ============================================================
-- TIMETABLE
-- ============================================================

CREATE TABLE timetable (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id      UUID NOT NULL REFERENCES sections(id),
    subject_id      UUID NOT NULL REFERENCES subjects(id),
    teacher_id      UUID NOT NULL REFERENCES users(id),
    day             day_of_week NOT NULL,
    period_number   SMALLINT NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    UNIQUE(section_id, day, period_number, academic_year_id)
);

CREATE INDEX idx_timetable_section ON timetable(section_id);
CREATE INDEX idx_timetable_teacher ON timetable(teacher_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    type            notification_type NOT NULL,
    channel         notification_channel[] DEFAULT '{in_app}',
    sender_id       UUID REFERENCES users(id),
    is_broadcast    BOOLEAN DEFAULT FALSE,
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_sent ON notifications(sent_at DESC);

-- Per-user notification delivery
CREATE TABLE user_notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id     UUID NOT NULL REFERENCES notifications(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    is_read             BOOLEAN DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id, is_read);
CREATE INDEX idx_user_notifications_notif ON user_notifications(notification_id);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

CREATE TABLE announcements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    attachment_url  TEXT,
    target_roles    user_role[] DEFAULT '{admin,teacher,parent,student}',
    class_id        UUID REFERENCES classes(id),     -- NULL = all classes
    is_pinned       BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(published_at DESC);
CREATE INDEX idx_announcements_class ON announcements(class_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_marks_updated_at BEFORE UPDATE ON marks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_fees_updated_at BEFORE UPDATE ON fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grade calculation function
CREATE OR REPLACE FUNCTION calculate_grade(percentage DECIMAL)
RETURNS VARCHAR(5) AS $$
BEGIN
    RETURN CASE
        WHEN percentage >= 91 THEN 'A+'
        WHEN percentage >= 81 THEN 'A'
        WHEN percentage >= 71 THEN 'B+'
        WHEN percentage >= 61 THEN 'B'
        WHEN percentage >= 51 THEN 'C+'
        WHEN percentage >= 41 THEN 'C'
        WHEN percentage >= 33 THEN 'D'
        ELSE 'F'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Attendance percentage function
CREATE OR REPLACE FUNCTION get_attendance_percentage(
    p_student_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    total_days INTEGER;
    present_days INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_days
    FROM attendance
    WHERE student_id = p_student_id
      AND date BETWEEN p_start_date AND p_end_date;

    SELECT COUNT(*) INTO present_days
    FROM attendance
    WHERE student_id = p_student_id
      AND date BETWEEN p_start_date AND p_end_date
      AND status IN ('present', 'late');

    IF total_days = 0 THEN RETURN 0; END IF;
    RETURN ROUND((present_days::DECIMAL / total_days * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VIEWS
-- ============================================================

-- Student full profile view
CREATE VIEW v_student_profiles AS
SELECT
    s.id AS student_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.avatar_url,
    s.admission_number,
    s.roll_number,
    s.date_of_birth,
    s.gender,
    s.admission_status,
    c.name AS class_name,
    c.numeric_level,
    sec.name AS section_name,
    ay.name AS academic_year
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN sections sec ON sec.id = s.section_id
LEFT JOIN classes c ON c.id = sec.class_id
LEFT JOIN academic_years ay ON ay.id = c.academic_year_id
WHERE u.deleted_at IS NULL AND s.admission_status = 'active';

-- Fee summary view
CREATE VIEW v_fee_summary AS
SELECT
    f.student_id,
    s.admission_number,
    u.first_name || ' ' || u.last_name AS student_name,
    sec.name AS section,
    c.name AS class_name,
    SUM(f.amount_due) AS total_due,
    SUM(f.amount_paid) AS total_paid,
    SUM(f.amount_due - f.amount_paid) AS total_pending,
    COUNT(CASE WHEN f.status = 'overdue' THEN 1 END) AS overdue_count
FROM fees f
JOIN students s ON s.id = f.student_id
JOIN users u ON u.id = s.user_id
LEFT JOIN sections sec ON sec.id = s.section_id
LEFT JOIN classes c ON c.id = sec.class_id
GROUP BY f.student_id, s.admission_number, u.first_name, u.last_name, sec.name, c.name;
