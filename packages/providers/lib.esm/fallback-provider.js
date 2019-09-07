"use strict";
import { shuffled } from "@ethersproject/random";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { BaseProvider } from "./base-provider";
function now() { return (new Date()).getTime(); }
// Returns:
//  - true is all networks match
//  - false if any network is null
//  - throws if any 2 networks do not match
function checkNetworks(networks) {
    let result = true;
    let check = null;
    networks.forEach((network) => {
        // Null
        if (network == null) {
            result = false;
            return;
        }
        // Have nothing to compre to yet
        if (check == null) {
            check = network;
            return;
        }
        // Matches!
        if (check.name === network.name &&
            check.chainId === network.chainId &&
            ((check.ensAddress === network.ensAddress) ||
                (check.ensAddress == null && network.ensAddress == null))) {
            return;
        }
        logger.throwArgumentError("provider mismatch", "networks", networks);
    });
    return result;
}
function serialize(result) {
    if (Array.isArray(result)) {
        return JSON.stringify(result.map((r) => serialize(r)));
    }
    else if (result === null) {
        return "null";
    }
    else if (typeof (result) === "object") {
        let keys = Object.keys(result);
        keys.sort();
        return "{" + keys.map((key) => {
            let value = result[key];
            if (typeof (value) === "function") {
                value = "function{}";
            }
            else {
                value = serialize(value);
            }
            return JSON.stringify(key) + "=" + serialize(value);
        }).join(",") + "}";
    }
    return JSON.stringify(result);
}
let nextRid = 1;
export class FallbackProvider extends BaseProvider {
    constructor(providers, quorum, weights) {
        logger.checkNew(new.target, FallbackProvider);
        if (providers.length === 0) {
            logger.throwArgumentError("missing providers", "providers", providers);
        }
        if (weights != null && weights.length !== providers.length) {
            logger.throwArgumentError("too many weights", "weights", weights);
        }
        else if (!weights) {
            weights = providers.map((p) => 1);
        }
        else {
            weights.forEach((w) => {
                if (w % 1 || w > 512 || w < 1) {
                    logger.throwArgumentError("invalid weight; must be integer in [1, 512]", "weights", weights);
                }
            });
        }
        let total = weights.reduce((accum, w) => (accum + w));
        if (quorum == null) {
            quorum = total / 2;
        }
        else {
            if (quorum > total) {
                logger.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
            }
        }
        // All networks are ready, we can know the network for certain
        let ready = checkNetworks(providers.map((p) => p.network));
        if (ready) {
            super(providers[0].network);
        }
        else {
            // The network won't be known until all child providers know
            let ready = Promise.all(providers.map((p) => p.getNetwork())).then((networks) => {
                if (!checkNetworks(networks)) {
                    logger.throwError("getNetwork returned null", Logger.errors.UNKNOWN_ERROR);
                }
                return networks[0];
            });
            super(ready);
        }
        // Preserve a copy, so we do not get mutated
        defineReadOnly(this, "providers", Object.freeze(providers.slice()));
        defineReadOnly(this, "quorum", quorum);
        defineReadOnly(this, "weights", Object.freeze(weights.slice()));
    }
    static doPerform(provider, method, params) {
        switch (method) {
            case "getBlockNumber":
            case "getGasPrice":
            case "getEtherPrice":
                return provider[method]();
            case "getBalance":
            case "getTransactionCount":
            case "getCode":
                return provider[method](params.address, params.blockTag || "latest");
            case "getStorageAt":
                return provider.getStorageAt(params.address, params.position, params.blockTag || "latest");
            case "sendTransaction":
                return provider.sendTransaction(params.signedTransaction).then((result) => {
                    return result.hash;
                });
            case "getBlock":
                return provider[(params.includeTransactions ? "getBlockWithTransactions" : "getBlock")](params.blockTag || params.blockHash);
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
    perform(method, params) {
        let T0 = now();
        let runners = (shuffled(this.providers)).map((provider, i) => {
            let weight = this.weights[i];
            let rid = nextRid++;
            return {
                run: () => {
                    let t0 = now();
                    let start = t0 - T0;
                    this.emit("debug", {
                        action: "request",
                        rid: rid,
                        backend: { weight, start, provider },
                        request: { method: method, params: deepCopy(params) },
                        provider: this
                    });
                    return FallbackProvider.doPerform(provider, method, params).then((result) => {
                        let duration = now() - t0;
                        this.emit("debug", {
                            action: "response",
                            rid: rid,
                            backend: { weight, start, duration, provider },
                            request: { method: method, params: deepCopy(params) },
                            response: deepCopy(result)
                        });
                        return { weight: weight, result: result };
                    }, (error) => {
                        let duration = now() - t0;
                        this.emit("debug", {
                            action: "response",
                            rid: rid,
                            backend: { weight, start, duration, provider },
                            request: { method: method, params: deepCopy(params) },
                            error: error
                        });
                        return { weight: weight, error: error };
                    });
                },
                weight: weight
            };
        });
        // Broadcast transactions to all backends, any that succeed is good enough
        if (method === "sendTransaction") {
            return Promise.all(runners.map((r) => r.run())).then((results) => {
                for (let i = 0; i < results.length; i++) {
                    let result = results[i];
                    if (result.result) {
                        return result.result;
                    }
                }
                return Promise.reject(results[0].error);
            });
        }
        // Otherwise query backends (randomly) until we have a quorum agreement
        // on the correct result
        return new Promise((resolve, reject) => {
            let firstError = null;
            // How much weight is inflight
            let inflightWeight = 0;
            // All results, indexed by the serialized response.
            let results = {};
            let next = () => {
                if (runners.length === 0) {
                    return;
                }
                let runner = runners.shift();
                inflightWeight += runner.weight;
                runner.run().then((result) => {
                    if (results === null) {
                        return;
                    }
                    inflightWeight -= runner.weight;
                    if (result.error) {
                        if (firstError == null) {
                            firstError = result.error;
                        }
                    }
                    else {
                        let unique = serialize(result.result);
                        if (results[unique] == null) {
                            results[unique] = [];
                        }
                        results[unique].push(result);
                        // Do any results meet our quroum?
                        for (let u in results) {
                            let weight = results[u].reduce((accum, r) => (accum + r.weight), 0);
                            if (weight >= this.quorum) {
                                let result = results[u][0].result;
                                this.emit("debug", "quorum", -1, { weight, result });
                                resolve(result);
                                results = null;
                                return;
                            }
                        }
                    }
                    // Out of options; give up
                    if (runners.length === 0 && inflightWeight === 0) {
                        // @TODO: this might need some more thinking... Maybe only if half
                        // of the results contain non-error?
                        if (method === "getGasPrice") {
                            const values = [];
                            Object.keys(results).forEach((key) => {
                                results[key].forEach((result) => {
                                    if (!result.result) {
                                        return;
                                    }
                                    values.push(result.result);
                                });
                            });
                            values.sort((a, b) => {
                                if (a.lt(b)) {
                                    return -1;
                                }
                                if (a.gt(b)) {
                                    return 1;
                                }
                                return 0;
                            });
                            let index = parseInt(String(values.length / 2));
                            if (values.length % 2) {
                                resolve(values[index]);
                                return;
                            }
                            resolve(values[index - 1].add(values[index]).div(2));
                            return;
                        }
                        if (firstError === null) {
                            firstError = logger.makeError("failed to meet quorum", Logger.errors.SERVER_ERROR, {
                                results: Object.keys(results).map((u) => {
                                    return {
                                        method: method,
                                        params: params,
                                        result: u,
                                        weight: results[u].reduce((accum, r) => (accum + r.weight), 0)
                                    };
                                })
                            });
                        }
                        reject(firstError);
                        return;
                    }
                    // Queue up the next round
                    setTimeout(next, 0);
                });
                // Fire off requests until we could possibly meet quorum
                if (inflightWeight < this.quorum) {
                    setTimeout(next, 0);
                    return;
                }
            };
            // bootstrap firing requests
            next();
        });
    }
}
