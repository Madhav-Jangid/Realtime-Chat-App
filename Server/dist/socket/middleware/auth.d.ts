import { Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare function socketAuthMiddleware(socket: AuthenticatedSocket, next: Function): any;
