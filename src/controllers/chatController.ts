// src/controllers/chatController.ts
import { Request, Response } from "express";
import { readMessages, writeMessages } from "../utils/messageUtils";

// GET /api/chat/:roomId/messages
export const getMessagesByRoom = (req: Request, res: Response) => {
  const { roomId } = req.params;
  const messages = readMessages();
  const roomMessages = messages[roomId] || [];
  res.json(roomMessages);
};

// POST /api/chat/:roomId/messages
export const postMessage = (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).json({ error: "Username and message are required" });
  }

  const messages = readMessages();
  if (!messages[roomId]) {
    messages[roomId] = [];
  }

  const newMessage = {
    id: Date.now().toString(),
    username,
    message,
    room: roomId,
    timestamp: new Date().toISOString(),
  };

  messages[roomId].push(newMessage);
  writeMessages(messages);

  res.status(201).json(newMessage);
};

// DELETE /api/chat/:roomId/messages
export const deleteMessagesByRoom = (req: Request, res: Response) => {
  const { roomId } = req.params;
  const messages = readMessages();

  if (!messages[roomId] || messages[roomId].length === 0) {
    return res.status(404).json({ error: "No messages found for this room" });
  }

  messages[roomId] = [];
  writeMessages(messages);

  res.json({
    success: true,
    message: `All messages deleted for room ${roomId}`
  });
};
