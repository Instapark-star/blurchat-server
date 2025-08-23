"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure logs directory exists
const logDir = path_1.default.join(__dirname, "../../logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const { combine, timestamp, errors, json, colorize, printf } = winston_1.format;
// Custom printf format with correct typing
const consoleFormat = printf((info) => {
    const message = typeof info.message === "string" ? info.message : JSON.stringify(info.message);
    const timestamp = info.timestamp ?? new Date().toISOString();
    const stack = info.stack ?? "";
    return `${timestamp} [${info.level}]: ${stack || message}`;
});
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), json()),
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "combined.log"),
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "error.log"),
            level: "error",
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    }));
}
exports.default = logger;
