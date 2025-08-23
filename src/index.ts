// src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes";
import { registerSocketHandlers } from "./services/socketService";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
