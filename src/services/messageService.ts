// src/services/messageService.ts

type Message = {
  username: string
  text: string
  timestamp: string
}

let messages: Message[] = []

export const messageService = {
  getAll: (): Message[] => messages,

  add: (msg: Message) => {
    messages.push(msg)
    // Keep only the last 100 messages
    if (messages.length > 100) {
      messages = messages.slice(-100)
    }
  },

  clear: () => {
    messages = []
  },
}
