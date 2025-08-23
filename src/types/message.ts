// src/types/message.ts
export interface ChatMessage {
  id: string;
  sender: string;
  recipient?: string;
  content: string;
  room: string;            // e.g. "general" or "private"
  timestamp: number;      // epoch ms (Date.now())
  type: "public" | "private";
}

// messages grouped by room
export type MessagesByRoom = Record<string, ChatMessage[]>;

// private messages store is a simple array of ChatMessage with type "private"
export type PrivateMessagesStore = ChatMessage[];
