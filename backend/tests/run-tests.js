// backend/tests/run-tests.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SILENT_TESTS = process.argv.includes('--verbose') ? 'false' : 'true';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print header
console.log(`${colors.cyan}┌───────────────────────────────────┐${colors.reset}`);
console.log(`${colors.cyan}│${colors.bright} Dragons Bindery API Tests${colors.reset}${colors.cyan}          │${colors.reset}`);
console.log(`${colors.cyan}└───────────────────────────────────┘${colors.reset}`);

try {
  // Check if MongoDB is running
  try {
    execSync('pgrep mongod', { stdio: 'ignore' });
    console.log(`${colors.green}✓${colors.reset} MongoDB is running`);
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} MongoDB may not be running. Using in-memory database.`);
  }

  // Ensure .env.test exists
  const envTestPath = path.join(__dirname, '../.env.test');
  if (!fs.existsSync(envTestPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} No .env.test file found. Creating one with default values.`);
    const defaultEnv = `
# Test Environment Configuration
NODE_ENV=test
PORT=5001

# Test MongoDB URI (In-memory for tests, will be overridden by setup.js)
MONGODB_URI=mongodb://localhost:27017/dragons-bindery-test

# API Keys (Mocked in test environment)
STRIPE_SECRET_KEY=sk_test_mock
STRIPE_PUBLISHABLE_KEY=pk_test_mock

# Logging
LOG_LEVEL=error
`;
    fs.writeFileSync(envTestPath, defaultEnv);
  }

  // Parse test arguments
  const testArgs = process.argv.slice(2);
  const jestArgs = testArgs.length > 0 
    ? testArgs.join(' ') 
    : '--config=jest.config.js';

  // Run the tests with Jest
  console.log(`\n${colors.bright}Running tests...${colors.reset}\n`);
  execSync(`jest ${jestArgs}`, { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      SILENT_TESTS: process.argv.includes('--verbose') ? 'false' : 'true'
    }
  });

  console.log(`\n${colors.green}✓${colors.reset} ${colors.bright}All tests completed successfully.${colors.reset}`);

} catch (error) {
  // If tests fail, Jest will return non-zero exit code
  if (error.status) {
    console.log(`\n${colors.red}✗${colors.reset} ${colors.bright}Tests failed with exit code ${error.status}.${colors.reset}`);
    process.exit(error.status);
  } else {
    console.error(`\n${colors.red}✗${colors.reset} Error running tests:`, error);
    process.exit(1);
  }
}