// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message || "Server Error");
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

export default errorHandler;
