// src/routes/chatRoutes.ts
import { Router } from "express";
import {
  getMessagesByRoom,
  postMessage,
  deleteMessagesByRoom
} from "../controllers/chatController";

const router = Router();

// GET /api/chat/:roomId/messages
router.get("/:roomId/messages", getMessagesByRoom);

// POST /api/chat/:roomId/messages
router.post("/:roomId/messages", postMessage);

// DELETE /api/chat/:roomId/messages
router.delete("/:roomId/messages", deleteMessagesByRoom);

// Optional test route
router.get("/", (req, res) => {
  res.json({ message: "Chat route works!" });
});

export default router;
