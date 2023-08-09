import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    const spaces = " ".repeat(4 - (level.length - 4));
    return `${timestamp} [${level.toUpperCase()}]${spaces}${message}`;
  });

const logger = createLogger({
    format: combine(timestamp(), logFormat),
    transports: [ new transports.Console() ],
});

// TODO: allow to modify the log level via cli
logger.level = 'debug';

export default logger;
