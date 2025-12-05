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
    new winston.transports.File({ filename: logName })
  ],
});

export default {
  info: (msg: string) => logger.info(msg),
  warn: (msg: string) => logger.warn(msg),
  error: (msg: string) => logger.error(msg),
};;
