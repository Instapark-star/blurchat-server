// src/utils/messageStore.ts

type Message = {
  sender: string
  message: string
  timestamp: number
}

const messageStore: Record<string, Message[]> = {}

// ✅ Get all messages from a room
export function getMessagesByRoomId(roomId: string): Message[] {
  return messageStore[roomId] || []
}

// ✅ Store a new message in a room
export function storeMessage(roomId: string, sender: string, message: string): Message {
  const newMessage: Message = {
    sender,
    message,
    timestamp: Date.now(),
  }

  if (!messageStore[roomId]) {
    messageStore[roomId] = []
  }

  messageStore[roomId].push(newMessage)
  return newMessage
}
