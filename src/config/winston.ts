import winston from 'winston';
// use rotation

import 'winston-daily-rotate-file';
const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, meta }) => {
	const levelStr = level.padEnd(7, ' '); // Adjust padding length as needed
	const metaStr = meta ? `[${meta}]`.padEnd(11, ' ') : ''.padEnd(11, ' '); // Adjust padding length as needed
	return `${timestamp} ${levelStr.padEnd(11, ' ')} ${metaStr}: ${message}`;
});

const errorFilter = winston.format((info, opts) => {
	return info.level === 'error' ? info : false;
});

// @ts-ignore
const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: 'error-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	maxFiles: '14d',
	level: 'error',
});

export const logger = winston.createLogger({
	levels: winston.config.syslog.levels,
	level: 'info',

	format: combine(
		errors({ stack: true }),
		timestamp(),
		colorize({ all: true }), // Apply color to the entire log message
		customFormat
	),
	transports: [fileRotateTransport, new winston.transports.Console()],
});
