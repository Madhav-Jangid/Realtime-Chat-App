import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
export const env = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
