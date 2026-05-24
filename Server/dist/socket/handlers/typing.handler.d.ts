import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.js';
export declare const typingHandler: {
    start(io: Server, socket: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
    stop(io: Server, socket: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
};
