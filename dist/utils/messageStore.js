"use strict";
// src/utils/messageStore.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByRoomId = getMessagesByRoomId;
exports.storeMessage = storeMessage;
const messageStore = {};
// ✅ Get all messages from a room
function getMessagesByRoomId(roomId) {
    return messageStore[roomId] || [];
}
// ✅ Store a new message in a room
function storeMessage(roomId, sender, message) {
    const newMessage = {
        sender,
        message,
        timestamp: Date.now(),
    };
    if (!messageStore[roomId]) {
        messageStore[roomId] = [];
    }
    messageStore[roomId].push(newMessage);
    return newMessage;
}
