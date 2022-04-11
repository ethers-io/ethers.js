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
var _FallbackProvider_instances, _FallbackProvider_configs, _FallbackProvider_initialSyncPromise, _FallbackProvider_getNextConfig, _FallbackProvider_addRunner, _FallbackProvider_initialSync, _FallbackProvider_checkQuorum, _FallbackProvider_waitForQuorum;
import { hexlify } from "@ethersproject/bytes";
import { AbstractProvider } from "./abstract-provider.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { shuffle } from "./shuffle.js";
//const BN_0 = BigInt("0");
const BN_1 = BigInt("1");
const BN_2 = BigInt("2");
function stall(duration) {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}
function getTime() { return (new Date()).getTime(); }
;
const defaultConfig = { stallTimeout: 400, priority: 1, weight: 1 };
const defaultState = {
    blockNumber: -2, requests: 0, lateResponses: 0, errorResponses: 0,
    outOfSync: -1, unsupportedEvents: 0, rollingDuration: 0, score: 0,
    _network: null, _updateNumber: null, _totalTime: 0
};
async function waitForSync(config, blockNumber) {
    while (config.blockNumber < 0 || config.blockNumber < blockNumber) {
        if (!config._updateNumber) {
            config._updateNumber = (async () => {
                const blockNumber = await config.provider.getBlockNumber();
                if (blockNumber > config.blockNumber) {
                    config.blockNumber = blockNumber;
                }
                config._updateNumber = null;
            })();
        }
        await config._updateNumber;
        config.outOfSync++;
    }
}
// Normalizes a result to a string that can be used to compare against
// other results using normal string equality
function normalize(network, value, req) {
    switch (req.method) {
        case "chainId":
            return logger.getBigInt(value).toString();
        case "getBlockNumber":
            return logger.getNumber(value).toString();
        case "getGasPrice":
            return logger.getBigInt(value).toString();
        case "getBalance":
            return logger.getBigInt(value).toString();
        case "getTransactionCount":
            return logger.getNumber(value).toString();
        case "getCode":
            return hexlify(value);
        case "getStorageAt":
            return hexlify(value);
        case "getBlock":
            if (req.includeTransactions) {
                return JSON.stringify(network.formatter.blockWithTransactions(value));
            }
            return JSON.stringify(network.formatter.block(value));
        case "getTransaction":
            return JSON.stringify(network.formatter.transactionResponse(value));
        case "getTransactionReceipt":
            return JSON.stringify(network.formatter.receipt(value));
        case "call":
            return hexlify(value);
        case "estimateGas":
            return logger.getBigInt(value).toString();
        case "getLogs":
            return JSON.stringify(value.map((v) => network.formatter.log(v)));
    }
    return logger.throwError("unsupported method", "UNSUPPORTED_OPERATION", {
        operation: `_perform(${JSON.stringify(req.method)})`
    });
}
// This strategy picks the highest wieght result, as long as the weight is
// equal to or greater than quorum
function checkQuorum(quorum, results) {
    const tally = new Map();
    for (const { result, normal, weight } of results) {
        const t = tally.get(normal) || { result, weight: 0 };
        t.weight += weight;
        tally.set(normal, t);
    }
    let bestWeight = 0;
    let bestResult = undefined;
    for (const { weight, result } of tally.values()) {
        if (weight >= quorum && weight > bestWeight) {
            bestWeight = weight;
            bestResult = result;
        }
    }
    return bestResult;
}
/*
function getMean(results: Array<TallyResult>): bigint {
    const total = results.reduce((a, r) => (a + BigInt(r.result)), BN_0);
    return total / BigInt(results.length);
}
*/
function getMedian(results) {
    // Get the sorted values
    const values = results.map((r) => BigInt(r.result));
    values.sort((a, b) => ((a < b) ? -1 : (b > a) ? 1 : 0));
    const mid = values.length / 2;
    // Odd-length; take the middle value
    if (values.length % 2) {
        return values[mid];
    }
    // Even length; take the ceiling of the mean of the center two values
    return (values[mid - 1] + values[mid] + BN_1) / BN_2;
}
export class FallbackProvider extends AbstractProvider {
    constructor(providers, network) {
        super(network);
        _FallbackProvider_instances.add(this);
        _FallbackProvider_configs.set(this, void 0);
        _FallbackProvider_initialSyncPromise.set(this, void 0);
        __classPrivateFieldSet(this, _FallbackProvider_configs, providers.map((p) => {
            if (p instanceof AbstractProvider) {
                return Object.assign({ provider: p }, defaultConfig, defaultState);
            }
            else {
                return Object.assign({}, defaultConfig, p, defaultState);
            }
        }), "f");
        __classPrivateFieldSet(this, _FallbackProvider_initialSyncPromise, null, "f");
        this.quorum = 2; //Math.ceil(providers.length /  2);
        this.eventQuorum = 1;
        this.eventWorkers = 1;
        if (this.quorum > __classPrivateFieldGet(this, _FallbackProvider_configs, "f").reduce((a, c) => (a + c.weight), 0)) {
            logger.throwArgumentError("quorum exceed provider wieght", "quorum", this.quorum);
        }
    }
    async _detectNetwork() {
        return Network.from(logger.getBigInt(await this._perform({ method: "chainId" }))).freeze();
    }
    _getSubscriber(sub) {
        throw new Error("@TODO");
    }
    async _perform(req) {
        await __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_initialSync).call(this);
        // Bootstrap enough to meet quorum
        const running = new Set();
        for (let i = 0; i < this.quorum; i++) {
            __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_addRunner).call(this, running, req);
        }
        const result = __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_waitForQuorum).call(this, running, req);
        for (const runner of running) {
            runner.done = true;
        }
        return result;
    }
}
_FallbackProvider_configs = new WeakMap(), _FallbackProvider_initialSyncPromise = new WeakMap(), _FallbackProvider_instances = new WeakSet(), _FallbackProvider_getNextConfig = function _FallbackProvider_getNextConfig(configs) {
    // Shuffle the states, sorted by priority
    const allConfigs = __classPrivateFieldGet(this, _FallbackProvider_configs, "f").slice();
    shuffle(allConfigs);
    allConfigs.sort((a, b) => (b.priority - a.priority));
    for (const config of allConfigs) {
        if (configs.indexOf(config) === -1) {
            return config;
        }
    }
    return null;
}, _FallbackProvider_addRunner = function _FallbackProvider_addRunner(running, req) {
    const config = __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_getNextConfig).call(this, Array.from(running).map((r) => r.config));
    if (config == null) {
        return null;
    }
    const result = {};
    const runner = {
        config, result, didBump: false, done: false,
        perform: null, staller: null
    };
    const now = getTime();
    runner.perform = (async () => {
        try {
            config.requests++;
            result.result = await config.provider._perform(req);
        }
        catch (error) {
            config.errorResponses++;
            result.error = error;
        }
        if (runner.done) {
            config.lateResponses++;
        }
        const dt = (getTime() - now);
        config._totalTime += dt;
        config.rollingDuration = 0.95 * config.rollingDuration + 0.05 * dt;
        runner.perform = null;
    })();
    runner.staller = (async () => {
        await stall(config.stallTimeout);
        runner.staller = null;
    })();
    running.add(runner);
    return runner;
}, _FallbackProvider_initialSync = 
// Initializes the blockNumber and network for each runner and
// blocks until initialized
async function _FallbackProvider_initialSync() {
    let initialSync = __classPrivateFieldGet(this, _FallbackProvider_initialSyncPromise, "f");
    if (!initialSync) {
        const promises = [];
        __classPrivateFieldGet(this, _FallbackProvider_configs, "f").forEach((config) => {
            promises.push(waitForSync(config, 0));
            promises.push((async () => {
                config._network = await config.provider.getNetwork();
            })());
        });
        __classPrivateFieldSet(this, _FallbackProvider_initialSyncPromise, initialSync = (async () => {
            // Wait for all providers to have a block number and network
            await Promise.all(promises);
            // Check all the networks match
            let chainId = null;
            for (const config of __classPrivateFieldGet(this, _FallbackProvider_configs, "f")) {
                const network = (config._network);
                if (chainId == null) {
                    chainId = network.chainId;
                }
                else if (network.chainId !== chainId) {
                    logger.throwError("cannot mix providers on different networks", "UNSUPPORTED_OPERATION", {
                        operation: "new FallbackProvider"
                    });
                }
            }
        })(), "f");
    }
    await initialSync;
}, _FallbackProvider_checkQuorum = async function _FallbackProvider_checkQuorum(running, req) {
    // Get all the result objects
    const results = [];
    for (const runner of running) {
        if ("result" in runner.result) {
            const result = runner.result.result;
            results.push({
                result,
                normal: normalize((runner.config._network), result, req),
                weight: runner.config.weight
            });
        }
    }
    // Are there enough results to event meet quorum?
    if (results.reduce((a, r) => (a + r.weight), 0) < this.quorum) {
        return undefined;
    }
    switch (req.method) {
        case "getBlockNumber": {
            throw new Error("TODO");
        }
        case "getGasPrice":
        case "estimateGas":
            return getMedian(results);
        case "getBlock":
            // Pending blocks are mempool dependant and already
            // quite untrustworthy
            if ("blockTag" in req && req.blockTag === "pending") {
                return results[0].result;
            }
            return checkQuorum(this.quorum, results);
        case "chainId":
        case "getBalance":
        case "getTransactionCount":
        case "getCode":
        case "getStorageAt":
        case "getTransaction":
        case "getTransactionReceipt":
        case "getLogs":
            return checkQuorum(this.quorum, results);
        case "call":
            // @TODO: Check errors
            return checkQuorum(this.quorum, results);
        case "sendTransaction":
            throw new Error("TODO");
    }
    return logger.throwError("unsupported method", "UNSUPPORTED_OPERATION", {
        operation: `_perform(${JSON.stringify(req.method)})`
    });
}, _FallbackProvider_waitForQuorum = async function _FallbackProvider_waitForQuorum(running, req) {
    if (running.size === 0) {
        throw new Error("no runners?!");
    }
    // Any promises that are interesting to watch for; an expired stall
    // or a successful perform
    const interesting = [];
    //const results: Array<any> = [ ];
    //const errors: Array<Error> = [ ];
    let newRunners = 0;
    for (const runner of running) {
        // @TODO: use runner.perfom != null
        /*
      if ("result" in runner.result) {
          results.push(runner.result.result);
      } else if ("error" in runner.result) {
          errors.push(runner.result.error);
      }
*/
        // No responses, yet; keep an eye on it
        if (runner.perform) {
            interesting.push(runner.perform);
        }
        // Still stalling...
        if (runner.staller) {
            interesting.push(runner.staller);
            continue;
        }
        // This runner has already triggered another runner
        if (runner.didBump) {
            continue;
        }
        // Got a response (result or error) or stalled; kick off another runner
        runner.didBump = true;
        newRunners++;
    }
    // Check for quorum
    /*
    console.log({ results, errors } );
    if (results.length >= this.quorum) {
        return results[0];
    }

    if (errors.length >= this.quorum) {
        return errors[0];
    }
    */
    const value = await __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_checkQuorum).call(this, running, req);
    if (value !== undefined) {
        if (value instanceof Error) {
            throw value;
        }
        return value;
    }
    // Add any new runners, because a staller timed out or a result
    // or error response came in.
    for (let i = 0; i < newRunners; i++) {
        __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_addRunner).call(this, running, req);
    }
    if (interesting.length === 0) {
        throw new Error("quorum not met");
        //            return logger.throwError("failed to meet quorum", "", {
        //            });
    }
    // Wait for someone to either complete its perform or trigger a stall
    await Promise.race(interesting);
    return await __classPrivateFieldGet(this, _FallbackProvider_instances, "m", _FallbackProvider_waitForQuorum).call(this, running, req);
};
//# sourceMappingURL=provider-fallback.js.map