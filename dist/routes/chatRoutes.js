"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatRoutes.ts
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
/* ---------- Middleware ---------- */
/**
 * Validate `roomId` in params
 */
function validateRoomId(req, res, next) {
    const { roomId } = req.params;
    if (!roomId || typeof roomId !== "string" || !roomId.trim()) {
        return res.status(400).json({ error: "Invalid or missing roomId" });
    }
    next();
}
/* ---------- Room Management ---------- */
/**
 * GET /api/chat/rooms
 * List all available rooms
 */
router.get("/rooms", chatController_1.listRooms);
/**
 * POST /api/chat/rooms
 * Create a new chat room
 */
router.post("/rooms", chatController_1.createRoom);
/* ---------- Private Messaging ---------- */
/**
 * POST /api/chat/private
 * Send a private message between two users
 */
router.post("/private", chatController_1.sendPrivateMessage);
/**
 * GET /api/chat/private/:user1/:user2
 * Fetch private messages between two users
 */
router.get("/private/:user1/:user2", chatController_1.getPrivateMessages);
/* ---------- Public Room Messaging ---------- */
/**
 * GET messages for a room
 */
router.get("/:roomId/messages", validateRoomId, chatController_1.getMessagesByRoom);
/**
 * POST a message to a room
 */
router.post("/:roomId/messages", validateRoomId, chatController_1.postMessage);
/**
 * DELETE all messages from a room
 */
router.delete("/:roomId/messages", validateRoomId, chatController_1.deleteRoomMessages);
/* ---------- Health Check ---------- */
router.get("/", (_req, res) => {
    res.json({ message: "✅ Chat route is active" });
});
exports.default = router;
