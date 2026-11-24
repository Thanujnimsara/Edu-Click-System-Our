import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getExams(req: Request, res: Response): Promise<void> {
  try {
    const { grade, subjectId, category } = req.query;
    let sql = `
      SELECT ep.*, s.name as subject_name, t.full_name as teacher_name
      FROM examination_papers ep
      JOIN subjects s ON ep.subject_id = s.id
      JOIN teachers t ON ep.teacher_id = t.id
      WHERE ep.is_published = 1
    `;
    const params: any[] = [];

    if (grade) {
      sql += ' AND ep.grade = ?';
      params.push(parseInt(grade as string, 10));
    }
    if (subjectId) {
      sql += ' AND ep.subject_id = ?';
      params.push(subjectId);
    }
    if (category) {
      sql += ' AND ep.exam_category = ?';
      params.push(category);
    }

    sql += ' ORDER BY ep.created_at DESC';
    const exams = await db.query(sql, params);
    res.json({ success: true, data: exams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getExamDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const papers = await db.query(`
      SELECT ep.*, s.name as subject_name, t.full_name as teacher_name
      FROM examination_papers ep
      JOIN subjects s ON ep.subject_id = s.id
      JOIN teachers t ON ep.teacher_id = t.id
      WHERE ep.id = ?
    `, [id]);

    if (papers.length === 0) {
      res.status(404).json({ success: false, message: 'Examination paper not found.' });
      return;
    }

    const questions = await db.query(`
      SELECT id, paper_id, question_number, question_text, question_type, options, allocated_marks
      FROM examination_questions
      WHERE paper_id = ?
      ORDER BY question_number ASC
    `, [id]);

    const formattedQuestions = questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json({
      success: true,
      data: {
        ...papers[0],
        questions: formattedQuestions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitExam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { paperId, answers } = req.body; // answers: { [questionId]: "A" }
    const userId = req.user?.userId;

    const students = await db.query('SELECT id, full_name FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(403).json({ success: false, message: 'Only students can submit exams.' });
      return;
    }
    const student = students[0];

    // Fetch questions with correct answers
    const questions = await db.query('SELECT id, correct_answer, allocated_marks FROM examination_questions WHERE paper_id = ?', [paperId]);
    if (questions.length === 0) {
      res.status(404).json({ success: false, message: 'Exam questions not found.' });
      return;
    }

    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const q of questions) {
      const marks = q.allocated_marks || 1;
      totalMarks += marks;
      const studentAns = answers?.[q.id];
      if (studentAns && studentAns.toString().trim().toUpperCase() === q.correct_answer.toString().trim().toUpperCase()) {
        obtainedMarks += marks;
      }
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    let gradeLetter = 'F';
    if (percentage >= 75) gradeLetter = 'A';
    else if (percentage >= 65) gradeLetter = 'B';
    else if (percentage >= 50) gradeLetter = 'C';
    else if (percentage >= 35) gradeLetter = 'S';

    const submissionId = uuidv4();
    await db.query(
      'INSERT INTO examination_submissions (id, paper_id, student_id, obtained_marks, status, feedback) VALUES (?, ?, ?, ?, ?, ?)',
      [submissionId, paperId, student.id, obtainedMarks, 'MARKED', `Automated Objective Marking: Score ${obtainedMarks}/${totalMarks} (${percentage.toFixed(1)}%)`]
    );

    res.json({
      success: true,
      message: 'Exam submitted and graded successfully.',
      data: {
        submissionId,
        obtainedMarks,
        totalMarks,
        percentage: Number(percentage.toFixed(1)),
        gradeLetter
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyResults(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const students = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (students.length === 0) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const results = await db.query(`
      SELECT es.*, ep.title as exam_title, ep.total_marks as max_marks, ep.grade, ep.term,
             s.name as subject_name, t.full_name as teacher_name
      FROM examination_submissions es
      JOIN examination_papers ep ON es.paper_id = ep.id
      JOIN subjects s ON ep.subject_id = s.id
      JOIN teachers t ON ep.teacher_id = t.id
      WHERE es.student_id = ?
      ORDER BY es.submitted_at DESC
    `, [students[0].id]);

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
