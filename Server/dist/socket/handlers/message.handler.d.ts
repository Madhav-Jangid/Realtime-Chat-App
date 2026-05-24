import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.js';
export declare const messageHandler: {
    send(io: Server, socket: AuthenticatedSocket, data: {
        conversationId: string;
        text: string;
    }): Promise<void>;
    markSeen(io: Server, socket: AuthenticatedSocket, data: {
        messageId: string;
    }): Promise<void>;
};
