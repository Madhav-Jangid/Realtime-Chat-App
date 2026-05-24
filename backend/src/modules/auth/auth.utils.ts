import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { env } from '../../config/env';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/AppError';

export function signToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.jwtSecret, options);
}

function normalizeUsername(base: string): string {
  return base.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'user';
}

async function makeUniqueUsername(seed: string): Promise<string> {
  const base = normalizeUsername(seed || 'user');
  let candidate = base;
  let i = 1;
  while (await UserModel.exists({ username: candidate })) {
    candidate = `${base}${i}`.slice(0, 24);
    i += 1;
  }
  return candidate;
}

export async function resolveClerkProfile(clerkToken: string): Promise<{
  clerkId: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
}> {
  if (!env.clerkSecretKey) {
    throw new AppError('CLERK secret key is not configured', 500);
  }

  let payload: JwtPayload;
  try {
    payload = (await verifyClerkToken(clerkToken, {
      secretKey: env.clerkSecretKey
    })) as JwtPayload;
  } catch {
    throw new AppError('Invalid Clerk token', 401);
  }

  const clerkId = String(payload.sub || '');
  if (!clerkId) {
    throw new AppError('Invalid Clerk token payload', 401);
  }

  const response = await fetch(`${env.clerkApiUrl}/users/${clerkId}`, {
    headers: {
      Authorization: `Bearer ${env.clerkSecretKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new AppError(`Unable to fetch Clerk user profile (${response.status})`, 401);
  }

  const user = (await response.json()) as any;
  const email = user?.email_addresses?.[0]?.email_address;

  if (!email) {
    throw new AppError('Clerk user has no email', 400);
  }

  const usernameSeed = String(user?.username || email.split('@')[0] || clerkId || 'user');
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || usernameSeed;

  return {
    clerkId,
    email: String(email).toLowerCase(),
    username: normalizeUsername(usernameSeed),
    name: fullName || 'User',
    avatar: user?.image_url || ''
  };
}

export async function findOrCreateUserFromClerk(clerkToken: string) {
  const profile = await resolveClerkProfile(clerkToken);

  let user = await UserModel.findOne({ $or: [{ clerkId: profile.clerkId }, { email: profile.email }] });

  if (!user) {
    const fallbackSeed = profile.username || `user_${profile.clerkId.slice(-8)}`;
    const uniqueUsername = await makeUniqueUsername(fallbackSeed);

    user = await UserModel.create({
      username: uniqueUsername || `user_${profile.clerkId.slice(-8)}`,
      name: profile.name || uniqueUsername || 'User',
      email: profile.email,
      password: null,
      authProvider: 'clerk',
      clerkId: profile.clerkId,
      avatar: profile.avatar
    });
  } else {
    if (!user.username) {
      user.username = await makeUniqueUsername(profile.username || `user_${profile.clerkId.slice(-8)}`);
    }
    if (!user.name) {
      user.name = profile.name || user.username || 'User';
    }
    user.authProvider = user.authProvider || 'clerk';
    user.clerkId = user.clerkId || profile.clerkId;
    user.lastActive = new Date();
    if (!user.avatar && profile.avatar) {
      user.avatar = profile.avatar;
    }
    await user.save();
  }

  return user;
}
