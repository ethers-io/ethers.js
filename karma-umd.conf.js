"use strict";

module.exports = function(config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [
        "./packages/ethers/dist/ethers-all.umd.min.js",
        "./packages/tests/dist/tests.umd.js",
    ],
    reporters: [ 'progress' ],
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: [ 'ChromeHeadless' ],
    autoWatch: false,
    singleRun: true,
    /*
    client: {
      mocha: {
        grep: 'utf',
      }
    }
    */
  })
}
