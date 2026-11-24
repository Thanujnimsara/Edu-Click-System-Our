-- =========================================================
-- EDU CLICK – INITIAL SEED DATA FOR SRI LANKA LMS
-- =========================================================

USE edu_click_db;

-- 1. Insert Grades 1 through 13
INSERT INTO grades (id, level, name, category, description) VALUES
(1, 1, 'Grade 1', 'Primary', 'Primary Foundation 1'),
(2, 2, 'Grade 2', 'Primary', 'Primary Foundation 2'),
(3, 3, 'Grade 3', 'Primary', 'Primary Key Stage 1'),
(4, 4, 'Grade 4', 'Primary', 'Primary Key Stage 2'),
(5, 5, 'Grade 5', 'Primary', 'Scholarship Examination Stage (ශිෂ්‍යත්ව විභාගය)'),
(6, 6, 'Grade 6', 'Junior', 'Junior Secondary Year 1'),
(7, 7, 'Grade 7', 'Junior', 'Junior Secondary Year 2'),
(8, 8, 'Grade 8', 'Junior', 'Junior Secondary Year 3'),
(9, 9, 'Grade 9', 'Junior', 'Junior Secondary Year 4'),
(10, 10, 'Grade 10', 'O/L', 'G.C.E. Ordinary Level Year 1'),
(11, 11, 'Grade 11', 'O/L', 'G.C.E. Ordinary Level Exam Year (සාමාන්‍ය පෙළ)'),
(12, 12, 'Grade 12', 'A/L', 'G.C.E. Advanced Level Year 1 (උසස් පෙළ)'),
(13, 13, 'Grade 13', 'A/L', 'G.C.E. Advanced Level Exam Year (උසස් පෙළ)')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Core Subjects
INSERT INTO subjects (id, name, code, description) VALUES
('subj-maths', 'Mathematics (ගණිතය)', 'MATH', 'National Mathematics curriculum'),
('subj-science', 'Science (විද්‍යාව)', 'SCI', 'Integrated Science for Junior and O/L'),
('subj-english', 'English Language (ඉංග්‍රීසි)', 'ENG', 'English Language and Grammar'),
('subj-sinhala', 'Sinhala Language & Literature (සිංහල)', 'SIN', 'Sinhala Language and Literature'),
('subj-tamil', 'Tamil Language (දෙමළ)', 'TAM', 'Tamil Language and Literature'),
('subj-history', 'History (ඉතිහාසය)', 'HIST', 'Sri Lankan and World History'),
('subj-ict', 'Information & Communication Technology', 'ICT', 'ICT for O/L and A/L'),
('subj-commerce', 'Commerce & Accounting (ව්‍යාපාර අධ්‍යයනය)', 'COMM', 'Business and Accounting'),
('subj-physics', 'Combined Mathematics & Physics', 'AL-MATH', 'A/L Physical Science Stream'),
('subj-biology', 'Biology & Chemistry', 'AL-BIO', 'A/L Biological Science Stream')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. System Bank Accounts
INSERT INTO bank_accounts (id, bank_name, account_name, account_number, branch_name, instructions, is_active) VALUES
('bank-boc', 'Bank of Ceylon (BOC)', 'EDU CLICK (PVT) LTD', '008920192837', 'Colombo City Branch', 'Please use your Student Registration Number as deposit reference.', TRUE),
('bank-com', 'Commercial Bank of Ceylon', 'EDU CLICK (PVT) LTD', '100092837461', 'Kandy Super Branch', 'Upload clear photograph or PDF of bank payment slip.', TRUE),
('bank-hnb', 'Hatton National Bank (HNB)', 'EDU CLICK (PVT) LTD', '200192837490', 'Galle Fort Branch', 'Electronic fund transfers (CEFT / SLIPS) accepted.', TRUE)
ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name);

-- 4. Initial System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('PLATFORM_NAME', 'EDU CLICK', 'Official platform brand name'),
('TAGLINE', 'One Platform. Every Device. Every Student.', 'Brand motto'),
('DEFAULT_TEACHER_COMMISSION', '70.00', 'Default commission percentage for instructors'),
('CURRENCY_CODE', 'LKR', 'Sri Lankan Rupee currency identifier'),
('PAYHERE_SANDBOX_MODE', 'TRUE', 'PayHere Sri Lanka gateway sandbox mode'),
('LIVEKIT_HOST', 'wss://live.educlick.lk', 'WebRTC LiveKit room service host')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
