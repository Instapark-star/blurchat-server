"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/logger.ts
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure logs directory exists
const logDir = path_1.default.join(__dirname, "../../logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.errors({ stack: true }), winston_1.format.printf(({ timestamp, level, message, stack }) => {
        const logMessage = typeof message === "string" ? message : JSON.stringify(message);
        return `[${timestamp}] ${level.toUpperCase()}: ${stack || logMessage}`;
    })),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({
            filename: path_1.default.join(logDir, "error.log"),
            level: "error",
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(logDir, "combined.log"),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});
exports.default = logger;
