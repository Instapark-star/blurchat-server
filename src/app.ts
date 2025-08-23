// src/app.ts
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet"; // ✅ make sure you run: npm install helmet @types/helmet
import morgan from "morgan";
import chatRoutes from "./routes/chatRoutes";

const app: Application = express();

// ---------- Middleware ----------
app.use(cors());
app.use(helmet()); // basic security headers
app.use(express.json());
app.use(morgan("dev"));

// ---------- Routes ----------
app.use("/api/chat", chatRoutes);

// ---------- Health Check ----------
app.get("/", (_req, res) => {
  res.json({ message: "✅ Blurchat server is running" });
});

export default app;
