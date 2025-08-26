// src/services/socketService.ts
import { Server, Socket } from "socket.io";
import { ChatMessage } from "../types/message";
import {
  addMessageToRoom,
  getMessagesForRoom,
  deleteMessagesByRoom,
  deleteMessageById,
  addPrivateMessage,
  getPrivateMessagesBetween,
} from "../utils/messageUtils";

type User = {
  socketId: string;
  username: string;
  room: string | null;
};

const rooms = new Map<string, Set<string>>(); // room -> socketIds
const users = new Map<string, User>();        // socketId -> User
const typing = new Map<string, Set<string>>(); // room -> set(username)

const listRooms = (): string[] => Array.from(rooms.keys());

function emitRooms(io: Server): void {
  io.emit("roomsUpdated", listRooms());
}

function getRoomUsers(room: string): User[] {
  const ids = rooms.get(room) ?? new Set();
  return Array.from(ids)
    .map((id) => users.get(id))
    .filter((u): u is User => Boolean(u));
}

function broadcastRoomUsers(io: Server, room: string): void {
  io.to(room).emit("roomUsers", getRoomUsers(room));
}

export function registerSocketHandlers(io: Server, socket: Socket): void {
  // register initial user
  users.set(socket.id, { socketId: socket.id, username: "Anonymous", room: null });

  socket.emit("roomsUpdated", listRooms());

  socket.on("register", (username: string) => {
    const u = users.get(socket.id);
    if (!u) return;
    u.username = (username ?? "").trim() || "Anonymous";
    users.set(socket.id, u);
    socket.emit("registered", u.username);
  });

  // ... keep rest of handlers as in your code (no type errors)
}
