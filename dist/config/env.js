"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.FRONTEND_ORIGINS = exports.PORT = void 0;
// src/config/env.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Fallbacks for dev mode
exports.PORT = parseInt(process.env.PORT || "4000", 10);
exports.FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim());
exports.NODE_ENV = process.env.NODE_ENV || "development";
