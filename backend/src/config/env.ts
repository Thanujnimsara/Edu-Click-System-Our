import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'edu_click_db'
  },
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'educlick_jwt_access_secret_dev_2026',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'educlick_jwt_refresh_secret_dev_2026',
    ACCESS_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  PAYHERE: {
    MERCHANT_ID: process.env.PAYHERE_MERCHANT_ID || '1220001',
    MERCHANT_SECRET: process.env.PAYHERE_MERCHANT_SECRET || 'payhere_secret_sandbox_educlick',
    CURRENCY: process.env.PAYHERE_CURRENCY || 'LKR',
    MODE: process.env.PAYHERE_MODE || 'sandbox'
  },
  LIVEKIT: {
    API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
    API_SECRET: process.env.LIVEKIT_API_SECRET || 'secret',
    URL: process.env.LIVEKIT_URL || 'wss://live.educlick.lk'
  }
};
