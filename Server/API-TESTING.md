# API Testing Collection

This file contains example requests for testing the Chat API.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Include JWT token in header:
```
Authorization: Bearer <token>
```

---

## AUTH ENDPOINTS

### 1. Sign Up
**Request:**
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "alice_smith",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice_smith",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "avatar": null,
    "bio": ""
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice_smith",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "avatar": null,
    "bio": ""
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## USER ENDPOINTS

### 3. Get User by ID
**Request:**
```http
GET /users/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "alice_smith",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "avatar": null,
  "bio": "",
  "lastActive": "2024-05-24T10:30:00.000Z",
  "createdAt": "2024-05-24T09:00:00.000Z"
}
```

### 4. Search Users
**Request:**
```http
GET /users/search/query?q=alice
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice_smith",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "avatar": null,
    "bio": "",
    "lastActive": "2024-05-24T10:30:00.000Z"
  }
]
```

### 5. Get Current User Profile
**Request:**
```http
GET /users/me/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "alice_smith",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "lastActive": "2024-05-24T10:30:00.000Z",
  "createdAt": "2024-05-24T09:00:00.000Z"
}
```

### 6. Update Profile
**Request:**
```http
PUT /users/me/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alice Johnson",
  "bio": "Full stack developer",
  "avatar": "https://example.com/avatar.jpg",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  }
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "alice_smith",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Full stack developer",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  }
}
```

---

## FRIENDS ENDPOINTS

### 7. Send Friend Request
**Request:**
```http
POST /friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "sender": "507f1f77bcf86cd799439011",
  "receiver": "507f1f77bcf86cd799439012",
  "status": "pending",
  "createdAt": "2024-05-24T10:35:00.000Z"
}
```

**Error Responses:**
- 400: `{ "error": "Cannot send request to yourself" }`
- 400: `{ "error": "Request already sent" }`
- 400: `{ "error": "Already friends" }`
- 404: `{ "error": "User not found" }`

### 8. Accept Friend Request
**Request:**
```http
POST /friends/507f1f77bcf86cd799439013/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
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
    "members": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ],
    "createdAt": "2024-05-24T10:36:00.000Z"
  }
}
```

### 9. Reject Friend Request
**Request:**
```http
POST /friends/507f1f77bcf86cd799439013/reject
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "sender": "507f1f77bcf86cd799439011",
  "receiver": "507f1f77bcf86cd799439012",
  "status": "rejected",
  "createdAt": "2024-05-24T10:35:00.000Z"
}
```

### 10. Get Friends List
**Request:**
```http
GET /friends
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "bob_jones",
    "name": "Bob Jones",
    "avatar": null,
    "email": "bob@example.com"
  }
]
```

### 11. Get Incoming Friend Requests
**Request:**
```http
GET /friends/requests/incoming
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice_smith",
      "name": "Alice Smith",
      "avatar": null
    },
    "receiver": "507f1f77bcf86cd799439012",
    "status": "pending",
    "createdAt": "2024-05-24T10:35:00.000Z"
  }
]
```

---

## CONVERSATIONS & MESSAGES ENDPOINTS

### 12. Get Conversations
**Request:**
```http
GET /conversations
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "members": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "username": "bob_jones",
        "name": "Bob Jones",
        "avatar": null
      }
    ],
    "lastMessage": "See you later!",
    "lastMessageAt": "2024-05-24T11:30:00.000Z",
    "createdAt": "2024-05-24T10:36:00.000Z"
  }
]
```

### 13. Get Messages (Paginated)
**Request:**
```http
GET /conversations/507f1f77bcf86cd799439014/messages?limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "conversationId": "507f1f77bcf86cd799439014",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice_smith",
      "avatar": null
    },
    "text": "Hi Bob!",
    "seenBy": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ],
    "createdAt": "2024-05-24T11:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439016",
    "conversationId": "507f1f77bcf86cd799439014",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob_jones",
      "avatar": null
    },
    "text": "Hey Alice!",
    "seenBy": [
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011"
    ],
    "createdAt": "2024-05-24T11:05:00.000Z"
  }
]
```

**Cursor Pagination:**
```http
GET /conversations/507f1f77bcf86cd799439014/messages?limit=20&cursor=507f1f77bcf86cd799439015
Authorization: Bearer <token>
```

---

## MESSAGES ENDPOINTS

### 14. Send Message (REST)
**Request:**
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "507f1f77bcf86cd799439014",
  "text": "Hello! How are you?"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "conversationId": "507f1f77bcf86cd799439014",
  "sender": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice_smith",
    "avatar": null
  },
  "text": "Hello! How are you?",
  "seenBy": [
    "507f1f77bcf86cd799439011"
  ],
  "createdAt": "2024-05-24T11:10:00.000Z"
}
```

### 15. Mark Message as Seen
**Request:**
```http
PUT /messages/507f1f77bcf86cd799439017/seen
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "conversationId": "507f1f77bcf86cd799439014",
  "sender": "507f1f77bcf86cd799439011",
  "text": "Hello! How are you?",
  "seenBy": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "createdAt": "2024-05-24T11:10:00.000Z"
}
```

---

## SOCKET.IO EVENTS

### Client to Server

#### Send Message
```javascript
socket.emit('message:send', {
  conversationId: '507f1f77bcf86cd799439014',
  text: 'Hi there!'
});
```

#### Mark as Seen
```javascript
socket.emit('message:seen', {
  messageId: '507f1f77bcf86cd799439017'
});
```

#### Start Typing
```javascript
socket.emit('typing:start', {
  conversationId: '507f1f77bcf86cd799439014'
});
```

#### Stop Typing
```javascript
socket.emit('typing:stop', {
  conversationId: '507f1f77bcf86cd799439014'
});
```

### Server to Client

#### New Message
```javascript
socket.on('message:new', (message) => {
  console.log(message);
  // {
  //   _id, conversationId, sender, text, seenBy, createdAt
  // }
});
```

#### Message Seen Update
```javascript
socket.on('message:seen:update', (data) => {
  console.log(data);
  // { messageId, userId }
});
```

#### Typing Update
```javascript
socket.on('typing:update', (data) => {
  console.log(data);
  // { conversationId, userId, isTyping: true/false }
});
```

#### User Online
```javascript
socket.on('user:online', (data) => {
  console.log(data);
  // { userId }
});
```

#### User Offline
```javascript
socket.on('user:offline', (data) => {
  console.log(data);
  // { userId }
});
```

#### Error
```javascript
socket.on('error', (data) => {
  console.error(data);
  // { message }
});
```

---

## Error Handling

### Common Errors

#### 400 - Bad Request
```json
{
  "error": "Missing required fields"
}
```

#### 401 - Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

#### 403 - Forbidden
```json
{
  "error": "Not authorized"
}
```

#### 404 - Not Found
```json
{
  "error": "User not found"
}
```

#### 500 - Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Testing Flow

1. **Create User Account**
   - POST /auth/signup (Alice)
   - POST /auth/signup (Bob)

2. **Search & Send Friend Request**
   - GET /users/search?q=bob (as Alice)
   - POST /friends/request (Alice to Bob)

3. **Accept Request**
   - GET /friends/requests/incoming (as Bob)
   - POST /friends/:id/accept (as Bob)

4. **Send Messages**
   - GET /conversations (should see conversation)
   - POST /messages (send message via REST)
   - Or via Socket.IO: emit('message:send')

5. **Check Messages**
   - GET /conversations/:id/messages
   - Or listen to 'message:new' via Socket.IO

6. **Mark as Seen**
   - PUT /messages/:id/seen (REST)
   - Or via Socket.IO: emit('message:seen')
