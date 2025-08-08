export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  content: string;
  timestamp: number;
}

export interface ServerToClientEvents {
  chat_message: (message: ChatMessage) => void;
  chat_history: (messages: ChatMessage[]) => void;
}

export interface ClientToServerEvents {
  chat_message: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
}
