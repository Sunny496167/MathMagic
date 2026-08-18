const winston = require('winston');
const config = require('../config/environment');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  config.isProduction
    ? winston.format.json()
    : winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
      })
);

const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: config.isProduction
        ? winston.format.json()
        : winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

module.exports = logger;
