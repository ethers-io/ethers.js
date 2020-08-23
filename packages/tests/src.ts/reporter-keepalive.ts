/* istanbul ignore file */

'use strict';

// Maximum time in seconds to suppress output
const MAX_DELAY = 60;

function getTime(): number {
    return (new Date()).getTime();
}

interface Suite {
    title: string;
    file: string;
    suites: Array<Suite>;
}

interface Runner {
  on(event: string, callback: (...args: Array<any>) => void): Runner;
}

const stdoutWrite = process.stdout.write.bind(process.stdout);
let logOut = "";
let capturing = false;

function log(message?: string): void {
    if (message == null) { message = ""; }
    if (capturing) {
        logOut += message;
    } else {
        console.log(message);
    }
}

function captureLog(initialLog?: string): void {
    capturing = true;

    if (initialLog == null) { initialLog = ""; }
    logOut = initialLog

    process.stdout.write = function(...args: Array<any>): boolean {
        logOut += "*";
        return true;
    }
}

function releaseLog(): string {
    capturing = false;

    const result = logOut;
    process.stdout.write = stdoutWrite;
    logOut = "";

    return result;
}

export function ReporterKeepAlive(runner: Runner) {
    let suites = 0;
    let fails = 0;
    const errors: Array<string> = [ ];

    // Catch anything attempting to write to the consolea
    captureLog();

    // Force Output; Keeps the console output alive with periodic updates
    let lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            let currentLog = releaseLog();
            console.log(`# Keep Alive: ${ currentLog }`);
            captureLog();
            lastOutput = getTime();
        }
    }
    const timer = setInterval(forceOutput, 1000);

    runner.on('suite', function(suite: Suite) {
        suites++;
        fails = 0;
        log("[");
    });

    runner.on('suite end', function() {
        suites--;
        log("]");

        if (suites === 0) {
            // Reset standard output
            const currentLog = releaseLog();

            if (logOut.length) {
                console.log(`# Keep Alive: ${ currentLog }`);
            }

            // Stop the keep-alive poller
            clearTimeout(timer);

            // Dump out any errors encountered
            console.log("#")
            if (errors.length) {
                console.log("# ---------------")
                errors.forEach((error, index) => {
                    if (index > 0) { console.log("#"); }
                    error.toString().split("\n").forEach((line) => {
                        console.log(`# ${ line }`);
                    });
                });
            }
            console.log("# ---------------")
        }
    });

    runner.on('test', function(test) {
    });

    runner.on('fail', function(test, error) {
        fails++;
        if (fails < 10) {
            errors.push(`Error #${ errors.length } (${ test.title }): ${ error.message }\n${ error.stack }`);
            log("!");
        }
    });

    runner.on('pass', function(test) {
    });

    runner.on('pending', function(test) {
        log("?");
    });
}

