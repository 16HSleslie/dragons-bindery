require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const productsRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const logger = require('./utils/logger');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('combined', { stream: logger.stream }));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('===================================');
  logger.info('MongoDB connected successfully');
  logger.info(`Database: ${mongoose.connection.name}`);
  logger.info('===================================');
})
.catch(err => {
  logger.error('===================================');
  logger.error('MongoDB connection FAILED');
  logger.error(err);
  logger.error('===================================');
});

// global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
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

// Serve static files from frontend if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/dragons-bindery')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/dragons-bindery/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});