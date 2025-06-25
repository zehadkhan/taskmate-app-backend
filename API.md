# TaskMate API Documentation

## Base URL

```
http://localhost:5050
```

## Authentication

### Login

```
POST /login
```

Authenticates a user and returns user information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "userName": "John Doe",
    "email": "user@example.com",
    "role": "STUDENT"
  }
}
```

### Check Email Availability

```
GET /check-email/:email
```

Checks if an email is already registered.

**Response:**
```json
{
  "exists": true
}
```

## Users

### Create User

```
POST /users/create
```

Creates a new user.

**Request Body:**
```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "id": 1,
  "userName": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2023-06-01T12:00:00.000Z",
  "updatedAt": "2023-06-01T12:00:00.000Z"
}
```

### Get All Users

```
GET /users
```

Returns a list of all users.

**Response:**
```json
[
  {
    "id": 1,
    "userName": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2023-06-01T12:00:00.000Z",
    "updatedAt": "2023-06-01T12:00:00.000Z"
  },
  {
    "id": 2,
    "userName": "Jane Smith",
    "email": "jane@example.com",
    "role": "TEACHER",
    "createdAt": "2023-06-01T12:00:00.000Z",
    "updatedAt": "2023-06-01T12:00:00.000Z"
  }
]
```

### Get User by ID

```
GET /users/:id
```

Returns a specific user by ID.

**Response:**
```json
{
  "id": 1,
  "userName": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2023-06-01T12:00:00.000Z",
  "updatedAt": "2023-06-01T12:00:00.000Z",
  "createdTasks": [...],
  "assignedTasks": [...]
}
```

### Update User

```
PATCH /users/:id
```

Updates a user's information.

**Request Body:**
```json
{
  "userName": "John Updated",
  "email": "john.updated@example.com",
  "password": "newpassword",
  "role": "TEACHER"
}
```

**Response:**
```json
{
  "id": 1,
  "userName": "John Updated",
  "email": "john.updated@example.com",
  "role": "TEACHER",
  "createdAt": "2023-06-01T12:00:00.000Z",
  "updatedAt": "2023-06-01T13:00:00.000Z"
}
```

### Delete User

```
DELETE /users/:id
```

Deletes a user.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Tasks

### Create Task

```
POST /tasks/create
```

Creates a new task.

**Request Body:**
```json
{
  "title": "Complete Assignment",
  "description": "Finish the math homework by Friday",
  "creatorId": 2,
  "assigneeId": 1,
  "status": "PENDING"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Complete Assignment",
  "description": "Finish the math homework by Friday",
  "status": "PENDING",
  "creatorId": 2,
  "assigneeId": 1,
  "createdAt": "2023-06-01T12:00:00.000Z",
  "updatedAt": "2023-06-01T12:00:00.000Z",
  "creator": {
    "id": 2,
    "userName": "Jane Smith",
    "email": "jane@example.com",
    "role": "TEACHER"
  },
  "assignee": {
    "id": 1,
    "userName": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  },
  "completions": []
}
```

### Get All Tasks

```
GET /tasks
```

Returns a list of all tasks.

### Get Tasks by User ID

```
GET /tasks/user/:userId
```

Returns tasks created by or assigned to a specific user.

### Get Task by ID

```
GET /tasks/:id
```

Returns a specific task by ID.

### Update Task

```
PATCH /tasks/:id
```

Updates a task.

**Request Body:**
```json
{
  "title": "Updated Assignment",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "assigneeId": 3
}
```

### Delete Task

```
DELETE /tasks/:id
```

Deletes a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

## Task Completions

### Create/Update Task Completion

```
POST /completeTasks/create
```

Creates a new task completion or updates an existing one.

**Request Body:**
```json
{
  "completed": true,
  "taskId": 1,
  "userId": 1
}
```

### Get All Completions

```
GET /completeTasks
```

Returns all task completions.

### Get Completions by Task ID

```
GET /completeTasks/task/:taskId
```

Returns completions for a specific task.

### Get Completions by User ID

```
GET /completeTasks/user/:userId
```

Returns completions by a specific user.

### Update Completion

```
PATCH /completeTasks/:id
```

Updates a completion status.

**Request Body:**
```json
{
  "completed": true
}
```

### Delete Completion

```
DELETE /completeTasks/:id
```

Deletes a completion.

**Response:**
```json
{
  "message": "Complete task deleted successfully"
}
```

## Dashboard

### Get Dashboard Statistics

```
GET /dashboard/stats
```

Returns statistics for the dashboard.

**Response:**
```json
{
  "totalUsers": 10,
  "totalTasks": 25,
  "completedTasks": 15,
  "pendingTasks": 8,
  "completionRate": 60
}
```

## Health Check

### API Status

```
GET /
```

Returns the API status.

**Response:**
```json
{
  "status": "online",
  "message": "TaskMate API is running!",
  "version": "1.0.0",
  "timestamp": "2023-06-01T12:00:00.000Z"
}
``` 