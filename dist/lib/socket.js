"use strict";
// src/lib/socket.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load .env variables for backend
// Get server URL from environment variables
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
// Create a single shared socket instance for backend
const socket = (0, socket_io_client_1.io)(SERVER_URL, {
    transports: ["websocket"],
    withCredentials: true,
});
exports.default = socket;
