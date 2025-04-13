const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dragon-bindery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/products', productsRoutes);

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

// backend/server.js - Add to your existing server file
const paymentRoutes = require('./routes/payment');

// Use routes
app.use('/api/payment', paymentRoutes);