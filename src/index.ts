import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { registerChatHandlers } from "./services/socketService";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // frontend origin if needed e.g. "http://localhost:5173"
    methods: ["GET", "POST"]
  }
});

// Register socket event handlers
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Default API route
app.get("/", (req, res) => {
  res.send("🚀 Blurchat Backend with Matchmaking is running");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
