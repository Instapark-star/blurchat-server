// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

// Fallbacks for dev mode
export const PORT: number = parseInt(process.env.PORT || "4000", 10);

export const FRONTEND_ORIGINS: string[] = (
  process.env.FRONTEND_ORIGINS || "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

export const NODE_ENV: string = process.env.NODE_ENV || "development";
