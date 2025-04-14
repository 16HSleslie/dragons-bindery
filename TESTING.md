# Dragons Bindery Automated Testing System

This document describes the comprehensive automated testing system implemented for the Dragons Bindery application. The system is designed to maintain code quality by automatically running relevant tests when code changes occur.

## Table of Contents

1. [Overview](#overview)
2. [Available Test Commands](#available-test-commands)
3. [Automated Testing Tools](#automated-testing-tools)
4. [Git Hooks Integration](#git-hooks-integration)
5. [Best Practices](#best-practices)

## Overview

The automated testing system consists of several components:

- **Smart test detection**: Identifies which tests should run based on code changes
- **Continuous test watching**: Automatically runs tests during development when files change
- **Git hooks integration**: Runs relevant tests before commits and pushes
- **Test coverage reporting**: Tracks code coverage to ensure comprehensive testing

The system prioritizes developer efficiency by only running tests that are affected by recent code changes, while ensuring that critical functionality is properly tested.

## Available Test Commands

The following commands are available for running tests:

| Command | Description |
|---------|-------------|
| `npm test` | Run frontend tests |
| `npm run test:watch` | Run frontend tests in watch mode |
| `npm run test:coverage` | Run frontend tests with coverage report |
| `npm run test:api` | Run backend API tests |
| `npm run test:api:watch` | Run backend API tests in watch mode |
| `npm run test:api:coverage` | Run backend API tests with coverage report |
| `npm run test:all` | Run all tests with coverage reports |
| `npm run test:affected` | Run tests affected by recent changes |
| `npm run test:auto` | Run tests in continuous watch mode (frontend and backend) |

### Examples

To run a specific frontend test:
```bash
ng test --include=**/cart.service.spec.ts
```

To run a specific backend test:
```bash
jest --config=backend/jest.config.js backend/tests/product.test.js
```

## Automated Testing Tools

### Test-Affected Script

The `scripts/test-affected.js` script analyzes changed files and runs only the relevant tests. This is particularly useful during development and in CI/CD pipelines to reduce test execution time.

Features:
- Detects which files have changed (staged or unstaged)
- Determines which tests should be run based on dependencies
- Runs backend and frontend tests as appropriate
- Provides clear feedback on test execution

### Test-Watcher Script

The `scripts/test-watcher.js` script continuously watches for file changes and runs relevant tests automatically. This enables rapid feedback during development.

Features:
- Monitors file changes in real-time
- Runs affected tests when a file is modified
- Provides immediate feedback on test failures
- Supports both frontend and backend code

## Git Hooks Integration

The testing system integrates with Git using Husky hooks:

### Pre-commit Hook

The pre-commit hook runs:
1. Linting checks on modified files
2. Affected tests for changed files

This prevents commits that would break the build or fail tests.

### Pre-push Hook

The pre-push hook performs more thorough testing:
1. For pushes to `main` or `master`, it runs the full test suite
2. For other branches, it runs affected tests only

## Best Practices

To get the most from the automated testing system:

1. **Write comprehensive tests**: Create tests for both happy paths and edge cases
2. **Keep tests focused**: Each test should verify a specific functionality
3. **Keep tests fast**: Slow tests discourage frequent testing
4. **Run test:auto during development**: Get immediate feedback as you code
5. **Use test:affected before committing**: Make sure your changes don't break existing functionality
6. **Maintain test independence**: Tests should not depend on each other's state
7. **Use meaningful test names**: Tests should clearly describe the functionality they validate

## Troubleshooting

If you encounter issues with the testing system:

1. **Tests not running**: Make sure the file paths in test patterns match your project structure
2. **Tests not detecting changes**: Check if the file dependency mapping needs to be updated
3. **Slow tests**: Consider using more focused tests or mocking expensive operations
4. **Git hooks not running**: Make sure Husky is installed (`npm run prepare`) and hooks are executable

## Adding New Tests

When adding new functionality, create corresponding tests:

1. **Backend**: Add tests in `backend/tests/` with the `.test.js` extension
2. **Frontend**: Add tests alongside components with the `.spec.ts` extension
3. **Update dependency mappings**: If needed, update file-to-test mappings in the test scripts

## Future Improvements

Planned enhancements to the testing system:

1. **Dependency graph analysis**: Automatically discover test dependencies
2. **Parallel test execution**: Run tests concurrently for faster feedback
3. **Visual test results**: Add visual reporting for test coverage and results
4. **Integration with CI/CD**: Optimize test running in CI/CD environments