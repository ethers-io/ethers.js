var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Stats_instances, _Stats_stats, _Stats_currentStats;
import fs from "fs";
import path from "path";
import zlib from 'zlib';
// Find the package root (based on the nyc output/ folder)
const root = (function () {
    let root = process.cwd();
    while (true) {
        if (fs.existsSync(path.join(root, "output"))) {
            return root;
        }
        const parent = path.join(root, "..");
        if (parent === root) {
            break;
        }
        root = parent;
    }
    throw new Error("could not find root");
})();
// Load the tests
export function loadTests(tag) {
    const filename = path.resolve(root, "testcases", tag + '.json.gz');
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}
async function stall(duration) {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}
const ATTEMPTS = 5;
export async function retryIt(name, func) {
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
                    if (i === ATTEMPTS - 1) {
                        stats.pushRetry(i, name, error);
                    }
                    else {
                        await stall(500 * (1 << i));
                        stats.pushRetry(i, name, null);
                    }
                }
            }
        }
        // All hope is lost.
        throw new Error(`Failed after ${ATTEMPTS} attempts; ${name}`);
    });
}
const _guard = {};
export class Stats {
    constructor(guard) {
        _Stats_instances.add(this);
        _Stats_stats.set(this, void 0);
        if (guard !== _guard) {
            throw new Error("private constructor");
        }
        __classPrivateFieldSet(this, _Stats_stats, [], "f");
    }
    pushRetry(attempt, line, error) {
        const { retries } = __classPrivateFieldGet(this, _Stats_instances, "m", _Stats_currentStats).call(this);
        if (attempt > 0) {
            retries.pop();
        }
        if (retries.length < 100) {
            retries.push({
                message: `${attempt + 1} failures: ${line}`,
                error
            });
        }
    }
    start(name) {
        __classPrivateFieldGet(this, _Stats_stats, "f").push({ name, retries: [] });
    }
    end() {
        const { name, retries } = __classPrivateFieldGet(this, _Stats_instances, "m", _Stats_currentStats).call(this);
        if (retries.length === 0) {
            return;
        }
        console.log(`Warning: The following tests required retries (${name})`);
        retries.forEach(({ error, message }) => {
            console.log("  " + message);
            if (error) {
                console.log(error);
            }
        });
    }
}
_Stats_stats = new WeakMap(), _Stats_instances = new WeakSet(), _Stats_currentStats = function _Stats_currentStats() {
    if (__classPrivateFieldGet(this, _Stats_stats, "f").length === 0) {
        throw new Error("no active stats");
    }
    return __classPrivateFieldGet(this, _Stats_stats, "f")[__classPrivateFieldGet(this, _Stats_stats, "f").length - 1];
};
export const stats = new Stats(_guard);
//# sourceMappingURL=utils.js.map