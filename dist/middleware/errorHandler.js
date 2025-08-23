"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("@/utils/logger"));
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    // Detailed logging for debugging
    logger_1.default.error(`💥 Error: ${err.message || "Unknown error"}`, {
        statusCode,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
    });
    res.status(statusCode).json({
        success: false,
        error: err.name || "ServerError",
        message: err.message || "Something went wrong",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
