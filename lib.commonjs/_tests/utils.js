"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryIt = exports.stall = exports.log = exports.loadTests = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
// Find the package root (based on the nyc output/ folder)
const root = (function () {
    let root = process.cwd();
    while (true) {
        if (fs_1.default.existsSync(path_1.default.join(root, "output"))) {
            return root;
        }
        const parent = path_1.default.join(root, "..");
        if (parent === root) {
            break;
        }
        root = parent;
    }
    throw new Error("could not find root");
})();
// Load the tests
function loadTests(tag) {
    const filename = path_1.default.resolve(root, "testcases", tag + ".json.gz");
    return JSON.parse(zlib_1.default.gunzipSync(fs_1.default.readFileSync(filename)).toString());
}
exports.loadTests = loadTests;
function log(context, text) {
    if (context && context.test && typeof (context.test._ethersLog) === "function") {
        context.test._ethersLog(text);
    }
    else {
        console.log(text);
    }
}
exports.log = log;
async function stall(duration) {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}
exports.stall = stall;
const ATTEMPTS = 5;
async function retryIt(name, func) {
    //const errors: Array<Error> = [ ];
    it(name, async function () {
        this.timeout(ATTEMPTS * 5000);
        for (let i = 0; i < ATTEMPTS; i++) {
            try {
                await func.call(this);
                return;
            }
            catch (error) {
                if (error.message === "sync skip; aborting execution") {
                    // Skipping a test; let mocha handle it
                    throw error;
                }
                else if (error.code === "ERR_ASSERTION") {
                    // Assertion error; let mocha scold us
                    throw error;
                }
                else {
                    //errors.push(error);
                    if (i === ATTEMPTS - 1) {
                        throw error;
                        //stats.pushRetry(i, name, error);
                    }
                    else {
                        await stall(500 * (1 << i));
                        //stats.pushRetry(i, name, null);
                    }
                }
            }
        }
        // All hope is lost.
        throw new Error(`Failed after ${ATTEMPTS} attempts; ${name}`);
    });
}
exports.retryIt = retryIt;
/*
export interface StatSet {
    name: string;
    retries: Array<{ message: string, error: null | Error }>;
}

const _guard = { };

export class Stats {
//    #stats: Array<StatSet>;

    constructor(guard: any) {
        if (guard !== _guard) { throw new Error("private constructor"); }
//        this.#stats = [ ];
    }

    #currentStats(): StatSet {
        if (this.#stats.length === 0) { throw new Error("no active stats"); }
        return this.#stats[this.#stats.length - 1];
    }

    pushRetry(attempt: number, line: string, error: null | Error): void {
        const { retries } = this.#currentStats();

        if (attempt > 0) { retries.pop(); }
        if (retries.length < 100) {
            retries.push({
                message: `${ attempt + 1 } failures: ${ line }`,
                error
            });
        }
    }

    start(name: string): void {
        this.#stats.push({ name, retries: [ ] });
    }

    end(context?: any): void {
        let log = console.log.bind(console);
        if (context && typeof(context._ethersLog) === "function") {
            log = context._ethersLog;
        }
        const { name, retries } = this.#currentStats();
        if (retries.length === 0) { return; }
        log(`Warning: The following tests required retries (${ name })`);
        retries.forEach(({ error, message }) => {
            log("  " + message);
            if (error) { log(error); }
        });
    }
}

export const stats = new Stats(_guard);
*/
//# sourceMappingURL=utils.js.map