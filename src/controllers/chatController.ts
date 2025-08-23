// src/controllers/chatController.ts
import { Request, Response } from "express";
import {
  readMessages,
  writeMessages,
  getMessagesForRoom,
  readPrivateMessages,
  writePrivateMessages,
  getPrivateMessagesBetween,
} from "../utils/messageUtils";
import { ChatMessage, MessagesByRoom } from "../types/message";

/* GET messages for a room */
export const getMessagesByRoom = (_req: Request, res: Response) => {
  try {
    const { roomId } = _req.params as unknown as { roomId: string };
    if (!roomId?.trim()) return res.status(400).json({ error: "Room ID required" });
    const messages = getMessagesForRoom(roomId);
    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/* POST message to room */
export const postMessage = (req: Request, res: Response) => {
  try {
    const { roomId } = req.params as unknown as { roomId: string };
    const { sender, content } = req.body as { sender?: string; content?: string };
    if (!roomId?.trim()) return res.status(400).json({ error: "Room ID required" });
    if (!sender?.trim() || !content?.trim()) return res.status(400).json({ error: "Sender and content required" });

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: sender.trim(),
      content: content.trim(),
      recipient: undefined,
      room: roomId,
      timestamp: Date.now(),
      type: "public",
    };

    const store = readMessages();
    if (!store[roomId]) store[roomId] = [];
    store[roomId].push(msg);
    writeMessages(store);

    return res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to post message" });
  }
};

/* DELETE all messages in a room */
export const deleteRoomMessages = (req: Request, res: Response) => {
  try {
    const { roomId } = req.params as unknown as { roomId: string };
    if (!roomId?.trim()) return res.status(400).json({ error: "Room ID required" });
    const store = readMessages();
    store[roomId] = [];
    writeMessages(store);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete messages" });
  }
};

/* List rooms */
export const listRooms = (_req: Request, res: Response) => {
  try {
    const store = readMessages();
    return res.status(200).json({ rooms: Object.keys(store) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list rooms" });
  }
};

/* Create room */
export const createRoom = (req: Request, res: Response) => {
  try {
    const { roomName } = req.body as { roomName?: string };
    if (!roomName?.trim()) return res.status(400).json({ error: "Room name required" });
    const store = readMessages();
    if (store[roomName]) return res.status(400).json({ error: "Room exists" });
    store[roomName] = [];
    writeMessages(store);
    return res.status(201).json({ room: roomName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create room" });
  }
};

/* Private message send */
export const sendPrivateMessage = (req: Request, res: Response) => {
  try {
    const { from, to, content } = req.body as { from?: string; to?: string; content?: string };
    if (!from?.trim() || !to?.trim() || !content?.trim()) return res.status(400).json({ error: "from,to,content required" });

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: from.trim(),
      recipient: to.trim(),
      content: content.trim(),
      room: "private",
      timestamp: Date.now(),
      type: "private",
    };

    const pmList = readPrivateMessages();
    pmList.push(msg);
    writePrivateMessages(pmList);

    return res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send private message" });
  }
};

/* Get private messages between two users */
export const getPrivateMessages = (req: Request, res: Response) => {
  try {
    const { user1, user2 } = req.params as unknown as { user1: string; user2: string };
    if (!user1?.trim() || !user2?.trim()) return res.status(400).json({ error: "user1 and user2 required" });
    const conv = getPrivateMessagesBetween(user1, user2);
    return res.status(200).json(conv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch private messages" });
  }
};
