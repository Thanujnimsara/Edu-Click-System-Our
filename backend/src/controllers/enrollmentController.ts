import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function enrollClass(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { classId } = req.body;
    const userId = req.user?.userId;

    // Get student profile
    const students = await db.query('SELECT id, full_name, grade FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(403).json({ success: false, message: 'Only registered students can enroll in classes.' });
      return;
    }
    const student = students[0];

    // Check class existence and capacity
    const classes = await db.query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classes.length === 0) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }
    const cls = classes[0];

    if (cls.enrolled_count >= cls.capacity) {
      res.status(400).json({ success: false, message: 'Class is fully booked.' });
      return;
    }

    // Check duplicate enrollment
    const existingEnrollment = await db.query(
      'SELECT id, is_active FROM enrollments WHERE student_id = ? AND class_id = ?',
      [student.id, classId]
    );

    if (existingEnrollment.length > 0) {
      res.status(409).json({ success: false, message: 'Student is already enrolled in this class.' });
      return;
    }

    const enrollmentId = uuidv4();
    await db.query(
      'INSERT INTO enrollments (id, student_id, class_id, is_active) VALUES (?, ?, ?, 1)',
      [enrollmentId, student.id, classId]
    );

    // Increment class enrolled count
    await db.query(
      'UPDATE classes SET enrolled_count = enrolled_count + 1 WHERE id = ?',
      [classId]
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment successful. Class added to your timetable and enrolled classes.',
      data: { enrollmentId, classId, title: cls.title }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyEnrolledClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const students = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }
    const studentId = students[0].id;

    const classes = await db.query(`
      SELECT e.id as enrollment_id, e.enrolled_at, e.is_active as enrollment_active,
             c.*, s.name as subject_name, s.code as subject_code,
             t.full_name as teacher_name, t.rating as teacher_rating, t.profile_picture_url as teacher_pic,
             (SELECT p.status FROM payments p WHERE p.student_id = e.student_id AND p.class_id = c.id ORDER BY p.created_at DESC LIMIT 1) as payment_status
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      WHERE e.student_id = ? AND e.is_active = 1
      ORDER BY c.day_of_week ASC, c.start_time ASC
    `, [studentId]);

    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyTimetable(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let classes: any[] = [];

    if (userRole === 'STUDENT') {
      const students = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
      if (students.length === 0) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }
      classes = await db.query(`
        SELECT c.id, c.title, c.grade, c.day_of_week, c.start_time, c.end_time,
               c.class_type, c.external_link, c.external_platform, c.status as class_status,
               s.name as subject_name, t.full_name as teacher_name
        FROM enrollments e
        JOIN classes c ON e.class_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        JOIN teachers t ON c.teacher_id = t.id
        WHERE e.student_id = ? AND e.is_active = 1
        ORDER BY c.start_time ASC
      `, [students[0].id]);
    } else if (userRole === 'TEACHER') {
      const teachers = await db.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
      if (teachers.length === 0) {
        res.status(404).json({ success: false, message: 'Teacher profile not found.' });
        return;
      }
      classes = await db.query(`
        SELECT c.id, c.title, c.grade, c.day_of_week, c.start_time, c.end_time,
               c.class_type, c.external_link, c.external_platform, c.status as class_status,
               c.enrolled_count, c.capacity,
               s.name as subject_name, t.full_name as teacher_name
        FROM classes c
        JOIN subjects s ON c.subject_id = s.id
        JOIN teachers t ON c.teacher_id = t.id
        WHERE c.teacher_id = ?
        ORDER BY c.start_time ASC
      `, [teachers[0].id]);
    }

    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
