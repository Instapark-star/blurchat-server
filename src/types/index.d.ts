// src/types/index.d.ts

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  content: string;
  timestamp: number;
}

// Events sent from server to client
export interface ServerToClientEvents {
  receive_message: (data: {
    message: string;
    senderId: string;
    timestamp: string;
  }) => void;
  chat_message: (message: ChatMessage) => void;
  chat_history: (messages: ChatMessage[]) => void;
}

// Events sent from client to server
export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  send_message: (data: { roomId: string; message: string }) => void;
  chat_message: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
}
