"use strict";

import * as errors from "@ethersproject/errors";
import { Network } from "@ethersproject/networks";
import { shuffled } from "@ethersproject/random";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";

import { BaseProvider } from "./base-provider";

function now() { return (new Date()).getTime(); }

// Returns:
//  - true is all networks match
//  - false if any network is null
//  - throws if any 2 networks do not match
function checkNetworks(networks: Array<Network>): boolean {
    let result = true;

    let check: Network = null;
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
                (check.ensAddress == null && network.ensAddress == null))) { return; }

        errors.throwError(
            "provider mismatch",
            errors.INVALID_ARGUMENT,
            { arg: "networks", value: networks }
        );
    });

    return result;
}

type Result = {
    result?: any;
    error?: Error;
    weight: number;
};

type Runner = {
    run: () => Promise<Result>;
    weight: number;
};


function serialize(result: any): string {
    if (Array.isArray(result)) {
        return JSON.stringify(result.map((r) => serialize(r)));
    } else if (result === null) {
        return "null";
    } else if (typeof(result) === "object") {
        let bare: any = {};
        let keys = Object.keys(result);
        keys.sort();
        keys.forEach((key) => {
            let value = result[key];
            if (typeof(value) === "function") { return; }
            bare[key] = serialize(value);
        });
        return JSON.stringify(bare);
    }

    return JSON.stringify(result);
}

let nextRid = 1;

export class FallbackProvider extends BaseProvider {
    readonly providers: Array<BaseProvider>;
    readonly weights: Array<number>;
    readonly quorum: number;

    constructor(providers: Array<BaseProvider>, quorum?: number, weights?: Array<number>) {
        errors.checkNew(new.target, FallbackProvider);

        if (providers.length === 0) {
            errors.throwArgumentError("missing providers", "providers", providers);
        }

        if (weights != null && weights.length !== providers.length) {
            errors.throwArgumentError("too many weights", "weights", weights);
        } else if (!weights) {
            weights = providers.map((p) => 1);
        } else {
            weights.forEach((w) => {
                if (w % 1 || w > 512 || w < 1) {
                    errors.throwArgumentError("invalid weight; must be integer in [1, 512]", "weights", weights);
                }
            });
        }

        let total = weights.reduce((accum, w) => (accum + w));

        if (quorum == null) {
            quorum = total / 2;
        } else {
            if (quorum > total) {
                errors.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
            }
        }


        // All networks are ready, we can know the network for certain
        let ready = checkNetworks(providers.map((p) => p.network));
        if (ready) {
            super(providers[0].network);

        } else {
            // The network won't be known until all child providers know
            let ready = Promise.all(providers.map((p) => p.getNetwork())).then((networks) => {
                if (!checkNetworks(networks)) {
                    errors.throwError("getNetwork returned null", errors.UNKNOWN_ERROR, { })
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

    perform(method: string, params: { [name: string]: any }): any {
        let T0 = now();
        let runners: Array<Runner> = (<Array<BaseProvider>>(shuffled(this.providers))).map((provider, i) => {
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
                    return provider.perform(method, params).then((result) => {
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
            }
        });

        // Broadcast transactions to all backends, any that succeed is good enough
        if (method === "sendTransaction") {
            return Promise.all(runners.map((r) => r.run())).then((results) => {
                for (let i = 0; i < results.length; i++) {
                    let result = results[i];
                    if (result.result) { return result.result; }
                }
                return Promise.reject(results[0].error);
            });
        }

        // Otherwise query backends (randomly) until we have a quorum agreement
        // on the correct result
        return new Promise((resolve, reject) => {
            let firstError: Error = null;

            // How much weight is inflight
            let inflightWeight = 0;

            // All results, indexed by the serialized response.
            let results: { [ unique: string ]: Array<Result> } = { };

            let next = () => {
                if (runners.length === 0) { return; }

                let runner = runners.shift();
                inflightWeight += runner.weight;

                runner.run().then((result) => {
                    if (results === null) { return; }
                    inflightWeight -= runner.weight;

                    if (result.error) {
                        if (firstError == null) { firstError = result.error; }

                    } else {
                        let unique = serialize(result.result);
                        if (results[unique] == null) { results[unique] = []; }
                        results[unique].push(result);

                        // Do any results meet our quroum?
                        for (let u in results) {
                            let weight = results[u].reduce((accum, r) => (accum + r.weight), 0);
                            if (weight >= this.quorum) {
                                let result = results[u][0].result;
                                this.emit("debug", "quorum", -1, { weight, result })
                                resolve(result);
                                results = null;
                                return;
                            }
                        }
                    }

                    // Out of options; give up
                    if (runners.length === 0 && inflightWeight === 0) {
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
            }

            // bootstrap firing requests
            next();
        });
    }
}
