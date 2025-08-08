// src/app.ts

import express from "express"
import cors from "cors"
import morgan from "morgan"
import chatRoutes from "./routes/chatRoutes"
import { notFound } from "./middleware/notFound"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Routes
app.use("/api/chat", chatRoutes)

// 404 Handler
app.use(notFound)

export default app
