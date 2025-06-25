# TaskMate API

TaskMate is a task management system API built with Express.js and Prisma ORM. It provides endpoints for managing users, tasks, and task completions.

## Features

- User authentication and management
- Task creation, assignment, and tracking
- Task completion tracking
- Dashboard statistics
- Role-based access (Teacher/Student)

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd taskmate-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/taskmate?schema=public"
DATABASE_URL_UNPOOLED="postgresql://username:password@localhost:5432/taskmate?schema=public"
PORT=5050
```

4. Run database migrations
```bash
npx prisma migrate dev --name init
```

5. Start the development server
```bash
npm start
```

### Database Management

To view and manage your database through Prisma Studio:
```bash
npx prisma studio
```

After editing the Prisma model, run migrations:
```bash
npx prisma migrate dev --name <migration-name>
```

## API Documentation

### Authentication

#### Login
```
POST /login
```
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Users

#### Create User
```
POST /users/create
```
Request body:
```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT" // or "TEACHER"
}
```

#### Get All Users
```
GET /users
```

#### Get User by ID
```
GET /users/:id
```

#### Update User
```
PATCH /users/:id
```
Request body (all fields optional):
```json
{
  "userName": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword",
  "role": "TEACHER"
}
```

#### Delete User
```
DELETE /users/:id
```

### Tasks

#### Create Task
```
POST /tasks/create
```
Request body:
```json
{
  "title": "Task Title",
  "description": "Task description",
  "creatorId": 1,
  "assigneeId": 2,
  "status": "PENDING"
}
```

#### Get All Tasks
```
GET /tasks
```

#### Get Tasks by User ID
```
GET /tasks/user/:userId
```

#### Get Task by ID
```
GET /tasks/:id
```

#### Update Task
```
PATCH /tasks/:id
```
Request body (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "assigneeId": 3
}
```

#### Delete Task
```
DELETE /tasks/:id
```

### Task Completions

#### Create/Update Task Completion
```
POST /completeTasks/create
```
Request body:
```json
{
  "completed": true,
  "taskId": 1,
  "userId": 2
}
```

#### Get All Completions
```
GET /completeTasks
```

#### Get Completions by Task ID
```
GET /completeTasks/task/:taskId
```

#### Get Completions by User ID
```
GET /completeTasks/user/:userId
```

#### Update Completion
```
PATCH /completeTasks/:id
```
Request body:
```json
{
  "completed": true
}
```

#### Delete Completion
```
DELETE /completeTasks/:id
```

### Dashboard

#### Get Dashboard Statistics
```
GET /dashboard/stats
```

## Deployment

The API is configured for deployment on Vercel with the included `vercel.json` file.

## License

ISC
