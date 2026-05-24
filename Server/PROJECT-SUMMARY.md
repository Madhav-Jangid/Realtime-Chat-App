# 🚀 Real-time Chat Backend - Complete Setup & Documentation

## ✅ What Has Been Built

A **production-ready, scalable real-time chat backend** using:
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** + **Mongoose** for persistence
- **Socket.IO** for real-time messaging
- **JWT** + **bcrypt** for authentication
- **Clean, maintainable architecture** (NO microservices, NO overengineering)

---

## 📁 Project Structure

```
Server/
├── src/
│   ├── modules/                    # Feature modules (modular)
│   │   ├── auth/                  # Authentication (signup, login)
│   │   ├── users/                 # User management & search
│   │   ├── friends/               # Friend requests & friendships
│   │   ├── chats/                 # Conversations
│   │   └── messages/              # Messaging API
│   │
│   ├── socket/                    # Real-time Socket.IO
│   │   ├── handlers/              # Message & typing handlers
│   │   ├── middleware/            # Socket authentication
│   │   └── index.ts               # Socket initialization
│   │
│   ├── models/                    # MongoDB schemas
│   │   ├── user.model.ts          # Users with bcrypt
│   │   ├── friend-request.model.ts
│   │   ├── conversation.model.ts
│   │   └── message.model.ts
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.ts                # JWT authentication
│   │   └── error-handler.ts       # Error handling
│   │
│   ├── config/                    # Configuration
│   │   ├── env.ts                 # Environment variables
│   │   └── database.ts            # MongoDB connection
│   │
│   ├── routes/                    # Route aggregator
│   ├── utils/                     # Utilities
│   ├── app.ts                     # Express setup
│   └── server.ts                  # Server entry point
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── .env.local                     # Environment variables (update this!)
├── .env.example                   # Template for .env
├── README.md                      # Full API documentation
├── SETUP.md                       # Quick start guide
├── ARCHITECTURE.md                # Architecture deep dive
└── API-TESTING.md                 # API testing examples

```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Server
npm install
```

### 2. Configure Environment
```bash
# Copy example to local config
cp .env.example .env.local

# Edit .env.local and update:
# - MONGODB_URI (your MongoDB connection)
# - JWT_SECRET (change to secure random value)
# - CORS_ORIGIN (your frontend URL)
```

### 3. Run the Server
```bash
# Development mode (auto-reload)
npm run dev

# Production
npm run build && npm start

# Type checking
npm run typecheck
```

**Server starts on:** `http://localhost:5000`

---

## 📚 Key Features Implemented

### ✅ Authentication
- User signup with validation
- User login with JWT tokens
- Token-based authorization
- Password hashing with bcrypt

### ✅ User Management
- Get user by ID
- Search users (by username or name)
- Update profile (name, bio, avatar, location)
- Support for geolocation (future "nearby users" feature)

### ✅ Friend System
- Send friend requests
- Accept/reject requests
- View friends list
- View incoming requests
- **Automatic conversation creation** when friendship accepted
- Prevent duplicate requests
- Prevent messaging non-friends

### ✅ Real-time Messaging
- Send messages (only to friends)
- Message seen status
- Typing indicators
- Cursor-based pagination for performance
- Online/offline user notifications

### ✅ Socket.IO Real-time Events
- `message:send` - Send message
- `message:seen` - Mark message as seen
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:new` - New message received
- `typing:update` - Typing status update
- `user:online` - User came online
- `user:offline` - User went offline

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup           - Sign up new user
POST   /api/auth/login            - Login user
```

### Users
```
GET    /api/users/:id              - Get user profile
GET    /api/users/search?q=        - Search users
GET    /api/users/me/profile       - Get current user
PUT    /api/users/me/profile       - Update profile
```

### Friends
```
POST   /api/friends/request                  - Send friend request
POST   /api/friends/:id/accept               - Accept request
POST   /api/friends/:id/reject               - Reject request
GET    /api/friends                          - Get friends list
GET    /api/friends/requests/incoming        - Get pending requests
```

### Conversations & Messages
```
GET    /api/conversations                            - Get conversations
GET    /api/conversations/:conversationId/messages   - Get messages (paginated)
POST   /api/messages                                 - Send message
PUT    /api/messages/:messageId/seen                 - Mark message as seen
```

---

## 📊 Database Collections

### Users
```json
{
  "username": "unique_username",
  "name": "Display Name",
  "email": "user@example.com",
  "password": "hashed_with_bcrypt",
  "avatar": "url_optional",
  "bio": "About user",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "lastActive": "2024-05-24T10:30:00Z",
  "createdAt": "2024-05-24T09:00:00Z"
}
```

### Friend Requests
```json
{
  "sender": "userId1",
  "receiver": "userId2",
  "status": "pending|accepted|rejected",
  "createdAt": "2024-05-24T10:35:00Z"
}
```

### Conversations
```json
{
  "members": ["userId1", "userId2"],
  "lastMessage": "Last message text...",
  "lastMessageAt": "2024-05-24T11:00:00Z",
  "createdAt": "2024-05-24T10:36:00Z"
}
```

### Messages
```json
{
  "conversationId": "conversationId",
  "sender": "userId",
  "text": "Message content",
  "seenBy": ["userId1", "userId2"],
  "createdAt": "2024-05-24T11:05:00Z"
}
```

---

## 🛡️ Security Features

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- Never returned in responses
- Minimum 6 characters

✅ **Authentication**
- JWT tokens (default 7 days expiry)
- Token-based authorization
- Socket.IO authentication

✅ **Authorization**
- Only friends can message each other
- Users can't request themselves
- Can't accept other users' requests
- Can't view private data

✅ **Validation**
- Email format validation
- Username constraints (3+ chars, lowercase)
- Text field trimming & limits

✅ **CORS**
- Configurable origin
- Prevents unauthorized requests

---

## 📈 Performance Features

✅ **Database Indexes**
- User: username (text search)
- User: location (2dsphere for geospatial)
- FriendRequest: sender+receiver+status
- Message: conversationId+createdAt (pagination)

✅ **Cursor Pagination**
- Messages: `GET /conversations/:id/messages?limit=20&cursor=<id>`
- Prevents loading entire history
- Efficient for large datasets

✅ **Caching**
- Conversation.lastMessage (no join needed for UI)
- User.lastActive (efficient online status)

---

## 🔄 Common Workflows

### 1. Sign Up
```bash
POST /api/auth/signup
{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
# Returns: { user, token }
```

### 2. Search & Send Friend Request
```bash
GET /api/users/search?q=jane
# Returns: array of users

POST /api/friends/request
{ "receiverId": "userId" }
# Returns: friend request object
```

### 3. Accept Request (Auto-creates Conversation)
```bash
POST /api/friends/requestId/accept
# Returns: { request (accepted), conversation (created) }
```

### 4. Send Message (REST or Socket)
```bash
# REST API
POST /api/messages
{ "conversationId": "convId", "text": "Hello!" }

# OR Socket.IO
socket.emit('message:send', { conversationId, text })
# Listen for: socket.on('message:new', message => ...)
```

---

## 🧪 Testing

### Using cURL
See `API-TESTING.md` for complete examples

### Quick Test
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","name":"Test","email":"test@test.com","password":"pass123"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/users/me/profile \
  -H "Authorization: Bearer TOKEN"
```

### Socket.IO Testing
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('message:new', (msg) => console.log('New message:', msg));
socket.emit('message:send', { conversationId: 'id', text: 'Hello' });
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete API documentation with examples |
| `SETUP.md` | Quick start & troubleshooting |
| `ARCHITECTURE.md` | Design patterns & technical deep dive |
| `API-TESTING.md` | cURL & Socket.IO testing examples |
| `.env.example` | Environment variable template |

---

## 🔧 Configuration

Update `.env.local`:

```env
# Server
PORT=5000                              # Server port
NODE_ENV=development                   # development or production

# MongoDB
MONGODB_URI=mongodb://...              # Your MongoDB connection string

# JWT
JWT_SECRET=your_secret_key_change_this # IMPORTANT: Change in production!
JWT_EXPIRE=7d                          # Token expiration time

# CORS
CORS_ORIGIN=http://localhost:3000      # Your frontend URL
```

---

## 🚢 Deployment

### Pre-deployment Checklist
- [ ] Change JWT_SECRET to random secure value
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Use production MongoDB (with authentication)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring & logging
- [ ] Set up backups
- [ ] Test thoroughly

### Deploy Commands
```bash
# Build
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start dist/server.js --name "chat-api"
```

---

## 🔮 Future Enhancements (Easy to Add)

The architecture supports these without major changes:

- **Group Chats** - Conversation.members already supports arrays
- **Nearby Users** - Location field with 2dsphere index ready
- **User Blocking** - Add blocked array to User model
- **Media Messages** - Add attachment field to Message model
- **Message Reactions** - Add reactions array to Message
- **Redis Adapter** - Scale Socket.IO to multiple processes
- **Message Search** - Add full-text indexes
- **Read Receipts** - Already storing seenBy
- **Voice/Video** - Socket events for WebRTC signaling

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run typecheck
```

### MongoDB connection fails
- Verify MongoDB is running
- Check MONGODB_URI in .env.local
- For MongoDB Atlas: whitelist your IP

### Socket.IO won't connect
- Check token is valid
- Verify client URL matches server URL
- Check browser console for errors

### Messages not saving
- Verify users are friends
- Check conversation membership
- Review server logs

---

## 📞 Support

For issues or questions:
1. Check the documentation files (README.md, SETUP.md, ARCHITECTURE.md)
2. Review error logs: `NODE_ENV=development npm run dev`
3. Check database directly: `mongosh chat_app`
4. See API-TESTING.md for request/response examples

---

## ✨ Key Design Decisions

✅ **No Microservices** - Complexity not needed yet
✅ **No Generic Repositories** - Direct MongoDB queries
✅ **In-Memory Online Users** - Upgradeable to Redis
✅ **Separate Messages Collection** - Avoids 16MB document limit
✅ **Cursor Pagination** - Efficient for large datasets
✅ **Friendship = Accepted Request** - No separate friends collection
✅ **Auto-create Conversations** - On friend request acceptance
✅ **Clean Modular Code** - Easy to find, understand, modify

---

## 📦 Project Summary

| Aspect | Status |
|--------|--------|
| Authentication | ✅ Complete (JWT + bcrypt) |
| User Management | ✅ Complete |
| Friend System | ✅ Complete |
| Messaging | ✅ Complete (REST + Socket.IO) |
| Error Handling | ✅ Complete |
| Security | ✅ Complete |
| Scalability | ✅ Ready (can upgrade to Redis) |
| Documentation | ✅ Complete |
| Type Safety | ✅ Full TypeScript |
| Production Ready | ✅ Yes |

---

## 🎉 Ready to Go!

Your chat backend is ready for production. 

**Next Steps:**
1. Install dependencies: `npm install`
2. Configure .env.local
3. Start server: `npm run dev`
4. Test API: See API-TESTING.md
5. Connect your frontend
6. Deploy!

**Happy coding!** 🚀

