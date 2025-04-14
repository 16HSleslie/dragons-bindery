// backend/tests/run-tests.js
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SILENT_TESTS = process.argv.includes('--verbose') ? 'false' : 'true';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Check for watch mode
const isWatchMode = process.argv.includes('--watch');
const isVerbose = process.argv.includes('--verbose');
const isCoverage = process.argv.includes('--coverage');

// Print header
function printHeader() {
  console.log(`${colors.cyan}┌───────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.cyan}│${colors.bright} Dragons Bindery API Tests${colors.reset}${colors.cyan}          │${colors.reset}`);
  console.log(`${colors.cyan}└───────────────────────────────────┘${colors.reset}`);
  
  if (isWatchMode) {
    console.log(`${colors.dim}Running in watch mode - tests will rerun when files change${colors.reset}`);
  }
  
  if (isCoverage) {
    console.log(`${colors.dim}Collecting coverage information${colors.reset}`);
  }
}

// Run tests once
function runTests() {
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
    let testArgs = process.argv.slice(2).filter(arg => 
      arg !== '--watch' && arg !== '--coverage' && arg !== '--verbose'
    );
    
    // Add coverage if needed
    if (isCoverage) {
      testArgs.push('--coverage');
    }
    
    // Add verbose if needed
    if (isVerbose) {
      testArgs.push('--verbose');
    }
    
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
        SILENT_TESTS: isVerbose ? 'false' : 'true'
      }
    });

    console.log(`\n${colors.green}✓${colors.reset} ${colors.bright}All tests completed successfully.${colors.reset}`);
    
    return true;
  } catch (error) {
    // If tests fail, Jest will return non-zero exit code
    if (error.status) {
      console.log(`\n${colors.red}✗${colors.reset} ${colors.bright}Tests failed with exit code ${error.status}.${colors.reset}`);
      return false;
    } else {
      console.error(`\n${colors.red}✗${colors.reset} Error running tests:`, error);
      return false;
    }
  }
}

// Watch mode implementation
function setupWatchMode() {
  // Define paths to watch
  const backendDir = path.join(__dirname, '..');
  
  // Create watcher
  const watcher = chokidar.watch([
    path.join(backendDir, 'routes/**/*.js'),
    path.join(backendDir, 'models/**/*.js'),
    path.join(backendDir, 'utils/**/*.js'),
    path.join(backendDir, 'tests/**/*.js'),
    path.join(backendDir, 'server.js')
  ], {
    ignored: [
      '**/node_modules/**',
      '**/coverage/**'
    ],
    persistent: true,
    ignoreInitial: true
  });
  
  let timeoutId = null;
  let isRunning = false;
  
  // Add event listeners
  watcher
    .on('add', handleFileChange)
    .on('change', handleFileChange)
    .on('unlink', handleFileChange);
  
  console.log(`\n${colors.blue}Watching for file changes...${colors.reset}`);
  
  // Handle file changes with debouncing
  function handleFileChange(filePath) {
    const relativePath = path.relative(backendDir, filePath);
    console.log(`\n${colors.yellow}File changed:${colors.reset} ${relativePath}`);
    
    // Debounce
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Only rerun tests if not already running
    if (!isRunning) {
      timeoutId = setTimeout(() => {
        isRunning = true;
        console.log(`\n${colors.bright}Rerunning tests...${colors.reset}`);
        
        runTests();
        
        isRunning = false;
        console.log(`\n${colors.blue}Watching for file changes...${colors.reset}`);
      }, 500);
    }
  }
}

// Main execution
function main() {
  printHeader();
  
  const success = runTests();
  
  if (isWatchMode) {
    setupWatchMode();
  } else {
    process.exit(success ? 0 : 1);
  }
}

// Start execution
main();