/* istanbul ignore file */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Maximum time in seconds to suppress output
var MAX_DELAY = 30;
function getTime() {
    return (new Date()).getTime();
}
function ReporterKeepAlive(runner) {
    var suites = 0;
    var fails = 0;
    var errors = [];
    var stdoutWrite = process.stdout.write.bind(process.stdout);
    //process.stdout.write = function(buffer: string | Uint8Array, cb?: (err?: Error) => void): boolean {
    process.stdout.write = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return stdoutWrite("*");
    };
    // Force Output; Keeps the console output alive with periodic updates
    var lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            log(".");
        }
    }
    var timer = setInterval(forceOutput, 1000);
    function log(message) {
        stdoutWrite(message);
        lastOutput = getTime();
    }
    runner.on('suite', function (suite) {
        suites++;
        fails = 0;
        log("[");
    });
    runner.on('suite end', function () {
        suites--;
        log("]");
        if (suites === 0) {
            process.stdout.write = stdoutWrite;
            clearTimeout(timer);
            console.log("");
            if (errors.length) {
                console.log("---------------");
                errors.forEach(function (error, index) {
                    if (index > 0) {
                        console.log("");
                    }
                    console.log(error);
                });
            }
            console.log("---------------");
        }
    });
    runner.on('test', function (test) {
        forceOutput();
    });
    runner.on('fail', function (test, error) {
        fails++;
        if (fails < 10) {
            errors.push("Error #" + errors.length + " (" + test.title + "): " + error.message + "\n" + error.stack);
            log("!");
        }
    });
    runner.on('pass', function (test) {
        forceOutput();
    });
    runner.on('pending', function (test) {
        log("?");
    });
}
exports.ReporterKeepAlive = ReporterKeepAlive;
//# sourceMappingURL=reporter-keepalive.js.map