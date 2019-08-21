"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var random_1 = require("@ethersproject/random");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var base_provider_1 = require("./base-provider");
function now() { return (new Date()).getTime(); }
// Returns:
//  - true is all networks match
//  - false if any network is null
//  - throws if any 2 networks do not match
function checkNetworks(networks) {
    var result = true;
    var check = null;
    networks.forEach(function (network) {
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
        return JSON.stringify(result.map(function (r) { return serialize(r); }));
    }
    else if (result === null) {
        return "null";
    }
    else if (typeof (result) === "object") {
        var keys = Object.keys(result);
        keys.sort();
        return "{" + keys.map(function (key) {
            var value = result[key];
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
var nextRid = 1;
var FallbackProvider = /** @class */ (function (_super) {
    __extends(FallbackProvider, _super);
    function FallbackProvider(providers, quorum, weights) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, FallbackProvider);
        if (providers.length === 0) {
            logger.throwArgumentError("missing providers", "providers", providers);
        }
        if (weights != null && weights.length !== providers.length) {
            logger.throwArgumentError("too many weights", "weights", weights);
        }
        else if (!weights) {
            weights = providers.map(function (p) { return 1; });
        }
        else {
            weights.forEach(function (w) {
                if (w % 1 || w > 512 || w < 1) {
                    logger.throwArgumentError("invalid weight; must be integer in [1, 512]", "weights", weights);
                }
            });
        }
        var total = weights.reduce(function (accum, w) { return (accum + w); });
        if (quorum == null) {
            quorum = total / 2;
        }
        else {
            if (quorum > total) {
                logger.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
            }
        }
        // All networks are ready, we can know the network for certain
        var ready = checkNetworks(providers.map(function (p) { return p.network; }));
        if (ready) {
            _this = _super.call(this, providers[0].network) || this;
        }
        else {
            // The network won't be known until all child providers know
            var ready_1 = Promise.all(providers.map(function (p) { return p.getNetwork(); })).then(function (networks) {
                if (!checkNetworks(networks)) {
                    logger.throwError("getNetwork returned null", logger_1.Logger.errors.UNKNOWN_ERROR);
                }
                return networks[0];
            });
            _this = _super.call(this, ready_1) || this;
        }
        // Preserve a copy, so we do not get mutated
        properties_1.defineReadOnly(_this, "providers", Object.freeze(providers.slice()));
        properties_1.defineReadOnly(_this, "quorum", quorum);
        properties_1.defineReadOnly(_this, "weights", Object.freeze(weights.slice()));
        return _this;
    }
    FallbackProvider.doPerform = function (provider, method, params) {
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
                return provider.sendTransaction(params.signedTransaction);
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
        return logger.throwError("unknown method error", logger_1.Logger.errors.UNKNOWN_ERROR, {
            method: method,
            params: params
        });
    };
    FallbackProvider.prototype.perform = function (method, params) {
        var _this = this;
        var T0 = now();
        var runners = (random_1.shuffled(this.providers)).map(function (provider, i) {
            var weight = _this.weights[i];
            var rid = nextRid++;
            return {
                run: function () {
                    var t0 = now();
                    var start = t0 - T0;
                    _this.emit("debug", {
                        action: "request",
                        rid: rid,
                        backend: { weight: weight, start: start, provider: provider },
                        request: { method: method, params: properties_1.deepCopy(params) },
                        provider: _this
                    });
                    return FallbackProvider.doPerform(provider, method, params).then(function (result) {
                        var duration = now() - t0;
                        _this.emit("debug", {
                            action: "response",
                            rid: rid,
                            backend: { weight: weight, start: start, duration: duration, provider: provider },
                            request: { method: method, params: properties_1.deepCopy(params) },
                            response: properties_1.deepCopy(result)
                        });
                        return { weight: weight, result: result };
                    }, function (error) {
                        var duration = now() - t0;
                        _this.emit("debug", {
                            action: "response",
                            rid: rid,
                            backend: { weight: weight, start: start, duration: duration, provider: provider },
                            request: { method: method, params: properties_1.deepCopy(params) },
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
            return Promise.all(runners.map(function (r) { return r.run(); })).then(function (results) {
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    if (result.result) {
                        return result.result;
                    }
                }
                return Promise.reject(results[0].error);
            });
        }
        // Otherwise query backends (randomly) until we have a quorum agreement
        // on the correct result
        return new Promise(function (resolve, reject) {
            var firstError = null;
            // How much weight is inflight
            var inflightWeight = 0;
            // All results, indexed by the serialized response.
            var results = {};
            var next = function () {
                if (runners.length === 0) {
                    return;
                }
                var runner = runners.shift();
                inflightWeight += runner.weight;
                runner.run().then(function (result) {
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
                        var unique = serialize(result.result);
                        if (results[unique] == null) {
                            results[unique] = [];
                        }
                        results[unique].push(result);
                        // Do any results meet our quroum?
                        for (var u in results) {
                            var weight = results[u].reduce(function (accum, r) { return (accum + r.weight); }, 0);
                            if (weight >= _this.quorum) {
                                var result_1 = results[u][0].result;
                                _this.emit("debug", "quorum", -1, { weight: weight, result: result_1 });
                                resolve(result_1);
                                results = null;
                                return;
                            }
                        }
                    }
                    // Out of options; give up
                    if (runners.length === 0 && inflightWeight === 0) {
                        if (firstError === null) {
                            firstError = logger.makeError("failed to meet quorum", logger_1.Logger.errors.SERVER_ERROR, {
                                results: Object.keys(results).map(function (u) {
                                    return { result: u, weight: results[u].reduce(function (accum, r) { return (accum + r.weight); }, 0) };
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
                if (inflightWeight < _this.quorum) {
                    setTimeout(next, 0);
                    return;
                }
            };
            // bootstrap firing requests
            next();
        });
    };
    return FallbackProvider;
}(base_provider_1.BaseProvider));
exports.FallbackProvider = FallbackProvider;
