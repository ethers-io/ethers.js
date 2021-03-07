/* istanbul ignore file */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = exports.setLogFunc = void 0;
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
var _logFunc = console.log.bind(console);
function setLogFunc(logFunc) {
    _logFunc = logFunc;
}
exports.setLogFunc = setLogFunc;
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
        _logFunc(getIndent() + message);
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
        suite._countSkip = 0;
        suite._countTotal = 0;
    });
    runner.on('suite end', function () {
        var suite = suites.pop();
        var extras = [];
        if (suite._countSkip) {
            extras.push(suite._countSkip + " skipped");
        }
        if (suite._countTotal > suite._countPass) {
            extras.push((suite._countTotal - suite._countPass) + " failed");
        }
        var extra = "";
        if (extras.length) {
            extra = " (" + extras.join(",") + ")  ******** WARNING! ********";
        }
        log("  Total Tests: " + suite._countPass + "/" + suite._countTotal + " passed " + getDelta(suite._t0) + " " + extra + " \n");
        if (suites.length > 0) {
            var currentSuite = suites[suites.length - 1];
            currentSuite._countFail += suite._countFail;
            currentSuite._countPass += suite._countPass;
            currentSuite._countSkip += suite._countSkip;
            currentSuite._countTotal += suite._countTotal;
        }
        else {
            clearTimeout(timer);
            var status_1 = (suite._countPass === suite._countTotal) ? 0 : 1;
            log("# status:" + status_1);
            // Force quit after 5s
            setTimeout(function () {
                process.exit(status_1);
            }, 5000);
        }
    });
    runner.on('test', function (test) {
        forceOutput();
        if (test._currentRetry === 0) {
            var currentSuite = suites[suites.length - 1];
            currentSuite._countTotal++;
        }
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
    runner.on('pending', function (test) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countSkip++;
    });
}
exports.Reporter = Reporter;
//# sourceMappingURL=reporter.js.map