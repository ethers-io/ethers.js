"use strict";

import { Network } from "@ethersproject/networks";
import { Block, BlockWithTransactions, Provider } from "@ethersproject/abstract-provider";
import { shuffled } from "@ethersproject/random";
import { deepCopy, defineReadOnly, shallowCopy } from "@ethersproject/properties";
import { BigNumber } from "@ethersproject/bignumber";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { BaseProvider } from "./base-provider";

function now() { return (new Date()).getTime(); }

// Returns to network as long as all agree, or null if any is null.
// Throws an error if any two networks do not match.
function checkNetworks(networks: Array<Network>): Network {
    let result = null;

    for (let i = 0; i < networks.length; i++) {
        const network = networks[i];

        // Null! We do not know our network; bail.
        if (network == null) { return null; }

        if (result) {
            // Make sure the network matches the previous networks
            if (!(result.name === network.name && result.chainId === network.chainId &&
                ((result.ensAddress === network.ensAddress) || (result.ensAddress == null && network.ensAddress == null)))) {

                logger.throwArgumentError("provider mismatch", "networks", networks);
           }
        } else {
            result = network;
        }
    }

    return result;
}

function median(values: Array<number>): number {
        values = values.slice().sort();
        const middle = Math.floor(values.length / 2);

        // Odd length; take the middle
        if (values.length % 2) {
            return values[middle];
        }

        // Even length; take the average of the two middle
        const a = values[middle - 1], b = values[middle];
        return (a + b) / 2;
}

function serialize(value: any): string {
    if (value === null) {
        return "null";
    } else if (typeof(value) === "number" || typeof(value) === "boolean") {
        return JSON.stringify(value);
    } else if (typeof(value) === "string") {
        return value;
    } else if (BigNumber.isBigNumber(value)) {
        return value.toString();
    } else if (Array.isArray(value)) {
        return JSON.stringify(value.map((i) => serialize(i)));
    } else if (typeof(value) === "object") {
        const keys = Object.keys(value);
        keys.sort();
        return "{" + keys.map((key) => {
            let v = value[key];
            if (typeof(v) === "function") {
                v = "[function]";
            } else {
                v = serialize(v);
            }
            return JSON.stringify(key) + ":" + v;
        }).join(",") + "}";
    }

    throw new Error("unknown value type: " + typeof(value));
}

// Next request ID to use for emitting debug info
let nextRid = 1;


export interface FallbackProviderConfig {
    // The Provider
    provider: Provider;

    // The priority to favour this Provider; higher values are used first
    priority?: number;

    // Timeout before also triggering the next provider; this does not stop
    // this provider and if its result comes back before a quorum is reached
    // it will be used it will be used.
    // - lower values will cause more network traffic but may result in a
    //   faster retult.
    stallTimeout?: number;

    // How much this provider contributes to the quorum; sometimes a specific
    // provider may be more reliable or trustworthy than others, but usually
    // this should be left as the default
    weight?: number;
};

// Returns a promise that delays for duration
function stall(duration: number): Promise<void> {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, duration);
        if (timer.unref) { timer.unref(); }
    });
}

interface RunningConfig extends FallbackProviderConfig {
    start?: number;
    done?: boolean;
    runner?: Promise<any>;
    staller?: Promise<void>;
    result?: any;
    error?: Error;
};

function exposeDebugConfig(config: RunningConfig, now?: number): any {
    const result: any = {
        provider: config.provider,
        weight: config.weight
    };
    if (config.start) { result.start = config.start; }
    if (now) { result.duration = (now - config.start); }
    if (config.done) {
        if (config.error) {
            result.error = config.error;
        } else {
            result.result = config.result || null;
        }
    }
    return result;
}

function normalizedTally(normalize: (value: any) => string, quorum: number): (configs: Array<RunningConfig>) => any {
    return function(configs: Array<RunningConfig>): any {

        // Count the votes for each result
        const tally: { [ key: string]: { count: number, result: any } } = { };
        configs.forEach((c) => {
            const value = normalize(c.result);
            if (!tally[value]) { tally[value] = { count: 0, result: c.result }; }
            tally[value].count++;
        });

        // Check for a quorum on any given result
        const keys = Object.keys(tally);
        for (let i = 0; i < keys.length; i++) {
            const check = tally[keys[i]];
            if (check.count >= quorum) {
                return check.result;
            }
        }

        // No quroum
        return undefined;
    }
}
function getProcessFunc(provider: FallbackProvider, method: string, params: { [ key: string ]: any }): (configs: Array<RunningConfig>) => any {

    let normalize = serialize;

    switch (method) {
        case "getBlockNumber":
            // Return the median value, unless there is (median + 1) is also
            // present, in which case that is probably true and the median
            // is going to be stale soon. In the event of a malicious node,
            // the lie will be true soon enough.
            return function(configs: Array<RunningConfig>): number {
                const values = configs.map((c) => c.result);

                // Get the median block number
                let blockNumber = Math.ceil(median(configs.map((c) => c.result)));

                // If the next block height is present, its prolly safe to use
                if (values.indexOf(blockNumber + 1) >= 0) { blockNumber++; }

                // Don't ever roll back the blockNumber
                if (blockNumber >= provider._highestBlockNumber) {
                    provider._highestBlockNumber = blockNumber;
                }

                return provider._highestBlockNumber;
            };

        case "getGasPrice":
            // Return the middle (round index up) value, similar to median
            // but do not average even entries and choose the higher.
            // Malicious actors must compromise 50% of the nodes to lie.
            return function(configs: Array<RunningConfig>): BigNumber {
                const values = configs.map((c) => c.result);
                values.sort();
                return values[Math.floor(values.length / 2)];
            }

        case "getEtherPrice":
            // Returns the median price. Malicious actors must compromise at
            // least 50% of the nodes to lie (in a meaningful way).
            return function(configs: Array<RunningConfig>): number {
                return median(configs.map((c) => c.result));
            }

        // No additional normalizing required; serialize is enough
        case "getBalance":
        case "getTransactionCount":
        case "getCode":
        case "getStorageAt":
        case "call":
        case "estimateGas":
        case "getLogs":
            break;

        // We drop the confirmations from transactions as it is approximate
        case "getTransaction":
        case "getTransactionReceipt":
            normalize = function(tx: any): string {
                if (tx == null) { return null; }

                tx = shallowCopy(tx);
                tx.confirmations = -1;
                return serialize(tx);
            }
            break;

        // We drop the confirmations from transactions as it is approximate
        case "getBlock":
            // We drop the confirmations from transactions as it is approximate
            if (params.includeTransactions) {
                normalize = function(block: BlockWithTransactions): string {
                    if (block == null) { return null; }

                    block = shallowCopy(block);
                    block.transactions = block.transactions.map((tx) => {
                        tx = shallowCopy(tx);
                        tx.confirmations = -1;
                        return tx;
                    });
                    return serialize(block);
                };
            } else {
                normalize = function(block: Block): string {
                    if (block == null) { return null; }
                    return serialize(block);
                }
            }
            break;

        default:
            throw new Error("unknown method: " + method);
    }

    // Return the result if and only if the expected quorum is
    // satisfied and agreed upon for the final result.
    return normalizedTally(normalize, provider.quorum);

}

function getRunner(provider: Provider, method: string, params: { [ key: string]: any }): Promise<any> {
    switch (method) {
        case "getBlockNumber":
        case "getGasPrice":
            return provider[method]();
        case "getEtherPrice":
            if ((<any>provider).getEtherPrice) {
                return (<any>provider).getEtherPrice();
            }
            break;
        case "getBalance":
        case "getTransactionCount":
        case "getCode":
            return provider[method](params.address, params.blockTag || "latest");
        case "getStorageAt":
            return provider.getStorageAt(params.address, params.position, params.blockTag || "latest");
        case "getBlock":
            return provider[(params.includeTransactions ? "getBlockWithTransactions": "getBlock")](params.blockTag || params.blockHash);
        case "call":
        case "estimateGas":
            return provider[method](params.transaction);
        case "getTransaction":
        case "getTransactionReceipt":
            return provider[method](params.transactionHash);
        case "getLogs":
            return provider.getLogs(params.filter);
    }

    return logger.throwError("unknown method error", Logger.errors.UNKNOWN_ERROR, {
        method: method,
        params: params
    });
}

export class FallbackProvider extends BaseProvider {
    readonly providerConfigs: ReadonlyArray<FallbackProviderConfig>;
    readonly quorum: number;

    // Due to teh highly asyncronous nature of the blockchain, we need
    // to make sure we never unroll the blockNumber due to our random
    // sample of backends
    _highestBlockNumber: number;

    constructor(providers: Array<Provider | FallbackProviderConfig>, quorum?: number) {
        logger.checkNew(new.target, FallbackProvider);

        if (providers.length === 0) {
            logger.throwArgumentError("missing providers", "providers", providers);
        }

        const providerConfigs: Array<FallbackProviderConfig> = providers.map((configOrProvider, index) => {
            if (Provider.isProvider(configOrProvider)) {
                return Object.freeze({ provider: configOrProvider, weight: 1, stallTimeout: 750, priority: 1 });
            }

            const config: FallbackProviderConfig = shallowCopy(configOrProvider);

            if (config.priority == null) { config.priority = 1; }
            if (config.stallTimeout == null) { config.stallTimeout = 750; }
            if (config.weight == null) { config.weight = 1; }

            const weight = config.weight;
            if (weight % 1 || weight > 512 || weight < 1) {
                logger.throwArgumentError("invalid weight; must be integer in [1, 512]", `providers[${ index }].weight`, weight);
            }

            return Object.freeze(config);
        });

        const total = providerConfigs.reduce((accum, c) => (accum + c.weight), 0);

        if (quorum == null) {
            quorum = total / 2;
        } else if (quorum > total) {
            logger.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
        }

        // All networks are ready, we can know the network for certain
        const network = checkNetworks(providerConfigs.map((c) => (<any>(c.provider)).network));
        if (network) {
            super(network);

        } else {
            // The network won't be known until all child providers know
            const ready = Promise.all(providerConfigs.map((c) => c.provider.getNetwork())).then((networks) => {
                return checkNetworks(networks);
            });

            super(ready);
        }

        // Preserve a copy, so we do not get mutated
        defineReadOnly(this, "providerConfigs", Object.freeze(providerConfigs));
        defineReadOnly(this, "quorum", quorum);

        this._highestBlockNumber = -1;
    }

    async perform(method: string, params: { [name: string]: any }): Promise<any> {

        // Sending transactions is special; always broadcast it to all backends
        if (method === "sendTransaction") {
            return Promise.all(this.providerConfigs.map((c) => {
                return c.provider.sendTransaction(params.signedTransaction).then((result) => {
                    return result.hash;
                }, (error) => {
                    return error;
                });
            })).then((results) => {
                // Any success is good enough (other errors are likely "already seen" errors
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (typeof(result) === "string") { return result; }
                }

                // They were all an error; pick the first error
                return Promise.reject(results[0].error);
            });
        }

        const processFunc = getProcessFunc(this, method, params);

        // Shuffle the providers and then sort them by their priority; we
        // shallowCopy them since we will store the result in them too
        const configs: Array<RunningConfig> = shuffled(this.providerConfigs.map((c) => shallowCopy(c)));
        configs.sort((a, b) => (a.priority - b.priority));

        let i = 0;
        while (true) {
            const t0 = now();

            // Get a list of running
            //const running = configs.filter((c) => (c.runner && !c.done));

            // Compute the inflight weight (exclude anything past)
            let inflightWeight = configs.filter((c) => (c.runner && ((t0 - c.start) < c.stallTimeout)))
                                        .reduce((accum, c) => (accum + c.weight), 0);

            // Start running enough to meet quorum
            while (inflightWeight < this.quorum && i < configs.length) {
                const config = configs[i++];

                const rid = nextRid++;

                config.start = now();
                config.staller = stall(config.stallTimeout).then(() => { config.staller = null; });

                config.runner = getRunner(config.provider, method, params).then((result) => {
                    config.done = true;
                    config.result = result;

                    if (this.listenerCount("debug")) {
                        this.emit("debug", {
                            action: "request",
                            rid: rid,
                            backend: exposeDebugConfig(config, now()),
                            request: { method: method, params: deepCopy(params) },
                            provider: this
                        });
                     }

                }, (error) => {
                    config.done = true;
                    config.error = error;

                    if (this.listenerCount("debug")) {
                        this.emit("debug", {
                            action: "request",
                            rid: rid,
                            backend: exposeDebugConfig(config, now()),
                            request: { method: method, params: deepCopy(params) },
                            provider: this
                        });
                    }
                });

                //running.push(config);

                if (this.listenerCount("debug")) {
                    this.emit("debug", {
                        action: "request",
                        rid: rid,
                        backend: exposeDebugConfig(config, null),
                        request: { method: method, params: deepCopy(params) },
                        provider: this
                    });
                }

                inflightWeight += config.weight;
            }

            // Wait for anything meaningful to finish or stall out
            const waiting: Array<Promise<any>> = [ ];
            configs.forEach((c) => {
                if (c.done || !c.runner) { return; }
                waiting.push(c.runner);
                if (c.staller) { waiting.push(c.staller); }
            });

            if (waiting.length) { await Promise.race(waiting); }

            // Check the quorum and process the results; the process function
            // may additionally decide the quorum is not met
            const results = configs.filter((c) => (c.done && c.error == null));
            if (results.length >= this.quorum) {
                const result = processFunc(results);
                if (result !== undefined) { return result; }
            }

            // All configs have run to completion; we will never get more data
            if (configs.filter((c) => !c.done).length === 0) { break; }
        }

        return logger.throwError("failed to meet quorum", Logger.errors.SERVER_ERROR, {
            method: method,
            params: params,
            //results: configs.map((c) => c.result),
            //errors: configs.map((c) => c.error),
            results: configs.map((c) => exposeDebugConfig(c)),
            provider: this
        });
    }
}
