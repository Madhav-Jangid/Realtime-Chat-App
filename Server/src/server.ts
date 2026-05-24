import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initializeSocket } from './socket/index.js';
import { socketAuthMiddleware } from './socket/middleware/auth.js';

async function start() {
  const app = await createApp();
  const httpServer = createServer(app);

  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO authentication middleware
  io.use(socketAuthMiddleware);

  // Initialize socket handlers
  initializeSocket(io);

  // Make io accessible in app for later use
  (app as any).io = io;

  httpServer.listen(env.port, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Real-time Chat Server Running        ║
╚════════════════════════════════════════╝

Port: ${env.port}
Environment: ${env.nodeEnv}
MongoDB: Connected
Socket.IO: Ready

API Routes:
  POST   /api/auth/signup         - Sign up
  POST   /api/auth/login          - Log in
  GET    /api/users/:id           - Get user
  GET    /api/users/search?q=     - Search users
  GET    /api/users/me/profile    - Get profile
  PUT    /api/users/me/profile    - Update profile
  
  POST   /api/friends/request     - Send friend request
  POST   /api/friends/:id/accept  - Accept request
  POST   /api/friends/:id/reject  - Reject request
  GET    /api/friends             - Get friends
  GET    /api/friends/requests/incoming - Get incoming requests
  
  GET    /api/conversations       - Get conversations
  GET    /api/conversations/:conversationId/messages - Get messages
  
  POST   /api/messages            - Send message
  PUT    /api/messages/:id/seen   - Mark as seen

Socket.IO Events:
  Client -> Server:
    message:send    - { conversationId, text }
    message:seen    - { messageId }
    typing:start    - { conversationId }
    typing:stop     - { conversationId }
  
  Server -> Client:
    message:new     - New message received
    message:seen:update - Message marked as seen
    typing:update   - Typing status
    user:online     - User came online
    user:offline    - User went offline
    error           - Error message
    `);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
