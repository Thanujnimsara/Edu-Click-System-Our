import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getTeacherDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teachers = await db.query('SELECT id, full_name, teacher_id, commission_percentage FROM teachers WHERE user_id = ?', [userId]);
    if (teachers.length === 0) {
      res.status(404).json({ success: false, message: 'Teacher profile not found.' });
      return;
    }
    const teacher = teachers[0];

    const classCount = await db.query('SELECT count(*) as count FROM classes WHERE teacher_id = ?', [teacher.id]);
    const studentCount = await db.query(`
      SELECT count(DISTINCT e.student_id) as count
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = ? AND e.is_active = 1
    `, [teacher.id]);

    const earningsResult = await db.query(`
      SELECT SUM(teacher_earning_lkr) as total_earnings,
             SUM(CASE WHEN status = 'PENDING' THEN teacher_earning_lkr ELSE 0 END) as pending_commission
      FROM teacher_commissions
      WHERE teacher_id = ?
    `, [teacher.id]);

    res.json({
      success: true,
      data: {
        teacher,
        totalClasses: classCount[0]?.count || 0,
        totalStudents: studentCount[0]?.count || 0,
        totalEarningsLkr: earningsResult[0]?.total_earnings || 0,
        pendingCommissionLkr: earningsResult[0]?.pending_commission || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTeacherClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teachers = await db.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
    if (teachers.length === 0) {
      res.status(404).json({ success: false, message: 'Teacher not found.' });
      return;
    }

    const classes = await db.query(`
      SELECT c.*, s.name as subject_name
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      WHERE c.teacher_id = ?
      ORDER BY c.grade ASC, c.title ASC
    `, [teachers[0].id]);

    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { classId, sessionDate, attendanceList } = req.body; // attendanceList: [{ studentId, status: 'PRESENT' | 'ABSENT' | 'LATE' }]
    const userId = req.user?.userId;

    for (const record of attendanceList) {
      const existing = await db.query(
        'SELECT id FROM attendance WHERE class_id = ? AND student_id = ? AND session_date = ?',
        [classId, record.studentId, sessionDate]
      );

      if (existing.length > 0) {
        await db.query(
          'UPDATE attendance SET status = ?, marked_by = ?, marked_at = CURRENT_TIMESTAMP WHERE id = ?',
          [record.status, userId, existing[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO attendance (id, class_id, student_id, session_date, status, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), classId, record.studentId, sessionDate, record.status, userId]
        );
      }
    }

    res.json({ success: true, message: 'Attendance marked successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
