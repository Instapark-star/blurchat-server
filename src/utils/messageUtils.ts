// src/utils/messageUtils.ts
import * as fs from "fs";
import * as path from "path";
import { ChatMessage, MessagesByRoom, PrivateMessagesStore } from "../types/message";

const DATA_DIR = path.resolve(__dirname, "../../data");
const PUBLIC_FILE = path.join(DATA_DIR, "messages.json");
const PRIVATE_FILE = path.join(DATA_DIR, "privateMessages.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_FILE)) {
    const initial: MessagesByRoom = { general: [] };
    fs.writeFileSync(PUBLIC_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
  if (!fs.existsSync(PRIVATE_FILE)) {
    const initial: PrivateMessagesStore = [];
    fs.writeFileSync(PRIVATE_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = safeParse<T>(raw, fallback);
    if (!parsed) {
      writeJson(filePath, fallback);
      return fallback;
    }
    return parsed;
  } catch {
    writeJson(filePath, fallback);
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

/* Public room functions */
export function readMessages(): MessagesByRoom {
  return readJson<MessagesByRoom>(PUBLIC_FILE, { general: [] });
}

export function writeMessages(data: MessagesByRoom): void {
  writeJson<MessagesByRoom>(PUBLIC_FILE, data);
}

export function getMessagesForRoom(room: string): ChatMessage[] {
  const store = readMessages();
  return store[room] ?? [];
}

export function addMessageToRoom(room: string, msg: ChatMessage): void {
  const store = readMessages();
  if (!store[room]) store[room] = [];
  store[room].push(msg);
  writeMessages(store);
}

export function deleteMessagesByRoom(room: string): void {
  const store = readMessages();
  if (store[room]) {
    store[room] = [];
    writeMessages(store);
  }
}

export function deleteMessageById(room: string, messageId: string): boolean {
  const store = readMessages();
  if (!store[room]) return false;
  const idx = store[room].findIndex(m => m.id === messageId);
  if (idx === -1) return false;
  store[room].splice(idx, 1);
  writeMessages(store);
  return true;
}

/* Private messages functions */
export function readPrivateMessages(): PrivateMessagesStore {
  return readJson<PrivateMessagesStore>(PRIVATE_FILE, []);
}

export function writePrivateMessages(list: PrivateMessagesStore): void {
  writeJson<PrivateMessagesStore>(PRIVATE_FILE, list);
}

export function addPrivateMessage(msg: ChatMessage): void {
  const list = readPrivateMessages();
  list.push(msg);
  writePrivateMessages(list);
}

export function getPrivateMessagesBetween(userA: string, userB: string): ChatMessage[] {
  const list = readPrivateMessages();
  return list.filter(m =>
    m.type === "private" &&
    ((m.sender === userA && m.recipient === userB) || (m.sender === userB && m.recipient === userA))
  );
}
