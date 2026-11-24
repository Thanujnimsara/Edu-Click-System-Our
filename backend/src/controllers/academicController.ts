import { Request, Response } from 'express';
import { db } from '../config/db';

export async function getGrades(req: Request, res: Response): Promise<void> {
  try {
    const grades = await db.query('SELECT * FROM grades ORDER BY level ASC');
    res.json({ success: true, data: grades });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const { grade } = req.query;
    let sql = 'SELECT * FROM subjects ORDER BY name ASC';
    const params: any[] = [];
    const subjects = await db.query(sql, params);
    res.json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTeachers(req: Request, res: Response): Promise<void> {
  try {
    const teachers = await db.query(`
      SELECT t.id, t.teacher_id, t.full_name, t.qualifications, t.experience_years,
             t.bio, t.profile_picture_url, t.rating, t.total_students, u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.rating DESC, t.full_name ASC
    `);
    res.json({ success: true, data: teachers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClasses(req: Request, res: Response): Promise<void> {
  try {
    const { grade, subjectId, teacherId, isFree, search, status } = req.query;
    let sql = `
      SELECT c.*, s.name as subject_name, s.code as subject_code,
             t.full_name as teacher_name, t.teacher_id, t.rating as teacher_rating, t.profile_picture_url as teacher_pic
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (grade) {
      sql += ' AND c.grade = ?';
      params.push(parseInt(grade as string, 10));
    }
    if (subjectId) {
      sql += ' AND c.subject_id = ?';
      params.push(subjectId);
    }
    if (teacherId) {
      sql += ' AND c.teacher_id = ?';
      params.push(teacherId);
    }
    if (isFree !== undefined) {
      sql += ' AND c.is_free = ?';
      params.push(isFree === 'true' ? 1 : 0);
    }
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (c.title LIKE ? OR c.description LIKE ? OR t.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY c.grade ASC, c.title ASC';
    const classes = await db.query(sql, params);
    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClassDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const classes = await db.query(`
      SELECT c.*, s.name as subject_name, s.code as subject_code,
             t.full_name as teacher_name, t.teacher_id, t.qualifications, t.bio as teacher_bio,
             t.rating as teacher_rating, t.profile_picture_url as teacher_pic
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = ?
    `, [id]);

    if (classes.length === 0) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }

    res.json({ success: true, data: classes[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
