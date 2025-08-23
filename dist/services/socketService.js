"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const messageUtils_1 = require("../utils/messageUtils");
const rooms = new Map(); // room -> socketIds
const users = new Map(); // socketId -> User
const typing = new Map(); // room -> set(username)
const listRooms = () => Array.from(rooms.keys());
function emitRooms(io) {
    io.emit("roomsUpdated", listRooms());
}
function getRoomUsers(room) {
    const ids = rooms.get(room) ?? new Set();
    return Array.from(ids).map(id => users.get(id)).filter(Boolean);
}
function broadcastRoomUsers(io, room) {
    io.to(room).emit("roomUsers", getRoomUsers(room));
}
function registerSocketHandlers(io, socket) {
    users.set(socket.id, { socketId: socket.id, username: "Anonymous", room: null });
    socket.emit("roomsUpdated", listRooms());
    socket.on("register", (username) => {
        const u = users.get(socket.id);
        if (!u)
            return;
        u.username = (username ?? "").trim() || "Anonymous";
        users.set(socket.id, u);
        socket.emit("registered", u.username);
    });
    socket.on("rooms:create", (roomName, ack) => {
        const room = roomName?.trim();
        if (!room)
            return ack?.(false, "Room name required");
        if (rooms.has(room))
            return ack?.(false, "Room already exists");
        rooms.set(room, new Set());
        emitRooms(io);
        ack?.(true);
    });
    socket.on("rooms:join", (roomName, ack) => {
        const room = roomName?.trim();
        if (!room || !rooms.has(room))
            return ack?.(false, "Room not found");
        const u = users.get(socket.id);
        if (!u)
            return ack?.(false, "User not found");
        if (u.room && rooms.has(u.room)) {
            socket.leave(u.room);
            rooms.get(u.room).delete(socket.id);
            io.to(u.room).emit("system", `${u.username} left ${u.room}`);
            broadcastRoomUsers(io, u.room);
            if (rooms.get(u.room).size === 0) {
                rooms.delete(u.room);
                (0, messageUtils_1.deleteMessagesByRoom)(u.room);
                typing.delete(u.room);
                emitRooms(io);
            }
        }
        u.room = room;
        users.set(socket.id, u);
        socket.join(room);
        rooms.get(room).add(socket.id);
        typing.set(room, typing.get(room) ?? new Set());
        socket.emit("chatHistory", (0, messageUtils_1.getMessagesForRoom)(room));
        io.to(room).emit("system", `${u.username} joined ${room}`);
        broadcastRoomUsers(io, room);
        emitRooms(io);
        ack?.(true);
    });
    socket.on("rooms:leave", (ack) => {
        const u = users.get(socket.id);
        if (!u || !u.room)
            return ack?.(true);
        const room = u.room;
        socket.leave(room);
        rooms.get(room)?.delete(socket.id);
        io.to(room).emit("system", `${u.username} left ${room}`);
        broadcastRoomUsers(io, room);
        if (rooms.get(room)?.size === 0) {
            rooms.delete(room);
            (0, messageUtils_1.deleteMessagesByRoom)(room);
            typing.delete(room);
            emitRooms(io);
        }
        u.room = null;
        users.set(socket.id, u);
        ack?.(true);
    });
    socket.on("chat:send", (payload, ack) => {
        const u = users.get(socket.id);
        if (!u)
            return ack?.(false, "User not found");
        const room = payload?.room?.trim();
        if (!room || !rooms.has(room))
            return ack?.(false, "Room not found");
        if (!payload?.message?.trim())
            return ack?.(false, "Empty message");
        const msg = {
            id: payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            username: u.username,
            message: payload.message.trim(),
            timestamp: new Date().toISOString(),
        };
        (0, messageUtils_1.addMessageToRoom)(room, msg);
        io.to(room).emit("chat:message", msg);
        ack?.(true);
    });
    socket.on("typing:start", (room) => {
        const u = users.get(socket.id);
        if (!u?.username || !room)
            return;
        const set = typing.get(room) ?? new Set();
        set.add(u.username);
        typing.set(room, set);
        io.to(room).emit("typing", Array.from(set));
    });
    socket.on("typing:stop", (room) => {
        const u = users.get(socket.id);
        if (!u?.username || !room)
            return;
        const set = typing.get(room) ?? new Set();
        set.delete(u.username);
        typing.set(room, set);
        io.to(room).emit("typing", Array.from(set));
    });
    socket.on("chat:delete", (payload, ack) => {
        const { room, messageId } = payload || {};
        if (!room || !rooms.has(room))
            return ack?.(false, "Room not found");
        if (!messageId)
            return ack?.(false, "messageId required");
        const ok = (0, messageUtils_1.deleteMessageById)(room, messageId);
        if (ok)
            io.to(room).emit("chat:deleted", { messageId });
        ack?.(ok, ok ? undefined : "Message not found");
    });
    socket.on("chat:clear", (room, ack) => {
        if (!room || !rooms.has(room))
            return ack?.(false, "Room not found");
        (0, messageUtils_1.deleteMessagesByRoom)(room);
        io.to(room).emit("chat:cleared");
        ack?.(true);
    });
    // Private messages (now using readPrivateMessages + getPrivateMessagesBetween)
    socket.on("pm:send", (payload, ack) => {
        const u = users.get(socket.id);
        if (!u)
            return ack?.(false, "User not found");
        const to = payload?.to?.trim();
        const message = payload?.message?.trim();
        if (!to || !message)
            return ack?.(false, "Recipient and message required");
        const msg = {
            from: u.username,
            to,
            message,
            timestamp: new Date().toISOString(),
        };
        // store via readPrivateMessages (in messageUtils we’d extend it to accept pushes if needed)
        // For now: deliver directly
        for (const [, user] of users) {
            if (user.username === to) {
                io.to(user.socketId).emit("pm:message", msg);
            }
        }
        socket.emit("pm:message", msg);
        ack?.(true);
    });
    socket.on("pm:history", (withUser, ack) => {
        const u = users.get(socket.id);
        if (!u)
            return ack?.(false, undefined, "User not found");
        const history = (0, messageUtils_1.getPrivateMessagesBetween)(u.username, withUser);
        ack?.(true, history);
    });
    socket.on("disconnect", () => {
        const u = users.get(socket.id);
        if (!u)
            return;
        if (u.room && rooms.has(u.room)) {
            rooms.get(u.room).delete(socket.id);
            io.to(u.room).emit("system", `${u.username} disconnected`);
            broadcastRoomUsers(io, u.room);
            if (rooms.get(u.room).size === 0) {
                rooms.delete(u.room);
                (0, messageUtils_1.deleteMessagesByRoom)(u.room);
                typing.delete(u.room);
                emitRooms(io);
            }
        }
        users.delete(socket.id);
    });
}
