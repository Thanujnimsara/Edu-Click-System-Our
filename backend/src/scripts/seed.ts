import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function runFullSeed(): Promise<void> {
  await db.init();

  // Check if admin already exists
  const existingAdmin = await db.query('SELECT id FROM users WHERE username = "admin"');
  if (existingAdmin.length > 0) {
    console.log('[Seed] Database already populated with seed users.');
    return;
  }

  console.log('[Seed] Generating comprehensive EDU CLICK LMS demo data...');

  const adminPass = await bcrypt.hash('Admin@1234', 10);
  const teacherPass = await bcrypt.hash('Teacher@1234', 10);
  const studentPass = await bcrypt.hash('Student@1234', 10);

  // 1. Admin User
  const adminUserId = uuidv4();
  await db.query(
    'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [adminUserId, 'admin', 'admin@educlick.lk', '0771234567', adminPass, 'ADMIN']
  );

  // 2. Teacher Kasun (Mathematics)
  const teacherKasunUserId = uuidv4();
  const teacherKasunId = uuidv4();
  await db.query(
    'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [teacherKasunUserId, 'teacher_kasun', 'kasun@educlick.lk', '0712345678', teacherPass, 'TEACHER']
  );
  await db.query(
    'INSERT INTO teachers (id, user_id, teacher_id, full_name, qualifications, experience_years, address, bio, commission_percentage, rating, total_students, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [teacherKasunId, teacherKasunUserId, 'TCH20260001', 'Kasun Jayawardena (B.Sc. Hons)', 'B.Sc. Mathematics (University of Colombo), PGDE', 8, 'Nugegoda, Colombo', 'Specialized in Grade 10-11 G.C.E. O/L Mathematics. Over 8 years of proven A-grade results across Sri Lanka.', 70.0, 4.95, 340, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200']
  );

  // 3. Teacher Priya (Science)
  const teacherPriyaUserId = uuidv4();
  const teacherPriyaId = uuidv4();
  await db.query(
    'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [teacherPriyaUserId, 'teacher_priya', 'priya@educlick.lk', '0723456789', teacherPass, 'TEACHER']
  );
  await db.query(
    'INSERT INTO teachers (id, user_id, teacher_id, full_name, qualifications, experience_years, address, bio, commission_percentage, rating, total_students, profile_picture_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [teacherPriyaId, teacherPriyaUserId, 'TCH20260002', 'Priyadarshani Silva', 'B.Sc. Biological Science (University of Peradeniya)', 6, 'Peradeniya, Kandy', 'Passionate science educator making complex physics and biology concepts intuitive and exam-oriented.', 70.0, 4.88, 220, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200']
  );

  // 4. Student Kamal Perera (Grade 11)
  const studentKamalUserId = uuidv4();
  const studentKamalId = uuidv4();
  await db.query(
    'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [studentKamalUserId, 'student_kamal', 'kamal@gmail.com', '0751112233', studentPass, 'STUDENT']
  );
  await db.query(
    'INSERT INTO students (id, user_id, registration_number, full_name, date_of_birth, gender, parent_name, parent_mobile, address, district, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [studentKamalId, studentKamalUserId, 'STU20260001', 'Kamal Perera', '2010-04-12', 'MALE', 'Sunil Perera', '0719998877', '120 Galle Road, Colombo 03', 'Colombo', 11]
  );

  // 5. Student Fatima Rameez (Grade 10)
  const studentFatimaUserId = uuidv4();
  const studentFatimaId = uuidv4();
  await db.query(
    'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [studentFatimaUserId, 'student_fatima', 'fatima@gmail.com', '0762223344', studentPass, 'STUDENT']
  );
  await db.query(
    'INSERT INTO students (id, user_id, registration_number, full_name, date_of_birth, gender, parent_name, parent_mobile, address, district, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [studentFatimaId, studentFatimaUserId, 'STU20260002', 'Fatima Rameez', '2011-08-20', 'FEMALE', 'M. Rameez', '0778887766', '45 Hill Street, Kandy', 'Kandy', 10]
  );

  // 6. Classes
  const classMath11 = 'cls-math-gr11';
  await db.query(
    `INSERT INTO classes (id, title, description, subject_id, grade, teacher_id, fee_lkr, is_free, capacity, enrolled_count, status, medium, day_of_week, start_time, end_time, class_type, external_link, external_platform)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [classMath11, 'G.C.E. O/L Mathematics Theory & Revision', 'Complete syllabus coverage, unit tests, and 10 years of past paper discussions.', 'subj-maths', 11, teacherKasunId, 2500.0, 0, 150, 48, 'AVAILABLE', 'SINHALA', 'Saturday', '08:30', '11:30', 'BUILT_IN', null, null]
  );

  const classSci10 = 'cls-sci-gr10';
  await db.query(
    `INSERT INTO classes (id, title, description, subject_id, grade, teacher_id, fee_lkr, is_free, capacity, enrolled_count, status, medium, day_of_week, start_time, end_time, class_type, external_link, external_platform)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [classSci10, 'Grade 10 Science Foundation Masterclass', 'Experimental demonstrations, molecular theory, genetics and electricity.', 'subj-science', 10, teacherPriyaId, 2000.0, 0, 120, 32, 'AVAILABLE', 'ENGLISH', 'Sunday', '09:00', '11:00', 'EXTERNAL', 'https://meet.google.com/edu-scie-gr10', 'GOOGLE_MEET']
  );

  const classEng11 = 'cls-eng-gr11';
  await db.query(
    `INSERT INTO classes (id, title, description, subject_id, grade, teacher_id, fee_lkr, is_free, capacity, enrolled_count, status, medium, day_of_week, start_time, end_time, class_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [classEng11, 'Grade 11 English Language Free Revision', 'Grammar essentials, essay composition, and reading comprehension.', 'subj-english', 11, teacherKasunId, 0.0, 1, 300, 115, 'AVAILABLE', 'ENGLISH', 'Monday', '16:30', '18:00', 'BUILT_IN']
  );

  // 7. Enroll Kamal in Grade 11 Mathematics & English
  await db.query('INSERT OR IGNORE INTO enrollments (id, student_id, class_id, is_active) VALUES (?, ?, ?, 1)', [uuidv4(), studentKamalId, classMath11]);
  await db.query('INSERT OR IGNORE INTO enrollments (id, student_id, class_id, is_active) VALUES (?, ?, ?, 1)', [uuidv4(), studentKamalId, classEng11]);

  // 8. Payment & Receipt for Kamal's Mathematics Class
  const paymentId = uuidv4();
  const receiptNo = 'REC-2026-782194';
  await db.query(
    'INSERT OR IGNORE INTO payments (id, student_id, class_id, amount_lkr, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [paymentId, studentKamalId, classMath11, 2500.0, 'BANK_TRANSFER', 'APPROVED', 'SLIP-9812903']
  );
  await db.query(
    'INSERT OR IGNORE INTO payment_receipts (id, receipt_number, payment_id) VALUES (?, ?, ?)',
    [uuidv4(), receiptNo, paymentId]
  );
  await db.query(
    'INSERT OR IGNORE INTO teacher_commissions (id, payment_id, teacher_id, class_id, total_fee_lkr, commission_percentage, teacher_earning_lkr, platform_earning_lkr, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), paymentId, teacherKasunId, classMath11, 2500.0, 70.0, 1750.0, 750.0, 'PAID']
  );

  // 9. Examination Paper (Grade 11 Mathematics Model Paper)
  const examId = 'exam-math-gr11-model';
  await db.query(
    `INSERT OR IGNORE INTO examination_papers (id, title, grade, subject_id, teacher_id, exam_category, term, academic_year, total_marks, duration_minutes, instructions, has_online_quiz, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [examId, '2026 G.C.E. O/L Mathematics Model Examination Paper 1', 11, 'subj-maths', teacherKasunId, 'MODEL_PAPERS', 'FIRST', 2026, 25, 30, 'Answer all multiple choice questions. 5 marks per question.', 1, 1]
  );

  // 10. Exam Questions
  const questions = [
    {
      num: 1,
      text: 'Find the value of x if 3x + 7 = 28',
      type: 'MCQ',
      options: ['x = 5', 'x = 7', 'x = 9', 'x = 8'],
      ans: 'x = 7',
      marks: 5
    },
    {
      num: 2,
      text: 'If the radius of a circle is 7 cm, what is its circumference? (Use π = 22/7)',
      type: 'MCQ',
      options: ['22 cm', '44 cm', '88 cm', '154 cm'],
      ans: '44 cm',
      marks: 5
    },
    {
      num: 3,
      text: 'What is the gradient (slope) of the straight line with equation y = 4x - 5?',
      type: 'MCQ',
      options: ['-5', '4', '5/4', '-4'],
      ans: '4',
      marks: 5
    },
    {
      num: 4,
      text: 'Factorize the quadratic expression: x² - 9',
      type: 'MCQ',
      options: ['(x - 3)(x - 3)', '(x + 3)(x - 3)', '(x + 9)(x - 1)', '(x - 9)(x + 1)'],
      ans: 'x + 3)(x - 3',
      marks: 5
    },
    {
      num: 5,
      text: 'A bag contains 5 red balls and 3 blue balls. What is the probability of randomly drawing a blue ball?',
      type: 'MCQ',
      options: ['3/8', '5/8', '1/3', '3/5'],
      ans: '3/8',
      marks: 5
    }
  ];

  for (const q of questions) {
    await db.query(
      `INSERT OR IGNORE INTO examination_questions (id, paper_id, question_number, question_text, question_type, options, correct_answer, allocated_marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), examId, q.num, q.text, q.type, JSON.stringify(q.options), q.ans, q.marks]
    );
  }

  // 11. Initial Notifications
  await db.query(
    'INSERT OR IGNORE INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), studentKamalUserId, 'Welcome to EDU CLICK!', 'Your account STU20260001 is active. Explore Grade 11 subjects and join live classes.', 'INFO']
  );

  console.log('[Seed] Comprehensive EDU CLICK LMS demo data successfully populated!');
}
