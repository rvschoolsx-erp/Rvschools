-- =============================================================
-- SchoolConnect — Demo Data
-- Run this ONCE in Neon SQL Editor
-- Fixes: teacher / student / parent login + populates all features
-- =============================================================

-- =============================================================
-- PART 1: DEMO LOGIN USERS
-- Credentials shown on the login page
-- =============================================================

-- Admin (admin@school.com / admin123)
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified)
VALUES ('00000000-0000-0005-0000-000000000099', 'admin@school.com', NULL,
        '$2a$10$5TfaoXBTTF1Lss7hP9NdkO1Wd12fCpC852BiP7GR7Rqhbjii/qrbK',
        'admin', 'Admin', 'User', TRUE, TRUE)
ON CONFLICT DO NOTHING;
UPDATE users SET password_hash = '$2a$10$5TfaoXBTTF1Lss7hP9NdkO1Wd12fCpC852BiP7GR7Rqhbjii/qrbK',
  is_active = TRUE, is_verified = TRUE
WHERE email = 'admin@school.com';

-- Teacher (teacher@school.com / teacher123)
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified)
VALUES ('00000000-0000-0006-0000-000000000099', 'teacher@school.com', NULL,
        '$2a$10$qftnOx8WtictAVU0EJ8cleF2T9fpMVRqst8YH59PVjoHOa8PwtcRi',
        'teacher', 'Anita', 'Joshi', TRUE, TRUE)
ON CONFLICT DO NOTHING;
UPDATE users SET password_hash = '$2a$10$qftnOx8WtictAVU0EJ8cleF2T9fpMVRqst8YH59PVjoHOa8PwtcRi',
  is_active = TRUE, is_verified = TRUE
WHERE email = 'teacher@school.com';

-- Student (student@school.com / student123)
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified)
VALUES ('00000000-0000-0007-0000-000000000099', 'student@school.com', NULL,
        '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm',
        'student', 'Arjun', 'Mehta', TRUE, TRUE)
ON CONFLICT DO NOTHING;
UPDATE users SET password_hash = '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm',
  is_active = TRUE, is_verified = TRUE
WHERE email = 'student@school.com';

-- Parent (9876543210 / parent123)
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified)
VALUES ('00000000-0000-0008-0000-000000000099', NULL, '9876543210',
        '$2a$10$/VIkmXVww7Kugae9KglQceeZ1X5owms5iZeO9Mz.cI4S9BkmCgq0y',
        'parent', 'Rajesh', 'Mehta', TRUE, TRUE)
ON CONFLICT DO NOTHING;
UPDATE users SET password_hash = '$2a$10$/VIkmXVww7Kugae9KglQceeZ1X5owms5iZeO9Mz.cI4S9BkmCgq0y',
  is_active = TRUE, is_verified = TRUE
WHERE phone = '9876543210';


-- =============================================================
-- PART 2: TEACHER RECORD FOR DEMO TEACHER
-- Uses SELECT to get actual user_id (safe even if UUID differs)
-- =============================================================

INSERT INTO teachers (id, user_id, employee_id, qualification, specialization, joining_date, designation, department, experience_years)
SELECT '00000000-0000-0009-0000-000000000099', u.id, 'EMP-099', 'M.Ed., B.Sc.', 'Science & Biology', '2018-06-01', 'TGT Science', 'Science', 6
FROM users u WHERE u.email = 'teacher@school.com'
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 3: SECTIONS FOR CLASSES 1–5 (for class distribution chart)
-- =============================================================

INSERT INTO sections (id, class_id, name, capacity, room_number) VALUES
  ('00000000-0000-0003-0000-000000000014', '00000000-0000-0002-0000-000000000001', 'A', 35, 'R-101'),
  ('00000000-0000-0003-0000-000000000015', '00000000-0000-0002-0000-000000000002', 'A', 35, 'R-201'),
  ('00000000-0000-0003-0000-000000000016', '00000000-0000-0002-0000-000000000003', 'A', 35, 'R-301'),
  ('00000000-0000-0003-0000-000000000017', '00000000-0000-0002-0000-000000000004', 'A', 35, 'R-401'),
  ('00000000-0000-0003-0000-000000000018', '00000000-0000-0002-0000-000000000005', 'A', 35, 'R-501')
ON CONFLICT DO NOTHING;

-- Assign demo teacher as class teacher of section 9-A
UPDATE sections SET class_teacher_id = (SELECT id FROM users WHERE email = 'teacher@school.com' LIMIT 1)
  WHERE id = '00000000-0000-0003-0000-000000000007';


-- =============================================================
-- PART 4: MORE USERS (for bulk students)
-- =============================================================

INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active, is_verified) VALUES
  ('00000000-0000-0007-0000-000000000004', 'kavya.sharma@srsv.edu.in',  '9800000004', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Kavya',    'Sharma',     TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000005', 'rohan.verma@srsv.edu.in',   '9800000005', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Rohan',    'Verma',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000006', 'sneha.gupta@srsv.edu.in',   '9800000006', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Sneha',    'Gupta',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000007', 'vivek.patel@srsv.edu.in',   '9800000007', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Vivek',    'Patel',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000008', 'anjali.yadav@srsv.edu.in',  '9800000008', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Anjali',   'Yadav',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000009', 'sunil.singh@srsv.edu.in',   '9800000009', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Sunil',    'Singh',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000010', 'pooja.mishra@srsv.edu.in',  '9800000010', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Pooja',    'Mishra',     TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000011', 'harsh.agarwal@srsv.edu.in', '9800000011', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Harsh',    'Agarwal',    TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000012', 'meera.joshi@srsv.edu.in',   '9800000012', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Meera',    'Joshi',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000013', 'nikhil.kumar@srsv.edu.in',  '9800000013', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Nikhil',   'Kumar',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000014', 'asha.rao@srsv.edu.in',      '9800000014', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Asha',     'Rao',        TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000015', 'kiran.dubey@srsv.edu.in',   '9800000015', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Kiran',    'Dubey',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000016', 'mohit.yadav@srsv.edu.in',   '9800000016', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Mohit',    'Yadav',      TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000017', 'riya.kapoor@srsv.edu.in',   '9800000017', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Riya',     'Kapoor',     TRUE, TRUE),
  ('00000000-0000-0007-0000-000000000018', 'dev.trivedi@srsv.edu.in',   '9800000018', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Dev',      'Trivedi',    TRUE, TRUE)
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 5: STUDENTS
-- 8A (section 5): students 1,2,99,4,5,6,7,8
-- 8B (section 6): students 3,9,10,11
-- 9A (section 7): students 12,13,14,15
-- 10A (section 8): students 16,17,18
-- Classes 1-5: 4 students each (for distribution chart)
-- =============================================================

-- Demo student (student@school.com) — uses SELECT to get actual user_id
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date, admission_status)
SELECT '00000000-0000-000a-0000-000000000099', u.id, '2024/099', '8',
       '00000000-0000-0003-0000-000000000005', '2011-05-12', 'male', 'O+', '2021-06-01', 'active'
FROM users u WHERE u.email = 'student@school.com'
ON CONFLICT DO NOTHING;

-- Class 8A students
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date, admission_status) VALUES
  ('00000000-0000-000a-0000-000000000004', '00000000-0000-0007-0000-000000000004', '2024/004', '4', '00000000-0000-0003-0000-000000000005', '2011-08-14', 'female', 'A+',  '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000005', '00000000-0000-0007-0000-000000000005', '2024/005', '5', '00000000-0000-0003-0000-000000000005', '2011-12-03', 'male',   'B-',  '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000006', '00000000-0000-0007-0000-000000000006', '2024/006', '6', '00000000-0000-0003-0000-000000000005', '2011-02-27', 'female', 'O-',  '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000007', '00000000-0000-0007-0000-000000000007', '2024/007', '7', '00000000-0000-0003-0000-000000000005', '2011-09-18', 'male',   'AB+', '2022-06-01', 'active')
ON CONFLICT DO NOTHING;

-- Class 8B students
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date, admission_status) VALUES
  ('00000000-0000-000a-0000-000000000008', '00000000-0000-0007-0000-000000000008', '2024/008', '1', '00000000-0000-0003-0000-000000000006', '2011-04-22', 'female', 'B+',  '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000009', '00000000-0000-0007-0000-000000000009', '2024/009', '2', '00000000-0000-0003-0000-000000000006', '2011-07-11', 'male',   'O+',  '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000010', '00000000-0000-0007-0000-000000000010', '2024/010', '3', '00000000-0000-0003-0000-000000000006', '2011-01-30', 'female', 'A-',  '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000011', '00000000-0000-0007-0000-000000000011', '2024/011', '4', '00000000-0000-0003-0000-000000000006', '2011-06-05', 'male',   'B+',  '2022-06-01', 'active')
ON CONFLICT DO NOTHING;

-- Class 9A students
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date, admission_status) VALUES
  ('00000000-0000-000a-0000-000000000012', '00000000-0000-0007-0000-000000000012', '2023/012', '1', '00000000-0000-0003-0000-000000000007', '2010-03-14', 'female', 'O+',  '2020-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000013', '00000000-0000-0007-0000-000000000013', '2023/013', '2', '00000000-0000-0003-0000-000000000007', '2010-11-25', 'male',   'AB-', '2020-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000014', '00000000-0000-0007-0000-000000000014', '2023/014', '3', '00000000-0000-0003-0000-000000000007', '2010-08-07', 'female', 'A+',  '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000015', '00000000-0000-0007-0000-000000000015', '2023/015', '4', '00000000-0000-0003-0000-000000000007', '2010-05-19', 'male',   'B+',  '2021-06-01', 'active')
ON CONFLICT DO NOTHING;

-- Class 10A students
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, blood_group, admission_date, admission_status) VALUES
  ('00000000-0000-000a-0000-000000000016', '00000000-0000-0007-0000-000000000016', '2022/016', '1', '00000000-0000-0003-0000-000000000008', '2009-04-08', 'female', 'O-',  '2019-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000017', '00000000-0000-0007-0000-000000000017', '2022/017', '2', '00000000-0000-0003-0000-000000000008', '2009-09-22', 'male',   'A+',  '2019-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000018', '00000000-0000-0007-0000-000000000018', '2022/018', '3', '00000000-0000-0003-0000-000000000008', '2009-12-15', 'male',   'B-',  '2020-06-01', 'active')
ON CONFLICT DO NOTHING;

-- Classes 1-5: 4 students each (dummy, no user accounts needed — just for count in analytics)
INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name, is_active) VALUES
  ('00000000-0000-0007-0000-000000000101', 's101@srsv.edu.in', '9800000101', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Rahul',   'Kumar',  TRUE),
  ('00000000-0000-0007-0000-000000000102', 's102@srsv.edu.in', '9800000102', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Priya',   'Tiwari', TRUE),
  ('00000000-0000-0007-0000-000000000103', 's103@srsv.edu.in', '9800000103', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Amit',    'Sharma', TRUE),
  ('00000000-0000-0007-0000-000000000104', 's104@srsv.edu.in', '9800000104', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Sita',    'Yadav',  TRUE),
  ('00000000-0000-0007-0000-000000000105', 's105@srsv.edu.in', '9800000105', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Ravi',    'Jain',   TRUE),
  ('00000000-0000-0007-0000-000000000106', 's106@srsv.edu.in', '9800000106', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Sunita',  'Patil',  TRUE),
  ('00000000-0000-0007-0000-000000000107', 's107@srsv.edu.in', '9800000107', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Manish',  'Dubey',  TRUE),
  ('00000000-0000-0007-0000-000000000108', 's108@srsv.edu.in', '9800000108', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Neha',    'Singh',  TRUE),
  ('00000000-0000-0007-0000-000000000109', 's109@srsv.edu.in', '9800000109', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Rakesh',  'Agarwal',TRUE),
  ('00000000-0000-0007-0000-000000000110', 's110@srsv.edu.in', '9800000110', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Geeta',   'Mishra', TRUE),
  ('00000000-0000-0007-0000-000000000111', 's111@srsv.edu.in', '9800000111', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Sanjay',  'Patel',  TRUE),
  ('00000000-0000-0007-0000-000000000112', 's112@srsv.edu.in', '9800000112', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Ananya',  'Verma',  TRUE),
  ('00000000-0000-0007-0000-000000000113', 's113@srsv.edu.in', '9800000113', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Vijay',   'Tiwari', TRUE),
  ('00000000-0000-0007-0000-000000000114', 's114@srsv.edu.in', '9800000114', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Divya',   'Rao',    TRUE),
  ('00000000-0000-0007-0000-000000000115', 's115@srsv.edu.in', '9800000115', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Arun',    'Sharma', TRUE),
  ('00000000-0000-0007-0000-000000000116', 's116@srsv.edu.in', '9800000116', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Kavita',  'Kumar',  TRUE),
  ('00000000-0000-0007-0000-000000000117', 's117@srsv.edu.in', '9800000117', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Neeraj',  'Joshi',  TRUE),
  ('00000000-0000-0007-0000-000000000118', 's118@srsv.edu.in', '9800000118', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Shweta',  'Pandey', TRUE),
  ('00000000-0000-0007-0000-000000000119', 's119@srsv.edu.in', '9800000119', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Gaurav',  'Singh',  TRUE),
  ('00000000-0000-0007-0000-000000000120', 's120@srsv.edu.in', '9800000120', '$2a$10$g3NwJKcNbUroxBEoPj3QW.3sWbjxxo/B.USmxgSqk92xNjDC3GbQm', 'student', 'Mamta',   'Dubey',  TRUE)
ON CONFLICT DO NOTHING;

-- Spread students across classes 1-5 sections
INSERT INTO students (id, user_id, admission_number, roll_number, section_id, date_of_birth, gender, admission_date, admission_status) VALUES
  -- Class 1A (section 14)
  ('00000000-0000-000a-0000-000000000101', '00000000-0000-0007-0000-000000000101', '2024/101', '1', '00000000-0000-0003-0000-000000000014', '2018-04-01', 'male',   '2024-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000102', '00000000-0000-0007-0000-000000000102', '2024/102', '2', '00000000-0000-0003-0000-000000000014', '2018-07-12', 'female', '2024-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000103', '00000000-0000-0007-0000-000000000103', '2024/103', '3', '00000000-0000-0003-0000-000000000014', '2018-01-20', 'male',   '2024-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000104', '00000000-0000-0007-0000-000000000104', '2024/104', '4', '00000000-0000-0003-0000-000000000014', '2018-09-05', 'female', '2024-06-01', 'active'),
  -- Class 2A (section 15)
  ('00000000-0000-000a-0000-000000000105', '00000000-0000-0007-0000-000000000105', '2024/105', '1', '00000000-0000-0003-0000-000000000015', '2017-03-15', 'male',   '2023-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000106', '00000000-0000-0007-0000-000000000106', '2024/106', '2', '00000000-0000-0003-0000-000000000015', '2017-08-22', 'female', '2023-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000107', '00000000-0000-0007-0000-000000000107', '2024/107', '3', '00000000-0000-0003-0000-000000000015', '2017-11-10', 'male',   '2023-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000108', '00000000-0000-0007-0000-000000000108', '2024/108', '4', '00000000-0000-0003-0000-000000000015', '2017-05-28', 'female', '2023-06-01', 'active'),
  -- Class 3A (section 16)
  ('00000000-0000-000a-0000-000000000109', '00000000-0000-0007-0000-000000000109', '2024/109', '1', '00000000-0000-0003-0000-000000000016', '2016-02-18', 'male',   '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000110', '00000000-0000-0007-0000-000000000110', '2024/110', '2', '00000000-0000-0003-0000-000000000016', '2016-06-14', 'female', '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000111', '00000000-0000-0007-0000-000000000111', '2024/111', '3', '00000000-0000-0003-0000-000000000016', '2016-10-09', 'male',   '2022-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000112', '00000000-0000-0007-0000-000000000112', '2024/112', '4', '00000000-0000-0003-0000-000000000016', '2016-12-01', 'female', '2022-06-01', 'active'),
  -- Class 4A (section 17)
  ('00000000-0000-000a-0000-000000000113', '00000000-0000-0007-0000-000000000113', '2024/113', '1', '00000000-0000-0003-0000-000000000017', '2015-01-07', 'male',   '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000114', '00000000-0000-0007-0000-000000000114', '2024/114', '2', '00000000-0000-0003-0000-000000000017', '2015-04-24', 'female', '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000115', '00000000-0000-0007-0000-000000000115', '2024/115', '3', '00000000-0000-0003-0000-000000000017', '2015-08-16', 'male',   '2021-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000116', '00000000-0000-0007-0000-000000000116', '2024/116', '4', '00000000-0000-0003-0000-000000000017', '2015-11-29', 'female', '2021-06-01', 'active'),
  -- Class 5A (section 18)
  ('00000000-0000-000a-0000-000000000117', '00000000-0000-0007-0000-000000000117', '2024/117', '1', '00000000-0000-0003-0000-000000000018', '2014-02-11', 'male',   '2020-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000118', '00000000-0000-0007-0000-000000000118', '2024/118', '2', '00000000-0000-0003-0000-000000000018', '2014-06-03', 'female', '2020-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000119', '00000000-0000-0007-0000-000000000119', '2024/119', '3', '00000000-0000-0003-0000-000000000018', '2014-09-17', 'male',   '2020-06-01', 'active'),
  ('00000000-0000-000a-0000-000000000120', '00000000-0000-0007-0000-000000000120', '2024/120', '4', '00000000-0000-0003-0000-000000000018', '2014-12-23', 'female', '2020-06-01', 'active')
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 6: PARENT FOR DEMO STUDENT
-- =============================================================

INSERT INTO parents (id, user_id, relationship, occupation)
SELECT '00000000-0000-000b-0000-000000000099', u.id, 'father', 'Engineer'
FROM users u WHERE u.phone = '9876543210'
ON CONFLICT DO NOTHING;

INSERT INTO student_parents (id, student_id, parent_id, is_primary)
SELECT gen_random_uuid(), '00000000-0000-000a-0000-000000000099', '00000000-0000-000b-0000-000000000099', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM student_parents
  WHERE student_id = '00000000-0000-000a-0000-000000000099'
    AND parent_id  = '00000000-0000-000b-0000-000000000099'
);


-- =============================================================
-- PART 7: ATTENDANCE — 30 days for class 8A, 8B, 9A, 10A
-- =============================================================

-- Class 8A students (section 5) — ~87% attendance
INSERT INTO attendance (id, student_id, section_id, date, status, marked_by)
SELECT
  gen_random_uuid(),
  s.id,
  '00000000-0000-0003-0000-000000000005',
  d.dt::DATE,
  CASE
    WHEN EXTRACT(DOW FROM d.dt) IN (0,6) THEN NULL  -- skip weekends
    WHEN (EXTRACT(DAY FROM d.dt) + CASE s.id
      WHEN '00000000-0000-000a-0000-000000000001' THEN 3
      WHEN '00000000-0000-000a-0000-000000000002' THEN 1
      WHEN '00000000-0000-000a-0000-000000000099' THEN 2
      WHEN '00000000-0000-000a-0000-000000000004' THEN 5
      WHEN '00000000-0000-000a-0000-000000000005' THEN 7
      WHEN '00000000-0000-000a-0000-000000000006' THEN 4
      WHEN '00000000-0000-000a-0000-000000000007' THEN 6
      ELSE 0 END) % 10 = 0 THEN 'absent'
    WHEN (EXTRACT(DAY FROM d.dt) + CASE s.id
      WHEN '00000000-0000-000a-0000-000000000002' THEN 1
      WHEN '00000000-0000-000a-0000-000000000006' THEN 4
      ELSE 9 END) % 15 = 0 THEN 'late'
    ELSE 'present'
  END,
  '00000000-0000-0006-0000-000000000001'
FROM students s
CROSS JOIN (SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day') AS dt) d
WHERE s.section_id = '00000000-0000-0003-0000-000000000005'
  AND EXTRACT(DOW FROM d.dt) NOT IN (0, 6);

-- Class 8B students (section 6)
INSERT INTO attendance (id, student_id, section_id, date, status, marked_by)
SELECT
  gen_random_uuid(),
  s.id,
  '00000000-0000-0003-0000-000000000006',
  d.dt::DATE,
  CASE
    WHEN (EXTRACT(DAY FROM d.dt) + CASE s.id
      WHEN '00000000-0000-000a-0000-000000000003'  THEN 2
      WHEN '00000000-0000-000a-0000-000000000008'  THEN 4
      WHEN '00000000-0000-000a-0000-000000000009'  THEN 6
      WHEN '00000000-0000-000a-0000-000000000010'  THEN 8
      WHEN '00000000-0000-000a-0000-000000000011'  THEN 1
      ELSE 3 END) % 8 = 0 THEN 'absent'
    WHEN (EXTRACT(DAY FROM d.dt)) % 12 = 0 THEN 'late'
    ELSE 'present'
  END,
  '00000000-0000-0006-0000-000000000001'
FROM students s
CROSS JOIN (SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day') AS dt) d
WHERE s.section_id = '00000000-0000-0003-0000-000000000006'
  AND EXTRACT(DOW FROM d.dt) NOT IN (0, 6);

-- Class 9A students (section 7)
INSERT INTO attendance (id, student_id, section_id, date, status, marked_by)
SELECT
  gen_random_uuid(),
  s.id,
  '00000000-0000-0003-0000-000000000007',
  d.dt::DATE,
  CASE
    WHEN (EXTRACT(DAY FROM d.dt) + CASE s.id
      WHEN '00000000-0000-000a-0000-000000000012' THEN 3
      WHEN '00000000-0000-000a-0000-000000000013' THEN 5
      WHEN '00000000-0000-000a-0000-000000000014' THEN 7
      WHEN '00000000-0000-000a-0000-000000000015' THEN 2
      ELSE 4 END) % 9 = 0 THEN 'absent'
    ELSE 'present'
  END,
  '00000000-0000-0006-0000-000000000099'
FROM students s
CROSS JOIN (SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day') AS dt) d
WHERE s.section_id = '00000000-0000-0003-0000-000000000007'
  AND EXTRACT(DOW FROM d.dt) NOT IN (0, 6);

-- Class 10A students (section 8)
INSERT INTO attendance (id, student_id, section_id, date, status, marked_by)
SELECT
  gen_random_uuid(),
  s.id,
  '00000000-0000-0003-0000-000000000008',
  d.dt::DATE,
  CASE
    WHEN (EXTRACT(DAY FROM d.dt) + CASE s.id
      WHEN '00000000-0000-000a-0000-000000000016' THEN 4
      WHEN '00000000-0000-000a-0000-000000000017' THEN 6
      WHEN '00000000-0000-000a-0000-000000000018' THEN 2
      ELSE 5 END) % 11 = 0 THEN 'absent'
    ELSE 'present'
  END,
  '00000000-0000-0006-0000-000000000001'
FROM students s
CROSS JOIN (SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day') AS dt) d
WHERE s.section_id = '00000000-0000-0003-0000-000000000008'
  AND EXTRACT(DOW FROM d.dt) NOT IN (0, 6);


-- =============================================================
-- PART 8: FEE STRUCTURES (with fixed IDs)
-- =============================================================

INSERT INTO fee_structures (id, academic_year_id, class_id, fee_type, amount, due_date, is_recurring) VALUES
  ('00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000008', 'Tuition Fee',     2500.00, '2024-04-10', TRUE),
  ('00000000-0000-000d-0000-000000000002', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000008', 'Annual Charges',  5000.00, '2024-04-30', FALSE),
  ('00000000-0000-000d-0000-000000000003', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000008', 'Library Fee',      500.00, '2024-04-30', FALSE),
  ('00000000-0000-000d-0000-000000000004', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000009', 'Tuition Fee',     3000.00, '2024-04-10', TRUE),
  ('00000000-0000-000d-0000-000000000005', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000010', 'Tuition Fee',     3200.00, '2024-04-10', TRUE)
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 9: FEES (tuition for all class 8A+8B+9A+10A students)
-- Mix: paid, pending, overdue
-- =============================================================

-- Class 8 Annual + Library fees (paid for existing students 1-3)
INSERT INTO fees (id, student_id, fee_structure_id, academic_year_id, amount_due, amount_paid, due_date, status) VALUES
  ('00000000-0000-000e-0000-000000000001', '00000000-0000-000a-0000-000000000001', '00000000-0000-000d-0000-000000000002', '00000000-0000-0001-0000-000000000001', 5000.00, 5000.00, '2024-04-30', 'paid'),
  ('00000000-0000-000e-0000-000000000002', '00000000-0000-000a-0000-000000000002', '00000000-0000-000d-0000-000000000002', '00000000-0000-0001-0000-000000000001', 5000.00, 5000.00, '2024-04-30', 'paid'),
  ('00000000-0000-000e-0000-000000000003', '00000000-0000-000a-0000-000000000003', '00000000-0000-000d-0000-000000000002', '00000000-0000-0001-0000-000000000001', 5000.00, 2000.00, '2024-04-30', 'pending'),
  -- Demo student
  ('00000000-0000-000e-0000-000000000099', '00000000-0000-000a-0000-000000000099', '00000000-0000-000d-0000-000000000002', '00000000-0000-0001-0000-000000000001', 5000.00, 0.00,    '2024-04-30', 'overdue'),
  -- Tuition fee (monthly Q1) - demo student pending
  ('00000000-0000-000e-0000-000000000100', '00000000-0000-000a-0000-000000000099', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 0.00,    '2024-04-10', 'overdue'),
  -- Tuition fees for new class 8A students
  ('00000000-0000-000e-0000-000000000004', '00000000-0000-000a-0000-000000000004', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 2500.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000005', '00000000-0000-000a-0000-000000000005', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 2500.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000006', '00000000-0000-000a-0000-000000000006', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 1000.00, '2024-04-10', 'pending'),
  ('00000000-0000-000e-0000-000000000007', '00000000-0000-000a-0000-000000000007', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 0.00,    '2024-04-10', 'overdue'),
  -- Class 8B
  ('00000000-0000-000e-0000-000000000008', '00000000-0000-000a-0000-000000000008', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 2500.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000009', '00000000-0000-000a-0000-000000000009', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 2500.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000010', '00000000-0000-000a-0000-000000000010', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 0.00,    '2024-04-10', 'overdue'),
  ('00000000-0000-000e-0000-000000000011', '00000000-0000-000a-0000-000000000011', '00000000-0000-000d-0000-000000000001', '00000000-0000-0001-0000-000000000001', 2500.00, 1500.00, '2024-04-10', 'pending'),
  -- Class 9A
  ('00000000-0000-000e-0000-000000000012', '00000000-0000-000a-0000-000000000012', '00000000-0000-000d-0000-000000000004', '00000000-0000-0001-0000-000000000001', 3000.00, 3000.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000013', '00000000-0000-000a-0000-000000000013', '00000000-0000-000d-0000-000000000004', '00000000-0000-0001-0000-000000000001', 3000.00, 3000.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000014', '00000000-0000-000a-0000-000000000014', '00000000-0000-000d-0000-000000000004', '00000000-0000-0001-0000-000000000001', 3000.00, 0.00,    '2024-04-10', 'overdue'),
  ('00000000-0000-000e-0000-000000000015', '00000000-0000-000a-0000-000000000015', '00000000-0000-000d-0000-000000000004', '00000000-0000-0001-0000-000000000001', 3000.00, 3000.00, '2024-04-10', 'paid'),
  -- Class 10A
  ('00000000-0000-000e-0000-000000000016', '00000000-0000-000a-0000-000000000016', '00000000-0000-000d-0000-000000000005', '00000000-0000-0001-0000-000000000001', 3200.00, 3200.00, '2024-04-10', 'paid'),
  ('00000000-0000-000e-0000-000000000017', '00000000-0000-000a-0000-000000000017', '00000000-0000-000d-0000-000000000005', '00000000-0000-0001-0000-000000000001', 3200.00, 1600.00, '2024-04-10', 'pending'),
  ('00000000-0000-000e-0000-000000000018', '00000000-0000-000a-0000-000000000018', '00000000-0000-000d-0000-000000000005', '00000000-0000-0001-0000-000000000001', 3200.00, 3200.00, '2024-04-10', 'paid')
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 10: FEE TRANSACTIONS (6 months — for revenue trend chart)
-- =============================================================

INSERT INTO fee_transactions (id, fee_id, student_id, amount, payment_method, receipt_number, payment_date, collected_by) VALUES
  -- Jan 2026
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000001', '00000000-0000-000a-0000-000000000001', 5000.00, 'upi',          'RCP-2501', '2025-01-10 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000002', '00000000-0000-000a-0000-000000000002', 5000.00, 'cash',         'RCP-2502', '2025-01-12 11:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000004', '00000000-0000-000a-0000-000000000004', 2500.00, 'bank_transfer','RCP-2503', '2025-01-14 09:30:00', '00000000-0000-0005-0000-000000000001'),
  -- Feb 2026
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000005', '00000000-0000-000a-0000-000000000005', 2500.00, 'upi',          'RCP-2601', '2025-02-05 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000008', '00000000-0000-000a-0000-000000000008', 2500.00, 'cash',         'RCP-2602', '2025-02-08 11:30:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000009', '00000000-0000-000a-0000-000000000009', 2500.00, 'upi',          'RCP-2603', '2025-02-10 14:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000012', '00000000-0000-000a-0000-000000000012', 3000.00, 'bank_transfer','RCP-2604', '2025-02-12 09:00:00', '00000000-0000-0005-0000-000000000001'),
  -- Mar 2026
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000013', '00000000-0000-000a-0000-000000000013', 3000.00, 'cash',         'RCP-2701', '2025-03-03 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000015', '00000000-0000-000a-0000-000000000015', 3000.00, 'upi',          'RCP-2702', '2025-03-07 11:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000016', '00000000-0000-000a-0000-000000000016', 3200.00, 'bank_transfer','RCP-2703', '2025-03-09 09:30:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000018', '00000000-0000-000a-0000-000000000018', 3200.00, 'cash',         'RCP-2704', '2025-03-11 10:30:00', '00000000-0000-0005-0000-000000000001'),
  -- Apr 2026
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000001', '00000000-0000-000a-0000-000000000001', 2500.00, 'upi',          'RCP-2801', '2025-04-04 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000004', '00000000-0000-000a-0000-000000000004', 2500.00, 'cash',         'RCP-2802', '2025-04-06 11:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000008', '00000000-0000-000a-0000-000000000008', 2500.00, 'upi',          'RCP-2803', '2025-04-08 09:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000013', '00000000-0000-000a-0000-000000000013', 3000.00, 'bank_transfer','RCP-2804', '2025-04-10 14:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000016', '00000000-0000-000a-0000-000000000016', 3200.00, 'cash',         'RCP-2805', '2025-04-12 10:00:00', '00000000-0000-0005-0000-000000000001'),
  -- May 2026
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000002', '00000000-0000-000a-0000-000000000002', 2500.00, 'upi',          'RCP-2901', '2025-05-05 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000005', '00000000-0000-000a-0000-000000000005', 2500.00, 'cash',         'RCP-2902', '2025-05-07 11:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000009', '00000000-0000-000a-0000-000000000009', 2500.00, 'bank_transfer','RCP-2903', '2025-05-09 09:30:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000012', '00000000-0000-000a-0000-000000000012', 3000.00, 'upi',          'RCP-2904', '2025-05-11 10:30:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000018', '00000000-0000-000a-0000-000000000018', 3200.00, 'cash',         'RCP-2905', '2025-05-13 14:00:00', '00000000-0000-0005-0000-000000000001'),
  -- Jun 2026 (current month)
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000001', '00000000-0000-000a-0000-000000000001', 2500.00, 'upi',          'RCP-3001', '2026-06-03 10:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000004', '00000000-0000-000a-0000-000000000004', 2500.00, 'cash',         'RCP-3002', '2026-06-05 11:00:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000015', '00000000-0000-000a-0000-000000000015', 3000.00, 'bank_transfer','RCP-3003', '2026-06-07 09:30:00', '00000000-0000-0005-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000e-0000-000000000016', '00000000-0000-000a-0000-000000000016', 3200.00, 'upi',          'RCP-3004', '2026-06-08 10:00:00', '00000000-0000-0005-0000-000000000001')
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 11: MARKS for demo student + all class 8A
-- =============================================================

-- Marks for demo student (student@school.com) — exam 1
INSERT INTO marks (id, exam_id, student_id, subject_id, marks_obtained, is_absent, entered_by) VALUES
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000099', '00000000-0000-0004-0000-000000000003', 82, FALSE, '00000000-0000-0006-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000099', '00000000-0000-0004-0000-000000000004', 75, FALSE, '00000000-0000-0006-0000-000000000003'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000099', '00000000-0000-0004-0000-000000000002', 68, FALSE, '00000000-0000-0006-0000-000000000002'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000099', '00000000-0000-0004-0000-000000000001', 88, FALSE, '00000000-0000-0006-0000-000000000002'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000099', '00000000-0000-0004-0000-000000000005', 71, FALSE, '00000000-0000-0006-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Marks for class 8A students 4-7
INSERT INTO marks (id, exam_id, student_id, subject_id, marks_obtained, is_absent, entered_by) VALUES
  -- Student 4 (Kavya)
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000004', '00000000-0000-0004-0000-000000000003', 91, FALSE, '00000000-0000-0006-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000004', '00000000-0000-0004-0000-000000000004', 85, FALSE, '00000000-0000-0006-0000-000000000003'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000004', '00000000-0000-0004-0000-000000000002', 77, FALSE, '00000000-0000-0006-0000-000000000002'),
  -- Student 5 (Rohan)
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000005', '00000000-0000-0004-0000-000000000003', 62, FALSE, '00000000-0000-0006-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000005', '00000000-0000-0004-0000-000000000004', 58, FALSE, '00000000-0000-0006-0000-000000000003'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000005', '00000000-0000-0004-0000-000000000002', 71, FALSE, '00000000-0000-0006-0000-000000000002'),
  -- Student 6 (Sneha)
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000006', '00000000-0000-0004-0000-000000000003', 78, FALSE, '00000000-0000-0006-0000-000000000001'),
  (gen_random_uuid(), '00000000-0000-000c-0000-000000000001', '00000000-0000-000a-0000-000000000006', '00000000-0000-0004-0000-000000000001', 92, FALSE, '00000000-0000-0006-0000-000000000002')
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 12: HOMEWORK (for teacher dashboard + student pending HW)
-- =============================================================

INSERT INTO homework (id, teacher_id, section_id, subject_id, title, description, due_date) VALUES
  ('00000000-0000-000f-0000-000000000001', '00000000-0000-0006-0000-000000000001', '00000000-0000-0003-0000-000000000005', '00000000-0000-0004-0000-000000000003',
   'Chapter 5 — Quadratic Equations', 'Solve exercises 5.1 to 5.3 from NCERT. Show all working steps.', CURRENT_DATE + 3),
  ('00000000-0000-000f-0000-000000000002', '00000000-0000-0006-0000-000000000002', '00000000-0000-0003-0000-000000000005', '00000000-0000-0004-0000-000000000001',
   'Kavita Lekhan — Ped aur Pani', 'Write a poem of 12 lines on "Trees and Water". Include metaphors.', CURRENT_DATE + 2),
  ('00000000-0000-000f-0000-000000000003', '00000000-0000-0006-0000-000000000003', '00000000-0000-0003-0000-000000000005', '00000000-0000-0004-0000-000000000004',
   'Electricity Chapter Notes', 'Prepare handwritten notes on Ohm''s Law with diagrams. Min 2 pages.', CURRENT_DATE + 5),
  ('00000000-0000-000f-0000-000000000004', '00000000-0000-0006-0000-000000000001', '00000000-0000-0003-0000-000000000005', '00000000-0000-0004-0000-000000000005',
   'Map Work — Indian Rivers', 'On outline map of India, mark 10 major rivers and their origins.', CURRENT_DATE - 1),
  ('00000000-0000-000f-0000-000000000005', '00000000-0000-0006-0000-000000000099', '00000000-0000-0003-0000-000000000007', '00000000-0000-0004-0000-000000000004',
   'Periodic Table Exercise', 'Write electronic configuration of first 20 elements. Practice 5 times.', CURRENT_DATE + 4),
  ('00000000-0000-000f-0000-000000000006', '00000000-0000-0006-0000-000000000099', '00000000-0000-0003-0000-000000000007', '00000000-0000-0004-0000-000000000004',
   'Food and Nutrition Project', 'Prepare a chart showing food groups, nutrients and their sources.', CURRENT_DATE - 2)
ON CONFLICT DO NOTHING;


-- =============================================================
-- PART 13: NOTIFICATIONS
-- =============================================================

INSERT INTO notifications (id, title, body, type, sender_id, is_broadcast, sent_at) VALUES
  ('00000000-0000-0010-0000-000000000001', 'PTM Schedule — Class 8', 'Parent-Teacher Meeting for Class 8 is scheduled on 15 June 2026 from 10 AM to 1 PM. Please confirm your attendance.', 'general', '00000000-0000-0005-0000-000000000001', TRUE, NOW()),
  ('00000000-0000-0010-0000-000000000002', 'Fee Due Reminder', 'Annual fee for 2024-25 is overdue. Please pay at the school office before 20 June 2026 to avoid late charges.', 'fee', '00000000-0000-0005-0000-000000000001', FALSE, NOW()),
  ('00000000-0000-0010-0000-000000000003', 'Half-Yearly Exam Schedule Released', 'Half-Yearly Examination 2024-25 dates have been published. Exams will be held from 1 Oct to 10 Oct 2026.', 'exam', '00000000-0000-0005-0000-000000000001', TRUE, NOW()),
  ('00000000-0000-0010-0000-000000000004', 'Holiday Notice — Eid ul-Adha', 'School will remain closed on 17 June 2026 on account of Eid ul-Adha. Classes will resume from 18 June.', 'general', '00000000-0000-0005-0000-000000000001', TRUE, NOW()),
  ('00000000-0000-0010-0000-000000000005', 'Sports Day Registration Open', 'Annual Sports Day registrations are now open. Students interested in participating must register with their class teacher by 12 June.', 'general', '00000000-0000-0005-0000-000000000001', FALSE, NOW())
ON CONFLICT DO NOTHING;

-- Link notifications to demo student
INSERT INTO user_notifications (id, user_id, notification_id, is_read)
VALUES
  (gen_random_uuid(), '00000000-0000-0007-0000-000000000099', '00000000-0000-0010-0000-000000000003', FALSE),
  (gen_random_uuid(), '00000000-0000-0007-0000-000000000099', '00000000-0000-0010-0000-000000000004', FALSE),
  (gen_random_uuid(), '00000000-0000-0007-0000-000000000099', '00000000-0000-0010-0000-000000000005', TRUE)
ON CONFLICT (notification_id, user_id) DO NOTHING;

-- Link notifications to demo parent
INSERT INTO user_notifications (id, user_id, notification_id, is_read)
VALUES
  (gen_random_uuid(), '00000000-0000-0008-0000-000000000099', '00000000-0000-0010-0000-000000000001', FALSE),
  (gen_random_uuid(), '00000000-0000-0008-0000-000000000099', '00000000-0000-0010-0000-000000000002', FALSE),
  (gen_random_uuid(), '00000000-0000-0008-0000-000000000099', '00000000-0000-0010-0000-000000000004', TRUE)
ON CONFLICT (notification_id, user_id) DO NOTHING;


-- =============================================================
-- PART 14: ANNOUNCEMENTS
-- =============================================================

INSERT INTO announcements (id, title, content, created_by, is_pinned, target_roles) VALUES
  (gen_random_uuid(), 'New Academic Session 2025-26 Starts June 16', 'The new academic session will commence from 16 June 2026. All students are required to be present on the first day with complete uniform.', '00000000-0000-0005-0000-000000000001', TRUE,  ARRAY['admin','teacher','parent','student']::user_role[]),
  (gen_random_uuid(), 'Summer Vacation Extended', 'Due to extreme heat conditions, summer vacation has been extended till 15 June 2026. Online classes will continue as scheduled.', '00000000-0000-0005-0000-000000000001', TRUE,  ARRAY['admin','teacher','parent','student']::user_role[]),
  (gen_random_uuid(), 'Staff Meeting — 10 June 2026', 'Mandatory staff meeting for all teaching faculty on 10 June 2026 at 9 AM in the conference room.', '00000000-0000-0005-0000-000000000001', FALSE, ARRAY['admin','teacher']::user_role[])
ON CONFLICT DO NOTHING;


-- =============================================================
-- LOGIN CREDENTIALS SUMMARY
-- =============================================================
-- Admin   : admin@school.com       / admin123
-- Teacher : teacher@school.com     / teacher123
-- Student : student@school.com     / student123
-- Parent  : 9876543210 (phone)     / parent123
-- =============================================================
