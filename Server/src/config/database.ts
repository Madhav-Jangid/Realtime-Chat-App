import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('✗ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ MongoDB error:', error);
});
