"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet")); // ✅ make sure you run: npm install helmet @types/helmet
const morgan_1 = __importDefault(require("morgan"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const app = (0, express_1.default)();
// ---------- Middleware ----------
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)()); // basic security headers
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ---------- Routes ----------
app.use("/api/chat", chatRoutes_1.default);
// ---------- Health Check ----------
app.get("/", (_req, res) => {
    res.json({ message: "✅ Blurchat server is running" });
});
exports.default = app;
