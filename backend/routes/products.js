const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new product with validation
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { name, description, price, image, category } = req.body;
    
    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({
        message: 'Missing required fields. Name, description, price, image, and category are required.'
      });
    }
    
    // Validate price is a positive number
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        message: 'Price must be a positive number.'
      });
    }
    
    // Validate image URL
    if (!image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('/uploads/')) {
      return res.status(400).json({
        message: 'Invalid image URL.'
      });
    }
    
    // Create and save the product
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    // Provide more specific error messages for common issues
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a product with validation
router.put('/:id', async (req, res) => {
  try {
    // Validate id parameter
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // If price is provided, validate it
    if (req.body.price !== undefined) {
      if (isNaN(req.body.price) || req.body.price <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
    }
    
    // If image is provided, validate URL format
    if (req.body.image && 
        !req.body.image.startsWith('http://') && 
        !req.body.image.startsWith('https://') && 
        !req.body.image.startsWith('/uploads/')) {
      return res.status(400).json({ message: 'Invalid image URL format' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run mongoose validators
      }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err);
    // Provide more specific error messages for common issues
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    } else if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a product with validation
router.delete('/:id', async (req, res) => {
  try {
    // Validate id parameter
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If the product had an image in the uploads folder, we could delete it here
    // This would require tracking which images are used by which products
    
    res.json({ 
      message: 'Product removed successfully',
      productId: req.params.id
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;