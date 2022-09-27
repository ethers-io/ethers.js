import { getBigInt, getNumber, hexlify, throwError, throwArgumentError } from "../utils/index.js";
import { AbstractProvider } from "./abstract-provider.js";
import { formatBlock, formatBlockWithTransactions, formatLog, formatTransactionReceipt, formatTransactionResponse } from "./format.js";
import { Network } from "./network.js";
//const BN_0 = BigInt("0");
const BN_1 = BigInt("1");
const BN_2 = BigInt("2");
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}
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
function normalize(provider, value, req) {
    switch (req.method) {
        case "chainId":
            return getBigInt(value).toString();
        case "getBlockNumber":
            return getNumber(value).toString();
        case "getGasPrice":
            return getBigInt(value).toString();
        case "getBalance":
            return getBigInt(value).toString();
        case "getTransactionCount":
            return getNumber(value).toString();
        case "getCode":
            return hexlify(value);
        case "getStorageAt":
            return hexlify(value);
        case "getBlock":
            if (req.includeTransactions) {
                return JSON.stringify(formatBlockWithTransactions(value));
            }
            return JSON.stringify(formatBlock(value));
        case "getTransaction":
            return JSON.stringify(formatTransactionResponse(value));
        case "getTransactionReceipt":
            return JSON.stringify(formatTransactionReceipt(value));
        case "call":
            return hexlify(value);
        case "estimateGas":
            return getBigInt(value).toString();
        case "getLogs":
            return JSON.stringify(value.map((v) => formatLog(v)));
    }
    return throwError("unsupported method", "UNSUPPORTED_OPERATION", {
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
function getFuzzyMode(quorum, results) {
    if (quorum === 1) {
        return getNumber(getMedian(results), "%internal");
    }
    const tally = new Map();
    const add = (result, weight) => {
        const t = tally.get(result) || { result, weight: 0 };
        t.weight += weight;
        tally.set(result, t);
    };
    for (const { weight, result } of results) {
        const r = getNumber(result);
        add(r - 1, weight);
        add(r, weight);
        add(r + 1, weight);
    }
    let bestWeight = 0;
    let bestResult = undefined;
    for (const { weight, result } of tally.values()) {
        // Use this result, if this result meets quorum and has either:
        // - a better weight
        // - or equal weight, but the result is larger
        if (weight >= quorum && (weight > bestWeight || (bestResult != null && weight === bestWeight && result > bestResult))) {
            bestWeight = weight;
            bestResult = result;
        }
    }
    return bestResult;
}
export class FallbackProvider extends AbstractProvider {
    //readonly providerConfigs!: ReadonlyArray<Required<Readonly<ProviderConfig>>>;
    quorum;
    eventQuorum;
    eventWorkers;
    #configs;
    #height;
    #initialSyncPromise;
    constructor(providers, network) {
        super(network);
        this.#configs = providers.map((p) => {
            if (p instanceof AbstractProvider) {
                return Object.assign({ provider: p }, defaultConfig, defaultState);
            }
            else {
                return Object.assign({}, defaultConfig, p, defaultState);
            }
        });
        this.#height = -2;
        this.#initialSyncPromise = null;
        this.quorum = 2; //Math.ceil(providers.length /  2);
        this.eventQuorum = 1;
        this.eventWorkers = 1;
        if (this.quorum > this.#configs.reduce((a, c) => (a + c.weight), 0)) {
            throwArgumentError("quorum exceed provider wieght", "quorum", this.quorum);
        }
    }
    // @TOOD: Copy these and only return public values
    get providerConfigs() {
        return this.#configs.slice();
    }
    async _detectNetwork() {
        return Network.from(getBigInt(await this._perform({ method: "chainId" })));
    }
    // @TODO: Add support to select providers to be the event subscriber
    //_getSubscriber(sub: Subscription): Subscriber {
    //    throw new Error("@TODO");
    //}
    // Grab the next (random) config that is not already part of configs
    #getNextConfig(configs) {
        // Shuffle the states, sorted by priority
        const allConfigs = this.#configs.slice();
        shuffle(allConfigs);
        allConfigs.sort((a, b) => (b.priority - a.priority));
        for (const config of allConfigs) {
            if (configs.indexOf(config) === -1) {
                return config;
            }
        }
        return null;
    }
    // Adds a new runner (if available) to running.
    #addRunner(running, req) {
        const config = this.#getNextConfig(Array.from(running).map((r) => r.config));
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
    }
    // Initializes the blockNumber and network for each runner and
    // blocks until initialized
    async #initialSync() {
        let initialSync = this.#initialSyncPromise;
        if (!initialSync) {
            const promises = [];
            this.#configs.forEach((config) => {
                promises.push(waitForSync(config, 0));
                promises.push((async () => {
                    config._network = await config.provider.getNetwork();
                })());
            });
            this.#initialSyncPromise = initialSync = (async () => {
                // Wait for all providers to have a block number and network
                await Promise.all(promises);
                // Check all the networks match
                let chainId = null;
                for (const config of this.#configs) {
                    const network = (config._network);
                    if (chainId == null) {
                        chainId = network.chainId;
                    }
                    else if (network.chainId !== chainId) {
                        throwError("cannot mix providers on different networks", "UNSUPPORTED_OPERATION", {
                            operation: "new FallbackProvider"
                        });
                    }
                }
            })();
        }
        await initialSync;
    }
    async #checkQuorum(running, req) {
        // Get all the result objects
        const results = [];
        for (const runner of running) {
            if ("result" in runner.result) {
                const result = runner.result.result;
                results.push({
                    result,
                    normal: normalize(runner.config.provider, result, req),
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
                // We need to get the bootstrap block height
                if (this.#height === -2) {
                    const height = Math.ceil(getNumber(getMedian(this.#configs.map((c) => ({
                        result: c.blockNumber,
                        normal: getNumber(c.blockNumber).toString(),
                        weight: c.weight
                    }))), "%internal"));
                    this.#height = height;
                }
                const mode = getFuzzyMode(this.quorum, results);
                if (mode === undefined) {
                    return undefined;
                }
                if (mode > this.#height) {
                    this.#height = mode;
                }
                return this.#height;
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
            case "broadcastTransaction":
                throw new Error("TODO");
        }
        return throwError("unsupported method", "UNSUPPORTED_OPERATION", {
            operation: `_perform(${JSON.stringify(req.method)})`
        });
    }
    async #waitForQuorum(running, req) {
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
        const value = await this.#checkQuorum(running, req);
        if (value !== undefined) {
            if (value instanceof Error) {
                throw value;
            }
            return value;
        }
        // Add any new runners, because a staller timed out or a result
        // or error response came in.
        for (let i = 0; i < newRunners; i++) {
            this.#addRunner(running, req);
        }
        if (interesting.length === 0) {
            throw new Error("quorum not met");
            //            return logger.throwError("failed to meet quorum", "", {
            //            });
        }
        // Wait for someone to either complete its perform or trigger a stall
        await Promise.race(interesting);
        return await this.#waitForQuorum(running, req);
    }
    async _perform(req) {
        await this.#initialSync();
        // Bootstrap enough to meet quorum
        const running = new Set();
        for (let i = 0; i < this.quorum; i++) {
            this.#addRunner(running, req);
        }
        const result = this.#waitForQuorum(running, req);
        for (const runner of running) {
            runner.done = true;
        }
        return result;
    }
}
//# sourceMappingURL=provider-fallback.js.map