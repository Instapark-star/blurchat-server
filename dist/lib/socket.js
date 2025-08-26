"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
// src/lib/socket.ts
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIO = getIO;
