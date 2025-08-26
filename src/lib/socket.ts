// src/lib/socket.ts
import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // allow all for now, adjust later if needed
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
