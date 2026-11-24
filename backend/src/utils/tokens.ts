import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  deviceId?: string;
  sessionId?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_EXPIRES_IN as any
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, jti: uuidv4() }, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_EXPIRES_IN as any
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT.ACCESS_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT.REFRESH_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function generateStudentRegNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `STU${year}${sequence.toString().padStart(4, '0')}`;
}

export function generateTeacherId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TCH${year}${sequence.toString().padStart(4, '0')}`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
