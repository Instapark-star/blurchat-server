"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateMessages = exports.sendPrivateMessage = exports.createRoom = exports.listRooms = exports.deleteRoomMessages = exports.postMessage = exports.getMessagesByRoom = void 0;
const messageUtils_1 = require("../utils/messageUtils");
/* GET messages for a room */
const getMessagesByRoom = (_req, res) => {
    try {
        const { roomId } = _req.params;
        if (!roomId?.trim())
            return res.status(400).json({ error: "Room ID required" });
        const messages = (0, messageUtils_1.getMessagesForRoom)(roomId);
        return res.status(200).json(messages);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch messages" });
    }
};
exports.getMessagesByRoom = getMessagesByRoom;
/* POST message to room */
const postMessage = (req, res) => {
    try {
        const { roomId } = req.params;
        const { sender, content } = req.body;
        if (!roomId?.trim())
            return res.status(400).json({ error: "Room ID required" });
        if (!sender?.trim() || !content?.trim())
            return res.status(400).json({ error: "Sender and content required" });
        const msg = {
            id: Date.now().toString(),
            sender: sender.trim(),
            content: content.trim(),
            recipient: undefined,
            room: roomId,
            timestamp: Date.now(),
            type: "public",
        };
        const store = (0, messageUtils_1.readMessages)();
        if (!store[roomId])
            store[roomId] = [];
        store[roomId].push(msg);
        (0, messageUtils_1.writeMessages)(store);
        return res.status(201).json(msg);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to post message" });
    }
};
exports.postMessage = postMessage;
/* DELETE all messages in a room */
const deleteRoomMessages = (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId?.trim())
            return res.status(400).json({ error: "Room ID required" });
        const store = (0, messageUtils_1.readMessages)();
        store[roomId] = [];
        (0, messageUtils_1.writeMessages)(store);
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete messages" });
    }
};
exports.deleteRoomMessages = deleteRoomMessages;
/* List rooms */
const listRooms = (_req, res) => {
    try {
        const store = (0, messageUtils_1.readMessages)();
        return res.status(200).json({ rooms: Object.keys(store) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to list rooms" });
    }
};
exports.listRooms = listRooms;
/* Create room */
const createRoom = (req, res) => {
    try {
        const { roomName } = req.body;
        if (!roomName?.trim())
            return res.status(400).json({ error: "Room name required" });
        const store = (0, messageUtils_1.readMessages)();
        if (store[roomName])
            return res.status(400).json({ error: "Room exists" });
        store[roomName] = [];
        (0, messageUtils_1.writeMessages)(store);
        return res.status(201).json({ room: roomName });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create room" });
    }
};
exports.createRoom = createRoom;
/* Private message send */
const sendPrivateMessage = (req, res) => {
    try {
        const { from, to, content } = req.body;
        if (!from?.trim() || !to?.trim() || !content?.trim())
            return res.status(400).json({ error: "from,to,content required" });
        const msg = {
            id: Date.now().toString(),
            sender: from.trim(),
            recipient: to.trim(),
            content: content.trim(),
            room: "private",
            timestamp: Date.now(),
            type: "private",
        };
        const pmList = (0, messageUtils_1.readPrivateMessages)();
        pmList.push(msg);
        (0, messageUtils_1.writePrivateMessages)(pmList);
        return res.status(201).json(msg);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to send private message" });
    }
};
exports.sendPrivateMessage = sendPrivateMessage;
/* Get private messages between two users */
const getPrivateMessages = (req, res) => {
    try {
        const { user1, user2 } = req.params;
        if (!user1?.trim() || !user2?.trim())
            return res.status(400).json({ error: "user1 and user2 required" });
        const conv = (0, messageUtils_1.getPrivateMessagesBetween)(user1, user2);
        return res.status(200).json(conv);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch private messages" });
    }
};
exports.getPrivateMessages = getPrivateMessages;
