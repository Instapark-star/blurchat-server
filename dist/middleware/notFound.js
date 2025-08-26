"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    logger_1.default.warn(error.message);
    res.status(404).json({
        success: false,
        message: error.message,
    });
};
exports.default = notFound;
