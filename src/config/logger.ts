import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    const spaces = " ".repeat(4 - (level.length - 4));
    return `${timestamp} [${level.toUpperCase()}]${spaces}${message}`;
});

const logger = createLogger({
    format: combine(timestamp(), logFormat),
    transports: [new transports.Console()],
});

logger.level = "info";

const logLevelMap = {
    0: "emerg",
    1: "alert",
    2: "crit",
    3: "error",
    4: "warning",
    5: "notice",
    6: "info",
    7: "debug"
} as const;

export const logLevels = [0,1,2,3,4,5,6,7] as const;
export type LogLevel = typeof logLevels[number];
export function setLogLevel(level: number): void {
    if (level < 0) {
        logger.level = logLevelMap[0];
        return;
    }

    if (level > 7) {
        logger.level = logLevelMap[7];
        return;
    }

    logger.level = logLevelMap[level as LogLevel];
    return;
}

export default logger;
