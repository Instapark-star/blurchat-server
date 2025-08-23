"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const socketService_1 = require("./services/socketService");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// CORS setup
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (env_1.FRONTEND_ORIGINS.includes(origin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
// Health check route
app.get("/", (_req, res) => {
    res.json({ ok: true, service: "blurchat-server" });
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: env_1.FRONTEND_ORIGINS, credentials: true },
});
// Register socket handlers
io.on("connection", (socket) => (0, socketService_1.registerSocketHandlers)(io, socket));
server.listen(env_1.PORT, () => {
    console.log(`✅ blurchat-server running on http://localhost:${env_1.PORT}`);
});
