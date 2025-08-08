import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types";

export const handleSocketConnection = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`✅ ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    const { roomId, message } = data;
    socket.to(roomId).emit("receive_message", {
      message,
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    });
    console.log(`💬 ${socket.id} sent message to ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
};
