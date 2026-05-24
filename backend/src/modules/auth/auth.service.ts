import bcrypt from 'bcrypt';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/AppError';
import { findOrCreateUserFromClerk, signToken } from './auth.utils';

interface SignupInput {
  username: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
}

export async function signup(input: SignupInput) {
  const existing = await UserModel.findOne({
    $or: [{ email: input.email.toLowerCase() }, { username: input.username }]
  });

  if (existing) {
    throw new AppError('Email or username already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    ...input,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    authProvider: 'local'
  });

  return {
    token: signToken(String(user._id)),
    user
  };
}

export async function login(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.password) {
    throw new AppError('This account uses Clerk login. Use /auth/clerk/login.', 400);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastActive = new Date();
  await user.save();

  return {
    token: signToken(String(user._id)),
    user: await UserModel.findById(user._id)
  };
}

export async function clerkLogin(clerkToken: string) {
  const user = await findOrCreateUserFromClerk(clerkToken);
  user.lastActive = new Date();
  await user.save();

  return {
    token: signToken(String(user._id)),
    user
  };
}
