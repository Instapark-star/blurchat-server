// src/lib/socket.ts

import { io, Socket } from "socket.io-client";

// Create a single shared socket instance using Vite env variable
const socket: Socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
