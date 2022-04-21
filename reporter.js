'use strict';

const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

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
        this._prefixCount = 0;
        const stats = runner.stats;

        runner.once(EVENT_RUN_BEGIN, () => {

        }).on(EVENT_SUITE_BEGIN, (suite) => {
            if (suite.title.trim()) {
                this.log(`Suite: ${ suite.title }`)
            }
            this.increaseIndent();

        }).on(EVENT_SUITE_END, (suite) => {
            this.flush(true);
            this.decreaseIndent();
            if (suite.title.trim()) { this.log(""); }

        }).on(EVENT_TEST_PASS, (test) => {
            this.addPass(test.title);

        }).on(EVENT_TEST_FAIL, (test, error) => {
            this.flush();
            this._errors.push({ test, error });
            this.log(
                `    [ fail(${ this._errors.length }): ${ test.title } - ${error.message} ]`
            );

        }).once(EVENT_RUN_END, () => {
            this.flush(true);

            if (this._errors.length) {
                this._errors.forEach(({ test, error }, index) => {
                    console.log("---------------------");
                    console.log(`ERROR ${ index + 1 }: ${ test.title }`);
                    console.log(error);
                });
                console.log("=====================");
            }

            const { duration, passes, failures } = stats;
            const total = passes + failures;
            console.log(`Done: ${ passes }/${ total } passed (${ failures } failed)`);
        });
    }

    log(line) {
        this._lastLog = getTime();
        const indent = Array(this._indents).join('  ');
        console.log(`${ indent }${ line }`);
    }

    addPass(line) {
        const prefix = line.split(":")[0];
        if (prefix === this._lastPrefix) {
            this._prefixCount++;
            if (getTime() - this._lastLog > KEEP_ALIVE) {
                this.flush(false);
                this.log("    [ keep-alive: forced output ]")
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
        if (this._lastPrefix != null) {
            if (this._prefixCount === 1 && this._lastPrefixHeader == null) {
                this.log(this._lastLine);
            } else {
                if (this._lastPrefixHeader !== this._lastPrefix) {
                    this.log(`${ this._lastPrefix }:`);
                    this._lastPrefixHeader = this._lastPrefix;
                }
                this.log(`  - ${ this._prefixCount } tests passed (prefix coalesced)`);
            }
        }

        if (reset) {
            this._lastPrefixHeader = null;
            this._lastPrefix = null;
        }

        this._prefixCount = 0;
    }

    increaseIndent() { this._indents++; }

    decreaseIndent() { this._indents--; }
}

module.exports = MyReporter;
