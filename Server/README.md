# Real-time Chat Backend

A scalable, production-ready real-time chat backend built with Node.js, Express, MongoDB, and Socket.IO.

## Features

✅ **User Authentication**
- Sign up / Login with JWT
- Password hashing with bcrypt
- Token-based authorization

✅ **User Management**
- Search users by username or name
- Update profile (name, bio, avatar, location)
- Geospatial support (for future "nearby users" feature)

✅ **Friend System**
- Send/accept/reject friend requests
- View friends list
- View incoming requests
- Automatic conversation creation on acceptance

✅ **Real-time Messaging**
- Send messages only to friends
- Message seen status
- Typing indicators
- Cursor-based pagination for messages

✅ **Online Status**
- Track online/offline users
- User online presence broadcast

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.IO
- **Auth**: JWT + bcrypt
- **Language**: TypeScript

## Project Structure

```
src/
├── modules/                 # Feature modules
│   ├── auth/               # Authentication
│   ├── users/              # User management
│   ├── friends/            # Friend requests & relationships
│   ├── chats/              # Conversations
│   └── messages/           # Messaging
├── socket/                 # Socket.IO setup
│   ├── handlers/           # Event handlers
│   ├── middleware/         # Socket middleware
│   └── index.ts
├── models/                 # MongoDB schemas
├── middleware/             # Express middleware
├── config/                 # Configuration
├── utils/                  # Utilities
├── routes/                 # Route aggregator
├── app.ts                  # Express app setup
└── server.ts               # Server entry point
```

## Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update environment variables
nano .env.local
```

## Configuration

Create `.env.local` with:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chat_app

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Running

```bash
# Development (with auto-reload)
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run typecheck

# Tests
npm test
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,          // unique, lowercase, 3+ chars
  name: String,
  email: String,             // unique
  password: String,          // hashed with bcrypt
  avatar: String,            // optional
  bio: String,               // optional, max 500 chars
  location: {
    type: "Point",           // GeoJSON for future "nearby users"
    coordinates: [lng, lat]
  },
  lastActive: Date,
  createdAt: Date,
  
  // Indexes
  // - username: text search
  // - location: 2dsphere (geospatial)
}
```

### FriendRequests Collection

```javascript
{
  _id: ObjectId,
  sender: ObjectId,          // ref to User
  receiver: ObjectId,        // ref to User
  status: "pending" | "accepted" | "rejected",
  createdAt: Date,
  
  // Indexes
  // - sender + receiver + status
  // - receiver + status (for incoming requests)
}
```

### Conversations Collection

```javascript
{
  _id: ObjectId,
  members: [ObjectId],       // user IDs in conversation
  lastMessage: String,       // cached for UI display
  lastMessageAt: Date,       // for sorting conversations
  createdAt: Date,
  
  // Indexes
  // - members (find conversations by user)
}
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,  // ref to Conversation
  sender: ObjectId,          // ref to User
  text: String,
  seenBy: [ObjectId],        // users who have seen this message
  createdAt: Date,
  
  // Indexes
  // - conversationId + createdAt (for pagination)
  // - sender
}
```

## API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
```

### Users

```
GET    /api/users/:id                 - Get user by ID
GET    /api/users/search?q=           - Search users
GET    /api/users/me/profile          - Get current user profile
PUT    /api/users/me/profile          - Update profile
```

### Friends

```
POST   /api/friends/request           - Send friend request
POST   /api/friends/:id/accept        - Accept request
POST   /api/friends/:id/reject        - Reject request
GET    /api/friends                   - Get friends list
GET    /api/friends/requests/incoming - Get incoming requests
```

### Conversations & Messages

```
GET    /api/conversations                              - Get conversations
GET    /api/conversations/:conversationId/messages     - Get messages
POST   /api/messages                                   - Send message
PUT    /api/messages/:messageId/seen                   - Mark as seen
```

## API Examples

### Sign Up

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response (201)
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "bio": ""
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response (200)
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "bio": ""
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Search Users

```bash
GET /api/users/search?q=john
Authorization: Bearer <token>

# Response (200)
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "bio": "",
    "lastActive": "2024-05-24T10:30:00.000Z"
  }
]
```

### Send Friend Request

```bash
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "507f1f77bcf86cd799439012"
}

# Response (201)
{
  "_id": "507f1f77bcf86cd799439013",
  "sender": "507f1f77bcf86cd799439011",
  "receiver": "507f1f77bcf86cd799439012",
  "status": "pending",
  "createdAt": "2024-05-24T10:35:00.000Z"
}
```

### Accept Friend Request

```bash
POST /api/friends/507f1f77bcf86cd799439013/accept
Authorization: Bearer <token>

# Response (200)
{
  "request": {
    "_id": "507f1f77bcf86cd799439013",
    "sender": "507f1f77bcf86cd799439011",
    "receiver": "507f1f77bcf86cd799439012",
    "status": "accepted",
    "createdAt": "2024-05-24T10:35:00.000Z"
  },
  "conversation": {
    "_id": "507f1f77bcf86cd799439014",
    "members": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "createdAt": "2024-05-24T10:36:00.000Z"
  }
}
```

### Get Conversations

```bash
GET /api/conversations
Authorization: Bearer <token>

# Response (200)
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "members": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "username": "jane_doe",
        "name": "Jane Doe",
        "avatar": null
      }
    ],
    "lastMessage": "Hey, how are you?",
    "lastMessageAt": "2024-05-24T11:00:00.000Z",
    "createdAt": "2024-05-24T10:36:00.000Z"
  }
]
```

### Get Messages (Paginated)

```bash
GET /api/conversations/507f1f77bcf86cd799439014/messages?limit=20
Authorization: Bearer <token>

# Response (200)
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "conversationId": "507f1f77bcf86cd799439014",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "avatar": null
    },
    "text": "Hey, how are you?",
    "seenBy": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "createdAt": "2024-05-24T11:00:00.000Z"
  }
]
```

### Send Message

```bash
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "507f1f77bcf86cd799439014",
  "text": "Hey, how are you?"
}

# Response (201)
{
  "_id": "507f1f77bcf86cd799439015",
  "conversationId": "507f1f77bcf86cd799439014",
  "sender": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "avatar": null
  },
  "text": "Hey, how are you?",
  "seenBy": ["507f1f77bcf86cd799439011"],
  "createdAt": "2024-05-24T11:00:00.000Z"
}
```

## Socket.IO Events

### Client -> Server

**Send Message**
```javascript
socket.emit('message:send', {
  conversationId: '507f1f77bcf86cd799439014',
  text: 'Hello!'
});
```

**Mark Message as Seen**
```javascript
socket.emit('message:seen', {
  messageId: '507f1f77bcf86cd799439015'
});
```

**Start Typing**
```javascript
socket.emit('typing:start', {
  conversationId: '507f1f77bcf86cd799439014'
});
```

**Stop Typing**
```javascript
socket.emit('typing:stop', {
  conversationId: '507f1f77bcf86cd799439014'
});
```

### Server -> Client

**New Message**
```javascript
socket.on('message:new', (message) => {
  // {
  //   _id, conversationId, sender, text, seenBy, createdAt
  // }
});
```

**Message Seen Update**
```javascript
socket.on('message:seen:update', (data) => {
  // { messageId, userId }
});
```

**Typing Update**
```javascript
socket.on('typing:update', (data) => {
  // { conversationId, userId, isTyping: true/false }
});
```

**User Online**
```javascript
socket.on('user:online', (data) => {
  // { userId }
});
```

**User Offline**
```javascript
socket.on('user:offline', (data) => {
  // { userId }
});
```

**Error**
```javascript
socket.on('error', (data) => {
  // { message }
});
```

## Error Handling

All errors return JSON responses with appropriate HTTP status codes:

```javascript
{
  "error": "Error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request / validation error
- `401` - Unauthorized / invalid token
- `403` - Forbidden / not authorized
- `404` - Not found
- `500` - Internal server error

## Security Features

✅ **Password Security**
- Passwords hashed with bcrypt (10 salt rounds)
- Never returned in API responses

✅ **Authentication**
- JWT token-based
- Token included in Authorization header: `Bearer <token>`
- Socket.IO authentication via token

✅ **Authorization**
- Users can only access their own data
- Can only message friends
- Cannot send duplicate friend requests

✅ **CORS**
- Configurable CORS origin
- Prevents unauthorized cross-origin requests

## Performance

📊 **Database Indexes**
- User: username, location (2dsphere)
- FriendRequest: sender+receiver+status, receiver+status
- Conversation: members
- Message: conversationId+createdAt, sender

📄 **Message Pagination**
- Cursor-based pagination
- Prevents loading entire chat history at once
- Configurable limit (default 20)

🔄 **Scalability Ready**
- Socket.IO structure supports Redis adapter
- In-memory online users map easily migrates to Redis
- Services separate from controllers
- Clean separation of concerns

## Future Enhancements

The architecture supports these features without major refactoring:

- [ ] Nearby users (using GeoJSON location)
- [ ] Group chats (conversation members array ready)
- [ ] User blocking
- [ ] Media messages (add attachment field to Message)
- [ ] Message reactions
- [ ] Voice/video call signaling
- [ ] Message search
- [ ] Redis adapter for Socket.IO scaling
- [ ] Message archival / deletion
- [ ] Read receipts enhancements
- [ ] Presence indicators (away, do not disturb)

## License

MIT
