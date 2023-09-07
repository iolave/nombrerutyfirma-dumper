import os from 'os';
import path from 'path';
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    const spaces = " ".repeat(4 - (level.length - 4));
    return `${timestamp} [${level.toUpperCase()}]${spaces}${message}`;
});

function createTransports() {
    const winstonTransports = [];

    winstonTransports.push(new transports.Console());

    if (os.platform() === 'linux') winstonTransports.push(new transports.File({
        format: combine(timestamp(), logFormat),
        tailable: true,
        level: 'debug',
        eol: os.EOL,
        filename: path.join('/', 'var', 'log', 'nryf-dumper.log'),
    }));
    else if (os.platform() === "darwin") winstonTransports.push(new transports.File({
        format: combine(timestamp(), logFormat),
        tailable: true,
        level: 'debug',
        eol: os.EOL,
        filename: path.join(os.homedir(), 'Library', 'Logs', 'nryf-dumper.log'),
    }));

    return winstonTransports;
}

const logger = createLogger({
    format: combine(timestamp(), logFormat),
    transports: createTransports(),
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
