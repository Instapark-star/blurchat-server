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
  readPrivateMessages,
  writePrivateMessages,
} from "../utils/messageUtils";

type User = {
  socketId: string;
  username: string;
  room: string | null;
};

const rooms = new Map<string, Set<string>>(); // room -> socketIds
const users = new Map<string, User>();        // socketId -> User
const typing = new Map<string, Set<string>>(); // room -> set(username)

const listRooms = () => Array.from(rooms.keys());

function emitRooms(io: Server) {
  io.emit("roomsUpdated", listRooms());
}

function getRoomUsers(room: string) {
  const ids = rooms.get(room) ?? new Set();
  return Array.from(ids).map(id => users.get(id)).filter(Boolean);
}

function broadcastRoomUsers(io: Server, room: string) {
  io.to(room).emit("roomUsers", getRoomUsers(room));
}

export function registerSocketHandlers(io: Server, socket: Socket) {
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

  socket.on("rooms:create", (roomName: string, ack?: (ok: boolean, err?: string) => void) => {
    const room = roomName?.trim();
    if (!room) return ack?.(false, "Room name required");
    if (rooms.has(room)) return ack?.(false, "Room already exists");
    rooms.set(room, new Set());
    emitRooms(io);
    ack?.(true);
  });

  socket.on("rooms:join", (roomName: string, ack?: (ok: boolean, err?: string) => void) => {
    const room = roomName?.trim();
    if (!room) return ack?.(false, "Room name required");
    if (!rooms.has(room)) rooms.set(room, new Set()); // allow auto-create on join

    const u = users.get(socket.id);
    if (!u) return ack?.(false, "User not found");

    // leave previous
    if (u.room && rooms.has(u.room)) {
      socket.leave(u.room);
      rooms.get(u.room)!.delete(socket.id);
      io.to(u.room).emit("system", `${u.username} left ${u.room}`);
      broadcastRoomUsers(io, u.room);
      if (rooms.get(u.room)!.size === 0) {
        rooms.delete(u.room);
        deleteMessagesByRoom(u.room);
        typing.delete(u.room);
        emitRooms(io);
      }
    }

    // join new
    u.room = room;
    users.set(socket.id, u);
    socket.join(room);
    rooms.get(room)!.add(socket.id);

    typing.set(room, typing.get(room) ?? new Set());

    // send history & presence
    socket.emit("chatHistory", getMessagesForRoom(room));
    io.to(room).emit("system", `${u.username} joined ${room}`);
    broadcastRoomUsers(io, room);
    emitRooms(io);

    ack?.(true);
  });

  socket.on("rooms:leave", (ack?: (ok: boolean) => void) => {
    const u = users.get(socket.id);
    if (!u || !u.room) return ack?.(true);
    const room = u.room;

    socket.leave(room);
    rooms.get(room)?.delete(socket.id);
    io.to(room).emit("system", `${u.username} left ${room}`);
    broadcastRoomUsers(io, room);

    if (rooms.get(room)?.size === 0) {
      rooms.delete(room);
      deleteMessagesByRoom(room);
      typing.delete(room);
      emitRooms(io);
    }

    u.room = null;
    users.set(socket.id, u);
    ack?.(true);
  });

  // Public chat
  socket.on("chat:send", (payload: { room: string; message: string; id?: string }, ack?: (ok: boolean, err?: string) => void) => {
    const u = users.get(socket.id);
    if (!u) return ack?.(false, "User not found");
    const room = payload?.room?.trim();
    if (!room || !rooms.has(room)) return ack?.(false, "Room not found");
    if (!payload?.message?.trim()) return ack?.(false, "Empty message");

    const msg: ChatMessage = {
      id: payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: u.username,
      recipient: undefined,
      content: payload.message.trim(),
      room,
      timestamp: Date.now(),
      type: "public",
    };

    addMessageToRoom(room, msg);
    io.to(room).emit("chat:message", msg);
    ack?.(true);
  });

  // Typing indicators
  socket.on("typing:start", (room: string) => {
    const u = users.get(socket.id);
    if (!u?.username || !room) return;
    const set = typing.get(room) ?? new Set();
    set.add(u.username);
    typing.set(room, set);
    io.to(room).emit("typing", Array.from(set));
  });

  socket.on("typing:stop", (room: string) => {
    const u = users.get(socket.id);
    if (!u?.username || !room) return;
    const set = typing.get(room) ?? new Set();
    set.delete(u.username);
    typing.set(room, set);
    io.to(room).emit("typing", Array.from(set));
  });

  // Delete one message
  socket.on("chat:delete", (payload: { room: string; messageId: string }, ack?: (ok: boolean, err?: string) => void) => {
    const { room, messageId } = payload || {};
    if (!room || !rooms.has(room)) return ack?.(false, "Room not found");
    if (!messageId) return ack?.(false, "messageId required");
    const ok = deleteMessageById(room, messageId);
    if (ok) io.to(room).emit("chat:deleted", { messageId });
    ack?.(ok, ok ? undefined : "Message not found");
  });

  // Clear room messages
  socket.on("chat:clear", (room: string, ack?: (ok: boolean, err?: string) => void) => {
    if (!room || !rooms.has(room)) return ack?.(false, "Room not found");
    deleteMessagesByRoom(room);
    io.to(room).emit("chat:cleared");
    ack?.(true);
  });

  // Private messages
  socket.on("pm:send", (payload: { to: string; message: string }, ack?: (ok: boolean, err?: string) => void) => {
    const u = users.get(socket.id);
    if (!u) return ack?.(false, "User not found");
    const to = payload?.to?.trim();
    const message = payload?.message?.trim();
    if (!to || !message) return ack?.(false, "Recipient and message required");

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: u.username,
      recipient: to,
      content: message,
      room: "private",
      timestamp: Date.now(),
      type: "private",
    };

    // persist private
    addPrivateMessage(msg);

    // deliver to sockets with username == recipient
    for (const [, user] of users) {
      if (user.username === to) {
        io.to(user.socketId).emit("pm:message", msg);
      }
    }
    // echo to sender
    socket.emit("pm:message", msg);
    ack?.(true);
  });

  socket.on("pm:history", (withUser: string, ack?: (ok: boolean, data?: ChatMessage[], err?: string) => void) => {
    const u = users.get(socket.id);
    if (!u) return ack?.(false, undefined, "User not found");
    const history = getPrivateMessagesBetween(u.username, withUser);
    ack?.(true, history);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const u = users.get(socket.id);
    if (!u) return;
    if (u.room && rooms.has(u.room)) {
      rooms.get(u.room)!.delete(socket.id);
      io.to(u.room).emit("system", `${u.username} disconnected`);
      broadcastRoomUsers(io, u.room);
      if (rooms.get(u.room)!.size === 0) {
        rooms.delete(u.room);
        deleteMessagesByRoom(u.room);
        typing.delete(u.room);
        emitRooms(io);
      }
    }
    users.delete(socket.id);
  });
}
