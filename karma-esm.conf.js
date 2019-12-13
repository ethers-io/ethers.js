"use strict";

module.exports = function(config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [
        { pattern: "./packages/ethers/dist/ethers-all.esm.min.js", type: "module" },
        { pattern: "./packages/tests/dist/tests.esm.js", type: "module" }
    ],
    reporters: ['karma'],
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      require('./packages/tests/karma-reporter')
    ],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: [ 'ChromeHeadless' ],
    autoWatch: false,
    singleRun: true,
    browserNoActivityTimeout: 60000
    /*
    client: {
      mocha: {
        grep: 'utf',
      }
    }
    */
  })
}
