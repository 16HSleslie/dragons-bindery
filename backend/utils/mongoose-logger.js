// backend/utils/mongoose-logger.js
const mongoose = require('mongoose');
const logger = require('./logger');

// Colorized output for development
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Middleware to log MongoDB queries with improved formatting
function logMongooseOperations(enableDebug = true) {
  if (enableDebug) {
    mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
      // Truncate long queries for readability
      const formatArg = (arg) => {
        const str = JSON.stringify(arg);
        return str.length > 200 ? str.substring(0, 200) + '...' : str;
      };
      
      // Get the calling function from the stack trace
      const stack = new Error().stack || '';
      const stackLines = stack.split('\n').slice(2);
      const callerLine = stackLines.find(line => !line.includes('mongoose') && !line.includes('mongodb'));
      const caller = callerLine 
        ? callerLine.trim().substring(3).split(' ')[0].split('.').pop() 
        : 'unknown';
      
      const queryArgs = methodArgs.map(formatArg).join(', ');
      
      // Colorize output for development environments
      const formattedMethod = `${colors.bright}${methodName}${colors.reset}`;
      const formattedCollection = `${colors.blue}${collectionName}${colors.reset}`;
      const formattedCaller = caller !== 'unknown' ? ` [${colors.green}${caller}${colors.reset}]` : '';
      
      logger.debug(`Mongo: ${formattedCollection}.${formattedMethod}(${queryArgs})${formattedCaller}`);
    });
  }
  
  // Track mongoose connection events
  mongoose.connection.on('connecting', () => {
    logger.info('MongoDB: Connecting to database...');
  });

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB: Connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB: Disconnected from database');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB Connection Error: ${err.message}`);
  });
}

// Track query execution time with better formatting
function setupPerformanceMonitoring() {
  mongoose.plugin(schema => {
    // Add hooks for each operation to track timing
    const operations = ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'updateOne', 'deleteOne', 'save'];
    
    // Performance thresholds in ms (configurable via environment variables)
    const SLOW_THRESHOLD = process.env.MONGO_SLOW_THRESHOLD || 200;
    const VERY_SLOW_THRESHOLD = process.env.MONGO_VERY_SLOW_THRESHOLD || 500;
    
    operations.forEach(operation => {
      if (operation === 'save') {
        schema.pre('save', function(next) {
          this._startTime = Date.now();
          next();
        });
        
        schema.post('save', function(doc) {
          if (this._startTime) {
            const duration = Date.now() - this._startTime;
            const modelName = this.constructor.modelName;
            
            if (duration > VERY_SLOW_THRESHOLD) {
              logger.warn(`${colors.red}Slow DB Operation${colors.reset}: save on ${colors.bright}${modelName}${colors.reset} took ${duration}ms`);
            } else if (duration > SLOW_THRESHOLD) {
              logger.debug(`DB Performance: save on ${modelName} took ${duration}ms`);
            }
          }
        });
      } else {
        schema.pre(operation, function() {
          this._startTime = Date.now();
        });
        
        schema.post(operation, function(result) {
          if (this._startTime) {
            const duration = Date.now() - this._startTime;
            const modelName = this.model.modelName || 'Unknown';
            
            if (duration > VERY_SLOW_THRESHOLD) {
              logger.warn(`${colors.red}Slow DB Operation${colors.reset}: ${operation} on ${colors.bright}${modelName}${colors.reset} took ${duration}ms`);
            } else if (duration > SLOW_THRESHOLD) {
              logger.debug(`DB Performance: ${operation} on ${modelName} took ${duration}ms`);
            }
          }
        });
      }
    });
  });
}

// Initialize logging with environment-specific settings
function initMongooseLogging(enableDebug = false) {
  logMongooseOperations(enableDebug);
  setupPerformanceMonitoring();
  
  // Only log initialization in non-test environments to keep test output clean
  if (process.env.NODE_ENV !== 'test') {
    logger.info(`MongoDB Logging initialized (${process.env.NODE_ENV || 'development'} mode)`);
  }
}

module.exports = { 
  logMongooseOperations,
  setupPerformanceMonitoring,
  initMongooseLogging
};