# 🧠 Assistant Memory API

**Production-ready Node.js API service for AI assistants to persist conversation contexts, user preferences, tasks, and structured data across sessions.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 🎯 Why This Exists: Real Problems This Solves

### The Problem
AI assistants are inherently **stateless** - they only remember what's in the current conversation. This creates significant limitations:

1. **No Memory Across Sessions**: Once a conversation ends, everything is forgotten
2. **Cannot Track Long-Running Tasks**: Multi-step operations that span hours or days are impossible
3. **No User Preference Persistence**: User preferences must be re-established every conversation
4. **Cannot Build Complex Workflows**: No ability to coordinate across multiple interactions
5. **Limited Practical Utility**: Assistants can't truly "help" with ongoing projects

### The Solution
This API provides AI assistants with **persistent memory and state management**:

- **📝 Conversation Context Storage**: Remember important information across sessions
- **⚙️ User Preferences**: Store and retrieve user settings, preferences, and configurations
- **📋 Task Tracking**: Create and monitor long-running tasks with status updates
- **💾 Structured Data Storage**: Generic key-value store for any structured data
- **🔐 Secure Authentication**: JWT-based auth ensures data privacy
- **🐳 Easy Deployment**: Docker support for rapid deployment
- **💪 Production-Ready**: Error handling, logging, rate limiting, and fallback storage

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- (Optional) MongoDB for production storage
- (Optional) Docker for containerized deployment

### Local Development

```bash
# Clone the repository
git clone https://github.com/leoakok/assistant-memory-api.git
cd assistant-memory-api

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings (JWT_SECRET is required)
nano .env

# Start the server (uses JSON storage by default)
npm start

# Or run in development mode with auto-reload
npm run dev
```

The API will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build and run with Docker Compose (includes MongoDB)
docker-compose up -d

# Or build standalone
docker build -t assistant-memory-api .
docker run -p 3000:3000 -e JWT_SECRET=your-secret assistant-memory-api
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a JWT token:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔑 Authentication Endpoints

### Register New User/Assistant
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "my-assistant",
  "email": "assistant@example.com",
  "password": "secure-password",
  "role": "assistant"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "my-assistant",
    "email": "assistant@example.com",
    "role": "assistant",
    "apiKey": "unique-api-key"
  }
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "my-assistant",
  "password": "secure-password"
}
```

---

## 💬 Conversation Context Endpoints

### Create Context
```bash
POST /api/v1/contexts
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "sessionId": "session-123",
  "content": "User mentioned they prefer morning meetings and are working on a Python project",
  "metadata": {
    "project": "assistant-memory-api",
    "language": "python"
  },
  "tags": ["preferences", "project-info"],
  "expiresAt": "2026-03-01T00:00:00Z"
}
```

### Get All Contexts
```bash
GET /api/v1/contexts?sessionId=session-123&tags=preferences&limit=50&skip=0
Authorization: Bearer YOUR_TOKEN
```

### Get Specific Context
```bash
GET /api/v1/contexts/{contextId}
Authorization: Bearer YOUR_TOKEN
```

### Update Context
```bash
PUT /api/v1/contexts/{contextId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "Updated information",
  "tags": ["updated"]
}
```

### Delete Context
```bash
DELETE /api/v1/contexts/{contextId}
Authorization: Bearer YOUR_TOKEN
```

---

## ⚙️ User Preferences Endpoints

### Get Preferences
```bash
GET /api/v1/preferences
Authorization: Bearer YOUR_TOKEN
```

### Update Preferences
```bash
PUT /api/v1/preferences
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "preferences": {
    "default_language": "python",
    "code_style": "pep8",
    "meeting_time": "morning"
  },
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "notificationSettings": {
    "email": true,
    "push": false
  }
}
```

### Get Specific Preference
```bash
GET /api/v1/preferences/{key}
Authorization: Bearer YOUR_TOKEN
```

---

## 📋 Task Tracking Endpoints

### Create Task
```bash
POST /api/v1/tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Deploy API to production",
  "description": "Set up Docker container and deploy to cloud",
  "priority": "high",
  "tags": ["deployment", "devops"],
  "dueDate": "2026-02-15T17:00:00Z",
  "metadata": {
    "environment": "production",
    "platform": "AWS"
  }
}
```

### Get All Tasks
```bash
GET /api/v1/tasks?status=in_progress&priority=high&tags=deployment
Authorization: Bearer YOUR_TOKEN
```

### Update Task
```bash
PUT /api/v1/tasks/{taskId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "in_progress",
  "progress": 50,
  "result": {
    "deployment_url": "https://api.example.com"
  }
}
```

**Task Status Options:**
- `pending` - Task created but not started
- `in_progress` - Currently being worked on
- `completed` - Successfully finished
- `failed` - Task failed
- `cancelled` - Task cancelled

**Priority Options:** `low`, `medium`, `high`, `urgent`

---

## 💾 Structured Data Endpoints

### Store Data
```bash
POST /api/v1/data
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "collection": "project_settings",
  "data": {
    "api_keys": {
      "openai": "sk-...",
      "github": "ghp_..."
    },
    "default_model": "gpt-4"
  },
  "tags": ["config", "api"],
  "metadata": {
    "project": "assistant-memory-api"
  }
}
```

### Query Data
```bash
GET /api/v1/data?collection=project_settings&tags=config
Authorization: Bearer YOUR_TOKEN
```

### Get Specific Data
```bash
GET /api/v1/data/{dataId}
Authorization: Bearer YOUR_TOKEN
```

### Update Data
```bash
PUT /api/v1/data/{dataId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "data": {
    "updated_field": "new_value"
  }
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required
JWT_SECRET=your-super-secret-key-change-this

# Optional - Server
PORT=3000
NODE_ENV=production

# Optional - MongoDB (falls back to JSON if not provided)
MONGODB_URI=mongodb://localhost:27017/assistant-memory
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/assistant-memory

# Optional - Storage
STORAGE_MODE=auto  # Options: mongodb, json, auto
JSON_STORAGE_PATH=./data

# Optional - Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Storage Modes

1. **`auto` (Recommended)**: Tries MongoDB, falls back to JSON if unavailable
2. **`mongodb`**: Requires MongoDB, fails if not available
3. **`json`**: Always uses JSON file storage (good for development)

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

The `docker-compose.yml` includes both the API and MongoDB:

```bash
# Set your JWT secret
export JWT_SECRET="your-production-secret"

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Standalone Docker

```bash
# Build image
docker build -t assistant-memory-api .

# Run with JSON storage
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/usr/src/app/data \
  -e JWT_SECRET=your-secret \
  -e STORAGE_MODE=json \
  --name assistant-api \
  assistant-memory-api

# Run with external MongoDB
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e MONGODB_URI=mongodb://mongo:27017/assistant-memory \
  -e STORAGE_MODE=mongodb \
  --name assistant-api \
  assistant-memory-api
```

---

## 💡 Use Cases

### 1. **Multi-Session Project Tracking**
```javascript
// Day 1: Start a project
POST /api/v1/contexts
{
  "content": "Starting new web app. Stack: React + Node.js + PostgreSQL",
  "tags": ["project:webapp", "stack"]
}

// Day 3: Resume work
GET /api/v1/contexts?tags=project:webapp
// Returns all project context, picks up where you left off
```

### 2. **Long-Running Task Management**
```javascript
// Create deployment task
POST /api/v1/tasks
{
  "title": "Deploy v2.0 to production",
  "priority": "high",
  "status": "pending"
}

// Update progress over hours/days
PUT /api/v1/tasks/{id}
{
  "status": "in_progress",
  "progress": 75,
  "result": { "stage": "testing" }
}
```

### 3. **User Preference Persistence**
```javascript
// Store coding preferences
PUT /api/v1/preferences
{
  "preferences": {
    "indent": "2 spaces",
    "quotes": "single",
    "framework": "express"
  }
}

// Every conversation automatically uses these preferences
GET /api/v1/preferences/indent
// Returns: "2 spaces"
```

### 4. **API Key & Config Storage**
```javascript
// Store sensitive configs securely
POST /api/v1/data
{
  "collection": "api_keys",
  "data": {
    "github": "ghp_xxxx",
    "aws_key": "AKIA..."
  }
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  AI Assistant                       │
│          (Claude, GPT, Custom, etc.)                │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST API Calls
                   ▼
┌─────────────────────────────────────────────────────┐
│         Assistant Memory API (Express.js)           │
│  ┌──────────┐  ┌──────────┐  ┌────────┐           │
│  │ Contexts │  │  Tasks   │  │  Data  │           │
│  └──────────┘  └──────────┘  └────────┘           │
│  ┌──────────┐  ┌──────────┐                        │
│  │   Auth   │  │  Prefs   │  JWT Security         │
│  └──────────┘  └──────────┘                        │
└──────────────────┬─────────────┬────────────────────┘
                   │             │
          ┌────────▼──────┐     ┌▼────────────┐
          │   MongoDB     │     │ JSON Files  │
          │  (Primary)    │     │ (Fallback)  │
          └───────────────┘     └─────────────┘
```

---

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse (100 requests per 15 min by default)
- **Helmet.js**: Security headers protection
- **CORS Configuration**: Configurable cross-origin policies
- **Input Validation**: Joi schema validation (ready to extend)
- **Error Handling**: No sensitive data leaked in error responses

---

## 📊 Monitoring

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T10:28:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

### Logging
Logs are output to console with timestamps and levels:
- **Error**: Critical failures
- **Warn**: Important warnings
- **Info**: General information (default)
- **Debug**: Detailed debugging info

Configure via `LOG_LEVEL` environment variable.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Lint code
npm run lint
```

---

## 🚢 Production Deployment

### Cloud Platforms

**AWS (EC2 + MongoDB Atlas):**
```bash
# 1. Set up MongoDB Atlas cluster
# 2. Launch EC2 instance
# 3. Clone repository
git clone https://github.com/leoakok/assistant-memory-api.git
cd assistant-memory-api

# 4. Set environment variables
export JWT_SECRET="production-secret"
export MONGODB_URI="mongodb+srv://..."
export NODE_ENV=production

# 5. Install and start
npm ci --only=production
npm start
```

**Heroku:**
```bash
heroku create assistant-memory-api
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

**DigitalOcean/Railway/Render:**
- Connect GitHub repository
- Set environment variables
- Deploy (auto-deploys on push)

---

## 📦 Project Structure

```
assistant-memory-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection logic
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   ├── Context.js            # Conversation context schema
│   │   ├── Preference.js         # User preferences schema
│   │   ├── Task.js               # Task tracking schema
│   │   ├── StructuredData.js     # Generic data schema
│   │   └── User.js               # User/assistant schema
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── contexts.js           # Context CRUD endpoints
│   │   ├── preferences.js        # Preferences endpoints
│   │   ├── tasks.js              # Task management endpoints
│   │   └── data.js               # Structured data endpoints
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   └── jsonStorage.js        # JSON file storage fallback
│   └── server.js                 # Express app & server setup
├── data/                         # JSON storage directory (gitignored)
├── .env.example                  # Environment template
├── .gitignore
├── Dockerfile                    # Docker container definition
├── docker-compose.yml            # Docker Compose with MongoDB
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For issues, questions, or contributions, please open an issue on GitHub:
https://github.com/leoakok/assistant-memory-api/issues

---

## 🎓 Example: Programmatic Usage

```javascript
// Example: AI Assistant using this API
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = null;

// 1. Register/Login
async function authenticate() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username: 'my-assistant',
    password: 'secure-password'
  });
  authToken = response.data.token;
}

// 2. Store context from conversation
async function rememberContext(content, tags) {
  await axios.post(`${API_URL}/contexts`, 
    { content, tags },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
}

// 3. Retrieve past contexts
async function recallContext(tags) {
  const response = await axios.get(
    `${API_URL}/contexts?tags=${tags.join(',')}`,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  return response.data.contexts;
}

// 4. Track long-running task
async function createTask(title, description) {
  const response = await axios.post(`${API_URL}/tasks`,
    { title, description, status: 'in_progress' },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  return response.data.task.taskId;
}

// 5. Update task progress
async function updateTaskProgress(taskId, progress, status) {
  await axios.put(`${API_URL}/tasks/${taskId}`,
    { progress, status },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
}

// Usage
(async () => {
  await authenticate();
  
  // Remember user preferences
  await rememberContext(
    "User prefers Python for backend, React for frontend",
    ["preferences", "tech-stack"]
  );
  
  // Create a deployment task
  const taskId = await createTask(
    "Deploy application",
    "Deploy the new version to production"
  );
  
  // Later: Update progress
  await updateTaskProgress(taskId, 75, 'in_progress');
  
  // Recall what user likes
  const contexts = await recallContext(['preferences']);
  console.log('User preferences:', contexts);
})();
```

---

**Built with ❤️ for AI assistants that need memory**

*Making AI assistants more capable, one API call at a time.*