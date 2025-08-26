"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatRoutes.ts
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
router.get("/rooms", chatController_1.listRooms);
router.post("/rooms", chatController_1.createRoom);
router.get("/rooms/:roomId/messages", chatController_1.getMessagesByRoom);
router.post("/rooms/:roomId/messages", chatController_1.postMessage);
router.delete("/rooms/:roomId/messages", chatController_1.deleteRoomMessages);
router.post("/private", chatController_1.sendPrivateMessage);
router.get("/private/:user1/:user2", chatController_1.getPrivateMessages);
exports.default = router;
