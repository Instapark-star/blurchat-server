import winston, { format, Logger } from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, errors, json, colorize, printf } = format;

// Custom printf format with correct typing
const consoleFormat = printf((info) => {
  const message = typeof info.message === "string" ? info.message : JSON.stringify(info.message);
  const timestamp = info.timestamp ?? new Date().toISOString();
  const stack = info.stack ?? "";
  return `${timestamp} [${info.level}]: ${stack || message}`;
});

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    })
  );
}

export default logger;
