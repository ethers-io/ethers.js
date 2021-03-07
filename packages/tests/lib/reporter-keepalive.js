/* istanbul ignore file */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporterKeepAlive = void 0;
// Maximum time in seconds to suppress output
var MAX_DELAY = 60;
function getTime() {
    return (new Date()).getTime();
}
var stdoutWrite = process.stdout.write.bind(process.stdout);
var logOut = "";
var capturing = false;
function log(message) {
    if (message == null) {
        message = "";
    }
    if (capturing) {
        logOut += message;
    }
    else {
        console.log(message);
    }
}
function captureLog(initialLog) {
    capturing = true;
    if (initialLog == null) {
        initialLog = "";
    }
    logOut = initialLog;
    process.stdout.write = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        logOut += "*";
        return true;
    };
}
function releaseLog() {
    capturing = false;
    var result = logOut;
    process.stdout.write = stdoutWrite;
    logOut = "";
    return result;
}
function ReporterKeepAlive(runner) {
    var suites = 0;
    var fails = 0;
    var errors = [];
    // Catch anything attempting to write to the consolea
    captureLog();
    // Force Output; Keeps the console output alive with periodic updates
    var lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            var currentLog = releaseLog();
            console.log("# Keep Alive: " + currentLog);
            captureLog();
            lastOutput = getTime();
        }
    }
    var timer = setInterval(forceOutput, 1000);
    runner.on('suite', function (suite) {
        suites++;
        fails = 0;
        log("[");
    });
    runner.on('suite end', function () {
        suites--;
        log("]");
        if (suites === 0) {
            // Reset standard output
            var currentLog = releaseLog();
            if (logOut.length) {
                console.log("# Keep Alive: " + currentLog);
            }
            // Stop the keep-alive poller
            clearTimeout(timer);
            // Dump out any errors encountered
            console.log("#");
            if (errors.length) {
                console.log("# ---------------");
                errors.forEach(function (error, index) {
                    if (index > 0) {
                        console.log("#");
                    }
                    error.toString().split("\n").forEach(function (line) {
                        console.log("# " + line);
                    });
                });
            }
            console.log("# ---------------");
        }
    });
    runner.on('test', function (test) {
    });
    runner.on('fail', function (test, error) {
        fails++;
        if (fails < 10) {
            errors.push("Error #" + errors.length + " (" + test.title + "): " + error.message + "\n" + error.stack);
            log("!");
        }
    });
    runner.on('pass', function (test) {
    });
    runner.on('pending', function (test) {
        log("?");
    });
}
exports.ReporterKeepAlive = ReporterKeepAlive;
//# sourceMappingURL=reporter-keepalive.js.map