// backend/jest.config.js
module.exports = {
    testEnvironment: 'node',
    coverageDirectory: './coverage',
    collectCoverageFrom: [
      'routes/**/*.js',
      'models/**/*.js',
      'utils/**/*.js'
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true
  };