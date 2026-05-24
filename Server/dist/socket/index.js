import { messageHandler } from './handlers/message.handler.js';
import { typingHandler } from './handlers/typing.handler.js';
// In-memory store for online users
export const onlineUsers = new Map(); // userId -> socketId
export function initializeSocket(io) {
    io.on('connection', (socket) => {
        const userId = socket.userId;
        // User came online
        onlineUsers.set(userId, socket.id);
        io.emit('user:online', { userId });
        console.log(`✓ User connected: ${userId} (${socket.id})`);
        // Message events
        socket.on('message:send', (data) => messageHandler.send(io, socket, data));
        socket.on('message:seen', (data) => messageHandler.markSeen(io, socket, data));
        // Typing events
        socket.on('typing:start', (data) => typingHandler.start(io, socket, data));
        socket.on('typing:stop', (data) => typingHandler.stop(io, socket, data));
        // Disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('user:offline', { userId });
            console.log(`✗ User disconnected: ${userId}`);
        });
    });
}
