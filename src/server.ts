import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes";
import { registerChatHandlers } from "./services/socketService"; // ✅ fixed import
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/chat", chatRoutes);

// WebSocket handling
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);
  registerChatHandlers(io, socket); // ✅ use correct handler
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
