const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

// Import middleware
const { validateUserInput, validateTaskInput, validateCompletionInput } = require("./middleware/validation");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5050;

// Middleware
app.use(express.json());
app.use(cors());

//! Users API
// Create a new user
app.post("/users/create", validateUserInput, async (req, res) => {
  const { userName, email, password, role } = req.body;
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user with the hashed password
    const newUser = await prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        createdTasks: true,
        assignedTasks: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch single user" });
  }
});

// Update a user
app.patch("/users/:id", validateUserInput, async (req, res) => {
  const { id } = req.params;
  const { userName, email, password, role } = req.body;
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    // Hash the password
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        userName,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        role,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete associated tasks and completions first
    await prisma.$transaction([
      prisma.completeTask.deleteMany({
        where: { userId: parseInt(id) },
      }),
      prisma.task.updateMany({
        where: { assigneeId: parseInt(id) },
        data: { assigneeId: null },
      }),
      prisma.user.delete({
        where: { id: parseInt(id) },
      }),
    ]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//! Task API
// Create a new task
app.post("/tasks/create", validateTaskInput, async (req, res) => {
  const { title, description, creatorId, assigneeId, status, deadline, points } = req.body;
  try {
    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { id: parseInt(creatorId) },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: parseInt(assigneeId) },
      });

      if (!assignee) {
        return res.status(404).json({ error: "Assignee not found" });
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        deadline: deadline ? new Date(deadline) : null,
        points: points || 10,
        creatorId: parseInt(creatorId),
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        assignee: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        completions: true,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        creator: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        assignee: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        completions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get tasks by user ID (either created by or assigned to)
app.get("/tasks/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: parseInt(userId) },
          { assigneeId: parseInt(userId) },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        assignee: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        completions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user tasks" });
  }
});

// Get single task
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        assignee: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        completions: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                role: true,
              }
            }
          }
        },
      },
    });
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// Update a task
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assigneeId, deadline, points } = req.body;

  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: parseInt(assigneeId) },
      });

      if (!assignee) {
        return res.status(404).json({ error: "Assignee not found" });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(points !== undefined && { points: parseInt(points) }),
      },
      include: {
        creator: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        assignee: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
        completions: true,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Delete associated completions first, then the task
    await prisma.$transaction([
      prisma.completeTask.deleteMany({
        where: { taskId: parseInt(id) },
      }),
      prisma.task.delete({
        where: { id: parseInt(id) },
      }),
    ]);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

//! Complete Task API
// Create a new complete task
app.post("/completeTasks/create", validateCompletionInput, async (req, res) => {
  const { completed, taskId, userId } = req.body;
  try {
    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if completion already exists
    const existingCompletion = await prisma.completeTask.findFirst({
      where: {
        taskId: parseInt(taskId),
        userId: parseInt(userId),
      },
    });

    if (existingCompletion) {
      // Update existing completion instead of creating a new one
      const updatedCompletion = await prisma.completeTask.update({
        where: { id: existingCompletion.id },
        data: { completed },
        include: {
          task: true,
          user: {
            select: {
              id: true,
              userName: true,
              email: true,
              role: true,
            }
          },
        },
      });
      return res.json(updatedCompletion);
    }

    // Create new completion
    const newCompleteTask = await prisma.completeTask.create({
      data: {
        completed,
        task: { connect: { id: parseInt(taskId) } },
        user: { connect: { id: parseInt(userId) } },
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
      },
    });

    // If task is completed, update task status
    if (completed) {
      await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: { status: "COMPLETED" },
      });
    }

    res.status(201).json(newCompleteTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create complete task" });
  }
});

// Get all complete tasks
app.get("/completeTasks", async (req, res) => {
  try {
    const completeTasks = await prisma.completeTask.findMany({
      include: {
        task: true,
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(completeTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch complete tasks" });
  }
});

// Get completions by task ID
app.get("/completeTasks/task/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    const completeTasks = await prisma.completeTask.findMany({
      where: { taskId: parseInt(taskId) },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(completeTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch task completions" });
  }
});

// Get completions by user ID
app.get("/completeTasks/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const completeTasks = await prisma.completeTask.findMany({
      where: { userId: parseInt(userId) },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(completeTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user completions" });
  }
});

// Update a complete task
app.patch("/completeTasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    // Check if completion exists
    const existingCompletion = await prisma.completeTask.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCompletion) {
      return res.status(404).json({ error: "Completion not found" });
    }

    const updatedCompleteTask = await prisma.completeTask.update({
      where: { id: parseInt(id) },
      data: { completed },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
          }
        },
      },
    });

    // If task is completed, update task status
    if (completed) {
      await prisma.task.update({
        where: { id: updatedCompleteTask.taskId },
        data: { status: "COMPLETED" },
      });
    }

    res.json(updatedCompleteTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update complete task" });
  }
});

// Delete a complete task
app.delete("/completeTasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if completion exists
    const existingCompletion = await prisma.completeTask.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCompletion) {
      return res.status(404).json({ error: "Completion not found" });
    }

    await prisma.completeTask.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Complete task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete complete task" });
  }
});

//! Login System
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user not found or password doesn't match, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // If credentials are valid, return user data (excluding sensitive info)
    const loggedInUser = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };
    
    res.json({ 
      message: "Login successful",
      user: loggedInUser 
    });
    console.log("Login Successfully", loggedInUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check if email exists (for registration validation)
app.get("/check-email/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    
    res.json({ exists: !!user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check email" });
  }
});

// Get dashboard stats
app.get("/dashboard/stats", async (req, res) => {
  try {
    const [totalUsers, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { status: "PENDING" } }),
    ]);
    
    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "TaskMate API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Apply error handling middleware
app.use(errorHandler);

// Apply 404 handler for undefined routes
app.use(notFoundHandler);

app.listen(port, () => {
  console.log(`TaskMate API server running on port ${port}`);
});
