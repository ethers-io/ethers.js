"use strict";

module.exports = function(config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [
        { pattern: "./packages/tests/dist/tests.esm.js", type: "module" }
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
