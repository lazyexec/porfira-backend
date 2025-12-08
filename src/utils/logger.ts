import winston from "winston";

const date = new Date().toISOString().slice(0, 10);
const logName = `logs/log-${date}.log`;

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level.toUpperCase()} ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logName }),
  ],
});

export default {
  info: (msg: string, meta?: any) => logger.info(msg, meta),
  warn: (msg: string, meta?: any) => logger.warn(msg, meta),
  error: (msg: string, error?: any) => logger.error(msg, error),
  success: (msg: string, meta?: any) => logger.log("SUCCESS", msg, meta),
};
