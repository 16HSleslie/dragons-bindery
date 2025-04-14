#!/usr/bin/env node

/**
 * Test-affected.js
 * 
 * This script analyzes changed files and runs relevant tests based on file dependencies.
 * It can be used in git hooks, CI/CD pipelines, or manually to test only what's necessary.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load test configuration
const testConfig = require('../.config/test-config.js');

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
  // Paths to analyze
  paths: {
    backend: 'backend',
    src: 'src',
    components: 'src/app/components',
    services: 'src/app/services',
  },
  
  // Test file patterns
  testPatterns: {
    backend: '**/*.test.js',
    frontend: '**/*.spec.ts',
  },
  
  // Maximum test files to run in one batch
  maxTestFilesToRun: 10,
  
  // Skip tests in CI mode
  skipTestsInCI: process.env.CI === 'true' && process.env.SKIP_AFFECTED_TESTS === 'true',
  
  // Verbose output
  verbose: process.argv.includes('--verbose') || process.env.VERBOSE === 'true'
};

/**
 * Main execution function
 */
async function main() {
  try {
    console.log(`${colors.cyan}┌─────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.bright} Dragons Bindery - Test Affected Files${colors.reset}${colors.cyan}    │${colors.reset}`);
    console.log(`${colors.cyan}└─────────────────────────────────────────┘${colors.reset}`);
    
    // Get changed files
    const stagedFiles = getStagedFiles();
    const changedFiles = getChangedFiles();

    const filesWithPath = [...new Set([...stagedFiles, ...changedFiles])];
    
    if (config.verbose) {
      console.log(`\n${colors.bright}Changed files:${colors.reset}`);
      filesWithPath.forEach(file => console.log(`  - ${file}`));
    }
    
    if (filesWithPath.length === 0) {
      console.log(`\n${colors.yellow}No changed files detected.${colors.reset}`);
      return;
    }
    
    // Analyze file types and run appropriate tests
    const { backendFiles, frontendFiles } = categorizeFiles(filesWithPath);
    
    // Run backend tests first if applicable
    if (backendFiles.length > 0) {
      console.log(`\n${colors.bright}Running backend tests for ${backendFiles.length} affected files...${colors.reset}`);
      runBackendTests(backendFiles);
    }
    
    // Then run frontend tests if applicable
    if (frontendFiles.length > 0) {
      console.log(`\n${colors.bright}Running frontend tests for ${frontendFiles.length} affected files...${colors.reset}`);
      runFrontendTests(frontendFiles);
    }
    
    console.log(`\n${colors.green}✓${colors.reset} ${colors.bright}All affected tests completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✗${colors.reset} ${colors.bright}Error running affected tests:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Get files that are staged in git
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR').toString().trim();
    return output ? output.split('\n') : [];
  } catch (error) {
    // If not in a git repo or other error, return empty array
    return [];
  }
}

/**
 * Get files that have been changed but not staged
 */
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only --diff-filter=ACMR').toString().trim();
    return output ? output.split('\n') : [];
  } catch (error) {
    // If not in a git repo or other error, return empty array
    return [];
  }
}

/**
 * Categorize files into backend and frontend
 */
function categorizeFiles(files) {
  const backendFiles = files.filter(file => file.startsWith(config.paths.backend));
  const frontendFiles = files.filter(file => file.startsWith(config.paths.src));
  
  return { backendFiles, frontendFiles };
}

/**
 * Run backend tests for affected files
 */
function runBackendTests(files) {
  // Determine which backend test files to run
  const testFiles = determineBackendTestsToRun(files);
  
  if (testFiles.length === 0) {
    console.log(`${colors.yellow}No backend test files found to run.${colors.reset}`);
    return;
  }
  
  if (config.verbose) {
    console.log(`\n${colors.bright}Backend test files to run:${colors.reset}`);
    testFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  // Run backend tests - truncate list if too many files
  const filesToRun = testFiles.slice(0, config.maxTestFilesToRun);
  const remainingCount = testFiles.length - filesToRun.length;
  
  if (remainingCount > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Running only ${filesToRun.length} tests (${remainingCount} more affected)`);
  }
  
  try {
    // Skip tests if in CI mode and configured to skip
    if (config.skipTestsInCI) {
      console.log(`${colors.yellow}⚠${colors.reset} Skipping backend tests in CI mode`);
      return;
    }
    
    // Run tests for each file
    filesToRun.forEach(testFile => {
      const relativePath = path.relative(process.cwd(), testFile);
      console.log(`\n${colors.blue}Running test:${colors.reset} ${relativePath}`);
      
      // Execute the test with Jest
      execSync(`jest --config=backend/jest.config.js "${relativePath}"`, { 
        stdio: config.verbose ? 'inherit' : 'pipe' 
      });
    });
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Backend tests failed`);
    throw error;
  }
}

/**
 * Determine which backend test files to run based on affected files
 */
function determineBackendTestsToRun(files) {
  const testFiles = [];
  
  // Map of file paths to test files, enhanced with config
  const fileToTestMap = {
    'models/Product.js': ['tests/product.test.js', 'tests/product-api.test.js'],
    'routes/products.js': ['tests/product.test.js', 'tests/product-api.test.js'],
    'server.js': ['tests/product.test.js', 'tests/product-api.test.js'],
    // Add more mappings as needed
  };
  
  // Add any critical tests from config
  const criticalBackendTests = testConfig.criticalTests
    .filter(test => test.startsWith('backend/'))
    .map(test => test.replace('backend/', ''));
    
  if (criticalBackendTests.length > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Including ${criticalBackendTests.length} critical backend tests`);
  }
  
  // Check each file and add corresponding tests
  files.forEach(file => {
    // Extract path relative to backend folder
    const relativePath = path.relative(config.paths.backend, file);
    
    // Check if we have a direct mapping
    if (fileToTestMap[relativePath]) {
      fileToTestMap[relativePath].forEach(testFile => {
        const fullPath = path.join(config.paths.backend, testFile);
        if (!testFiles.includes(fullPath)) {
          testFiles.push(fullPath);
        }
      });
    } else {
      // Check if there's a corresponding test file with the same name
      const baseName = path.basename(file, path.extname(file));
      const potentialTestPath = path.join(config.paths.backend, 'tests', `${baseName}.test.js`);
      
      if (fs.existsSync(potentialTestPath) && !testFiles.includes(potentialTestPath)) {
        testFiles.push(potentialTestPath);
      }
    }
  });
  
  // Add critical backend tests from config
  criticalBackendTests.forEach(testPath => {
    const fullPath = path.join(config.paths.backend, testPath);
    if (fs.existsSync(fullPath) && !testFiles.includes(fullPath)) {
      testFiles.push(fullPath);
    }
  });
  
  // Check for global dependencies that should trigger additional tests
  const hasGlobalChanges = files.some(file => 
    testConfig.globalDependencies.some(pattern => file.includes(pattern))
  );
  
  if (hasGlobalChanges) {
    console.log(`${colors.yellow}⚠${colors.reset} Global dependencies changed, including all critical tests`);
    
    // Add all remaining critical backend tests
    criticalBackendTests.forEach(testPath => {
      const fullPath = path.join(config.paths.backend, testPath);
      if (fs.existsSync(fullPath) && !testFiles.includes(fullPath)) {
        testFiles.push(fullPath);
      }
    });
  }
  
  return testFiles;
}

/**
 * Run frontend tests for affected files
 */
function runFrontendTests(files) {
  // Determine which frontend test files to run
  const testFiles = determineFrontendTestsToRun(files);
  
  if (testFiles.length === 0) {
    console.log(`${colors.yellow}No frontend test files found to run.${colors.reset}`);
    return;
  }
  
  if (config.verbose) {
    console.log(`\n${colors.bright}Frontend test files to run:${colors.reset}`);
    testFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  // Run frontend tests - truncate list if too many files
  const filesToRun = testFiles.slice(0, config.maxTestFilesToRun);
  const remainingCount = testFiles.length - filesToRun.length;
  
  if (remainingCount > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Running only ${filesToRun.length} tests (${remainingCount} more affected)`);
  }
  
  try {
    // Skip tests if in CI mode and configured to skip
    if (config.skipTestsInCI) {
      console.log(`${colors.yellow}⚠${colors.reset} Skipping frontend tests in CI mode`);
      return;
    }
    
    // Run tests for each file
    filesToRun.forEach(testFile => {
      const relativePath = path.relative(process.cwd(), testFile);
      console.log(`\n${colors.blue}Running test:${colors.reset} ${relativePath}`);
      
      // Execute the test with Angular test runner
      execSync(`ng test --include=**/$(basename "${relativePath}") --watch=false`, { 
        stdio: config.verbose ? 'inherit' : 'pipe' 
      });
    });
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Frontend tests failed`);
    throw error;
  }
}

/**
 * Determine which frontend test files to run based on affected files
 */
function determineFrontendTestsToRun(files) {
  const testFiles = [];
  
  // For each file, find the corresponding test file
  files.forEach(file => {
    // Skip test files themselves
    if (file.endsWith('.spec.ts')) {
      if (!testFiles.includes(file)) {
        testFiles.push(file);
      }
      return;
    }
    
    // Find corresponding test file
    const baseName = path.basename(file, path.extname(file));
    const dirName = path.dirname(file);
    
    // Component or service test
    const potentialTestPath = path.join(dirName, `${baseName}.spec.ts`);
    
    if (fs.existsSync(potentialTestPath) && !testFiles.includes(potentialTestPath)) {
      testFiles.push(potentialTestPath);
    }
    
    // If we have a service, also run dependent component tests
    if (file.includes('/services/')) {
      const serviceName = baseName.replace('.service', '');
      addDependentComponentTests(testFiles, serviceName);
    }
    
    // Check for backend changes that should trigger frontend tests
    if (file.startsWith(config.paths.backend)) {
      const relativePath = path.relative(config.paths.backend, file);
      
      // Check for mappings in config
      Object.entries(testConfig.backendToFrontendDependencies).forEach(([backendPath, frontendTests]) => {
        if (relativePath.includes(backendPath)) {
          frontendTests.forEach(test => {
            if (!testFiles.includes(test)) {
              console.log(`${colors.yellow}⚠${colors.reset} Backend change in ${relativePath} requires frontend test: ${test}`);
              testFiles.push(test);
            }
          });
        }
      });
    }
  });
  
  // Add critical frontend tests from config
  const criticalFrontendTests = testConfig.criticalTests
    .filter(test => test.startsWith('src/'))
    .filter(test => !testFiles.includes(test));
    
  if (criticalFrontendTests.length > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Including ${criticalFrontendTests.length} critical frontend tests`);
    testFiles.push(...criticalFrontendTests);
  }
  
  // Check for global dependencies that should trigger additional tests
  const hasGlobalChanges = files.some(file => 
    testConfig.globalDependencies.some(pattern => file.includes(pattern))
  );
  
  if (hasGlobalChanges) {
    console.log(`${colors.yellow}⚠${colors.reset} Global dependencies changed, including critical tests`);
    testConfig.criticalTests
      .filter(test => !testFiles.includes(test))
      .forEach(test => testFiles.push(test));
  }
  
  return testFiles;
}

/**
 * Add tests for components that depend on a given service
 */
function addDependentComponentTests(testFiles, serviceName) {
  // Get dependent components from config
  const dependentComponents = testConfig.serviceDependencies[`${serviceName}.service`] || [];
  
  if (dependentComponents.length === 0) {
    // Fallback to dynamic search if not in config
    findDependentComponentsDynamically(testFiles, serviceName);
    return;
  }
  
  console.log(`${colors.dim}Found ${dependentComponents.length} components dependent on ${serviceName}.service${colors.reset}`);
  
  // Find spec files for dependent components
  const componentsPath = config.paths.components;
  dependentComponents.forEach(componentName => {
    try {
      // Find the component directory - it could be in a subdirectory
      let componentSpecPath = null;
      
      // Try direct path first
      const directPath = path.join(componentsPath, componentName, `${componentName}.component.spec.ts`);
      if (fs.existsSync(directPath)) {
        componentSpecPath = directPath;
      } else {
        // Search in subdirectories
        const dirs = fs.readdirSync(componentsPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => path.join(componentsPath, dirent.name));
          
        for (const dir of dirs) {
          const nestedPath = path.join(dir, componentName, `${componentName}.component.spec.ts`);
          if (fs.existsSync(nestedPath)) {
            componentSpecPath = nestedPath;
            break;
          }
        }
      }
      
      if (componentSpecPath && !testFiles.includes(componentSpecPath)) {
        testFiles.push(componentSpecPath);
      }
    } catch (error) {
      console.error(`Error finding spec for component ${componentName}: ${error.message}`);
    }
  });
}

/**
 * Fallback method to find component dependencies dynamically
 */
function findDependentComponentsDynamically(testFiles, serviceName) {
  // This is a simplified implementation - in a real app, you'd need to parse
  // the components to find which ones import the service
  const componentsPath = config.paths.components;
  
  try {
    // Find component directories
    const componentDirs = fs
      .readdirSync(componentsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(componentsPath, dirent.name));
    
    // For each component dir, check if there are tests
    componentDirs.forEach(componentDir => {
      // Get subdirectories (specific components)
      const components = fs
        .readdirSync(componentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(componentDir, dirent.name));
      
      // Check each component for spec files and dependency on the service
      components.forEach(component => {
        const files = fs.readdirSync(component);
        const tsFile = files.find(f => f.endsWith('.component.ts'));
        const specFile = files.find(f => f.endsWith('.component.spec.ts'));
        
        if (tsFile && specFile) {
          const tsFilePath = path.join(component, tsFile);
          const specFilePath = path.join(component, specFile);
          
          // Read the component file to check for service import
          const content = fs.readFileSync(tsFilePath, 'utf8');
          if (content.includes(`${serviceName}.service`) && !testFiles.includes(specFilePath)) {
            testFiles.push(specFilePath);
          }
        }
      });
    });
  } catch (error) {
    console.error(`Error finding dependent components: ${error.message}`);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});