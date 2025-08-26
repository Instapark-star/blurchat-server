"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const rooms = new Map(); // room -> socketIds
const users = new Map(); // socketId -> User
const typing = new Map(); // room -> set(username)
const listRooms = () => Array.from(rooms.keys());
function emitRooms(io) {
    io.emit("roomsUpdated", listRooms());
}
function getRoomUsers(room) {
    const ids = rooms.get(room) ?? new Set();
    return Array.from(ids)
        .map((id) => users.get(id))
        .filter((u) => Boolean(u));
}
function broadcastRoomUsers(io, room) {
    io.to(room).emit("roomUsers", getRoomUsers(room));
}
function registerSocketHandlers(io, socket) {
    // register initial user
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
    // ... keep rest of handlers as in your code (no type errors)
}
