import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateTeacherId } from '../utils/tokens';

export async function getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentCount = await db.query('SELECT count(*) as count FROM students');
    const teacherCount = await db.query('SELECT count(*) as count FROM teachers');
    const classCount = await db.query('SELECT count(*) as count FROM classes');
    const enrollmentCount = await db.query('SELECT count(*) as count FROM enrollments WHERE is_active = 1');
    const revenueSum = await db.query('SELECT SUM(amount_lkr) as total FROM payments WHERE status = "APPROVED"');
    const pendingSlips = await db.query('SELECT count(*) as count FROM bank_transfer_submissions WHERE verification_status = "PENDING"');
    const examCount = await db.query('SELECT count(*) as count FROM examination_papers');

    const totalRevenue = revenueSum[0]?.total || 0;
    const teacherCommission = totalRevenue * 0.70;
    const platformEarnings = totalRevenue * 0.30;

    res.json({
      success: true,
      data: {
        totalStudents: studentCount[0]?.count || 0,
        totalTeachers: teacherCount[0]?.count || 0,
        totalClasses: classCount[0]?.count || 0,
        activeEnrollments: enrollmentCount[0]?.count || 0,
        totalRevenueLkr: totalRevenue,
        teacherCommissionsLkr: teacherCommission,
        platformEarningsLkr: platformEarnings,
        pendingBankVerifications: pendingSlips[0]?.count || 0,
        totalExams: examCount[0]?.count || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPendingBankSlips(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const slips = await db.query(`
      SELECT bts.*, p.amount_lkr, p.student_id, p.class_id,
             s.full_name as student_name, s.registration_number,
             c.title as class_title, ba.bank_name, ba.account_number
      FROM bank_transfer_submissions bts
      JOIN payments p ON bts.payment_id = p.id
      JOIN students s ON p.student_id = s.id
      JOIN classes c ON p.class_id = c.id
      LEFT JOIN bank_accounts ba ON bts.bank_account_id = ba.id
      WHERE bts.verification_status = 'PENDING'
      ORDER BY bts.created_at ASC
    `);

    res.json({ success: true, data: slips });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyBankSlip(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { submissionId } = req.params;
    const { action, notes } = req.body; // action: 'APPROVED' or 'REJECTED'
    const adminUserId = req.user?.userId;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be APPROVED or REJECTED.' });
      return;
    }

    const submissions = await db.query(
      'SELECT bts.*, p.student_id, p.class_id, p.amount_lkr FROM bank_transfer_submissions bts JOIN payments p ON bts.payment_id = p.id WHERE bts.id = ?',
      [submissionId]
    );

    if (submissions.length === 0) {
      res.status(404).json({ success: false, message: 'Bank submission not found.' });
      return;
    }

    const sub = submissions[0];

    // Update submission
    await db.query(
      'UPDATE bank_transfer_submissions SET verification_status = ?, rejection_reason = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?',
      [action, notes || '', adminUserId, submissionId]
    );

    // Update payment
    await db.query(
      'UPDATE payments SET status = ? WHERE id = ?',
      [action, sub.payment_id]
    );

    if (action === 'APPROVED') {
      // 1. Ensure student is enrolled in the class
      const enrollCheck = await db.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?',
        [sub.student_id, sub.class_id]
      );
      if (enrollCheck.length === 0) {
        await db.query(
          'INSERT INTO enrollments (id, student_id, class_id, is_active) VALUES (?, ?, ?, 1)',
          [uuidv4(), sub.student_id, sub.class_id]
        );
        await db.query('UPDATE classes SET enrolled_count = enrolled_count + 1 WHERE id = ?', [sub.class_id]);
      }

      // 2. Generate PDF receipt record
      const receiptNo = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      await db.query(
        'INSERT INTO payment_receipts (id, receipt_number, payment_id) VALUES (?, ?, ?)',
        [uuidv4(), receiptNo, sub.payment_id]
      );

      // 3. Compute teacher commission (70% teacher, 30% platform)
      const clsResult = await db.query('SELECT teacher_id FROM classes WHERE id = ?', [sub.class_id]);
      if (clsResult.length > 0) {
        const teacherId = clsResult[0].teacher_id;
        const totalFee = sub.amount_lkr;
        const commPct = 70.0;
        const teacherEarning = totalFee * (commPct / 100);
        const platformEarning = totalFee - teacherEarning;

        await db.query(
          'INSERT INTO teacher_commissions (id, payment_id, teacher_id, class_id, total_fee_lkr, commission_percentage, teacher_earning_lkr, platform_earning_lkr, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), sub.payment_id, teacherId, sub.class_id, totalFee, commPct, teacherEarning, platformEarning, 'PENDING']
        );
      }

      // 4. Send notification to student
      const studentUser = await db.query('SELECT user_id FROM students WHERE id = ?', [sub.student_id]);
      if (studentUser.length > 0) {
        await db.query(
          'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), studentUser[0].user_id, 'Payment Approved', `Your bank deposit of LKR ${sub.amount_lkr} has been verified and enrollment is active.`, 'PAYMENT']
        );
      }
    }

    res.json({ success: true, message: `Payment submission ${action.toLowerCase()} successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createTeacherAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { fullName, username, email, mobile, password, qualifications, experienceYears, bio, commissionPercentage = 70 } = req.body;

    if (!fullName || !username || !email || !mobile || !password) {
      res.status(400).json({ success: false, message: 'All teacher core fields are required.' });
      return;
    }

    const existing = await db.query('SELECT id FROM users WHERE username = ? OR email = ? OR mobile = ?', [username, email, mobile]);
    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'User already exists with this username, email, or mobile.' });
      return;
    }

    const teacherCountResult = await db.query('SELECT count(*) as count FROM teachers');
    const seq = (teacherCountResult[0]?.count || 0) + 1;
    const teacherIdCode = generateTeacherId(seq);

    const userId = uuidv4();
    const teacherId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [userId, username, email, mobile, passwordHash, 'TEACHER']
    );

    await db.query(
      'INSERT INTO teachers (id, user_id, teacher_id, full_name, qualifications, experience_years, address, bio, commission_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [teacherId, userId, teacherIdCode, fullName, qualifications || 'B.Sc. / National Dip.', parseInt(experienceYears || '3', 10), 'Sri Lanka', bio || '', commissionPercentage]
    );

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      data: { teacherId: teacherIdCode, username, email }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
