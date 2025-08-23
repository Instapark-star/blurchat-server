"use strict";
// src/services/messageService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
let messages = [];
exports.messageService = {
    getAll: () => messages,
    add: (msg) => {
        messages.push(msg);
        // Keep only the last 100 messages
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }
    },
    clear: () => {
        messages = [];
    },
};
