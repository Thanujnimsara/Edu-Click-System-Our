import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getLiveRoomToken(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { classId } = req.params;
    const user = req.user;

    const classes = await db.query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classes.length === 0) {
      res.status(404).json({ success: false, message: 'Classroom not found.' });
      return;
    }
    const cls = classes[0];

    // Check enrollment if student
    if (user?.role === 'STUDENT') {
      const students = await db.query('SELECT id FROM students WHERE user_id = ?', [user.userId]);
      if (students.length === 0) {
        res.status(403).json({ success: false, message: 'Unauthorized student profile.' });
        return;
      }
      const enrollCheck = await db.query('SELECT id FROM enrollments WHERE student_id = ? AND class_id = ? AND is_active = 1', [students[0].id, classId]);
      if (enrollCheck.length === 0) {
        res.status(403).json({ success: false, message: 'You must be enrolled in this class to access live sessions.' });
        return;
      }
    }

    // Return session details: either external link or built-in WebRTC room
    const roomName = `room-${cls.id}`;
    const token = `educlick-token-${uuidv4()}`;

    res.json({
      success: true,
      data: {
        classId: cls.id,
        classTitle: cls.title,
        classType: cls.class_type,
        externalLink: cls.external_link,
        externalPlatform: cls.external_platform,
        builtInRoom: {
          roomName,
          token,
          userRole: user?.role,
          username: user?.username
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
