# 📖 API Examples & Cookbook

Complete examples for every endpoint in the Assistant Memory API.

## Table of Contents
- [Initial Setup](#initial-setup)
- [Authentication Examples](#authentication-examples)
- [Context Management](#context-management)
- [Preferences Management](#preferences-management)
- [Task Tracking](#task-tracking)
- [Structured Data Storage](#structured-data-storage)
- [Advanced Use Cases](#advanced-use-cases)

---

## Initial Setup

### Using cURL

```bash
# Set base URL
export API_URL="http://localhost:3000/api/v1"
```

### Using JavaScript (Node.js)

```javascript
const axios = require('axios');
const API_URL = 'http://localhost:3000/api/v1';
let token = '';
```

### Using Python

```python
import requests

API_URL = 'http://localhost:3000/api/v1'
token = ''
```

---

## Authentication Examples

### Register New Assistant

**cURL:**
```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "my-assistant",
    "email": "assistant@example.com",
    "password": "SecurePass123!",
    "role": "assistant"
  }'
```

**JavaScript:**
```javascript
const response = await axios.post(`${API_URL}/auth/register`, {
  username: 'my-assistant',
  email: 'assistant@example.com',
  password: 'SecurePass123!',
  role: 'assistant'
});

token = response.data.token;
console.log('Registered with token:', token);
```

**Python:**
```python
response = requests.post(f'{API_URL}/auth/register', json={
    'username': 'my-assistant',
    'email': 'assistant@example.com',
    'password': 'SecurePass123!',
    'role': 'assistant'
})

token = response.json()['token']
print(f'Registered with token: {token}')
```

### Login

**cURL:**
```bash
export TOKEN=$(curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "my-assistant", "password": "SecurePass123!"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

**JavaScript:**
```javascript
const loginResponse = await axios.post(`${API_URL}/auth/login`, {
  username: 'my-assistant',
  password: 'SecurePass123!'
});

token = loginResponse.data.token;
```

**Python:**
```python
response = requests.post(f'{API_URL}/auth/login', json={
    'username': 'my-assistant',
    'password': 'SecurePass123!'
})

token = response.json()['token']
headers = {'Authorization': f'Bearer {token}'}
```

---

## Context Management

### Create Context with Metadata

**cURL:**
```bash
curl -X POST $API_URL/contexts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-2026-02-08",
    "content": "User is building a React app with TypeScript. Prefers functional components and hooks. Working on authentication feature.",
    "metadata": {
      "project": "my-react-app",
      "framework": "React",
      "language": "TypeScript",
      "current_feature": "authentication"
    },
    "tags": ["project", "react", "typescript", "auth"],
    "expiresAt": "2026-03-08T00:00:00Z"
  }'
```

**JavaScript:**
```javascript
const context = await axios.post(`${API_URL}/contexts`, {
  sessionId: 'session-2026-02-08',
  content: 'User is building a React app with TypeScript. Prefers functional components.',
  metadata: {
    project: 'my-react-app',
    framework: 'React',
    language: 'TypeScript'
  },
  tags: ['project', 'react', 'typescript']
}, {
  headers: { Authorization: `Bearer ${token}` }
});

console.log('Context created:', context.data.context.contextId);
```

**Python:**
```python
response = requests.post(f'{API_URL}/contexts', 
    headers=headers,
    json={
        'sessionId': 'session-2026-02-08',
        'content': 'User is building a React app with TypeScript.',
        'metadata': {
            'project': 'my-react-app',
            'framework': 'React'
        },
        'tags': ['project', 'react', 'typescript']
    }
)

context_id = response.json()['context']['contextId']
print(f'Context created: {context_id}')
```

### Query Contexts by Tags

**cURL:**
```bash
# Get all React-related contexts
curl -X GET "$API_URL/contexts?tags=react,typescript&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**JavaScript:**
```javascript
const contexts = await axios.get(`${API_URL}/contexts`, {
  params: { tags: 'react,typescript', limit: 10 },
  headers: { Authorization: `Bearer ${token}` }
});

console.log(`Found ${contexts.data.count} contexts:`);
contexts.data.contexts.forEach(ctx => {
  console.log(`- ${ctx.content.substring(0, 50)}...`);
});
```

**Python:**
```python
response = requests.get(f'{API_URL}/contexts',
    headers=headers,
    params={'tags': 'react,typescript', 'limit': 10}
)

contexts = response.json()['contexts']
for ctx in contexts:
    print(f"- {ctx['content'][:50]}...")
```

### Update Context

**cURL:**
```bash
curl -X PUT $API_URL/contexts/{contextId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated: User completed authentication feature, now working on user profile page.",
    "tags": ["project", "react", "typescript", "profile"]
  }'
```

---

## Preferences Management

### Set Comprehensive Preferences

**JavaScript:**
```javascript
await axios.put(`${API_URL}/preferences`, {
  preferences: {
    // Coding preferences
    indentation: '2 spaces',
    quotes: 'single',
    semicolons: false,
    
    // Workflow preferences
    default_framework: 'React',
    default_language: 'TypeScript',
    testing_framework: 'Jest',
    
    // Communication preferences
    code_comments: 'detailed',
    explanation_style: 'beginner-friendly',
    
    // Project preferences
    package_manager: 'npm',
    git_workflow: 'feature-branch'
  },
  theme: 'dark',
  language: 'en',
  timezone: 'America/New_York',
  notificationSettings: {
    email: true,
    push: false,
    sms: false
  }
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Python:**
```python
requests.put(f'{API_URL}/preferences',
    headers=headers,
    json={
        'preferences': {
            'indentation': '2 spaces',
            'quotes': 'single',
            'default_framework': 'React',
            'default_language': 'TypeScript'
        },
        'theme': 'dark',
        'language': 'en',
        'timezone': 'America/New_York'
    }
)
```

### Get Specific Preference

**cURL:**
```bash
curl -X GET $API_URL/preferences/default_framework \
  -H "Authorization: Bearer $TOKEN"
```

---

## Task Tracking

### Create Task with Full Details

**JavaScript:**
```javascript
const task = await axios.post(`${API_URL}/tasks`, {
  title: 'Implement OAuth2 Authentication',
  description: `
    1. Set up OAuth2 provider integration
    2. Create login/logout endpoints
    3. Implement token refresh mechanism
    4. Add protected route middleware
    5. Write integration tests
  `,
  priority: 'high',
  tags: ['authentication', 'security', 'backend'],
  dueDate: '2026-02-15T17:00:00Z',
  metadata: {
    estimated_hours: 8,
    assigned_to: 'backend-team',
    sprint: 'sprint-12',
    story_points: 5
  }
}, {
  headers: { Authorization: `Bearer ${token}` }
});

const taskId = task.data.task.taskId;
console.log('Task created:', taskId);
```

### Update Task Progress

**JavaScript:**
```javascript
// Start task
await axios.put(`${API_URL}/tasks/${taskId}`, {
  status: 'in_progress',
  progress: 0
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Update progress
await axios.put(`${API_URL}/tasks/${taskId}`, {
  progress: 40,
  result: {
    completed_steps: ['OAuth2 provider setup', 'Login endpoint created']
  }
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Complete task
await axios.put(`${API_URL}/tasks/${taskId}`, {
  status: 'completed',
  progress: 100,
  result: {
    pull_request: 'https://github.com/user/repo/pull/123',
    tests_passing: true,
    deployed_to: 'staging'
  }
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Query Tasks

**cURL:**
```bash
# Get all high-priority in-progress tasks
curl -X GET "$API_URL/tasks?status=in_progress&priority=high" \
  -H "Authorization: Bearer $TOKEN"

# Get all authentication-related tasks
curl -X GET "$API_URL/tasks?tags=authentication" \
  -H "Authorization: Bearer $TOKEN"
```

**Python:**
```python
# Get pending tasks
response = requests.get(f'{API_URL}/tasks',
    headers=headers,
    params={'status': 'pending', 'priority': 'high'}
)

tasks = response.json()['tasks']
for task in tasks:
    print(f"Task: {task['title']} - {task['priority']}")
```

---

## Structured Data Storage

### Store API Configuration

**JavaScript:**
```javascript
await axios.post(`${API_URL}/data`, {
  collection: 'api_config',
  data: {
    services: {
      github: {
        api_url: 'https://api.github.com',
        token: 'ghp_xxxxxxxxxxxx',
        rate_limit: 5000
      },
      openai: {
        api_url: 'https://api.openai.com/v1',
        api_key: 'sk-xxxxxxxxxx',
        model: 'gpt-4',
        max_tokens: 4000
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        ssl: true
      }
    }
  },
  tags: ['config', 'api', 'secrets'],
  metadata: {
    environment: 'production',
    last_updated: new Date().toISOString()
  }
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Store User Project Data

**JavaScript:**
```javascript
await axios.post(`${API_URL}/data`, {
  collection: 'projects',
  data: {
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution',
    tech_stack: {
      frontend: ['React', 'TypeScript', 'TailwindCSS'],
      backend: ['Node.js', 'Express', 'PostgreSQL'],
      devops: ['Docker', 'GitHub Actions', 'AWS']
    },
    repositories: {
      frontend: 'https://github.com/user/ecommerce-frontend',
      backend: 'https://github.com/user/ecommerce-backend'
    },
    status: 'in_development',
    milestones: [
      { name: 'MVP', date: '2026-03-01', completed: false },
      { name: 'Beta Launch', date: '2026-04-15', completed: false }
    ]
  },
  tags: ['project', 'ecommerce', 'active']
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Query Structured Data

**cURL:**
```bash
# Get all project data
curl -X GET "$API_URL/data?collection=projects" \
  -H "Authorization: Bearer $TOKEN"

# Get API configurations
curl -X GET "$API_URL/data?collection=api_config&tags=secrets" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Advanced Use Cases

### Complete Workflow: Project Onboarding

```javascript
class AssistantMemory {
  constructor(apiUrl, token) {
    this.api = axios.create({
      baseURL: apiUrl,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async onboardProject(projectDetails) {
    // 1. Store project data
    const projectData = await this.api.post('/data', {
      collection: 'projects',
      data: projectDetails,
      tags: ['project', 'active', projectDetails.name.toLowerCase()]
    });

    // 2. Create initial context
    await this.api.post('/contexts', {
      sessionId: `project-${projectDetails.name}`,
      content: `New project started: ${projectDetails.name}. Tech stack: ${projectDetails.tech_stack.join(', ')}`,
      tags: ['project', 'onboarding']
    });

    // 3. Set project preferences
    await this.api.put('/preferences', {
      preferences: {
        current_project: projectDetails.name,
        default_language: projectDetails.primary_language,
        default_framework: projectDetails.framework
      }
    });

    // 4. Create setup tasks
    const setupTasks = [
      'Initialize Git repository',
      'Set up CI/CD pipeline',
      'Configure development environment',
      'Create project documentation'
    ];

    for (const taskTitle of setupTasks) {
      await this.api.post('/tasks', {
        title: taskTitle,
        priority: 'high',
        tags: ['setup', 'project', projectDetails.name]
      });
    }

    return projectData.data.data.dataId;
  }

  async getProjectStatus(projectName) {
    // Get project data
    const projects = await this.api.get('/data', {
      params: { collection: 'projects', tags: projectName.toLowerCase() }
    });

    // Get related tasks
    const tasks = await this.api.get('/tasks', {
      params: { tags: projectName }
    });

    // Get contexts
    const contexts = await this.api.get('/contexts', {
      params: { tags: projectName.toLowerCase() }
    });

    return {
      project: projects.data.data[0],
      tasks: tasks.data.tasks,
      contexts: contexts.data.contexts
    };
  }
}

// Usage
const memory = new AssistantMemory(API_URL, token);

const projectId = await memory.onboardProject({
  name: 'MyApp',
  description: 'Revolutionary new application',
  tech_stack: ['React', 'Node.js', 'MongoDB'],
  primary_language: 'JavaScript',
  framework: 'Express'
});

console.log('Project onboarded:', projectId);

// Later: Check project status
const status = await memory.getProjectStatus('MyApp');
console.log('Project status:', status);
```

### Session Continuity Pattern

```javascript
// At the start of each conversation session
async function initializeSession(userId, sessionId) {
  const memory = new AssistantMemory(API_URL, token);

  // 1. Load user preferences
  const prefs = await memory.api.get('/preferences');
  
  // 2. Load recent contexts
  const recentContexts = await memory.api.get('/contexts', {
    params: { limit: 5 }
  });

  // 3. Load active tasks
  const activeTasks = await memory.api.get('/tasks', {
    params: { status: 'in_progress' }
  });

  // 4. Create session context
  await memory.api.post('/contexts', {
    sessionId,
    content: `Session started. User has ${activeTasks.data.count} active tasks.`,
    tags: ['session', 'start']
  });

  return {
    preferences: prefs.data.preferences,
    recentActivity: recentContexts.data.contexts,
    activeTasks: activeTasks.data.tasks
  };
}

// Usage in conversation
const sessionData = await initializeSession('user123', 'session-' + Date.now());
console.log('Loaded session context:', sessionData);
// Now the assistant knows user preferences and recent activity
```

---

## Error Handling Examples

```javascript
try {
  await axios.post(`${API_URL}/contexts`, {
    content: 'Some context'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data.error);
    console.error('Status:', error.response.status);
    
    if (error.response.status === 401) {
      console.log('Token expired, need to re-authenticate');
    } else if (error.response.status === 429) {
      console.log('Rate limit exceeded, wait before retrying');
    }
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Error setting up request
    console.error('Request error:', error.message);
  }
}
```

---

**For more examples, see the [README.md](README.md) or open an issue on GitHub!**