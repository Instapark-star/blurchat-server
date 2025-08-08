import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import chatRoutes from "@/routes/chatRoutes"; // ✅ correct

import { notFound } from "./middleware/notFound";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/chat", chatRoutes);

// Fallback route
app.use("*", notFound);

// Export both for use in `server.ts`
export { app, server };
