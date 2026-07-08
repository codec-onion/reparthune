import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { env } from "./env"

const isProduction = env.NODE_ENV === "production"

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`
    })
  ),
})

const errorFileTransport = {
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "10m",
  maxFiles: "14d",
  zippedArchive: true,
}

const combinedFileTransport = {
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
}

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: isProduction
    ? [consoleTransport, new DailyRotateFile(errorFileTransport), new DailyRotateFile(combinedFileTransport)]
    : [consoleTransport],
})

export default logger