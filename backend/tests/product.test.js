// backend/tests/product.test.js
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Simple test suite without HTTP requests
describe('Product Model', () => {
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

  // Set longer timeouts
  jest.setTimeout(30000);
  
  // Clear product collection before tests
  beforeAll(async () => {
    await Product.deleteMany({});
  });

  // Test creating a product
  it('should create a product', async () => {
    const product = await Product.create(testProduct);
    
    expect(product).toBeTruthy();
    expect(product.name).toBe(testProduct.name);
    expect(product.price).toBe(testProduct.price);
    expect(product.isNew).toBe(true);
  });

  // Test finding products
  it('should find all products', async () => {
    const products = await Product.find({});
    expect(Array.isArray(products)).toBe(true);
  });

  // Test updating a product
  it('should update a product', async () => {
    // Create a product to update
    const product = await Product.create({
      ...testProduct,
      name: 'Product to update'
    });
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { name: 'Updated Product', price: 39.99 },
      { new: true }
    );
    
    expect(updatedProduct.name).toBe('Updated Product');
    expect(updatedProduct.price).toBe(39.99);
  });

  // Test deleting a product
  it('should delete a product', async () => {
    // Create a product to delete
    const product = await Product.create({
      ...testProduct,
      name: 'Product to delete'
    });
    
    // Delete the product
    await Product.findByIdAndDelete(product._id);
    
    // Try to find the deleted product
    const deletedProduct = await Product.findById(product._id);
    expect(deletedProduct).toBeNull();
  });
});