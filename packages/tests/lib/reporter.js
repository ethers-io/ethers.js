'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Maximum time in seconds to suppress output
var MAX_DELAY = 30;
function getTime() {
    return (new Date()).getTime();
}
function trunc(value) {
    if (value >= 0) {
        return Math.floor(value);
    }
    return Math.ceil(value);
}
function getDelta(t0) {
    var ds = trunc((getTime() - t0) / 1000);
    var minutes = trunc(ds / 60);
    var seconds = String(trunc(ds) % 60);
    while (seconds.length < 2) {
        seconds = '0' + seconds;
    }
    return '(' + minutes + ':' + seconds + ')';
}
function Reporter(runner) {
    var suites = [];
    // Force Output; Keeps the console output alive with periodic updates
    var lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            var currentSuite = suites[suites.length - 1];
            log("[ Still running suite - test # " + (currentSuite ? currentSuite._countTotal : "0") + " ]");
        }
    }
    var timer = setInterval(forceOutput, 1000);
    function getIndent() {
        var result = '';
        for (var i = 0; i < suites.length; i++) {
            result += '  ';
        }
        return result;
    }
    function log(message) {
        if (!message) {
            message = '';
        }
        console.log(getIndent() + message);
        lastOutput = getTime();
    }
    runner.on('suite', function (suite) {
        if (!suite.title) {
            log('Testing: ' + (suite.suites ? 'Found ' + suite.suites.length + ' test suites' : ''));
        }
        else {
            var filename = (suite.file || '').split('/').pop();
            if (filename) {
                filename = ' (' + filename + ')';
            }
            log('Test Suite: ' + suite.title + filename);
        }
        suites.push(suite);
        suite._t0 = getTime();
        suite._countFail = 0;
        suite._countPass = 0;
        suite._countTotal = 0;
    });
    runner.on('suite end', function () {
        var suite = suites.pop();
        var failure = '';
        if (suite._countTotal > suite._countPass) {
            failure = ' (' + (suite._countTotal - suite._countPass) + ' failed) *****';
        }
        log('  Total Tests: ' + suite._countPass + '/' + suite._countTotal + ' passed ' + getDelta(suite._t0) + failure);
        log();
        if (suites.length > 0) {
            var currentSuite = suites[suites.length - 1];
            currentSuite._countFail += suite._countFail;
            currentSuite._countPass += suite._countPass;
            currentSuite._countTotal += suite._countTotal;
        }
        else {
            clearTimeout(timer);
        }
    });
    runner.on('test', function (test) {
        forceOutput();
        var currentSuite = suites[suites.length - 1];
        currentSuite._countTotal++;
    });
    runner.on('fail', function (test, error) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countFail++;
        var countFail = currentSuite._countFail;
        if (countFail > 100) {
            if (countFail === 101) {
                log('[ Over 100 errors; skipping remaining suite output ]');
            }
            return;
        }
        if (countFail > 25) {
            log('Failure: ' + test.title + ' (too many errors; skipping dump)');
            return;
        }
        log('Failure: ' + test.title);
        error.toString().split('\n').forEach(function (line) {
            log('  ' + line);
        });
        Object.keys(error).forEach(function (key) {
            log('  ' + key + ': ' + error[key]);
        });
        if (error.stack) {
            log("Stack Trace:");
            error.stack.split('\n').forEach(function (line) {
                log('  ' + line);
            });
        }
    });
    runner.on('pass', function (test) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countPass++;
    });
}
exports.Reporter = Reporter;
