const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

// Import database connection
const connectDB = require("./config/database");

// Import routes
const eventRoutes = require("./routes/events");
const chatRoutes = require("./routes/chats");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

// Initialize express app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // React dev servers
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/chats", chatRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRMS Backend Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to HRMS Backend API",
    version: "1.0.0",
    endpoints: {
      events: "/api/events",
      chats: "/api/chats",
      health: "/api/health",
    },
  });
});

// Socket.io connection handling
const connectedUsers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (userData) => {
    connectedUsers.set(socket.id, userData);
    socket.join(userData.chatId);

    // Notify others in the chat that user is online
    socket.to(userData.chatId).emit('userOnline', {
      userId: userData.userId,
      userName: userData.userName
    });

    console.log(`👤 ${userData.userName} joined chat: ${userData.chatId}`);
  });

  // Handle new message
  socket.on('sendMessage', (messageData) => {
    const { chatId, message } = messageData;

    // Broadcast message to all users in the chat room
    io.to(chatId).emit('newMessage', message);

    console.log(`💬 Message sent to chat ${chatId}:`, message.text);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { chatId, userName, isTyping } = data;

    if (isTyping) {
      typingUsers.set(socket.id, { chatId, userName });
    } else {
      typingUsers.delete(socket.id);
    }

    // Get all users currently typing in this chat
    const usersTypingInChat = Array.from(typingUsers.values())
      .filter(user => user.chatId === chatId)
      .map(user => user.userName);

    // Broadcast typing status to others in the chat
    socket.to(chatId).emit('typingStatus', {
      chatId,
      usersTyping: usersTypingInChat
    });
  });

  // Handle file upload notification
  socket.on('fileUploaded', (data) => {
    const { chatId, message } = data;
    io.to(chatId).emit('newMessage', message);
    console.log(`📎 File uploaded to chat ${chatId}:`, message.fileName);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);

    if (userData) {
      // Notify others that user went offline
      socket.to(userData.chatId).emit('userOffline', {
        userId: userData.userId,
        userName: userData.userName
      });

      console.log(`👤 ${userData.userName} disconnected from chat: ${userData.chatId}`);
    }

    // Clean up
    connectedUsers.delete(socket.id);
    typingUsers.delete(socket.id);

    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 HRMS Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
