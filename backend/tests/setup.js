// backend/tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set NODE_ENV to test to disable extra logging
process.env.NODE_ENV = 'test';

let mongoServer;

// Silence MongoDB logging during tests
mongoose.set('debug', false);

// Setup in-memory MongoDB server
beforeAll(async () => {
  try {
    // Create MongoDB instance in memory for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Save URI to process.env for other modules to use
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Memory Server started at ${mongoUri}`);
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}, 30000); // Increase timeout for setup

// Clean up after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      // Disconnect and cleanup
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB Memory Server stopped');
    }
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}, 30000); // Increase timeout for teardown

// Clean up collections before each test
beforeEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) { // 1 = connected
      // Clear all collections between tests for isolation
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
}, 10000); // Increase timeout for cleanup

// Helper function to create test data
global.createTestData = async (model, data) => {
  return await model.create(data);
};

// Helper function to clear specific collection
global.clearCollection = async (model) => {
  await model.deleteMany({});
};

// Quiet down console for cleaner test output
if (process.env.SILENT_TESTS !== 'false') {
  // Keep a reference to original methods
  const originalMethods = {
    log: console.log,
    info: console.info,
    warn: console.warn
  };
  
  // Replace with no-op functions
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  
  // Restore original methods after tests
  afterAll(() => {
    console.log = originalMethods.log;
    console.info = originalMethods.info;
    console.warn = originalMethods.warn;
  });
}