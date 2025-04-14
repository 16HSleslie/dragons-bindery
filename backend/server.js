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

// Configure storage for uploaded files with security enhancements
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function(req, file, cb) {
    // Generate a random file name with a timestamp to prevent name collisions
    const fileExtension = file.originalname.split('.').pop();
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    cb(null, safeFileName);
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add file filters for security
const fileFilter = (req, file, cb) => {
  // Accept only specific image types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP images are allowed.'), false);
  }
};

// Configure multer with security settings
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// File upload endpoint with improved security and error handling
app.post('/api/products/upload', (req, res) => {
  // Use multer middleware dynamically to handle errors
  upload.single('image')(req, res, (err) => {
    // Handle multer errors
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB.' 
        });
      }
      
      // Handle other errors including invalid file types
      logger.error(`File upload error: ${err.message}`);
      return res.status(400).json({ 
        message: err.message || 'Error uploading file. Please try again.' 
      });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Additional validation for image files
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      // Remove the invalid file (with safety checks)
      try {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          // Validate that the path is really in our uploads directory
          const normalizedPath = path.normalize(req.file.path);
          const uploadsPath = path.normalize(uploadsDir);
          
          if (normalizedPath.startsWith(uploadsPath)) {
            fs.unlinkSync(req.file.path);
            logger.info(`Deleted invalid file: ${req.file.path}`);
          } else {
            logger.error(`Attempted to delete file outside uploads directory: ${req.file.path}`);
          }
        }
      } catch (err) {
        logger.error(`Error deleting invalid file: ${err.message}`);
      }
      return res.status(400).json({ 
        message: 'Invalid file extension. Only JPG, PNG, GIF and WEBP are allowed.' 
      });
    }
    
    // Return the URL to the uploaded file - use relative URL to avoid CORS/domain issues
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Log successful upload
    logger.info(`File uploaded successfully: ${req.file.filename}`);
    
    res.json({ imageUrl });
  });
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