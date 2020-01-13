"use strict";

module.exports = function(config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [
        "./packages/ethers/dist/ethers-all.umd.min.js",
        "./packages/tests/dist/tests.umd.js",
    ],
    reporters: [ 'karma' ],
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
    browserNoActivityTimeout: 180000
    /*
    client: {
      mocha: {
        grep: 'utf',
      }
    }
    */
  })
}
