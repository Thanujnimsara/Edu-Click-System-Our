import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokens';
import { db } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  token?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
    return;
  }

  // Check if session is revoked if sessionId is present
  if (payload.sessionId) {
    const sessions = await db.query(
      'SELECT is_revoked FROM user_sessions WHERE id = ?',
      [payload.sessionId]
    );
    if (sessions.length > 0 && sessions[0].is_revoked) {
      res.status(401).json({ success: false, message: 'Session has been revoked. Please log in again.' });
      return;
    }
  }

  req.user = payload;
  req.token = token;
  next();
}
