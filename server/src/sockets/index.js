const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const messageHandler = require("./messageHandler");
const notificationHandler = require("./notificationHandler");

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Find user
      const user = await User.findById(decoded.user.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Join user's personal room
    socket.join(`user-${socket.user.id}`);

    // Set online status
    socket.broadcast.emit("user-status", {
      userId: socket.user.id,
      status: "online",
    });

    // Register message handlers
    messageHandler(io, socket);

    // Register notification handlers
    notificationHandler(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);

      // Set offline status
      socket.broadcast.emit("user-status", {
        userId: socket.user.id,
        status: "offline",
      });
    });
  });

  return io;
};
