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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_provider_1 = require("@ethersproject/abstract-provider");
var random_1 = require("@ethersproject/random");
var properties_1 = require("@ethersproject/properties");
var bignumber_1 = require("@ethersproject/bignumber");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var base_provider_1 = require("./base-provider");
function now() { return (new Date()).getTime(); }
// Returns to network as long as all agree, or null if any is null.
// Throws an error if any two networks do not match.
function checkNetworks(networks) {
    var result = null;
    for (var i = 0; i < networks.length; i++) {
        var network = networks[i];
        // Null! We do not know our network; bail.
        if (network == null) {
            return null;
        }
        if (result) {
            // Make sure the network matches the previous networks
            if (!(result.name === network.name && result.chainId === network.chainId &&
                ((result.ensAddress === network.ensAddress) || (result.ensAddress == null && network.ensAddress == null)))) {
                logger.throwArgumentError("provider mismatch", "networks", networks);
            }
        }
        else {
            result = network;
        }
    }
    return result;
}
function median(values) {
    values = values.slice().sort();
    var middle = Math.floor(values.length / 2);
    // Odd length; take the middle
    if (values.length % 2) {
        return values[middle];
    }
    // Even length; take the average of the two middle
    var a = values[middle - 1], b = values[middle];
    return (a + b) / 2;
}
function serialize(value) {
    if (value === null) {
        return null;
    }
    else if (typeof (value) === "number" || typeof (value) === "boolean") {
        return JSON.stringify(value);
    }
    else if (typeof (value) === "string") {
        return value;
    }
    else if (bignumber_1.BigNumber.isBigNumber(value)) {
        return value.toString();
    }
    else if (Array.isArray(value)) {
        return JSON.stringify(value.map(function (i) { return serialize(i); }));
    }
    else if (typeof (value) === "object") {
        var keys = Object.keys(value);
        keys.sort();
        return "{" + keys.map(function (key) {
            var v = value[key];
            if (typeof (v) === "function") {
                v = "[function]";
            }
            else {
                v = serialize(v);
            }
            return JSON.stringify(key) + ":" + v;
        }).join(",") + "}";
    }
    throw new Error("unknown value type: " + typeof (value));
}
// Next request ID to use for emitting debug info
var nextRid = 1;
;
// Returns a promise that delays for duration
function stall(duration) {
    return new Promise(function (resolve) {
        var timer = setTimeout(resolve, duration);
        if (timer.unref) {
            timer.unref();
        }
    });
}
;
function exposeDebugConfig(config, now) {
    var result = {
        provider: config.provider,
        weight: config.weight
    };
    if (config.start) {
        result.start = config.start;
    }
    if (now) {
        result.duration = (now - config.start);
    }
    if (config.done) {
        if (config.error) {
            result.error = config.error;
        }
        else {
            result.result = config.result || null;
        }
    }
    return result;
}
function normalizedTally(normalize, quorum) {
    return function (configs) {
        // Count the votes for each result
        var tally = {};
        configs.forEach(function (c) {
            var value = normalize(c.result);
            if (!tally[value]) {
                tally[value] = { count: 0, result: c.result };
            }
            tally[value].count++;
        });
        // Check for a quorum on any given result
        var keys = Object.keys(tally);
        for (var i = 0; i < keys.length; i++) {
            var check = tally[keys[i]];
            if (check.count >= quorum) {
                return check.result;
            }
        }
        // No quroum
        return undefined;
    };
}
function getProcessFunc(provider, method, params) {
    var normalize = serialize;
    switch (method) {
        case "getBlockNumber":
            // Return the median value, unless there is (median + 1) is also
            // present, in which case that is probably true and the median
            // is going to be stale soon. In the event of a malicious node,
            // the lie will be true soon enough.
            return function (configs) {
                var values = configs.map(function (c) { return c.result; });
                // Get the median block number
                var blockNumber = Math.ceil(median(configs.map(function (c) { return c.result; })));
                // If the next block height is present, its prolly safe to use
                if (values.indexOf(blockNumber + 1) >= 0) {
                    blockNumber++;
                }
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
            return function (configs) {
                var values = configs.map(function (c) { return c.result; });
                values.sort();
                return values[Math.floor(values.length / 2)];
            };
        case "getEtherPrice":
            // Returns the median price. Malicious actors must compromise at
            // least 50% of the nodes to lie (in a meaningful way).
            return function (configs) {
                return median(configs.map(function (c) { return c.result; }));
            };
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
            normalize = function (tx) {
                tx = properties_1.shallowCopy(tx);
                tx.confirmations = -1;
                return serialize(tx);
            };
            break;
        // We drop the confirmations from transactions as it is approximate
        case "getBlock":
            // We drop the confirmations from transactions as it is approximate
            if (params.includeTransactions) {
                normalize = function (block) {
                    block = properties_1.shallowCopy(block);
                    block.transactions = block.transactions.map(function (tx) {
                        tx = properties_1.shallowCopy(tx);
                        tx.confirmations = -1;
                        return tx;
                    });
                    return serialize(block);
                };
            }
            break;
        default:
            throw new Error("unknown method: " + method);
    }
    // Return the result if and only if the expected quorum is
    // satisfied and agreed upon for the final result.
    return normalizedTally(normalize, provider.quorum);
}
function getRunner(provider, method, params) {
    switch (method) {
        case "getBlockNumber":
        case "getGasPrice":
            return provider[method]();
        case "getEtherPrice":
            if (provider.getEtherPrice) {
                return provider.getEtherPrice();
            }
            break;
        case "getBalance":
        case "getTransactionCount":
        case "getCode":
            return provider[method](params.address, params.blockTag || "latest");
        case "getStorageAt":
            return provider.getStorageAt(params.address, params.position, params.blockTag || "latest");
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
}
var FallbackProvider = /** @class */ (function (_super) {
    __extends(FallbackProvider, _super);
    function FallbackProvider(providers, quorum) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, FallbackProvider);
        if (providers.length === 0) {
            logger.throwArgumentError("missing providers", "providers", providers);
        }
        var providerConfigs = providers.map(function (configOrProvider, index) {
            if (abstract_provider_1.Provider.isProvider(configOrProvider)) {
                return Object.freeze({ provider: configOrProvider, weight: 1, stallTimeout: 750, priority: 1 });
            }
            var config = properties_1.shallowCopy(configOrProvider);
            if (config.priority == null) {
                config.priority = 1;
            }
            if (config.stallTimeout == null) {
                config.stallTimeout = 750;
            }
            if (config.weight == null) {
                config.weight = 1;
            }
            var weight = config.weight;
            if (weight % 1 || weight > 512 || weight < 1) {
                logger.throwArgumentError("invalid weight; must be integer in [1, 512]", "providers[" + index + "].weight", weight);
            }
            return Object.freeze(config);
        });
        var total = providerConfigs.reduce(function (accum, c) { return (accum + c.weight); }, 0);
        if (quorum == null) {
            quorum = total / 2;
        }
        else if (quorum > total) {
            logger.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
        }
        // All networks are ready, we can know the network for certain
        var network = checkNetworks(providerConfigs.map(function (c) { return (c.provider).network; }));
        if (network) {
            _this = _super.call(this, network) || this;
        }
        else {
            // The network won't be known until all child providers know
            var ready = Promise.all(providerConfigs.map(function (c) { return c.provider.getNetwork(); })).then(function (networks) {
                return checkNetworks(networks);
            });
            _this = _super.call(this, ready) || this;
        }
        // Preserve a copy, so we do not get mutated
        properties_1.defineReadOnly(_this, "providerConfigs", Object.freeze(providerConfigs));
        properties_1.defineReadOnly(_this, "quorum", quorum);
        _this._highestBlockNumber = -1;
        return _this;
    }
    FallbackProvider.prototype.perform = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var processFunc, configs, i, _loop_1, this_1, state_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Sending transactions is special; always broadcast it to all backends
                        if (method === "sendTransaction") {
                            return [2 /*return*/, Promise.all(this.providerConfigs.map(function (c) {
                                    return c.provider.sendTransaction(params.signedTransaction).then(function (result) {
                                        return result.hash;
                                    }, function (error) {
                                        return error;
                                    });
                                })).then(function (results) {
                                    // Any success is good enough (other errors are likely "already seen" errors
                                    for (var i_1 = 0; i_1 < results.length; i_1++) {
                                        var result = results[i_1];
                                        if (typeof (result) === "string") {
                                            return result;
                                        }
                                    }
                                    // They were all an error; pick the first error
                                    return Promise.reject(results[0].error);
                                })];
                        }
                        processFunc = getProcessFunc(this, method, params);
                        configs = random_1.shuffled(this.providerConfigs.map(function (c) { return properties_1.shallowCopy(c); }));
                        configs.sort(function (a, b) { return (a.priority - b.priority); });
                        i = 0;
                        _loop_1 = function () {
                            var t0, inflightWeight, _loop_2, waiting, results, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        t0 = now();
                                        inflightWeight = configs.filter(function (c) { return (c.runner && ((t0 - c.start) < c.stallTimeout)); })
                                            .reduce(function (accum, c) { return (accum + c.weight); }, 0);
                                        _loop_2 = function () {
                                            var config = configs[i++];
                                            var rid = nextRid++;
                                            config.start = now();
                                            config.staller = stall(config.stallTimeout).then(function () { config.staller = null; });
                                            config.runner = getRunner(config.provider, method, params).then(function (result) {
                                                config.done = true;
                                                config.result = result;
                                                if (_this.listenerCount("debug")) {
                                                    _this.emit("debug", {
                                                        action: "request",
                                                        rid: rid,
                                                        backend: exposeDebugConfig(config, now()),
                                                        request: { method: method, params: properties_1.deepCopy(params) },
                                                        provider: _this
                                                    });
                                                }
                                            }, function (error) {
                                                config.done = true;
                                                config.error = error;
                                                if (_this.listenerCount("debug")) {
                                                    _this.emit("debug", {
                                                        action: "request",
                                                        rid: rid,
                                                        backend: exposeDebugConfig(config, now()),
                                                        request: { method: method, params: properties_1.deepCopy(params) },
                                                        provider: _this
                                                    });
                                                }
                                            });
                                            //running.push(config);
                                            if (this_1.listenerCount("debug")) {
                                                this_1.emit("debug", {
                                                    action: "request",
                                                    rid: rid,
                                                    backend: exposeDebugConfig(config, null),
                                                    request: { method: method, params: properties_1.deepCopy(params) },
                                                    provider: this_1
                                                });
                                            }
                                            inflightWeight += config.weight;
                                        };
                                        // Start running enough to meet quorum
                                        while (inflightWeight < this_1.quorum && i < configs.length) {
                                            _loop_2();
                                        }
                                        waiting = [];
                                        configs.forEach(function (c) {
                                            if (c.done || !c.runner) {
                                                return;
                                            }
                                            waiting.push(c.runner);
                                            if (c.staller) {
                                                waiting.push(c.staller);
                                            }
                                        });
                                        if (!waiting.length) return [3 /*break*/, 2];
                                        return [4 /*yield*/, Promise.race(waiting)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        results = configs.filter(function (c) { return (c.done && c.error == null); });
                                        if (results.length >= this_1.quorum) {
                                            result = processFunc(results);
                                            if (result != undefined) {
                                                return [2 /*return*/, { value: result }];
                                            }
                                        }
                                        // All configs have run to completion; we will never get more data
                                        if (configs.filter(function (c) { return !c.done; }).length === 0) {
                                            return [2 /*return*/, "break"];
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        if (state_1 === "break")
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, logger.throwError("failed to meet quorum", logger_1.Logger.errors.SERVER_ERROR, {
                            method: method,
                            params: params,
                            results: configs.map(function (c) { return exposeDebugConfig(c); }),
                            //errors: configs.map((c) => c.error),
                            provider: this
                        })];
                }
            });
        });
    };
    return FallbackProvider;
}(base_provider_1.BaseProvider));
exports.FallbackProvider = FallbackProvider;
