"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessages = readMessages;
exports.writeMessages = writeMessages;
exports.readPrivateMessages = readPrivateMessages;
exports.writePrivateMessages = writePrivateMessages;
// src/utils/messageUtils.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATA_DIR = path.resolve(__dirname, "../../data");
const PUBLIC_FILE = path.join(DATA_DIR, "messages.json");
const PRIVATE_FILE = path.join(DATA_DIR, "privateMessages.json");
function ensureDataFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PUBLIC_FILE)) {
        const initial = { general: [] };
        fs.writeFileSync(PUBLIC_FILE, JSON.stringify(initial, null, 2), "utf8");
    }
    if (!fs.existsSync(PRIVATE_FILE)) {
        const initial = [];
        fs.writeFileSync(PRIVATE_FILE, JSON.stringify(initial, null, 2), "utf8");
    }
}
function safeParse(raw, fallback) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function readJson(filePath, fallback) {
    ensureDataFiles();
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = safeParse(raw, fallback);
        // auto-repair corrupted file
        if (!parsed) {
            writeJson(filePath, fallback);
            return fallback;
        }
        return parsed;
    }
    catch {
        writeJson(filePath, fallback);
        return fallback;
    }
}
function writeJson(filePath, data) {
    ensureDataFiles();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
/* -------------------- Public Room Messages -------------------- */
function readMessages() {
    return readJson(PUBLIC_FILE, { general: [] });
}
function writeMessages(data) {
    writeJson(PUBLIC_FILE, data);
}
/* -------------------- Private Messages -------------------- */
function readPrivateMessages() {
    return readJson(PRIVATE_FILE, []);
}
function writePrivateMessages(list) {
    writeJson(PRIVATE_FILE, list);
}
