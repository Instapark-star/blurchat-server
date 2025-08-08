// src/utils/messageUtils.ts
import fs from "fs";
import path from "path";

export type Message = {
  id?: string;
  username: string;
  message: string;
  room: string;
  timestamp: string;
  [key: string]: any;
};

export type MessagesByRoom = Record<string, Message[]>;

const messagesFilePath = path.join(__dirname, "../../data/messages.json");

/**
 * Ensure the messages file and parent directory exist.
 * If file missing, create it as an empty object (room-keyed).
 */
const ensureFileExists = () => {
  try {
    const dir = path.dirname(messagesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(messagesFilePath)) {
      fs.writeFileSync(messagesFilePath, JSON.stringify({}, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("❌ messageUtils.ensureFileExists error:", err);
  }
};

/**
 * Read messages.json and return an object keyed by roomId.
 * Supports two on-disk shapes:
 *  - array of messages (legacy): [{ room, ... }, ...]
 *  - object keyed by roomId: { roomId: [ ... ], ... }
 */
export const readMessages = (): MessagesByRoom => {
  ensureFileExists();

  try {
    const raw = fs.readFileSync(messagesFilePath, "utf-8").trim();
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    // Legacy format (array) -> convert to object keyed by room
    if (Array.isArray(parsed)) {
      const grouped: MessagesByRoom = {};
      parsed.forEach((m: any) => {
        const room = m.room || "default";
        if (!grouped[room]) grouped[room] = [];
        grouped[room].push(m as Message);
      });
      return grouped;
    }

    // If already an object keyed by roomId, return as-is
    if (parsed && typeof parsed === "object") {
      return parsed as MessagesByRoom;
    }

    // Unexpected shape -> return empty
    return {};
  } catch (err) {
    console.error("❌ Failed to read/parse messages.json:", err);
    return {};
  }
};

/**
 * Write the room-keyed messages object back to messages.json
 */
export const writeMessages = (messages: MessagesByRoom) => {
  ensureFileExists();
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to write messages.json:", err);
  }
};

/**
 * Convenience helpers
 */
export const getMessagesForRoom = (roomId: string): Message[] => {
  const all = readMessages();
  return all[roomId] || [];
};

/**
 * Adds a message into the specified room and returns the saved message (with id/timestamp).
 * Uses computed id/timestamp to avoid duplicate-property warnings.
 */
export const addMessageToRoom = (roomId: string, message: Partial<Message>): Message => {
  const all = readMessages();
  if (!all[roomId]) all[roomId] = [];

  const id = message.id ?? Date.now().toString();
  const timestamp = message.timestamp ?? new Date().toISOString();

  // Build final message object once (no duplicated keys in literal)
  const msgWithMeta: Message = {
    ...message,
    id,
    timestamp,
    room: roomId,
  } as Message;

  all[roomId].push(msgWithMeta);
  writeMessages(all);
  return msgWithMeta;
};

export const deleteMessagesByRoom = (roomId: string): boolean => {
  const all = readMessages();
  if (!all[roomId] || all[roomId].length === 0) return false;
  all[roomId] = [];
  writeMessages(all);
  return true;
};

export const deleteMessageById = (roomId: string, messageId: string): boolean => {
  const all = readMessages();
  const room = all[roomId];
  if (!room || room.length === 0) return false;
  const idx = room.findIndex((m) => m.id === messageId);
  if (idx === -1) return false;
  room.splice(idx, 1);
  all[roomId] = room;
  writeMessages(all);
  return true;
};
