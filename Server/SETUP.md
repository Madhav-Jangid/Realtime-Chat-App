# Quick Start Guide

## Prerequisites
- Node.js 20+
- MongoDB (local or cloud)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update `.env.local` with your MongoDB URI and JWT secret:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI)
```

### 4. Start Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Testing the API

### Using cURL or Postman

#### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Copy the returned `token`.

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Get Current User
```bash
curl http://localhost:5000/api/users/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Search Users
```bash
curl http://localhost:5000/api/users/search?q=john \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Send Friend Request
First, create another user and note their ID.

```bash
curl -X POST http://localhost:5000/api/friends/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "receiverId": "OTHER_USER_ID"
  }'
```

Copy the returned request `_id`.

#### 6. Accept Friend Request
```bash
curl -X POST http://localhost:5000/api/friends/REQUEST_ID/accept \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. Get Conversations
```bash
curl http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Copy the conversation `_id`.

#### 8. Send Message (REST API)
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "conversationId": "CONVERSATION_ID",
    "text": "Hello!"
  }'
```

#### 9. Get Messages
```bash
curl http://localhost:5000/api/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Socket.IO Testing

You can test Socket.IO with this JavaScript client code:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected');
});

// Listen for messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Send message
socket.emit('message:send', {
  conversationId: 'CONVERSATION_ID',
  text: 'Hello via socket!'
});

// Typing
socket.emit('typing:start', { conversationId: 'CONVERSATION_ID' });
socket.emit('typing:stop', { conversationId: 'CONVERSATION_ID' });

// Listen for typing
socket.on('typing:update', (data) => {
  console.log('User typing:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

## Troubleshooting

### "Cannot find module" errors
Make sure TypeScript compilation is correct:
```bash
npm run typecheck
```

### MongoDB connection errors
- Check if MongoDB is running
- Verify MONGODB_URI in .env.local
- For MongoDB Atlas, make sure IP is whitelisted

### CORS errors
- Update CORS_ORIGIN in .env.local to match your frontend URL
- Ensure frontend is making requests to http://localhost:5000/api

### Socket.IO connection errors
- Make sure token is valid in auth
- Check browser console for errors
- Verify client is connecting to correct URL

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication routes
│   ├── users/          # User management
│   ├── friends/        # Friend system
│   ├── chats/          # Conversations
│   └── messages/       # Messaging
├── socket/             # Real-time events
├── models/             # Mongoose schemas
├── middleware/         # Express middleware
├── config/             # Configuration
├── utils/              # Utilities
├── routes/             # Route aggregator
├── app.ts              # Express app
└── server.ts           # Entry point
```

## Next Steps

1. **Frontend Integration**: Connect your React app using Socket.IO client
2. **Database Backups**: Set up MongoDB backups
3. **Monitoring**: Add application monitoring/logging
4. **Production Deployment**: Deploy to Heroku, AWS, or similar
5. **Feature Enhancements**: Implement group chats, media uploads, etc.

## API Documentation

See `README.md` for complete API documentation.
