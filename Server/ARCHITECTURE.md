# Backend Architecture Documentation

## Overview

This is a production-ready real-time chat backend built with Node.js, Express, MongoDB, and Socket.IO. The architecture prioritizes simplicity, maintainability, and future scalability without overengineering.

## Design Principles

✅ **Simplicity First**
- Clean, readable code
- Minimal abstractions
- Direct database queries (no generic repositories)
- Straightforward request/response flow

✅ **Modular Structure**
- Feature-based modules (auth, users, friends, chats, messages)
- Each module is self-contained
- Easy to locate and modify features
- Clean separation of concerns

✅ **Scalability Without Complexity**
- In-memory online users map (upgradeable to Redis)
- Cursor-based pagination for messages
- Database indexes for query performance
- Socket.IO structure supports clustering

✅ **Production Ready**
- Error handling middleware
- Input validation
- Security best practices (JWT, bcrypt)
- CORS configuration
- Proper HTTP status codes

---

## File Structure

```
src/
│
├── modules/                      # Feature modules
│   ├── auth/
│   │   ├── auth.service.ts      # Business logic (signup, login)
│   │   ├── auth.controller.ts   # Route handlers
│   │   └── auth.routes.ts       # Express routes
│   │
│   ├── users/
│   │   └── users.routes.ts      # User endpoints
│   │
│   ├── friends/
│   │   └── friends.routes.ts    # Friend request endpoints
│   │
│   ├── chats/
│   │   └── chats.routes.ts      # Conversation endpoints
│   │
│   └── messages/
│       └── messages.routes.ts   # Messaging endpoints
│
├── socket/                        # Real-time functionality
│   ├── index.ts                 # Socket.IO initialization & online users
│   ├── middleware/
│   │   └── auth.ts              # Socket.IO JWT authentication
│   └── handlers/
│       ├── message.handler.ts   # Message events
│       └── typing.handler.ts    # Typing indicators
│
├── models/                        # MongoDB schemas
│   ├── user.model.ts            # User schema with bcrypt
│   ├── friend-request.model.ts  # Friend requests & friendships
│   ├── conversation.model.ts    # Conversations (DMs or groups)
│   └── message.model.ts         # Individual messages
│
├── middleware/                    # Express middleware
│   ├── auth.ts                  # JWT verification & auth middleware
│   └── error-handler.ts         # Centralized error handling
│
├── config/                        # Configuration
│   ├── env.ts                   # Environment variables
│   └── database.ts              # MongoDB connection
│
├── utils/                         # Utilities
│   ├── app-error.ts             # Custom error class & asyncHandler
│   └── types/
│       └── api.types.ts         # TypeScript type definitions
│
├── routes/                        # Route aggregation
│   └── index.ts                 # Combines all route modules
│
├── app.ts                         # Express app setup
└── server.ts                      # Server entry point
```

---

## Data Flow

### Sign Up Flow
```
User -> POST /auth/signup 
  -> auth.controller 
  -> auth.service 
  -> User.create() 
  -> hash password 
  -> generate token 
  -> return user + token
```

### Send Friend Request Flow
```
User A -> POST /friends/request 
  -> validate receiver exists
  -> check no duplicate pending request
  -> FriendRequest.create() 
  -> return request
```

### Accept Friend Request Flow
```
User B -> POST /friends/:id/accept 
  -> verify receiver is current user
  -> FriendRequest.updateOne(status: 'accepted') 
  -> Conversation.create(members: [sender, receiver]) 
  -> return request + conversation
```

### Send Message (Socket.IO) Flow
```
Client -> emit('message:send', {conversationId, text})
  -> socket handler
  -> verify user is conversation member
  -> verify friendship with other member
  -> Message.create()
  -> update Conversation.lastMessage
  -> io.to(conversationId).emit('message:new')
  -> save to DB first, then emit
```

---

## Database Schema Rationale

### Users Collection
```javascript
{
  username: "john_doe",           // Unique, for @mentions
  name: "John Doe",               // Display name
  email: "john@example.com",      // Login email
  password: "hashed",             // bcrypt hash (never sent to client)
  avatar: "url",                  // Profile picture
  bio: "description",             // About user
  location: {                     // GeoJSON for future features
    type: "Point",
    coordinates: [lng, lat]
  },
  lastActive: Date,               // For online status
  createdAt: Date
}
```

### FriendRequests Collection
```javascript
{
  sender: ObjectId,               // Who sent it
  receiver: ObjectId,             // Who received it
  status: "pending|accepted|rejected",
  createdAt: Date
}
```

**Key Design Choice:** No separate "friends" collection. Accepted requests ARE the friendship.
- Saves storage
- Reduces complexity
- Can query: `FriendRequest.find({$or: [{sender: id, status: 'accepted'}, {receiver: id, status: 'accepted'}]})`

### Conversations Collection
```javascript
{
  members: [ObjectId],            // Array for future group chats
  lastMessage: String,            // Cached for UI (no join needed)
  lastMessageAt: Date,            // For sorting conversations
  createdAt: Date
}
```

**Key Design Choice:** Separate messages collection (not embedded in conversation).
- Conversations can have unlimited messages without 16MB document limit
- Enables efficient pagination
- Better performance for large message volumes

### Messages Collection
```javascript
{
  conversationId: ObjectId,       // Reference to conversation
  sender: ObjectId,               // Who sent it
  text: String,                   // Message content
  seenBy: [ObjectId],             // Users who viewed it
  createdAt: Date
}
```

**Indexes for Performance:**
- `conversationId + createdAt` - Efficient message pagination
- `sender` - Find user's messages
- `location (2dsphere)` in User - Geospatial queries

---

## Authentication Flow

### JWT Tokens
```
POST /auth/signup or /auth/login
  -> generate JWT with userId
  -> payload: { id: userId }
  -> signed with JWT_SECRET
  -> expires in JWT_EXPIRE (default 7 days)
```

### REST API Authentication
```
GET /api/users/me/profile
Authorization: Bearer eyJhbGc...

-> authMiddleware
  -> extract token from "Bearer XXX"
  -> verify signature
  -> extract userId
  -> set req.user = { id: userId }
  -> next()
```

### Socket.IO Authentication
```
Client: io('url', { auth: { token: 'eyJhbGc...' } })

-> socketAuthMiddleware
  -> extract token from socket.handshake.auth
  -> verify signature
  -> set socket.userId
  -> allow connection
```

---

## Error Handling

### Centralized Error Handler
```
try {
  // business logic
} catch (error) {
  next(error)  // passed to errorHandler middleware
}

errorHandler() {
  if (ValidationError) -> 400
  if (DuplicateKey) -> 400
  if (AppError) -> custom statusCode
  else -> 500
}
```

### AppError Class
```typescript
throw new AppError('Message', statusCode, code);
// Used for intentional errors with proper status codes
```

---

## Real-time Architecture (Socket.IO)

### Online Users Management
```
Map: userId -> socketId

On connect:
  -> onlineUsers.set(userId, socketId)
  -> io.emit('user:online', {userId})

On disconnect:
  -> onlineUsers.delete(userId)
  -> io.emit('user:offline', {userId})
```

### Message Events
```
Socket Event: 'message:send'
  -> verify friendship
  -> save to DB
  -> emit 'message:new' to conversation room
  -> all other users in conversation get notified

Broadcast:
  socket.to(conversationId).emit('message:new', message)
```

### Typing Indicators
```
socket.emit('typing:start', {conversationId})
  -> io.to(conversationId).emit('typing:update', {userId, isTyping: true})

socket.emit('typing:stop', {conversationId})
  -> io.to(conversationId).emit('typing:update', {userId, isTyping: false})
```

---

## API Conventions

### URL Patterns
```
POST   /api/auth/signup                    - Create account
POST   /api/auth/login                     - Login

GET    /api/users/:id                      - Get user
GET    /api/users/search/query?q=          - Search users
GET    /api/users/me/profile               - Get current user
PUT    /api/users/me/profile               - Update profile

POST   /api/friends/request                - Send friend request
POST   /api/friends/:id/accept             - Accept request
POST   /api/friends/:id/reject             - Reject request
GET    /api/friends                        - Get friends
GET    /api/friends/requests/incoming      - Get pending requests

GET    /api/conversations                  - Get all conversations
GET    /api/conversations/:id/messages     - Get messages

POST   /api/messages                       - Send message
PUT    /api/messages/:id/seen              - Mark as seen
```

### Response Format
```
Success: { data } or { user, token } etc
Error: { error: "message" }
```

### HTTP Status Codes
```
200 OK                 - Success
201 Created            - Resource created
400 Bad Request        - Validation error
401 Unauthorized       - Invalid token
403 Forbidden          - Not authorized
404 Not Found          - Resource not found
500 Server Error       - Unexpected error
```

---

## Scalability Path

### Current State (Simple)
```
Single Node.js process
In-memory online users map
MongoDB connection pool
```

### Future (With Redis)
```
Multiple Node.js processes
Redis adapter for Socket.IO
Redis pub/sub for events
Distributed online users store

Changes needed:
1. Add Redis connection in config/redis.ts
2. Replace onlineUsers Map with Redis
3. Add io.adapter(createAdapter(pubClient, subClient))
```

### Future (With Caching)
```
Redis cache for:
- Frequently accessed users
- Conversation metadata
- Message search results
```

---

## Security Features

### Password Security
- Bcrypt with 10 salt rounds
- Never returned in API responses
- Selected only when needed (`.select('+password')`)

### Token Security
- JWT signed with secret
- Token expires in 7 days
- Sent in Authorization header (not in URL)

### Authorization
- All protected routes require token
- Users can only access their own data
- Cannot message non-friends
- Cannot accept another user's requests

### CORS
- Configurable origin (prevent cross-origin attacks)
- Only specific methods allowed (GET, POST, PUT)

### Input Validation
- Email format validation
- Password minimum length
- Username constraints (3+ chars, lowercase)
- Text length limits for messages

---

## Performance Optimizations

### Database Indexes
```javascript
User.index({ username: 1 });              // Search efficiency
User.index({ location: '2dsphere' });     // Geospatial queries
FriendRequest.index({ receiver: 1, status: 1 });  // Incoming requests
Message.index({ conversationId: 1, createdAt: -1 }); // Pagination
```

### Message Pagination
```
Instead of:
  GET /conversations/id/messages -> all 10,000 messages

Use cursor pagination:
  GET /conversations/id/messages?limit=20&cursor=507f...
  -> only 20 messages, more efficient
```

### Caching Fields
```
Conversation.lastMessage - avoid joining all messages to sort
Conversation.lastMessageAt - sort conversations efficiently
User.lastActive - track online status without queries
```

---

## Deployment Checklist

- [ ] Update JWT_SECRET to strong random value
- [ ] Update CORS_ORIGIN to actual frontend URL
- [ ] Use production MongoDB (with authentication)
- [ ] Set NODE_ENV=production
- [ ] Use `npm run build && npm start` (not npm run dev)
- [ ] Set up process manager (PM2, systemd)
- [ ] Enable HTTPS/SSL
- [ ] Set up logging
- [ ] Set up monitoring
- [ ] Set up backups
- [ ] Set up environment variables securely

---

## Maintenance

### Adding a New Feature
1. Create module folder in `src/modules/feature/`
2. Create `service.ts` (business logic)
3. Create `controller.ts` (request handlers) or `routes.ts`
4. Create route file
5. Add to `routes/index.ts`

### Modifying Database Schema
1. Create new migration file
2. Test locally
3. Update type definitions
4. Update indexes if needed

### Debugging
```bash
# Check TypeScript errors
npm run typecheck

# View detailed logs
NODE_ENV=development npm run dev

# Check database directly
mongosh chat_app
```

---

## Testing

### Manual Testing
See `API-TESTING.md` for cURL examples

### Automated Testing
```bash
npm test
```

### Load Testing
Consider tools like Apache JMeter for Socket.IO under load

---

## Common Issues & Solutions

### "Cannot find module" Error
- Run `npm install`
- Check TypeScript compilation: `npm run typecheck`

### MongoDB Connection Failed
- Verify MongoDB is running
- Check MONGODB_URI in .env.local
- For Atlas: whitelist IP, check credentials

### Socket.IO Connection Error
- Check token is valid
- Verify client is connecting to correct URL
- Check browser console for details

### Messages Not Saving
- Verify conversation membership
- Check friendship status
- Review error logs

---

## Resources

- **Express.js**: https://expressjs.com/
- **MongoDB**: https://www.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **Socket.IO**: https://socket.io/
- **JWT**: https://jwt.io/
- **Bcrypt**: https://www.npmjs.com/package/bcrypt

