"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateMessages = exports.sendPrivateMessage = exports.createRoom = exports.listRooms = exports.deleteRoomMessages = exports.postMessage = exports.getMessagesByRoom = void 0;
const messageUtils_1 = require("../utils/messageUtils");
/* -------------------- Public Room Messaging -------------------- */
/**
 * GET all messages for a specific room
 * @route GET /api/chat/:roomId/messages
 */
const getMessagesByRoom = (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId?.trim()) {
            return res.status(400).json({ error: "Room ID is required" });
        }
        const messages = (0, messageUtils_1.readMessages)();
        const roomMessages = messages[roomId] || [];
        return res.status(200).json(roomMessages);
    }
    catch (err) {
        console.error("❌ getMessagesByRoom error:", err);
        return res.status(500).json({ error: "Failed to fetch messages" });
    }
};
exports.getMessagesByRoom = getMessagesByRoom;
/**
 * POST a new message to a specific room
 * @route POST /api/chat/:roomId/messages
 * body: { sender: string, content: string }
 */
const postMessage = (req, res) => {
    try {
        const { roomId } = req.params;
        const { sender, content } = req.body;
        if (!roomId?.trim()) {
            return res.status(400).json({ error: "Room ID is required" });
        }
        if (!sender?.trim() || !content?.trim()) {
            return res.status(400).json({ error: "Sender and content are required" });
        }
        const messages = (0, messageUtils_1.readMessages)();
        if (!messages[roomId])
            messages[roomId] = [];
        const newMessage = {
            id: Date.now().toString(),
            room: roomId,
            sender: sender.trim(),
            content: content.trim(),
            timestamp: Date.now(),
            type: "public",
        };
        messages[roomId].push(newMessage);
        (0, messageUtils_1.writeMessages)(messages);
        return res.status(201).json(newMessage);
    }
    catch (err) {
        console.error("❌ postMessage error:", err);
        return res.status(500).json({ error: "Failed to add message" });
    }
};
exports.postMessage = postMessage;
/**
 * DELETE all messages in a specific room
 * @route DELETE /api/chat/:roomId/messages
 */
const deleteRoomMessages = (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId?.trim()) {
            return res.status(400).json({ error: "Room ID is required" });
        }
        const messages = (0, messageUtils_1.readMessages)();
        if (!messages[roomId] || messages[roomId].length === 0) {
            return res.status(404).json({ error: "No messages found for this room" });
        }
        messages[roomId] = [];
        (0, messageUtils_1.writeMessages)(messages);
        return res.status(200).json({
            success: true,
            message: `✅ All messages deleted for room "${roomId}"`,
        });
    }
    catch (err) {
        console.error("❌ deleteRoomMessages error:", err);
        return res.status(500).json({ error: "Failed to delete messages" });
    }
};
exports.deleteRoomMessages = deleteRoomMessages;
/* -------------------- Room Management -------------------- */
/**
 * GET list of all available rooms
 * @route GET /api/chat/rooms
 */
const listRooms = (_req, res) => {
    try {
        const messages = (0, messageUtils_1.readMessages)();
        const rooms = Object.keys(messages);
        return res.status(200).json({ rooms });
    }
    catch (err) {
        console.error("❌ listRooms error:", err);
        return res.status(500).json({ error: "Failed to fetch rooms" });
    }
};
exports.listRooms = listRooms;
/**
 * POST create a new chat room
 * @route POST /api/chat/rooms
 * @body { roomName: string }
 */
const createRoom = (req, res) => {
    try {
        const { roomName } = req.body;
        if (!roomName?.trim()) {
            return res.status(400).json({ error: "Room name is required" });
        }
        const messages = (0, messageUtils_1.readMessages)();
        if (messages[roomName]) {
            return res.status(400).json({ error: "Room already exists" });
        }
        messages[roomName] = [];
        (0, messageUtils_1.writeMessages)(messages);
        return res.status(201).json({ success: true, room: roomName });
    }
    catch (err) {
        console.error("❌ createRoom error:", err);
        return res.status(500).json({ error: "Failed to create room" });
    }
};
exports.createRoom = createRoom;
/* -------------------- Private Messaging -------------------- */
/**
 * POST send a private message between two users
 * @route POST /api/chat/private
 * body: { from: string, to: string, content: string }
 */
const sendPrivateMessage = (req, res) => {
    try {
        const { from, to, content } = req.body;
        if (!from?.trim() || !to?.trim() || !content?.trim()) {
            return res
                .status(400)
                .json({ error: "From, to, and content are required" });
        }
        const privateMessages = (0, messageUtils_1.readPrivateMessages)();
        const newPrivateMessage = {
            id: Date.now().toString(),
            room: "private",
            sender: from.trim(),
            recipient: to.trim(),
            content: content.trim(),
            timestamp: Date.now(),
            type: "private",
        };
        privateMessages.push(newPrivateMessage);
        (0, messageUtils_1.writePrivateMessages)(privateMessages);
        return res.status(201).json(newPrivateMessage);
    }
    catch (err) {
        console.error("❌ sendPrivateMessage error:", err);
        return res.status(500).json({ error: "Failed to send private message" });
    }
};
exports.sendPrivateMessage = sendPrivateMessage;
/**
 * GET private messages between two users
 * @route GET /api/chat/private/:user1/:user2
 */
const getPrivateMessages = (req, res) => {
    try {
        const { user1, user2 } = req.params;
        if (!user1?.trim() || !user2?.trim()) {
            return res.status(400).json({ error: "Both usernames are required" });
        }
        const privateMessages = (0, messageUtils_1.readPrivateMessages)();
        const conversation = privateMessages.filter((msg) => msg.type === "private" &&
            ((msg.sender === user1 && msg.recipient === user2) ||
                (msg.sender === user2 && msg.recipient === user1)));
        return res.status(200).json(conversation);
    }
    catch (err) {
        console.error("❌ getPrivateMessages error:", err);
        return res.status(500).json({ error: "Failed to fetch private messages" });
    }
};
exports.getPrivateMessages = getPrivateMessages;
