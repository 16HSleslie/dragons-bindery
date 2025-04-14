// Initialize environment first
const env = require('./utils/environment').init();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const productsRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const logger = require('./utils/logger');
const { initMongooseLogging } = require('./utils/mongoose-logger');
const morgan = require('morgan');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure colored terminal output for development
const colors = {
  reset: env.logColors ? '\x1b[0m' : '',
  bright: env.logColors ? '\x1b[1m' : '',
  dim: env.logColors ? '\x1b[2m' : '',
  green: env.logColors ? '\x1b[32m' : '',
  yellow: env.logColors ? '\x1b[33m' : '',
  blue: env.logColors ? '\x1b[34m' : '',
  cyan: env.logColors ? '\x1b[36m' : '',
  white: env.logColors ? '\x1b[37m' : ''
};

// Custom morgan token for colored status code
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  let color = colors.green;
  
  if (status >= 400) color = colors.yellow;
  if (status >= 500) color = '\x1b[31m'; // red
  
  return `${color}${status}${colors.reset}`;
});

// Custom morgan token for response time with color based on duration
morgan.token('response-time-colored', (req, res) => {
  const time = morgan['response-time'](req, res);
  let color = colors.green;
  
  if (time > 200) color = colors.yellow;
  if (time > 500) color = '\x1b[31m'; // red
  
  return `${color}${time} ms${colors.reset}`;
});

// Configure HTTP request logging format based on environment
const morganFormat = env.isProduction
  ? 'combined'
  : `${colors.dim}:remote-addr${colors.reset} ${colors.bright}:method${colors.reset} :url ${colors.bright}:status-colored${colors.reset} :response-time-colored - :res[content-length] - ${colors.cyan}:referrer${colors.reset}`;

app.use(morgan(morganFormat, { 
  stream: logger.stream,
  // Skip logging health check endpoints to reduce noise
  skip: (req, res) => req.url === '/health' || req.url === '/api/health'
}));

// Initialize MongoDB logging
initMongooseLogging(env.mongoDebug);

// Application Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Performance monitoring middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Log response timing after request completes
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (duration > 1000) {
      logger.warn(`Performance Alert: ${req.method} ${req.originalUrl} took ${duration}ms`);
    } else if (duration > 500) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} completed in ${duration}ms`);
    }
  });
  
  next();
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: env.environment,
    uptime: process.uptime()
  });
});

// Connect to MongoDB with clear visual separator in logs
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('┌────────────────────────────────────┐');
  logger.info('│ MongoDB connected successfully     │');
  logger.info(`│ Database: ${mongoose.connection.name.padEnd(28)}│`);
  logger.info('└────────────────────────────────────┘');
})
.catch(err => {
  logger.error('┌────────────────────────────────────┐');
  logger.error('│ MongoDB connection FAILED          │');
  logger.error('└────────────────────────────────────┘');
  logger.error(err);
});

// Global error handler with improved formatting
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error [${status}]: ${message}`);
  logger.error(`Request: ${req.method} ${req.originalUrl}`);
  
  // Include stack trace in non-production environments
  if (err.stack && env.detailedErrors) {
    logger.error(`Stack: ${err.stack}`);
  }
  
  res.status(status).json({
    error: {
      status,
      message: env.isProduction ? 'Server Error' : message
    }
  });
});

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/payment', paymentRoutes);

// File upload endpoint
app.post('/api/products/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the URL to the uploaded file
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Catch-all route for frontend in production
if (env.isProduction) {
  app.use(express.static(path.join(__dirname, '../dist/dragons-bindery')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/dragons-bindery/index.html'));
  });
}

// Start server with colorful output
const server = app.listen(PORT, () => {
  logger.info(`┌────────────────────────────────────┐`);
  logger.info(`│ Server running on port ${PORT.toString().padEnd(13)}│`);
  logger.info(`│ Environment: ${env.environment.padEnd(16)}│`);
  logger.info(`│ http://localhost:${PORT}${' '.repeat(13)}│`);
  logger.info(`└────────────────────────────────────┘`);
});

// Export for testing
module.exports = { app, server };