"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Socket.IO server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"],
    },
});
const users = {};
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // User joins with username
    socket.on("join", (username) => {
        users[socket.id] = username;
        console.log(`${username} joined`);
        io.emit("userList", Object.values(users));
    });
    // Public chat message
    socket.on("chatMessage", (data) => {
        io.emit("chatMessage", {
            id: `${Date.now()}-${Math.random()}`,
            sender: data.sender,
            text: data.text,
            isOwn: false, // optional: front-end can override for current user
        });
    });
    // Private message
    socket.on("privateMessage", (data) => {
        Object.entries(users).forEach(([id, username]) => {
            if (username === data.recipient || username === data.sender) {
                io.to(id).emit("privateMessage", {
                    id: `${Date.now()}-${Math.random()}`,
                    sender: data.sender,
                    text: data.text,
                    private: true,
                    recipient: data.recipient,
                    isOwn: username === data.sender,
                });
            }
        });
    });
    // User disconnects
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("userList", Object.values(users));
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const parseOrigins = (csv) => (csv ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
exports.config = {
    PORT: Number(process.env.PORT || 4000),
    FRONTEND_ORIGINS: parseOrigins(process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://localhost:3000"),
};
