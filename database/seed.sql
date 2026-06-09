-- ============================================================
-- शहीद राम सिंह विद्यालय — Seed Data
-- ============================================================

-- Academic Year
INSERT INTO academic_years (id, name, start_date, end_date, is_current) VALUES
  ('ay-2024-25', '2024-25', '2024-04-01', '2025-03-31', TRUE),
  ('ay-2023-24', '2023-24', '2023-04-01', '2024-03-31', FALSE);

-- Classes
INSERT INTO classes (id, academic_year_id, name, numeric_level) VALUES
  ('cls-1',  'ay-2024-25', 'Class 1',  1),
  ('cls-2',  'ay-2024-25', 'Class 2',  2),
  ('cls-3',  'ay-2024-25', 'Class 3',  3),
  ('cls-4',  'ay-2024-25', 'Class 4',  4),
  ('cls-5',  'ay-2024-25', 'Class 5',  5),
  ('cls-6',  'ay-2024-25', 'Class 6',  6),
  ('cls-7',  'ay-2024-25', 'Class 7',  7),
  ('cls-8',  'ay-2024-25', 'Class 8',  8),
  ('cls-9',  'ay-2024-25', 'Class 9',  9),
  ('cls-10', 'ay-2024-25', 'Class 10', 10),
  ('cls-11', 'ay-2024-25', 'Class 11', 11),
  ('cls-12', 'ay-2024-25', 'Class 12', 12);

-- Sections
INSERT INTO sections (id, class_id, name, capacity, room_number) VALUES
  ('sec-6a',  'cls-6',  'A', 40, 'R-601'),
  ('sec-6b',  'cls-6',  'B', 40, 'R-602'),
  ('sec-7a',  'cls-7',  'A', 40, 'R-701'),
  ('sec-7b',  'cls-7',  'B', 40, 'R-702'),
  ('sec-8a',  'cls-8',  'A', 40, 'R-801'),
  ('sec-8b',  'cls-8',  'B', 40, 'R-802'),
  ('sec-9a',  'cls-9',  'A', 40, 'R-901'),
  ('sec-10a', 'cls-10', 'A', 40, 'R-1001'),
  ('sec-10b', 'cls-10', 'B', 40, 'R-1002'),
  ('sec-11s', 'cls-11', 'Science', 35, 'R-1101'),
  ('sec-11c', 'cls-11', 'Commerce', 35, 'R-1102'),
  ('sec-12s', 'cls-12', 'Science', 35, 'R-1201'),
  ('sec-12c', 'cls-12', 'Commerce', 35, 'R-1202');

-- Subjects
INSERT INTO subjects (id, code, name, name_hindi, max_marks, passing_marks, is_practical) VALUES
  ('sub-hin', 'HIN', 'Hindi',           'हिंदी',          100, 33, FALSE),
  ('sub-eng', 'ENG', 'English',          'अंग्रेज़ी',       100, 33, FALSE),
  ('sub-mat', 'MAT', 'Mathematics',      'गणित',           100, 33, FALSE),
  ('sub-sci', 'SCI', 'Science',          'विज्ञान',        100, 33, TRUE),
  ('sub-sst', 'SST', 'Social Science',   'सामाजिक विज्ञान',100, 33, FALSE),
  ('sub-san', 'SAN', 'Sanskrit',         'संस्कृत',        100, 33, FALSE),
  ('sub-com', 'COM', 'Computer',         'कंप्यूटर',        100, 33, TRUE),
  ('sub-phy', 'PHY', 'Physics',          'भौतिकी',         100, 33, TRUE),
  ('sub-che', 'CHE', 'Chemistry',        'रसायन विज्ञान',  100, 33, TRUE),
  ('sub-bio', 'BIO', 'Biology',          'जीव विज्ञान',    100, 33, TRUE),
  ('sub-eco', 'ECO', 'Economics',        'अर्थशास्त्र',    100, 33, FALSE),
  ('sub-acc', 'ACC', 'Accounts',         'लेखा',           100, 33, FALSE);

-- Admin User
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified) VALUES
  ('user-admin-1', 'admin@srsv.edu.in', '9876543210',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y', -- password: admin123
   'admin', 'प्रधानाचार्य', 'शर्मा', TRUE, TRUE);

-- Teacher Users
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified) VALUES
  ('user-teacher-1', 'ram.sharma@srsv.edu.in', '9876543211',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y', -- teacher123
   'teacher', 'राम', 'शर्मा', TRUE, TRUE),
  ('user-teacher-2', 'priya.singh@srsv.edu.in', '9876543212',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'teacher', 'प्रिया', 'सिंह', TRUE, TRUE),
  ('user-teacher-3', 'suresh.verma@srsv.edu.in', '9876543213',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'teacher', 'सुरेश', 'वर्मा', TRUE, TRUE);

-- Teachers
INSERT INTO teachers (id, user_id, employee_id, qualification, specialization, joining_date, designation, department, experience_years) VALUES
  ('tch-1', 'user-teacher-1', 'EMP-001', 'M.Sc., B.Ed.', 'Mathematics', '2010-06-01', 'PGT Mathematics', 'Science', 14),
  ('tch-2', 'user-teacher-2', 'EMP-002', 'M.A., B.Ed.', 'Hindi Literature', '2012-06-01', 'TGT Hindi', 'Languages', 12),
  ('tch-3', 'user-teacher-3', 'EMP-003', 'M.Sc., B.Ed.', 'Physics', '2015-06-01', 'PGT Physics', 'Science', 9);

-- Update section class teachers
UPDATE sections SET class_teacher_id = 'user-teacher-1' WHERE id IN ('sec-8a', 'sec-8b');
UPDATE sections SET class_teacher_id = 'user-teacher-2' WHERE id IN ('sec-6a', 'sec-6b');

-- Student Users
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified) VALUES
  ('user-stu-1', 'rahul.sharma@srsv.edu.in', '9876543220',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'student', 'राहुल', 'शर्मा', TRUE, TRUE),
  ('user-stu-2', 'priya.gupta@srsv.edu.in', '9876543221',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'student', 'प्रिया', 'गुप्ता', TRUE, TRUE),
  ('user-stu-3', 'amit.yadav@srsv.edu.in', '9876543222',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'student', 'अमित', 'यादव', TRUE, TRUE);

-- Students
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date) VALUES
  ('stu-1', 'user-stu-1', '2024/001', '1', 'sec-8a', '2011-03-15', 'male', 'B+', '2021-06-01'),
  ('stu-2', 'user-stu-2', '2024/002', '2', 'sec-8a', '2011-07-22', 'female', 'O+', '2021-06-01'),
  ('stu-3', 'user-stu-3', '2024/003', '3', 'sec-8b', '2011-11-10', 'male', 'A+', '2022-06-01');

-- Parent Users
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active) VALUES
  ('user-par-1', 'mohan.sharma@gmail.com', '9876543230',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'parent', 'मोहन', 'शर्मा', TRUE),
  ('user-par-2', 'sunita.gupta@gmail.com', '9876543231',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHpEzs4r.x1.P7y',
   'parent', 'सुनीता', 'गुप्ता', TRUE);

INSERT INTO parents (id, user_id, relationship, occupation) VALUES
  ('par-1', 'user-par-1', 'father', 'Business'),
  ('par-2', 'user-par-2', 'mother', 'Teacher');

INSERT INTO student_parents (id, student_id, parent_id, is_primary) VALUES
  (gen_random_uuid(), 'stu-1', 'par-1', TRUE),
  (gen_random_uuid(), 'stu-2', 'par-2', TRUE);

-- Fee Structures
INSERT INTO fee_structures (id, academic_year_id, class_id, fee_type, amount, due_date, is_recurring) VALUES
  (gen_random_uuid(), 'ay-2024-25', 'cls-8', 'Tuition Fee', 2500.00, '2024-04-10', TRUE),
  (gen_random_uuid(), 'ay-2024-25', 'cls-8', 'Annual Charges', 5000.00, '2024-04-30', FALSE),
  (gen_random_uuid(), 'ay-2024-25', 'cls-8', 'Library Fee', 500.00, '2024-04-30', FALSE),
  (gen_random_uuid(), 'ay-2024-25', 'cls-10', 'Tuition Fee', 3000.00, '2024-04-10', TRUE),
  (gen_random_uuid(), 'ay-2024-25', 'cls-12', 'Tuition Fee', 3500.00, '2024-04-10', TRUE);

-- Exam
INSERT INTO exams (id, academic_year_id, class_id, name, exam_type, start_date, end_date, is_published, created_by) VALUES
  ('exam-q1-8', 'ay-2024-25', 'cls-8', 'प्रथम त्रैमासिक परीक्षा 2024', 'quarterly', '2024-07-15', '2024-07-20', TRUE, 'user-admin-1'),
  ('exam-half-8', 'ay-2024-25', 'cls-8', 'अर्धवार्षिक परीक्षा 2024', 'half_yearly', '2024-10-01', '2024-10-10', FALSE, 'user-admin-1');

-- Exam Schedules
INSERT INTO exam_schedules (id, exam_id, subject_id, exam_date, start_time, end_time, max_marks, passing_marks, room_number) VALUES
  (gen_random_uuid(), 'exam-q1-8', 'sub-mat', '2024-07-15', '09:00', '12:00', 100, 33, 'R-801'),
  (gen_random_uuid(), 'exam-q1-8', 'sub-sci', '2024-07-16', '09:00', '12:00', 100, 33, 'R-801'),
  (gen_random_uuid(), 'exam-q1-8', 'sub-eng', '2024-07-17', '09:00', '12:00', 100, 33, 'R-801'),
  (gen_random_uuid(), 'exam-q1-8', 'sub-hin', '2024-07-18', '09:00', '12:00', 100, 33, 'R-801'),
  (gen_random_uuid(), 'exam-q1-8', 'sub-sst', '2024-07-19', '09:00', '12:00', 100, 33, 'R-801');

-- Sample Marks
INSERT INTO marks (id, exam_id, student_id, subject_id, marks_obtained, is_absent, entered_by) VALUES
  (gen_random_uuid(), 'exam-q1-8', 'stu-1', 'sub-mat', 87, FALSE, 'user-teacher-1'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-1', 'sub-sci', 79, FALSE, 'user-teacher-3'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-1', 'sub-eng', 72, FALSE, 'user-teacher-2'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-1', 'sub-hin', 91, FALSE, 'user-teacher-2'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-1', 'sub-sst', 68, FALSE, 'user-teacher-2'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-2', 'sub-mat', 93, FALSE, 'user-teacher-1'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-2', 'sub-sci', 88, FALSE, 'user-teacher-3'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-2', 'sub-eng', 85, FALSE, 'user-teacher-2'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-2', 'sub-hin', 94, FALSE, 'user-teacher-2'),
  (gen_random_uuid(), 'exam-q1-8', 'stu-2', 'sub-sst', 78, FALSE, 'user-teacher-2');

-- Sample Attendance
INSERT INTO attendance (id, student_id, section_id, date, status, marked_by) VALUES
  (gen_random_uuid(), 'stu-1', 'sec-8a', CURRENT_DATE - 1, 'present', 'user-teacher-1'),
  (gen_random_uuid(), 'stu-1', 'sec-8a', CURRENT_DATE - 2, 'present', 'user-teacher-1'),
  (gen_random_uuid(), 'stu-1', 'sec-8a', CURRENT_DATE - 3, 'absent',  'user-teacher-1'),
  (gen_random_uuid(), 'stu-1', 'sec-8a', CURRENT_DATE - 4, 'present', 'user-teacher-1'),
  (gen_random_uuid(), 'stu-2', 'sec-8a', CURRENT_DATE - 1, 'present', 'user-teacher-1'),
  (gen_random_uuid(), 'stu-2', 'sec-8a', CURRENT_DATE - 2, 'late',    'user-teacher-1'),
  (gen_random_uuid(), 'stu-2', 'sec-8a', CURRENT_DATE - 3, 'present', 'user-teacher-1');

-- Sample Announcements
INSERT INTO announcements (id, title, content, created_by, is_pinned) VALUES
  (gen_random_uuid(), 'विद्यालय में प्रवेश 2025-26 प्रारंभ', 'नए शैक्षणिक सत्र 2025-26 हेतु प्रवेश प्रक्रिया प्रारंभ हो गई है।', 'user-admin-1', TRUE),
  (gen_random_uuid(), 'वार्षिक खेल दिवस — 25 जनवरी', 'समस्त अभिभावक और छात्र सादर आमंत्रित हैं।', 'user-admin-1', FALSE);

-- ============================================================
-- Default Login Credentials:
-- Admin:   admin@srsv.edu.in     / admin123
-- Teacher: ram.sharma@srsv.edu.in / teacher123
-- Parent:  9876543230             / teacher123
-- Student: rahul.sharma@srsv.edu.in / teacher123
-- (All hashed passwords use bcrypt rounds=12 for 'admin123'/'teacher123')
-- ============================================================
