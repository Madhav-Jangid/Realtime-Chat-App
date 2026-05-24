import dotenv from 'dotenv';

dotenv.config();

function mustGet(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function normalizeClerkApiUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\/users$/, '');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri: mustGet('MONGODB_URI'),
  jwtSecret: mustGet('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || '*',
  clerkSecretKey: (process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '').trim(),
  clerkApiUrl: normalizeClerkApiUrl(process.env.CLERK_API_URL || 'https://api.clerk.com/v1')
};
