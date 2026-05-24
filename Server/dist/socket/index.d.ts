import { Server } from 'socket.io';
export declare const onlineUsers: Map<string, string>;
export declare function initializeSocket(io: Server): void;
