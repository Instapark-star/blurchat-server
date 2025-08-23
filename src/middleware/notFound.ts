// src/middleware/notFound.ts
import { Request, Response, NextFunction } from "express";
import logger from "@/utils/logger";

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  const message = `🔍 Route not found: ${req.originalUrl}`;
  logger.warn(message);

  res.status(404).json({
    success: false,
    error: "Not Found",
    message,
  });
};

export default notFound;
