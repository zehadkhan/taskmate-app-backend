const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());

//! Users API
// Create a new user
app.post("/users/create", async (req, res) => {
  const { userName, email, password, role } = req.body;
  try {
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

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
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
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch single user" });
  }
});

// Update a user
app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { userName, email, password, role } = req.body;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        userName,
        email,
        password: hashedPassword,
        role,
      },
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
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//! Task API
// Create a new task
app.post("/tasks/create", async (req, res) => {
  const { title, description, creatorId, assignUser } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        creatorId: parseInt(creatorId),
        assignUser: assignUser ? parseInt(assignUser) : undefined,
      },
      include: {
        creator: true, // Include the creator information
        assignedTo: true, // Include the assigned user information
      },
    });
    res.json(newTask);
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
        creator: true,
        assignedTo: true,
        CompleteTasks: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Update a task
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completeTaskStatus } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        completeTaskStatus,
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
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

//! Complete Task API
// Create a new complete task
app.post("/completeTasks/create", async (req, res) => {
  const { complete, taskId, userId } = req.body;
  try {
    const newCompleteTask = await prisma.completeTask.create({
      data: {
        complete,
        task: { connect: { id: parseInt(taskId) } },
        user: { connect: { id: parseInt(userId) } },
      },
    });
    res.json(newCompleteTask);
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
        user: true,
      },
    });
    res.json(completeTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch complete tasks" });
  }
});

// Update a complete task
app.patch("/completeTasks/:id", async (req, res) => {
  const { id } = req.params;
  const { complete } = req.body;
  try {
    const updatedCompleteTask = await prisma.completeTask.update({
      where: { id: parseInt(id) },
      data: { complete },
    });
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

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user not found or password doesn't match, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // If credentials are valid, return user data
    const loggedInUser = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };
    res.json(loggedInUser);
    console.log("Login Successfully", loggedInUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("TaskMate server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
