// src/server.ts
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PORT, FRONTEND_ORIGINS } from "./config/env";
import { registerSocketHandlers } from "./services/socketService";

const app = express();

app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Health check route
app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "blurchat-server" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGINS, credentials: true },
});

// Register socket handlers
io.on("connection", (socket) => registerSocketHandlers(io, socket));

server.listen(PORT, () => {
  console.log(`✅ blurchat-server running on http://localhost:${PORT}`);
});
