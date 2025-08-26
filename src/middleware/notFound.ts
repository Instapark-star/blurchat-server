// src/middleware/notFound.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  logger.warn(error.message);
  res.status(404).json({
    success: false,
    message: error.message,
  });
};

export default notFound;
