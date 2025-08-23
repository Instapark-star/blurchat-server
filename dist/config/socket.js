"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // You can restrict this to your frontend URL
            methods: ["GET", "POST"]
        }
    });
    console.log("✅ Socket.IO initialized");
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("❌ Socket.io not initialized");
    }
    return io;
};
exports.getIO = getIO;
