import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';

export interface SignupRequest extends AuthRequest {
  body: {
    username: string;
    name: string;
    email: string;
    password: string;
  };
}

export interface LoginRequest extends AuthRequest {
  body: {
    email: string;
    password: string;
  };
}

export interface SendFriendRequestBody {
  receiverId: string;
}

export interface SendMessageBody {
  conversationId: string;
  text: string;
}

export interface MarkSeenBody {
  messageId: string;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}
