// backend/utils/environment.js
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Helper to detect environment
function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

// Load environment variables from .env file
function loadEnvironmentVariables() {
  const env = getEnvironment();
  
  // Try environment-specific .env file first
  const envFile = path.resolve(__dirname, `../.env.${env}`);
  const defaultEnvFile = path.resolve(__dirname, '../.env');
  
  // Check if environment-specific file exists, otherwise use default
  const envPath = fs.existsSync(envFile) ? envFile : defaultEnvFile;
  
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn(`Environment file not found: ${envPath}`);
  } else {
    console.log(`Loaded environment from: ${envPath}`);
  }
  
  // Set default values for missing variables
  setDefaults();
}

// Set default values for missing env variables
function setDefaults() {
  // Database
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dragons-bindery';
  
  // Server port
  process.env.PORT = process.env.PORT || '5000';
  
  // Logging
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || (getEnvironment() === 'production' ? 'info' : 'debug');
}

// Get environment-specific configuration
function getConfig() {
  const env = getEnvironment();
  
  // Common configuration for all environments
  const common = {
    environment: env,
    isProduction: env === 'production',
    isTest: env === 'test',
    isDevelopment: env === 'development',
  };
  
  // Environment-specific configurations
  const configs = {
    development: {
      ...common,
      logColors: true,
      detailedErrors: true,
      mongoDebug: true
    },
    test: {
      ...common,
      logColors: false,
      detailedErrors: true,
      mongoDebug: false
    },
    production: {
      ...common,
      logColors: false,
      detailedErrors: false,
      mongoDebug: false
    }
  };
  
  return configs[env] || configs.development;
}

// Initialize the environment
function init() {
  loadEnvironmentVariables();
  return getConfig();
}

module.exports = {
  getEnvironment,
  loadEnvironmentVariables,
  getConfig,
  init
};