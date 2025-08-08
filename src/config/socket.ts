import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import type { ClientToServerEvents, ServerToClientEvents } from "../types";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: "*", // You can restrict this to your frontend URL
      methods: ["GET", "POST"]
    }
  });

  console.log("✅ Socket.IO initialized");
  
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized");
  }
  return io;
};
