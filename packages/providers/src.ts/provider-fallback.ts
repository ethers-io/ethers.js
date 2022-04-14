
import { hexlify } from "@ethersproject/bytes";

import { AbstractProvider } from "./abstract-provider.js";
import { logger } from "./logger.js";
import { Network } from "./network.js"
import { shuffle } from "./shuffle.js";

import type { Frozen } from "@ethersproject/properties";

import type { PerformActionRequest } from "./abstract-provider.js";
import type { Networkish } from "./network.js"

//const BN_0 = BigInt("0");
const BN_1 = BigInt("1");
const BN_2 = BigInt("2");

function stall(duration: number) {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}

function getTime(): number { return (new Date()).getTime(); }

export interface FallbackProviderConfig {

    // The provider
    provider: AbstractProvider;

    // How long to wait for a response before getting impatient
    // and ispatching the next provider
    stallTimeout?: number;

    // Lower values are dispatched first
    priority?: number;

    // How much this provider contributes to the quorum
    weight?: number;
};

const defaultConfig = { stallTimeout: 400, priority: 1, weight: 1 };

// We track a bunch of extra stuff that might help debug problems or
// optimize infrastructure later on.
export interface FallbackProviderState extends Required<FallbackProviderConfig> {

    // The most recent blockNumber this provider has reported (-2 if none)
    blockNumber: number;

    // The number of total requests ever sent to this provider
    requests: number;

    // The number of responses that errored
    errorResponses: number;

    // The number of responses that occured after the result resolved
    lateResponses: number;

    // How many times syncing was required to catch up the expected block
    outOfSync: number;

    // The number of requests which reported unsupported operation
    unsupportedEvents: number;

    // A rolling average (5% current duration) for response time
    rollingDuration: number;

    // The ratio of quorum-agreed results to total
    score: number;
}

interface Config extends FallbackProviderState {
    _updateNumber: null | Promise<any>;
    _network: null | Frozen<Network>;
    _totalTime: number;
}

const defaultState = {
    blockNumber: -2, requests: 0, lateResponses: 0, errorResponses: 0,
    outOfSync: -1, unsupportedEvents: 0, rollingDuration: 0, score: 0,
    _network: null, _updateNumber: null, _totalTime: 0
};


async function waitForSync(config: Config, blockNumber: number): Promise<void> {
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

export type FallbackProviderOptions = {
    // How many providers must agree on a value before reporting
    // back the response
    quorum: number;

    // How many providers must have reported the same event
    // for it to be emitted
    eventQuorum: number;

    // How many providers to dispatch each event to simultaneously.
    // Set this to 0 to use getLog polling, which implies eventQuorum
    // is equal to quorum.
    eventWorkers: number;
};

type RunningState = {
    config: Config;
    staller: null | Promise<void>;
    didBump: boolean;
    perform: null | Promise<any>;
    done: boolean;
    result: { result: any } | { error: Error }
}

// Normalizes a result to a string that can be used to compare against
// other results using normal string equality
function normalize(network: Frozen<Network>, value: any, req: PerformActionRequest): string {
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
            return JSON.stringify(value.map((v: any) => network.formatter.log(v)));
    }

    return logger.throwError("unsupported method", "UNSUPPORTED_OPERATION", {
        operation: `_perform(${ JSON.stringify(req.method) })`
    });
}

type TallyResult = {
    result: any;
    normal: string;
    weight: number;
};

// This strategy picks the highest wieght result, as long as the weight is
// equal to or greater than quorum
function checkQuorum(quorum: number, results: Array<TallyResult>): any {
    const tally: Map<string, { weight: number, result: any }> = new Map();
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

function getMedian(results: Array<TallyResult>): bigint {
    // Get the sorted values
    const values = results.map((r) => BigInt(r.result));
    values.sort((a, b) => ((a < b) ? -1: (b > a) ? 1: 0));

    const mid = values.length / 2;

    // Odd-length; take the middle value
    if (values.length % 2) { return values[mid]; }

    // Even length; take the ceiling of the mean of the center two values
    return (values[mid - 1] + values[mid] + BN_1) / BN_2;
}

function getFuzzyMode(quorum: number, results: Array<TallyResult>): undefined | number {
    if (quorum === 1) { return logger.getNumber(getMedian(results), "%internal"); }

    const tally: Map<number, { result: number, weight: number }> = new Map();
    const add = (result: number, weight: number) => {
        const t = tally.get(result) || { result, weight: 0 };
        t.weight += weight;
        tally.set(result, t);
    };

    for (const { weight, result } of results) {
        const r = logger.getNumber(result);
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

    readonly quorum: number;
    readonly eventQuorum: number;
    readonly eventWorkers: number;

    readonly #configs: Array<Config>;

    #height: number;
    #initialSyncPromise: null | Promise<void>;

    constructor(providers: Array<AbstractProvider | FallbackProviderConfig>, network?: Networkish) {
        super(network);
        this.#configs = providers.map((p) => {
            if (p instanceof AbstractProvider) {
                return Object.assign({ provider: p }, defaultConfig, defaultState );
            } else {
                return Object.assign({ }, defaultConfig, p, defaultState );
            }
        });

        this.#height = -2;
        this.#initialSyncPromise = null;

        this.quorum = 2; //Math.ceil(providers.length /  2);
        this.eventQuorum = 1;
        this.eventWorkers = 1;

        if (this.quorum > this.#configs.reduce((a, c) => (a + c.weight), 0)) {
            logger.throwArgumentError("quorum exceed provider wieght", "quorum", this.quorum);
        }
    }

    // @TOOD: Copy these and only return public values
    get providerConfigs(): Array<FallbackProviderState> {
        return this.#configs.slice();
    }

    async _detectNetwork() {
        return Network.from(logger.getBigInt(await this._perform({ method: "chainId" }))).freeze();
    }

    // @TODO: Add support to select providers to be the event subscriber
    //_getSubscriber(sub: Subscription): Subscriber {
    //    throw new Error("@TODO");
    //}

    // Grab the next (random) config that is not already part of configs
    #getNextConfig(configs: Array<Config>): null | Config {
        // Shuffle the states, sorted by priority
        const allConfigs = this.#configs.slice();
        shuffle(allConfigs);
        allConfigs.sort((a, b) => (b.priority - a.priority));

        for (const config of allConfigs) {
            if (configs.indexOf(config) === -1) { return config; }
        }

        return null;
    }

    // Adds a new runner (if available) to running.
    #addRunner(running: Set<RunningState>, req: PerformActionRequest): null | RunningState {
        const config = this.#getNextConfig(Array.from(running).map((r) => r.config));
        if (config == null) {
            return null;
        }

        const result: any = { };

        const runner: RunningState = {
            config, result, didBump: false, done: false,
            perform: null, staller: null
        };

        const now = getTime();

        runner.perform = (async () => {
            try {
                config.requests++;
                result.result = await config.provider._perform(req);
            } catch (error) {
                config.errorResponses++;
                result.error = error;
            }

            if (runner.done) { config.lateResponses++; }

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
    async #initialSync(): Promise<void> {
        let initialSync = this.#initialSyncPromise;
        if (!initialSync) {
            const promises: Array<Promise<any>> = [ ];
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
                let chainId: null | bigint = null;
                for (const config of this.#configs) {
                    const network = <Frozen<Network>>(config._network);
                    if (chainId == null) {
                        chainId = network.chainId;
                    } else if (network.chainId !== chainId) {
                        logger.throwError("cannot mix providers on different networks", "UNSUPPORTED_OPERATION", {
                            operation: "new FallbackProvider"
                        });
                    }
                }
            })();
        }

        await initialSync
    }


    async #checkQuorum(running: Set<RunningState>, req: PerformActionRequest): Promise<any> {
        // Get all the result objects
        const results: Array<TallyResult> = [ ];
        for (const runner of running) {
            if ("result" in runner.result) {
                const result = runner.result.result;
                results.push({
                    result,
                    normal: normalize(<Frozen<Network>>(runner.config._network), result, req),
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
                    const height = Math.ceil(logger.getNumber(getMedian(this.#configs.map((c) => ({
                        result: c.blockNumber,
                        normal: logger.getNumber(c.blockNumber).toString(),
                        weight: c.weight
                    }))), "%internal"));
                    this.#height = height;
                }

                const mode = getFuzzyMode(this.quorum, results);
                if (mode === undefined) { return undefined; }
                if (mode > this.#height) { this.#height = mode; }
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

            case "sendTransaction":
                throw new Error("TODO");
        }

        return logger.throwError("unsupported method", "UNSUPPORTED_OPERATION", {
            operation: `_perform(${ JSON.stringify((<any>req).method) })`
        });
    }

    async #waitForQuorum(running: Set<RunningState>, req: PerformActionRequest): Promise<any> {
        if (running.size === 0) { throw new Error("no runners?!"); }

        // Any promises that are interesting to watch for; an expired stall
        // or a successful perform
        const interesting: Array<Promise<void>> = [ ];

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
            if (runner.didBump) { continue; }

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
            if (value instanceof Error) { throw value; }
            return value;
        }

        // Add any new runners, because a staller timed out or a result
        // or error response came in.
        for (let i = 0; i < newRunners; i++) {
            this.#addRunner(running, req)
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

    async _perform<T = any>(req: PerformActionRequest): Promise<T> {
        await this.#initialSync();

        // Bootstrap enough to meet quorum
        const running: Set<RunningState> = new Set();
        for (let i = 0; i < this.quorum; i++) {
            this.#addRunner(running, req);
        }

        const result = this.#waitForQuorum(running, req);
        for (const runner of running) { runner.done = true; }
        return result;
    }
}
