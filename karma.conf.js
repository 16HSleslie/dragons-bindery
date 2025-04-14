// karma.conf.js
module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage'),
        require('karma-mocha-reporter'),
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      client: {
        jasmine: {
          // Enable specific Jasmine options
          timeoutInterval: 10000
        },
        clearContext: false // leave Jasmine Spec Runner output visible
      },
      coverageReporter: {
        dir: require('path').join(__dirname, './coverage'),
        subdir: '.',
        reporters: [
          { type: 'html' },
          { type: 'text-summary' },
          { type: 'lcov' }
        ],
        check: {
          global: {
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70
          }
        }
      },
      reporters: ['mocha', 'kjhtml', 'coverage'],
      mochaReporter: {
        output: 'minimal',
        showDiff: true,
        symbols: {
          success: '✓',
          info: 'ℹ',
          warning: '⚠',
          error: '✗'
        }
      },
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['Chrome'],
      customLaunchers: {
        ChromeHeadlessCI: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },
      singleRun: false,
      restartOnFileChange: true
    });
  };