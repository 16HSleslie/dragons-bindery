#!/usr/bin/env node

/**
 * Test-watcher.js
 * 
 * This script watches for file changes and automatically runs relevant tests.
 * It helps developers maintain code quality by providing immediate feedback.
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Configuration
const config = {
  // Paths to watch
  paths: {
    backend: 'backend',
    frontend: 'src',
  },
  
  // File patterns to watch
  patterns: {
    backend: ['**/*.js', '!node_modules/**', '!**/coverage/**'],
    frontend: ['**/*.ts', '**/*.html', '!**/*.spec.ts', '!node_modules/**', '!**/coverage/**'],
  },
  
  // Test patterns
  testPatterns: {
    backend: ['**/*.test.js'],
    frontend: ['**/*.spec.ts'],
  },
  
  // Debounce interval in milliseconds
  debounceInterval: 500,
  
  // Enable verbose mode
  verbose: process.argv.includes('--verbose'),
};

// Global state
let changeTimeout = null;
let changedFiles = new Set();
let isRunning = false;

/**
 * Main function
 */
function main() {
  printBanner();
  
  // Set up watchers
  setupBackendWatcher();
  setupFrontendWatcher();
  
  console.log(`\n${colors.green}✓${colors.reset} Watching for file changes...\n`);
  
  // Handle exit signals
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}⚠${colors.reset} Test watcher stopped.`);
    process.exit(0);
  });
}

/**
 * Print a banner
 */
function printBanner() {
  console.log(`${colors.cyan}┌─────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.cyan}│${colors.bright} Dragons Bindery - Test Watcher${colors.reset}${colors.cyan}             │${colors.reset}`);
  console.log(`${colors.cyan}└─────────────────────────────────────────┘${colors.reset}`);
  console.log(`${colors.dim}Automatically runs tests when files change${colors.reset}`);
}

/**
 * Set up backend file watcher
 */
function setupBackendWatcher() {
  const patterns = config.patterns.backend.map(pattern => 
    path.join(config.paths.backend, pattern)
  );
  
  const watcher = chokidar.watch(patterns, {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true,
  });
  
  watcher
    .on('add', path => handleFileChange(path, 'backend'))
    .on('change', path => handleFileChange(path, 'backend'))
    .on('unlink', path => handleFileChange(path, 'backend'));
    
  if (config.verbose) {
    console.log(`${colors.blue}Backend watcher${colors.reset} set up for patterns:`, patterns);
  }
}

/**
 * Set up frontend file watcher
 */
function setupFrontendWatcher() {
  const patterns = config.patterns.frontend.map(pattern => 
    path.join(config.paths.frontend, pattern)
  );
  
  const watcher = chokidar.watch(patterns, {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true,
  });
  
  watcher
    .on('add', path => handleFileChange(path, 'frontend'))
    .on('change', path => handleFileChange(path, 'frontend'))
    .on('unlink', path => handleFileChange(path, 'frontend'));
    
  if (config.verbose) {
    console.log(`${colors.blue}Frontend watcher${colors.reset} set up for patterns:`, patterns);
  }
}

/**
 * Handle file changes with debouncing
 */
function handleFileChange(filePath, type) {
  // Skip test files themselves
  if (isTestFile(filePath, type)) {
    if (config.verbose) {
      console.log(`${colors.dim}Ignoring change in test file:${colors.reset} ${filePath}`);
    }
    return;
  }
  
  // Add to changed files set
  changedFiles.add({ path: filePath, type });
  
  // Debounce
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }
  
  // Only process changes if we're not already running tests
  if (!isRunning) {
    changeTimeout = setTimeout(() => processChanges(), config.debounceInterval);
  }
}

/**
 * Process file changes
 */
function processChanges() {
  if (changedFiles.size === 0 || isRunning) {
    return;
  }
  
  isRunning = true;
  
  console.log(`\n${colors.bright}Processing ${changedFiles.size} file changes${colors.reset}`);
  
  // Group by type
  const backendFiles = [...changedFiles]
    .filter(file => file.type === 'backend')
    .map(file => file.path);
    
  const frontendFiles = [...changedFiles]
    .filter(file => file.type === 'frontend')
    .map(file => file.path);
  
  // Clear the set
  changedFiles.clear();
  
  // Run tests
  Promise.resolve()
    .then(() => {
      if (backendFiles.length > 0) {
        return runBackendTestsForFiles(backendFiles);
      }
    })
    .then(() => {
      if (frontendFiles.length > 0) {
        return runFrontendTestsForFiles(frontendFiles);
      }
    })
    .catch(error => {
      console.error(`${colors.red}Error running tests:${colors.reset}`, error.message);
    })
    .finally(() => {
      isRunning = false;
      
      // If more changes accumulated during test run, process them
      if (changedFiles.size > 0) {
        changeTimeout = setTimeout(() => processChanges(), 100);
      } else {
        console.log(`\n${colors.green}✓${colors.reset} Watching for file changes...\n`);
      }
    });
}

/**
 * Check if a file is a test file
 */
function isTestFile(filePath, type) {
  const patterns = config.testPatterns[type];
  const relativePath = path.relative(config.paths[type], filePath);
  
  return patterns.some(pattern => {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(relativePath);
  });
}

/**
 * Run backend tests for changed files
 */
async function runBackendTestsForFiles(files) {
  console.log(`\n${colors.blue}Running backend tests for changed files...${colors.reset}`);
  
  if (config.verbose) {
    console.log(`${colors.dim}Changed files:${colors.reset}`);
    files.forEach(file => console.log(`  - ${file}`));
  }
  
  // Find corresponding test files
  const testFiles = findBackendTestFiles(files);
  
  if (testFiles.length === 0) {
    console.log(`${colors.yellow}No relevant backend test files found.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.bright}Running ${testFiles.length} backend test files:${colors.reset}`);
  
  try {
    // Run each test file
    for (const testFile of testFiles) {
      const relativePath = path.relative(process.cwd(), testFile);
      console.log(`\n${colors.blue}Running test:${colors.reset} ${relativePath}`);
      
      try {
        execSync(`jest --config=backend/jest.config.js "${relativePath}"`, { 
          stdio: 'inherit' 
        });
        console.log(`${colors.green}✓${colors.reset} ${colors.bright}Test passed:${colors.reset} ${relativePath}`);
      } catch (error) {
        console.error(`${colors.red}✗${colors.reset} ${colors.bright}Test failed:${colors.reset} ${relativePath}`);
        throw error;
      }
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} ${colors.bright}Some backend tests failed${colors.reset}`);
    throw error;
  }
}

/**
 * Find backend test files related to changed files
 */
function findBackendTestFiles(files) {
  const testFiles = new Set();
  
  // Map of file paths to test files
  const fileToTestMap = {
    'models/Product.js': ['tests/product.test.js'],
    'routes/products.js': ['tests/product.test.js'],
    'server.js': ['tests/product.test.js'], // Server changes could affect all tests
    // Add more mappings as needed
  };
  
  // Check each file
  files.forEach(file => {
    // Extract path relative to backend
    const relativePath = path.relative(config.paths.backend, file);
    
    // Check if we have a direct mapping
    if (fileToTestMap[relativePath]) {
      fileToTestMap[relativePath].forEach(testFile => {
        const fullPath = path.join(config.paths.backend, testFile);
        testFiles.add(fullPath);
      });
    } else {
      // Check if there's a corresponding test file
      const baseName = path.basename(file, path.extname(file));
      const potentialTestPath = path.join(config.paths.backend, 'tests', `${baseName}.test.js`);
      
      if (fs.existsSync(potentialTestPath)) {
        testFiles.add(potentialTestPath);
      }
    }
  });
  
  return [...testFiles];
}

/**
 * Run frontend tests for changed files
 */
async function runFrontendTestsForFiles(files) {
  console.log(`\n${colors.blue}Running frontend tests for changed files...${colors.reset}`);
  
  if (config.verbose) {
    console.log(`${colors.dim}Changed files:${colors.reset}`);
    files.forEach(file => console.log(`  - ${file}`));
  }
  
  // Find corresponding test files
  const testFiles = findFrontendTestFiles(files);
  
  if (testFiles.length === 0) {
    console.log(`${colors.yellow}No relevant frontend test files found.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.bright}Running ${testFiles.length} frontend test files:${colors.reset}`);
  
  try {
    // Run each test file
    for (const testFile of testFiles) {
      const relativePath = path.relative(process.cwd(), testFile);
      const fileName = path.basename(relativePath);
      console.log(`\n${colors.blue}Running test:${colors.reset} ${relativePath}`);
      
      try {
        execSync(`ng test --include=**/${fileName} --watch=false`, { 
          stdio: 'inherit' 
        });
        console.log(`${colors.green}✓${colors.reset} ${colors.bright}Test passed:${colors.reset} ${relativePath}`);
      } catch (error) {
        console.error(`${colors.red}✗${colors.reset} ${colors.bright}Test failed:${colors.reset} ${relativePath}`);
        throw error;
      }
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} ${colors.bright}Some frontend tests failed${colors.reset}`);
    throw error;
  }
}

/**
 * Find frontend test files related to changed files
 */
function findFrontendTestFiles(files) {
  const testFiles = new Set();
  
  // For each file, find the corresponding test file
  files.forEach(file => {
    // Find corresponding test file
    const baseName = path.basename(file, path.extname(file));
    const dirName = path.dirname(file);
    
    // Component or service test
    const specBaseName = baseName.replace('.component', '.component.spec')
                                 .replace('.service', '.service.spec');
    const potentialTestPath = path.join(dirName, `${specBaseName}.ts`);
    
    if (fs.existsSync(potentialTestPath)) {
      testFiles.add(potentialTestPath);
    }
    
    // If service changes, also run dependent component tests
    if (file.includes('/services/')) {
      const serviceName = baseName.replace('.service', '');
      findDependentComponentTests(testFiles, serviceName);
    }
  });
  
  return [...testFiles];
}

/**
 * Find tests for components that depend on a service
 */
function findDependentComponentTests(testFiles, serviceName) {
  const componentsPath = path.join(config.paths.frontend, 'app/components');
  
  try {
    // Find component directories recursively
    findComponentsRecursively(componentsPath, serviceName, testFiles);
  } catch (error) {
    console.error(`Error finding dependent components: ${error.message}`);
  }
}

/**
 * Recursively find components in directories
 */
function findComponentsRecursively(dirPath, serviceName, testFiles) {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Check if this directory contains a component
  const tsFile = items.find(item => 
    !item.isDirectory() && item.name.endsWith('.component.ts'));
  const specFile = items.find(item => 
    !item.isDirectory() && item.name.endsWith('.component.spec.ts'));
  
  if (tsFile && specFile) {
    const tsFilePath = path.join(dirPath, tsFile.name);
    const specFilePath = path.join(dirPath, specFile.name);
    
    // Read the component file to check for service import
    const content = fs.readFileSync(tsFilePath, 'utf8');
    if (content.includes(`${serviceName}.service`)) {
      testFiles.add(specFilePath);
    }
  }
  
  // Recursively process subdirectories
  items.filter(item => item.isDirectory())
    .forEach(item => {
      findComponentsRecursively(path.join(dirPath, item.name), serviceName, testFiles);
    });
}

// Execute the main function
main();