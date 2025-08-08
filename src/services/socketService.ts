import { Server, Socket } from "socket.io";
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  formatMessage,
} from "@/utils/messageUtils";

export const handleSocketConnection = (io: Server, socket: Socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("joinRoom", ({ username, room }) => {
    const user = addUser(socket.id, username, room);
    socket.join(user.room);

    // Welcome message
    socket.emit("message", formatMessage("Admin", `Welcome ${user.username}!`));

    // Broadcast to others
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage("Admin", `${user.username} has joined the chat.`));

    // Send room user list
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    }
  });

  socket.on("privateMessage", ({ toSocketId, message }) => {
    const user = getUser(socket.id);
    if (user && toSocketId) {
      io.to(toSocketId).emit("privateMessage", {
        from: user.username,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage("Admin", `${user.username} has left.`));

      // Update room user list
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
};
