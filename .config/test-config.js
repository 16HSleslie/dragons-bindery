/**
 * Configuration for automated tests
 * This file is used by the automated testing system to determine
 * which tests to run based on file dependencies.
 */

module.exports = {
  // Components that depend on specific services
  serviceDependencies: {
    'product.service': [
      'admin-dashboard',
      'product-edit-modal',
      'product-list',
      'product-detail',
      'shop'
    ],
    'cart.service': [
      'cart-dropdown',
      'cart-page',
      'checkout',
      'product-detail'
    ],
    'auth.service': [
      'admin-login',
      'admin-dashboard',
      'header'
    ],
    'stripe.service': [
      'checkout'
    ]
  },
  
  // Critical functionality that always needs testing
  criticalTests: [
    'src/app/services/product.service.spec.ts',
    'src/app/services/cart.service.spec.ts',
    'src/app/services/auth.service.spec.ts',
    'backend/tests/product.test.js',
    'backend/tests/product-api.test.js'
  ],
  
  // Files that affect multiple components and should trigger wider testing
  globalDependencies: [
    'src/app/app.config.ts',
    'src/environments/environment.ts',
    'backend/server.js',
    'backend/models/Product.js'
  ],
  
  // Frontend tests that should be run for backend changes
  backendToFrontendDependencies: {
    'routes/products.js': [
      'src/app/services/product.service.spec.ts'
    ],
    'models/Product.js': [
      'src/app/services/product.service.spec.ts',
      'src/app/components/admin/product-edit-modal/product-edit-modal.component.spec.ts'
    ]
  }
};