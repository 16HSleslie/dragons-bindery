// backend/tests/product-api.test.js
const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

describe('Product API', () => {
  // Test data
  const testProduct = {
    name: 'API Test Journal',
    description: 'A journal for API testing with rich details and quality binding',
    price: 29.99,
    category: 'journals',
    image: '/assets/images/placeholder.jpg',
    isNew: true,
    isBestseller: false
  };
  
  // Clear products before each test
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  // Test getting all products
  describe('GET /api/products', () => {
    it('should return an empty array when no products exist', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
    
    it('should return all products', async () => {
      // Create test product
      await Product.create(testProduct);
      
      const res = await request(app).get('/api/products');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe(testProduct.name);
    });
  });
  
  // Test getting a single product
  describe('GET /api/products/:id', () => {
    it('should return a 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/123456789012345678901234');
      
      expect(res.status).toBe(404);
    });
    
    it('should return a product by id', async () => {
      // Create test product
      const product = await Product.create(testProduct);
      
      const res = await request(app).get(`/api/products/${product._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(testProduct.name);
      expect(res.body.price).toBe(testProduct.price);
    });
    
    it('should return a 400 for invalid id format', async () => {
      const res = await request(app).get('/api/products/invalid-id');
      
      expect(res.status).toBe(400);
    });
  });
  
  // Test creating a new product
  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(testProduct);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(testProduct.name);
      expect(res.body.description).toBe(testProduct.description);
      expect(res.body.price).toBe(testProduct.price);
      expect(res.body.category).toBe(testProduct.category);
      expect(res.body.isNew).toBe(testProduct.isNew);
      expect(res.body.isBestseller).toBe(testProduct.isBestseller);
      expect(res.body._id).toBeDefined();
      
      // Verify saved to database
      const product = await Product.findById(res.body._id);
      expect(product).toBeTruthy();
      expect(product.name).toBe(testProduct.name);
    });
    
    it('should return a 400 for missing required fields', async () => {
      const invalidProduct = {
        name: 'Missing Fields Product',
        // Missing required fields
      };
      
      const res = await request(app)
        .post('/api/products')
        .send(invalidProduct);
      
      expect(res.status).toBe(400);
    });
    
    it('should return a 400 for invalid price', async () => {
      const invalidProduct = {
        ...testProduct,
        price: -10 // Invalid negative price
      };
      
      const res = await request(app)
        .post('/api/products')
        .send(invalidProduct);
      
      expect(res.status).toBe(400);
    });
    
    it('should return a 400 for invalid image URL', async () => {
      const invalidProduct = {
        ...testProduct,
        image: 'invalid-url' // Invalid URL format
      };
      
      const res = await request(app)
        .post('/api/products')
        .send(invalidProduct);
      
      expect(res.status).toBe(400);
    });
  });
  
  // Test updating a product
  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      // Create test product
      const product = await Product.create(testProduct);
      
      const updateData = {
        name: 'Updated Product Name',
        price: 39.99
      };
      
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send(updateData);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.price).toBe(updateData.price);
      // Original fields should be unchanged
      expect(res.body.description).toBe(testProduct.description);
      
      // Verify updated in database
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.name).toBe(updateData.name);
      expect(updatedProduct.price).toBe(updateData.price);
    });
    
    it('should return a 404 when updating non-existent product', async () => {
      const res = await request(app)
        .put('/api/products/123456789012345678901234')
        .send({ name: 'Updated Name' });
      
      expect(res.status).toBe(404);
    });
    
    it('should return a 400 for invalid price update', async () => {
      // Create test product
      const product = await Product.create(testProduct);
      
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ price: -5 }); // Invalid negative price
      
      expect(res.status).toBe(400);
    });
  });
  
  // Test deleting a product
  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      // Create test product
      const product = await Product.create(testProduct);
      
      const res = await request(app)
        .delete(`/api/products/${product._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed');
      
      // Verify deleted from database
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
    
    it('should return a 404 when deleting non-existent product', async () => {
      const res = await request(app)
        .delete('/api/products/123456789012345678901234');
      
      expect(res.status).toBe(404);
    });
  });
});