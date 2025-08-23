// src/lib/socket.ts

import { io, Socket } from "socket.io-client";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables for backend

// Get server URL from environment variables
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

// Create a single shared socket instance for backend
const socket: Socket = io(SERVER_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
