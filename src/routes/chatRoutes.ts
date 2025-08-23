// src/routes/chatRoutes.ts
import { Router } from "express";
import {
  getMessagesByRoom,
  postMessage,
  deleteRoomMessages,
  listRooms,
  createRoom,
  sendPrivateMessage,
  getPrivateMessages,
} from "../controllers/chatController";

const router = Router();

router.get("/rooms", listRooms);
router.post("/rooms", createRoom);

router.get("/rooms/:roomId/messages", getMessagesByRoom);
router.post("/rooms/:roomId/messages", postMessage);
router.delete("/rooms/:roomId/messages", deleteRoomMessages);

router.post("/private", sendPrivateMessage);
router.get("/private/:user1/:user2", getPrivateMessages);

export default router;
