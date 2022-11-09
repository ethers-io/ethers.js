'use strict';

/* c8 ignore start */

const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;


// See: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
let disableColor = false; //!(process.stdout.isTTY);
process.argv.forEach((arg) => {
    if (arg === "--no-color") { disableColor = true; }
});

const Colors = {
    "blue":     "\x1b[0;34m",
    "blue+":    "\x1b[0;1;34m",
    "cyan":     "\x1b[0;36m",
    "cyan+":    "\x1b[0;1;36m",
    "green":    "\x1b[0;32m",
    "green+":   "\x1b[0;1;32m",
    "magenta-":  "\x1b[0;2;35m",
    "magenta":  "\x1b[0;35m",
    "magenta+": "\x1b[0;1;35m",
    "red":      "\x1b[0;31m",
    "red+":     "\x1b[0;1;31m",
    "yellow":   "\x1b[0;33m",
    "yellow+":  "\x1b[0;1;33m",
    "dim":     "\x1b[0;2;37m",
    "bold":     "\x1b[0;1;37m",
    "normal":   "\x1b[0m"
};

function colorify(text) {
    return unescapeColor(text.replace(/(<([a-z+]+)>)/g, (all, _, color) => {
        if (disableColor) { return ""; }

        const seq = Colors[color];
        if (seq == null) {
            console.log("UNKNOWN COLOR:", color);
            return "";
        }
        return seq;
    })) + (disableColor ? "": Colors.normal);
}

function escapeColor(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unescapeColor(text) {
    return text.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

function getString(value) {
    if (value instanceof Error) {
        return value.stack;
    }
    return String(value);
}

// To prevent environments from thinking we're dead due to lack of
// output, we force output after 20s
function getTime() { return (new Date()).getTime(); }
const KEEP_ALIVE = 20 * 1000;

// this reporter outputs test results, indenting two spaces per suite
class MyReporter {
    constructor(runner) {
        this._errors = [ ];
        this._indents = 1;
        this._lastLog = getTime();
        this._lastPass = "";
        this._lastPrefix = null;
        this._lastPrefixHeader = null;
        this._testLogs = [ ];
        this._suiteLogs = [ ];
        this._prefixCount = 0;
        const stats = runner.stats;

        runner.once(EVENT_RUN_BEGIN, () => {

        }).on(EVENT_SUITE_BEGIN, (suite) => {
            this._suiteLogs.push([ ]);
            suite._ethersLog = (text) => {
                this._suiteLogs[this._suiteLogs.length - 1].push(getString(text))
            };
            if (suite.title.trim()) {
                this.log(`<blue+>Suite: ${ escapeColor(suite.title) }`)
            }
            this.increaseIndent();

        }).on(EVENT_SUITE_END, (suite) => {
            this.flush(true);
            this.decreaseIndent();
            const logs = this._suiteLogs.pop();
            if (logs.length) {
                logs.join("\n").split("\n").forEach((line) => {
                    this.log(`  <magenta+>&gt;&gt; <dim>${ escapeColor(line) }`);
                });
            }
            if (suite.title.trim()) { this.log(""); }

        }).on(EVENT_TEST_BEGIN, (test) => {
            this._testLogs.push([ ]);
            test._ethersLog = (text) => {
                this._testLogs[this._testLogs.length - 1].push(getString(text))
            };

        }).on(EVENT_TEST_END, (test) => {
            const logs = this._testLogs.pop();
            if (logs.length) {
                this.flush(false);
                logs.join("\n").split("\n").forEach((line) => {
                    this.log(`  <cyan+>&gt;&gt; <cyan->${ escapeColor(line) }`);
                });
            }

        }).on(EVENT_TEST_PASS, (test) => {
            this.addPass(test.title);

        }).on(EVENT_TEST_FAIL, (test, error) => {
            this.flush();
            this._errors.push({ test, error });
            this.log(
                `    [ <red+>fail(${ this._errors.length }): <red>${ escapeColor(test.title) } - <normal>${ escapeColor(error.message) } ]`
            );

        }).once(EVENT_RUN_END, () => {
            this.flush(true);
            this.indent = 0;

            if (this._errors.length) {
                this._errors.forEach(({ test, error }, index) => {
                    this.log("<cyan+>---------------------");
                    this.log(`<red+>ERROR ${ index + 1 }: <red>${ escapeColor(test.title) }`);
                    this.log(escapeColor(error.toString()));
                });
                this.log("<cyan+>=====================");
            }

            const { duration, passes, failures } = stats;
            const total = passes + failures;
            this.log(`<bold>Done: <green+>${ passes }<green>/${ total } passed <red>(<red+>${ failures } <red>failed)`);
        });
    }

    log(line) {
        this._lastLog = getTime();
        const indent = Array(this._indents).join('  ');
        console.log(`${ indent }${ colorify(line) }`);
    }

    addPass(line) {
        const prefix = line.split(":")[0];
        if (prefix === this._lastPrefix) {
            this._prefixCount++;
            if (getTime() - this._lastLog > KEEP_ALIVE) {
                const didLog = this.flush(false);
                // Nothing was output, so show *something* so the
                // environment knows we're still alive and kicking
                if (!didLog) {
                    this.log("    <yellow>[ keep-alive; forced output ]")
                }
            }
        } else {
            this.flush(true);
            this._lastPrefixHeader = null;
            this._lastPrefix = prefix;
            this._prefixCount = 1;
        }
        this._lastLine = line;
    }

    flush(reset) {
        let didLog = false;
        if (this._lastPrefix != null) {
            if (this._prefixCount === 1 && this._lastPrefixHeader == null) {
                this.log(escapeColor(this._lastLine));
                didLog = true;
            } else if (this._prefixCount > 0) {
                if (this._lastPrefixHeader !== this._lastPrefix) {
                    this.log(`<cyan>${ escapeColor(this._lastPrefix) }:`);
                    this._lastPrefixHeader = this._lastPrefix;
                }
                this.log(`  - ${ this._prefixCount } tests passed (prefix coalesced)`);
                didLog = true;
            }
        }

        if (reset) {
            this._lastPrefixHeader = null;
            this._lastPrefix = null;
        }

        this._prefixCount = 0;

        return didLog;
    }

    increaseIndent() { this._indents++; }

    decreaseIndent() { this._indents--; }
}

module.exports = MyReporter;

/* c8 ignore stop */
