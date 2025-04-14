// backend/tests/product.test.js
const request = require('supertest');
const { app } = require('../server'); // Export app for testing
const Product = require('../models/Product');

describe('Product API', () => {
  // Test data
  const testProduct = {
    name: 'Test Journal',
    description: 'A journal for testing',
    price: 29.99,
    category: 'journals',
    image: '/assets/images/placeholder.jpg',
    isNew: true,
    isBestseller: false
  };

  // Test GET /api/products endpoint
  it('should get all products', async () => {
    // Create a sample product
    await Product.create(testProduct);
    
    // Make request and check response
    const res = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe(testProduct.name);
  });

  // Test POST /api/products endpoint
  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(testProduct)
      .expect(201);
    
    expect(res.body.name).toBe(testProduct.name);
    
    // Verify it exists in the database
    const product = await Product.findById(res.body._id);
    expect(product).toBeTruthy();
    expect(product.name).toBe(testProduct.name);
  });

  // Test GET /api/products/:id endpoint
  it('should get product by ID', async () => {
    // Create a product and get its ID
    const product = await Product.create(testProduct);
    
    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .expect(200);
    
    expect(res.body.name).toBe(testProduct.name);
  });

  // Add more test cases for PUT, DELETE, etc.
});