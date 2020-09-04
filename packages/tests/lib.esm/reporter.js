/* istanbul ignore file */
'use strict';
// Maximum time in seconds to suppress output
const MAX_DELAY = 30;
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
    let ds = trunc((getTime() - t0) / 1000);
    let minutes = trunc(ds / 60);
    let seconds = String(trunc(ds) % 60);
    while (seconds.length < 2) {
        seconds = '0' + seconds;
    }
    return '(' + minutes + ':' + seconds + ')';
}
let _logFunc = console.log.bind(console);
export function setLogFunc(logFunc) {
    _logFunc = logFunc;
}
export function Reporter(runner) {
    let suites = [];
    // Force Output; Keeps the console output alive with periodic updates
    let lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            const currentSuite = suites[suites.length - 1];
            log(`[ Still running suite - test # ${(currentSuite ? currentSuite._countTotal : "0")} ]`);
        }
    }
    const timer = setInterval(forceOutput, 1000);
    function getIndent() {
        let result = '';
        for (let i = 0; i < suites.length; i++) {
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
            let filename = (suite.file || '').split('/').pop();
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
        let suite = suites.pop();
        let extras = [];
        if (suite._countSkip) {
            extras.push(suite._countSkip + " skipped");
        }
        if (suite._countTotal > suite._countPass) {
            extras.push((suite._countTotal - suite._countPass) + " failed");
        }
        let extra = "";
        if (extras.length) {
            extra = " (" + extras.join(",") + ")  ******** WARNING! ********";
        }
        log(`  Total Tests: ${suite._countPass}/${suite._countTotal} passed ${getDelta(suite._t0)} ${extra} \n`);
        if (suites.length > 0) {
            let currentSuite = suites[suites.length - 1];
            currentSuite._countFail += suite._countFail;
            currentSuite._countPass += suite._countPass;
            currentSuite._countSkip += suite._countSkip;
            currentSuite._countTotal += suite._countTotal;
        }
        else {
            clearTimeout(timer);
            const status = (suite._countPass === suite._countTotal) ? 0 : 1;
            log(`# status:${status}`);
            // Force quit after 5s
            setTimeout(() => {
                process.exit(status);
            }, 5000);
        }
    });
    runner.on('test', function (test) {
        forceOutput();
        if (test._currentRetry === 0) {
            const currentSuite = suites[suites.length - 1];
            currentSuite._countTotal++;
        }
    });
    runner.on('fail', function (test, error) {
        let currentSuite = suites[suites.length - 1];
        currentSuite._countFail++;
        let countFail = currentSuite._countFail;
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
        error.toString().split('\n').forEach((line) => {
            log('  ' + line);
        });
        Object.keys(error).forEach(function (key) {
            log('  ' + key + ': ' + error[key]);
        });
        if (error.stack) {
            log("Stack Trace:");
            error.stack.split('\n').forEach((line) => {
                log('  ' + line);
            });
        }
    });
    runner.on('pass', function (test) {
        let currentSuite = suites[suites.length - 1];
        currentSuite._countPass++;
    });
    runner.on('pending', function (test) {
        let currentSuite = suites[suites.length - 1];
        currentSuite._countSkip++;
    });
}
//# sourceMappingURL=reporter.js.map