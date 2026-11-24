import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateStudentRegNumber,
  generateOTP
} from '../utils/tokens';
import { AuthenticatedRequest } from '../middleware/auth';

export async function registerStudent(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      username,
      dateOfBirth,
      gender,
      parentName,
      parentMobile,
      mobile,
      email,
      password,
      address,
      district,
      grade
    } = req.body;

    if (!fullName || !username || !mobile || !email || !password || !grade) {
      res.status(400).json({ success: false, message: 'Please fill all mandatory fields.' });
      return;
    }

    // Check duplicate username, email, or mobile
    const existing = await db.query(
      'SELECT id, username, email, mobile FROM users WHERE username = ? OR email = ? OR mobile = ?',
      [username, email, mobile]
    );

    if (existing.length > 0) {
      const match = existing[0];
      let msg = 'Account already exists: ';
      if (match.username === username) msg += 'Username is taken. ';
      if (match.email === email) msg += 'Email is already registered. ';
      if (match.mobile === mobile) msg += 'Mobile number is already registered. ';
      res.status(409).json({ success: false, message: msg.trim() });
      return;
    }

    const userId = uuidv4();
    const studentId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    // Count students to generate sequential registration number
    const studentCountResult = await db.query('SELECT count(*) as count FROM students');
    const seq = (studentCountResult[0]?.count || 0) + 1;
    const regNumber = generateStudentRegNumber(seq);

    // Insert user
    await db.query(
      'INSERT INTO users (id, username, email, mobile, password_hash, role, is_active, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, mobile, passwordHash, 'STUDENT', 1, 'en']
    );

    // Insert student profile
    await db.query(
      'INSERT INTO students (id, user_id, registration_number, full_name, date_of_birth, gender, parent_name, parent_mobile, address, district, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, userId, regNumber, fullName, dateOfBirth || '2010-01-01', gender || 'MALE', parentName || 'Parent', parentMobile || mobile, address || 'Sri Lanka', district || 'Colombo', parseInt(grade, 10)]
    );

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    await db.query(
      'INSERT INTO otp_verifications (id, mobile, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), mobile, otp, 'REGISTRATION', otpExpires]
    );

    console.log(`[SMS-MOCK] OTP sent to ${mobile} for Registration: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Student registration initiated. OTP sent to registered mobile number.',
      data: {
        registrationNumber: regNumber,
        mobile,
        mockOtp: otp // Delivered for development testing
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration', error: error.message });
  }
}

export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const { mobile, otpCode, deviceName = 'Web Browser', platform = 'WEB' } = req.body;

    const rows = await db.query(
      'SELECT id, otp_code, expires_at, is_used FROM otp_verifications WHERE mobile = ? AND otp_code = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
      [mobile, otpCode]
    );

    if (rows.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or already used OTP code.' });
      return;
    }

    const otpRecord = rows[0];
    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
      return;
    }

    // Mark OTP as used
    await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [otpRecord.id]);

    // Fetch user and student profile
    const users = await db.query(
      'SELECT u.id, u.username, u.email, u.mobile, u.role, u.preferred_language, s.registration_number, s.full_name, s.grade FROM users u LEFT JOIN students s ON u.id = s.user_id WHERE u.mobile = ?',
      [mobile]
    );

    if (users.length === 0) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const user = users[0];
    const sessionId = uuidv4();
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 8);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Store user session for cross-device management
    await db.query(
      'INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_name, platform, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sessionId, user.id, refreshTokenHash, deviceName, platform, req.ip || '127.0.0.1', expiresAt]
    );

    res.json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          fullName: user.full_name,
          registrationNumber: user.registration_number,
          grade: user.grade,
          preferredLanguage: user.preferred_language
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function requestLoginOtp(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier) {
      res.status(400).json({ success: false, message: 'Please provide your username, registration number, or mobile.' });
      return;
    }

    // Match user by identifier and optional role
    let query = `
      SELECT u.id, u.username, u.email, u.mobile, u.password_hash, u.role, u.is_active,
             s.registration_number, s.full_name as student_name, s.grade,
             t.teacher_id, t.full_name as teacher_name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE (u.username = ? OR u.email = ? OR u.mobile = ? OR s.registration_number = ? OR t.teacher_id = ?)
    `;
    const params: any[] = [identifier, identifier, identifier, identifier, identifier];
    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    const users = await db.query(query, params);

    if (users.length === 0) {
      res.status(404).json({ success: false, message: 'Account not found with the provided details.' });
      return;
    }

    const user = users[0];
    if (!user.is_active) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Please contact administration.' });
      return;
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Incorrect password. Please enter the valid password.' });
        return;
      }
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await db.query(
      'INSERT INTO otp_verifications (id, mobile, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.mobile, otp, 'LOGIN', otpExpires]
    );

    console.log(`[SMS-MOCK] ${user.role} Login OTP sent to ${user.mobile} (${user.username}): ${otp}`);

    const mobileStr = user.mobile || '';
    const maskedMobile = mobileStr.length >= 7
      ? `${mobileStr.slice(0, 3)} •••• ${mobileStr.slice(-3)}`
      : mobileStr;

    res.json({
      success: true,
      message: `OTP code sent to registered mobile number (${maskedMobile}).`,
      data: {
        mobile: user.mobile,
        maskedMobile,
        role: user.role,
        fullName: user.role === 'STUDENT' ? user.student_name : (user.role === 'TEACHER' ? user.teacher_name : user.username),
        registrationNumber: user.registration_number,
        teacherId: user.teacher_id,
        mockOtp: otp // Included for testing and developer preview
      }
    });
  } catch (error: any) {
    console.error('Request Login OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const requestStudentLoginOtp = requestLoginOtp;

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password, otpCode, deviceName = 'Web Browser', platform = 'WEB' } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Please provide username/reg number and password.' });
      return;
    }

    // Match by username, email, mobile, or student registration number
    const users = await db.query(
      `SELECT u.id, u.username, u.email, u.mobile, u.password_hash, u.role, u.is_active, u.preferred_language,
              s.registration_number, s.full_name as student_name, s.grade,
              t.teacher_id, t.full_name as teacher_name
       FROM users u
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN teachers t ON u.id = t.user_id
       WHERE u.username = ? OR u.email = ? OR u.mobile = ? OR s.registration_number = ? OR t.teacher_id = ?`,
      [identifier, identifier, identifier, identifier, identifier]
    );

    if (users.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const user = users[0];
    if (!user.is_active) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    // If student or teacher and OTP code provided, verify OTP
    if ((user.role === 'STUDENT' || user.role === 'TEACHER') && otpCode) {
      const otpRows = await db.query(
        'SELECT id, otp_code, expires_at, is_used FROM otp_verifications WHERE mobile = ? AND otp_code = ? AND purpose = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
        [user.mobile, otpCode, 'LOGIN']
      );

      if (otpRows.length === 0) {
        res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your SMS or click Resend.' });
        return;
      }

      const otpRec = otpRows[0];
      if (new Date(otpRec.expires_at).getTime() < Date.now()) {
        res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new code.' });
        return;
      }

      // Mark OTP as used
      await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [otpRec.id]);
    }

    const sessionId = uuidv4();
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 8);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Save session
    await db.query(
      'INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_name, platform, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sessionId, user.id, refreshTokenHash, deviceName, platform, req.ip || '127.0.0.1', expiresAt]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          preferredLanguage: user.preferred_language || 'en',
          fullName: user.role === 'STUDENT' ? user.student_name : (user.role === 'TEACHER' ? user.teacher_name : 'Administrator'),
          registrationNumber: user.registration_number,
          teacherId: user.teacher_id,
          grade: user.grade
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    const payload = verifyRefreshToken(token);
    if (!payload || !payload.sessionId) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      return;
    }

    // Verify session in database
    const sessions = await db.query(
      'SELECT id, is_revoked, expires_at FROM user_sessions WHERE id = ?',
      [payload.sessionId]
    );

    if (sessions.length === 0 || sessions[0].is_revoked || new Date(sessions[0].expires_at).getTime() < Date.now()) {
      res.status(401).json({ success: false, message: 'Session is revoked or expired.' });
      return;
    }

    // Issue rotated tokens
    const newPayload = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    const newHash = await bcrypt.hash(newRefreshToken, 8);

    await db.query(
      'UPDATE user_sessions SET refresh_token_hash = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, payload.sessionId]
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user?.sessionId) {
      await db.query('UPDATE user_sessions SET is_revoked = 1 WHERE id = ?', [req.user.sessionId]);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const currentSessionId = req.user?.sessionId;

    const devices = await db.query(
      'SELECT id, device_name, platform, ip_address, last_active, is_revoked FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC',
      [userId]
    );

    const formatted = devices.map((d: any) => ({
      id: d.id,
      deviceName: d.device_name,
      platform: d.platform,
      ipAddress: d.ip_address,
      lastActive: d.last_active,
      isRevoked: Boolean(d.is_revoked),
      isCurrent: d.id === currentSessionId
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function revokeDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    await db.query(
      'UPDATE user_sessions SET is_revoked = 1 WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    res.json({ success: true, message: 'Device session revoked.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function logoutAllDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    await db.query('UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?', [userId]);
    res.json({ success: true, message: 'Logged out from all devices.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateLanguagePreference(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { language } = req.body;
    const userId = req.user?.userId;

    if (!['en', 'si', 'ta'].includes(language)) {
      res.status(400).json({ success: false, message: 'Supported languages are en, si, ta.' });
      return;
    }

    await db.query('UPDATE users SET preferred_language = ? WHERE id = ?', [language, userId]);
    res.json({ success: true, message: 'Language preference saved across all devices.', language });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
