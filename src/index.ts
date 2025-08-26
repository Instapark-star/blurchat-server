// src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT || 5000);

// Allow multiple frontend origins via env (comma-separated)
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ||
  process.env.CORS_ORIGIN ||
  ""
)
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// CORS config for REST
const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // Allow same-origin / server-to-server / curl
    if (!origin) return cb(null, true);

    if (FRONTEND_ORIGINS.length === 0) {
      // If not set, allow all in dev, block in prod
      if (NODE_ENV !== "production") return cb(null, true);
      return cb(new Error("CORS blocked: FRONTEND_ORIGINS not configured"));
    }

    if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Express + HTTP server
const app = express();
const server = http.createServer(app);

// Trust proxy (Render / reverse proxies)
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health & basic routes
app.get("/", (_req, res) => {
  res.status(200).send("Blurchat backend is running ✅");
});
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/readyz", (_req, res) => res.status(200).json({ ready: true }));

// Socket.IO (same CORS policy)
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGINS.length
      ? FRONTEND_ORIGINS
      : NODE_ENV !== "production"
      ? "*"
      : [], // in prod, require FRONTEND_ORIGINS
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Helpful in free tiers / proxies
  pingTimeout: 30000,
  pingInterval: 25000,
});

io.on("connection", socket => {
  console.log("🔌 Socket connected:", socket.id);

  // Simple broadcast chat event (public roomless demo)
  socket.on("message", msg => {
    io.emit("message", msg);
  });

  socket.on("disconnect", reason => {
    console.log("🔌 Socket disconnected:", socket.id, reason);
  });
});

// Start
server.listen(PORT, "0.0.0.0", () => {
  const origins =
    FRONTEND_ORIGINS.length > 0 ? FRONTEND_ORIGINS.join(", ") : "(none set)";
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${origins}`);
});
