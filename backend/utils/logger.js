// backend/utils/logger.js
const winston = require('winston');
require('winston-mongodb');
const { format, transports } = winston;
const path = require('path');

// Load environment variables
require('dotenv').config();

// Customized format for console outputs
const consoleFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'dragons-bindery' },
  transports: [
    // Console logging with colors and formatting
    new transports.Console({
      format: format.combine(
        format.colorize(),
        consoleFormat
      )
    }),
    // Log to files
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    new transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    })
  ]
});

// Add MongoDB transport only if MONGODB_URI is available and we're not in test mode
if (process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
  logger.add(new transports.MongoDB({
    level: 'info',
    db: process.env.MONGODB_URI,
    options: { useUnifiedTopology: true },
    collection: 'logs',
    format: format.combine(
      format.timestamp(),
      format.json()
    )
  }));
}

// Stream for Morgan HTTP logger
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

module.exports = logger;