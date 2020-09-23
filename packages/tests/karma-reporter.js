"use strict";

const Reporter = require('./reporter')
const EventEmitter = require('events');

const KarmaReporter = function () {

  const runner = new EventEmitter();
  const reporter = new Reporter(runner);
  let lastSuite = null;

  // capture console logs
  this.onBrowserLog = function (browser, log, type) {
    console.log('\x1b[36m%s\x1b[0m', log);
  }

  let dummyStarted = false;
  this.onRunComplete = function (browsers, results) {
    if (lastSuite !== null) {
      runner.emit('suite end');
      lastSuite = null;
    }

    // end the dummy suite for total test count
    if (dummyStarted) {
        runner.emit('suite end');
    }
  }

  this.onSpecComplete = function (browser, result) {
    if (result.suite[0] !== lastSuite) {
      if (lastSuite === null) {
        // this is the first test, start a dummy suite to track total test count
        runner.emit('suite', {});
        dummyStarted = true;
      }
      else {
        // end previous suite
        runner.emit('suite end');
      }

      runner.emit('suite', { title: result.suite });
      lastSuite = result.suite[0];
    }

    runner.emit('test', {
        _currentRetry: 0
    });

    if (result.skipped) {
      runner.emit('skipped');
    }
    else if (result.success) {
      runner.emit('pass');
    }
    else {
      const test = {
        title: result.description,
      };

      const error = {
        browser: browser.name,
        suite: result.suite,
        test: result.description,
        log: result.log
      }

      runner.emit('fail', test, error);
    }
  }
}

module.exports = {
  'reporter:karma': ['type', KarmaReporter]
};
