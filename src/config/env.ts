// src/config/env.ts

import dotenv from "dotenv";
import path from "path";

export function loadEnv() {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });
}
