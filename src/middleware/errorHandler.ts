// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "@/utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Detailed logging for debugging
  logger.error(`💥 Error: ${err.message || "Unknown error"}`, {
    statusCode,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: err.name || "ServerError",
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
