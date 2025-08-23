"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const logger_1 = __importDefault(require("@/utils/logger"));
const notFound = (req, res, _next) => {
    const message = `🔍 Route not found: ${req.originalUrl}`;
    logger_1.default.warn(message);
    res.status(404).json({
        success: false,
        error: "Not Found",
        message,
    });
};
exports.notFound = notFound;
exports.default = exports.notFound;
