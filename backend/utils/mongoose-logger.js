// backend/utils/mongoose-logger.js
const mongoose = require('mongoose');
const logger = require('./logger');

// Middleware to log MongoDB queries
function logMongooseOperations() {
  mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    const query = JSON.stringify(methodArgs);
    logger.debug(`MongoDB: ${collectionName}.${methodName}(${query})`);
  });
}

// Track query execution time
mongoose.plugin(schema => {
  // Add hooks for each operation to track timing
  const operations = ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'updateOne', 'deleteOne', 'save'];
  
  operations.forEach(operation => {
    if (operation === 'save') {
      schema.pre('save', function(next) {
        this._startTime = Date.now();
        next();
      });
      
      schema.post('save', function(doc) {
        if (this._startTime) {
          const duration = Date.now() - this._startTime;
          logger.debug(`MongoDB: save operation on ${this.constructor.modelName} took ${duration}ms`);
          
          if (duration > 500) {
            logger.warn(`Slow MongoDB operation: save on ${this.constructor.modelName} took ${duration}ms`);
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
          logger.debug(`MongoDB: ${operation} operation on ${this.model.modelName} took ${duration}ms`);
          
          if (duration > 500) {
            logger.warn(`Slow MongoDB operation: ${operation} on ${this.model.modelName} took ${duration}ms`);
          }
        }
      });
    }
  });
});

module.exports = { logMongooseOperations };