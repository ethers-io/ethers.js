"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = exports.Event = void 0;
var abstract_provider_1 = require("@hethers/abstract-provider");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var networks_1 = require("@hethers/networks");
var properties_1 = require("@ethersproject/properties");
var sdk_1 = require("@hashgraph/sdk");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var formatter_1 = require("./formatter");
var address_1 = require("@hethers/address");
var sdk_2 = require("@hashgraph/sdk");
var axios_1 = __importDefault(require("axios"));
var utils_1 = require("hethers/lib/utils");
var ZERO_HEDERA_TIMESTAMP = "1000000000.000000000";
//////////////////////////////
// Event Serializeing
// @ts-ignore
function checkTopic(topic) {
    if (topic == null) {
        return "null";
    }
    if ((0, bytes_1.hexDataLength)(topic) !== 32) {
        logger.throwArgumentError("invalid topic", "topic", topic);
    }
    return topic.toLowerCase();
}
// @ts-ignore
function serializeTopics(topics) {
    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics.length > 0 && topics[topics.length - 1] == null) {
        topics.pop();
    }
    return topics.map(function (topic) {
        if (Array.isArray(topic)) {
            // Only track unique OR-topics
            var unique_1 = {};
            topic.forEach(function (topic) {
                unique_1[checkTopic(topic)] = true;
            });
            // The order of OR-topics does not matter
            var sorted = Object.keys(unique_1);
            sorted.sort();
            return sorted.join("|");
        }
        else {
            return checkTopic(topic);
        }
    }).join("&");
}
function deserializeTopics(data) {
    if (data === "") {
        return [];
    }
    return data.split(/&/g).map(function (topic) {
        if (topic === "") {
            return [];
        }
        var comps = topic.split("|").map(function (topic) {
            return ((topic === "null") ? null : topic);
        });
        return ((comps.length === 1) ? comps[0] : comps);
    });
}
//////////////////////////////
// Helper Object
function stall(duration) {
    return new Promise(function (resolve) {
        setTimeout(resolve, duration);
    });
}
function base64ToHex(hash) {
    return (0, bytes_1.hexlify)(utils_1.base64.decode(hash));
}
//////////////////////////////
// Provider Object
/**
 *  EventType
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */
var PollableEvents = ["network", "pending", "poll"];
var Event = /** @class */ (function () {
    function Event(tag, listener, once) {
        (0, properties_1.defineReadOnly)(this, "tag", tag);
        (0, properties_1.defineReadOnly)(this, "listener", listener);
        (0, properties_1.defineReadOnly)(this, "once", once);
    }
    Object.defineProperty(Event.prototype, "event", {
        get: function () {
            switch (this.type) {
                case "tx":
                    return this.hash;
                case "filter":
                    return this.filter;
            }
            return this.tag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "type", {
        get: function () {
            return this.tag.split(":")[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "hash", {
        get: function () {
            var comps = this.tag.split(":");
            if (comps[0] !== "tx") {
                return null;
            }
            return comps[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "filter", {
        get: function () {
            var comps = this.tag.split(":");
            if (comps[0] !== "filter") {
                return null;
            }
            var address = comps[1];
            var topics = deserializeTopics(comps[2]);
            var filter = {};
            if (topics.length > 0) {
                filter.topics = topics;
            }
            if (address && address !== "*") {
                filter.address = address;
            }
            return filter;
        },
        enumerable: false,
        configurable: true
    });
    Event.prototype.pollable = function () {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    };
    return Event;
}());
exports.Event = Event;
var defaultFormatter = null;
var MIRROR_NODE_TRANSACTIONS_ENDPOINT = '/api/v1/transactions/';
var MIRROR_NODE_CONTRACTS_RESULTS_ENDPOINT = '/api/v1/contracts/results/';
var MIRROR_NODE_CONTRACTS_ENDPOINT = '/api/v1/contracts/';
var nextPollId = 1;
var BaseProvider = /** @class */ (function (_super) {
    __extends(BaseProvider, _super);
    function BaseProvider(network) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, abstract_provider_1.Provider);
        _this = _super.call(this) || this;
        _this._events = [];
        _this._emittedEvents = {};
        _this._previousPollingTimestamps = {};
        _this.formatter = _newTarget.getFormatter();
        // If network is any, this Provider allows the underlying
        // network to change dynamically, and we auto-detect the
        // current network
        (0, properties_1.defineReadOnly)(_this, "anyNetwork", (network === "any"));
        if (_this.anyNetwork) {
            network = _this.detectNetwork();
        }
        if (network instanceof Promise) {
            _this._networkPromise = network;
            // Squash any "unhandled promise" errors; that do not need to be handled
            network.catch(function (error) {
            });
            // Trigger initial network setting (async)
            _this._ready().catch(function (error) {
            });
        }
        else {
            if (!isHederaNetworkConfigLike(network)) {
                var asDefaultNetwork = network;
                // defineReadOnly(this, "_network", getNetwork(network));
                _this._network = (0, networks_1.getNetwork)(asDefaultNetwork);
                _this._networkPromise = Promise.resolve(_this._network);
                var knownNetwork = (0, properties_1.getStatic)(_newTarget, "getNetwork")(asDefaultNetwork);
                if (knownNetwork) {
                    (0, properties_1.defineReadOnly)(_this, "_network", knownNetwork);
                    _this.emit("network", knownNetwork);
                }
                else {
                    logger.throwArgumentError("invalid network", "network", network);
                }
                _this.hederaClient = sdk_2.Client.forName(mapNetworkToHederaNetworkName(asDefaultNetwork));
                _this._mirrorNodeUrl = resolveMirrorNetworkUrl(_this._network);
            }
            else {
                var asHederaNetwork = network;
                _this.hederaClient = sdk_2.Client.forNetwork(asHederaNetwork.network);
                _this._mirrorNodeUrl = asHederaNetwork.mirrorNodeUrl;
                (0, properties_1.defineReadOnly)(_this, "_network", {
                    // FIXME: chainId
                    chainId: 0,
                    name: _this.hederaClient.networkName
                });
            }
        }
        _this._pollingInterval = 3000;
        return _this;
    }
    BaseProvider.prototype._ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            var network, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._network == null)) return [3 /*break*/, 7];
                        network = null;
                        if (!this._networkPromise) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._networkPromise];
                    case 2:
                        network = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(network == null)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.detectNetwork()];
                    case 5:
                        network = _a.sent();
                        _a.label = 6;
                    case 6:
                        // Possible this call stacked so do not call defineReadOnly again
                        if (this._network == null) {
                            if (this.anyNetwork) {
                                // this._network = network;
                                (0, properties_1.defineReadOnly)(this, "_network", network);
                            }
                            else {
                                this._network = network;
                            }
                            this.emit("network", network, null);
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/, this._network];
                }
            });
        });
    };
    // @TODO: Remove this and just create a singleton formatter
    BaseProvider.getFormatter = function () {
        if (defaultFormatter == null) {
            defaultFormatter = new formatter_1.Formatter();
        }
        return defaultFormatter;
    };
    // @TODO: Remove this and just use getNetwork
    BaseProvider.getNetwork = function (network) {
        return (0, networks_1.getNetwork)((network == null) ? "mainnet" : network);
    };
    Object.defineProperty(BaseProvider.prototype, "network", {
        get: function () {
            return this._network;
        },
        enumerable: false,
        configurable: true
    });
    BaseProvider.prototype._checkMirrorNode = function () {
        if (!this._mirrorNodeUrl)
            logger.throwError("missing provider", logger_1.Logger.errors.UNSUPPORTED_OPERATION);
    };
    // This method should query the network if the underlying network
    // can change, such as when connected to a JSON-RPC backend
    // With the current hedera implementation, we do not support changeable networks,
    // thus we do not need to query at this level
    BaseProvider.prototype.detectNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._networkPromise = Promise.resolve(this._network);
                return [2 /*return*/, this._networkPromise];
            });
        });
    };
    BaseProvider.prototype.getNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var network, currentNetwork, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ready()];
                    case 1:
                        network = _a.sent();
                        return [4 /*yield*/, this.detectNetwork()];
                    case 2:
                        currentNetwork = _a.sent();
                        if (!(network.chainId !== currentNetwork.chainId)) return [3 /*break*/, 5];
                        if (!this.anyNetwork) return [3 /*break*/, 4];
                        this._network = currentNetwork;
                        // The "network" event MUST happen before this method resolves
                        // so any events have a chance to unregister, so we stall an
                        // additional event loop before returning from /this/ call
                        this.emit("network", currentNetwork, network);
                        return [4 /*yield*/, stall(0)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this._network];
                    case 4:
                        error = logger.makeError("underlying network changed", logger_1.Logger.errors.NETWORK_ERROR, {
                            event: "changed",
                            network: network,
                            detectedNetwork: currentNetwork
                        });
                        this.emit("error", error);
                        throw error;
                    case 5: return [2 /*return*/, network];
                }
            });
        });
    };
    Object.defineProperty(BaseProvider.prototype, "pollingInterval", {
        get: function () {
            return this._pollingInterval;
        },
        set: function (value) {
            if (typeof (value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
                throw new Error("invalid polling interval");
            }
            this._pollingInterval = value;
        },
        enumerable: false,
        configurable: true
    });
    BaseProvider.prototype.waitForTransaction = function (transactionId, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._waitForTransaction(transactionId, timeout)];
            });
        });
    };
    BaseProvider.prototype._waitForTransaction = function (transactionId, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var remainingTimeout;
            var _this = this;
            return __generator(this, function (_a) {
                remainingTimeout = timeout;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var txResponse;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(remainingTimeout == null || remainingTimeout > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, this.getTransaction(transactionId)];
                                case 1:
                                    txResponse = _a.sent();
                                    if (!(txResponse == null)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            setTimeout(resolve, _this._pollingInterval);
                                        })];
                                case 2:
                                    _a.sent();
                                    if (remainingTimeout != null)
                                        remainingTimeout -= this._pollingInterval;
                                    return [3 /*break*/, 4];
                                case 3: return [2 /*return*/, resolve(this.formatter.receiptFromResponse(txResponse))];
                                case 4: return [3 /*break*/, 0];
                                case 5:
                                    reject(logger.makeError("timeout exceeded", logger_1.Logger.errors.TIMEOUT, { timeout: timeout }));
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     *  AccountBalance query implementation, using the hashgraph sdk.
     *  It returns the tinybar balance of the given address.
     *
     * @param accountLike The address to check balance of
     */
    BaseProvider.prototype.getBalance = function (accountLike) {
        return __awaiter(this, void 0, void 0, function () {
            var account, balance, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, accountLike];
                    case 1:
                        accountLike = _a.sent();
                        account = (0, address_1.asAccountString)(accountLike);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, new sdk_2.AccountBalanceQuery()
                                .setAccountId(sdk_2.AccountId.fromString(account))
                                .execute(this.hederaClient)];
                    case 3:
                        balance = _a.sent();
                        return [2 /*return*/, bignumber_1.BigNumber.from(balance.hbars.toTinybars().toNumber())];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, logger.throwError("bad result from backend", logger_1.Logger.errors.SERVER_ERROR, {
                                method: "AccountBalanceQuery",
                                params: { address: accountLike },
                                error: error_2
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  Get contract bytecode implementation, using the REST Api.
     *  It returns the bytecode, or a default value as string.
     *
     * @param accountLike The address to get code for
     * @param throwOnNonExisting Whether or not to throw exception if address is not a contract
     */
    BaseProvider.prototype.getCode = function (accountLike, throwOnNonExisting) {
        return __awaiter(this, void 0, void 0, function () {
            var account, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkMirrorNode();
                        return [4 /*yield*/, accountLike];
                    case 1:
                        accountLike = _a.sent();
                        account = (0, address_1.asAccountString)(accountLike);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(this._mirrorNodeUrl + MIRROR_NODE_CONTRACTS_ENDPOINT + account)];
                    case 3:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data.bytecode ? (0, bytes_1.hexlify)(data.bytecode) : "0x"];
                    case 4:
                        error_3 = _a.sent();
                        if (error_3.response && error_3.response.status &&
                            (error_3.response.status != 404 || (error_3.response.status == 404 && throwOnNonExisting))) {
                            logger.throwError("bad result from backend", logger_1.Logger.errors.SERVER_ERROR, {
                                method: "ContractByteCodeQuery",
                                params: { address: accountLike },
                                error: error_3
                            });
                        }
                        return [2 /*return*/, "0x"];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // This should be called by any subclass wrapping a TransactionResponse
    BaseProvider.prototype._wrapTransaction = function (tx, hash, receipt) {
        var _this = this;
        if (hash != null && (0, bytes_1.hexDataLength)(hash) !== 48) {
            throw new Error("invalid response - sendTransaction");
        }
        var result = tx;
        if (!result.customData)
            result.customData = {};
        if (receipt && receipt.fileId) {
            result.customData.fileId = receipt.fileId.toString();
        }
        if (receipt && receipt.contractId) {
            result.customData.contractId = receipt.contractId.toSolidityAddress();
        }
        if (receipt && receipt.accountId) {
            result.customData.accountId = receipt.accountId;
        }
        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            logger.throwError("Transaction hash mismatch from Provider.sendTransaction.", logger_1.Logger.errors.UNKNOWN_ERROR, {
                expectedHash: tx.hash,
                returnedHash: hash
            });
        }
        result.wait = function (timeout) { return __awaiter(_this, void 0, void 0, function () {
            var receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._waitForTransaction(tx.transactionId, timeout)];
                    case 1:
                        receipt = _a.sent();
                        if (receipt.status === 0) {
                            logger.throwError("transaction failed", logger_1.Logger.errors.CALL_EXCEPTION, {
                                transactionHash: tx.hash,
                                transaction: tx,
                                receipt: receipt
                            });
                        }
                        return [2 /*return*/, receipt];
                }
            });
        }); };
        return result;
    };
    BaseProvider.prototype.getHederaClient = function () {
        return this.hederaClient;
    };
    BaseProvider.prototype.getHederaNetworkConfig = function () {
        return this.hederaClient._network.getNodeAccountIdsForExecute();
    };
    BaseProvider.prototype.sendTransaction = function (signedTransaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var txBytes, hederaTx, ethersTx, txHash, _b, resp, receipt, error_4, err;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, signedTransaction];
                    case 1:
                        signedTransaction = _c.sent();
                        txBytes = (0, bytes_1.arrayify)(signedTransaction);
                        hederaTx = sdk_2.Transaction.fromBytes(txBytes);
                        return [4 /*yield*/, this.formatter.transaction(signedTransaction)];
                    case 2:
                        ethersTx = _c.sent();
                        _b = bytes_1.hexlify;
                        return [4 /*yield*/, hederaTx.getTransactionHash()];
                    case 3:
                        txHash = _b.apply(void 0, [_c.sent()]);
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, hederaTx.execute(this.hederaClient)];
                    case 5:
                        resp = _c.sent();
                        return [4 /*yield*/, resp.getReceipt(this.hederaClient)];
                    case 6:
                        receipt = _c.sent();
                        return [2 /*return*/, this._wrapTransaction(ethersTx, txHash, receipt)];
                    case 7:
                        error_4 = _c.sent();
                        err = logger.makeError(error_4.message, (_a = error_4.status) === null || _a === void 0 ? void 0 : _a.toString());
                        err.transaction = ethersTx;
                        err.transactionHash = txHash;
                        throw err;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BaseProvider.prototype._getFilter = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, filter];
                    case 1:
                        filter = _c.sent();
                        result = {};
                        if (filter.address != null) {
                            result.address = filter.address.toString();
                        }
                        ["topics"].forEach(function (key) {
                            if (filter[key] == null) {
                                return;
                            }
                            result[key] = filter[key];
                        });
                        ["fromTimestamp", "toTimestamp"].forEach(function (key) {
                            if (filter[key] == null) {
                                return;
                            }
                            result[key] = filter[key];
                        });
                        _b = (_a = this.formatter).filter;
                        return [4 /*yield*/, (0, properties_1.resolveProperties)(result)];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    BaseProvider.prototype.estimateGas = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, logger.throwArgumentError("estimateGas not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, {
                        operation: "estimateGas"
                    })];
            });
        });
    };
    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionIdOrTimestamp - id or consensus timestamp of the transaction to search for
     */
    BaseProvider.prototype.getTransaction = function (transactionIdOrTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionsEndpoint, data, filtered_1, record_1, transactionName, charityFee_1, toTransfers, contractsEndpoint, dataWithLogs, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkMirrorNode();
                        return [4 /*yield*/, transactionIdOrTimestamp];
                    case 1:
                        transactionIdOrTimestamp = _a.sent();
                        transactionsEndpoint = MIRROR_NODE_TRANSACTIONS_ENDPOINT;
                        !transactionIdOrTimestamp.includes("-") ? transactionsEndpoint += ('?timestamp=' + transactionIdOrTimestamp) : transactionsEndpoint += transactionIdOrTimestamp;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        return [4 /*yield*/, axios_1.default.get(this._mirrorNodeUrl + transactionsEndpoint)];
                    case 3:
                        data = (_a.sent()).data;
                        if (!data) return [3 /*break*/, 8];
                        filtered_1 = data.transactions.filter(function (e) { return e.result != 'DUPLICATE_TRANSACTION'; });
                        if (!(filtered_1.length > 0)) return [3 /*break*/, 8];
                        record_1 = {
                            chainId: this._network.chainId,
                            transactionId: filtered_1[0].transaction_id,
                            result: filtered_1[0].result,
                            customData: {}
                        };
                        transactionName = filtered_1[0].name;
                        if (!(transactionName === 'CRYPTOCREATEACCOUNT')) return [3 /*break*/, 4];
                        record_1.from = (0, address_1.getAccountFromTransactionId)(filtered_1[0].transaction_id);
                        record_1.timestamp = filtered_1[0].consensus_timestamp;
                        // Different endpoints of the mirror node API returns hashes in different formats.
                        // In order to ensure consistency with data from MIRROR_NODE_CONTRACTS_ENDPOINT
                        // the hash from MIRROR_NODE_TRANSACTIONS_ENDPOINT is base64 decoded and then converted to hex.
                        record_1.hash = base64ToHex(filtered_1[0].transaction_hash);
                        record_1.accountAddress = (0, address_1.getAddressFromAccount)(filtered_1[0].entity_id);
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(transactionName === 'CRYPTOTRANSFER')) return [3 /*break*/, 5];
                        record_1.from = (0, address_1.getAccountFromTransactionId)(filtered_1[0].transaction_id);
                        record_1.timestamp = filtered_1[0].consensus_timestamp;
                        record_1.hash = base64ToHex(filtered_1[0].transaction_hash);
                        charityFee_1 = 0;
                        toTransfers = filtered_1[0].transfers.filter(function (t) {
                            if (t.account == filtered_1[0].node) {
                                charityFee_1 = filtered_1[0].charged_tx_fee - t.amount;
                                return false;
                            }
                            return t.account != record_1.from;
                        }).filter(function (t) {
                            return t.amount != charityFee_1;
                        });
                        if (toTransfers.length > 1) {
                            record_1.transfersList = toTransfers;
                        }
                        else {
                            record_1.to = toTransfers[0].account;
                            record_1.amount = toTransfers[0].amount;
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        contractsEndpoint = MIRROR_NODE_CONTRACTS_RESULTS_ENDPOINT + filtered_1[0].transaction_id;
                        return [4 /*yield*/, axios_1.default.get(this._mirrorNodeUrl + contractsEndpoint)];
                    case 6:
                        dataWithLogs = _a.sent();
                        record_1 = Object.assign({}, record_1, __assign({}, dataWithLogs.data));
                        _a.label = 7;
                    case 7: return [2 /*return*/, this.formatter.responseFromRecord(record_1)];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_5 = _a.sent();
                        if (error_5 && error_5.response && error_5.response.status != 404) {
                            logger.throwError("bad result from backend", logger_1.Logger.errors.SERVER_ERROR, {
                                method: "TransactionResponseQuery",
                                error: error_5
                            });
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionId - id of the transaction to search for
     */
    BaseProvider.prototype.getTransactionReceipt = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, logger.throwError("getTransactionReceipt not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, {
                        operation: 'getTransactionReceipt'
                    })
                    // await this.getNetwork();
                    // transactionId = await transactionId;
                    // try {
                    //     let receipt = await new TransactionReceiptQuery()
                    //         .setTransactionId(transactionId)
                    //         .execute(this.hederaClient);
                    //     console.log("getTransactionReceipt: ", receipt);
                    //     return null;
                    // } catch (error) {
                    //     return logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, {
                    //         method: "TransactionGetReceiptQuery",
                    //         error
                    //     });
                    // }
                ];
            });
        });
    };
    /**
     *  Get contract logs implementation, using the REST Api.
     *  It returns the logs array, or a default value [].
     *  Throws an exception, when the result size exceeds the given limit.
     *
     * @param filter The parameters to filter logs by.
     */
    BaseProvider.prototype.getLogs = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var params, fromTimestampFilter, toTimestampFilter, limit, oversizeResponseLength, epContractsLogs, i, topic, requestUrl, data, mappedLogs, error_6, errorParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkMirrorNode();
                        return [4 /*yield*/, (0, properties_1.resolveProperties)({ filter: this._getFilter(filter) })];
                    case 1:
                        params = _a.sent();
                        // set default values
                        params.filter.fromTimestamp = params.filter.fromTimestamp || ZERO_HEDERA_TIMESTAMP;
                        params.filter.toTimestamp = params.filter.toTimestamp || sdk_1.Timestamp.generate().toString();
                        fromTimestampFilter = '&timestamp=gte%3A' + params.filter.fromTimestamp;
                        toTimestampFilter = '&timestamp=lte%3A' + params.filter.toTimestamp;
                        limit = 100;
                        oversizeResponseLength = limit + 1;
                        epContractsLogs = '/api/v1/contracts/' + params.filter.address + '/results/logs?limit=' + oversizeResponseLength;
                        if (params.filter.topics && params.filter.topics.length > 0) {
                            for (i = 0; i < params.filter.topics.length; i++) {
                                topic = params.filter.topics[i];
                                if (typeof topic === "string") {
                                    epContractsLogs += "&topic" + i + "=" + topic;
                                }
                                else {
                                    return [2 /*return*/, logger.throwArgumentError("OR on topics", logger_1.Logger.errors.UNSUPPORTED_OPERATION, params.filter.topics)];
                                }
                            }
                        }
                        requestUrl = this._mirrorNodeUrl + epContractsLogs + toTimestampFilter + fromTimestampFilter;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(requestUrl)];
                    case 3:
                        data = (_a.sent()).data;
                        if (data) {
                            mappedLogs = this.formatter.logsMapper(data.logs);
                            if (mappedLogs.length == oversizeResponseLength) {
                                logger.throwError("query returned more than " + limit + " results", logger_1.Logger.errors.SERVER_ERROR);
                            }
                            return [2 /*return*/, formatter_1.Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(mappedLogs)];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        errorParams = { method: "ContractLogsQuery", error: error_6 };
                        if (error_6.response && error_6.response.status != 404) {
                            logger.throwError("bad result from backend", logger_1.Logger.errors.SERVER_ERROR, errorParams);
                        }
                        logger.throwError(error_6.message, error_6.code, errorParams);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, []];
                }
            });
        });
    };
    BaseProvider.prototype.getHbarPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, logger.throwError("NOT_IMPLEMENTED", logger_1.Logger.errors.NOT_IMPLEMENTED)];
            });
        });
    };
    /* Events, Event Listeners & Polling */
    BaseProvider.prototype._startEvent = function (event) {
        this.polling = (this._events.filter(function (e) { return e.pollable(); }).length > 0);
        this._previousPollingTimestamps[event.tag] = sdk_1.Timestamp.generate();
    };
    BaseProvider.prototype._stopEvent = function (event) {
        this.polling = (this._events.filter(function (e) { return e.pollable(); }).length > 0);
        delete this._previousPollingTimestamps[event.tag];
    };
    BaseProvider.prototype.perform = function (method, params) {
        return logger.throwError(method + " not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, { operation: method });
    };
    BaseProvider.prototype._addEventListener = function (eventName, listener, once) {
        var event = new Event(getEventTag(eventName), listener, once);
        this._events.push(event);
        this._startEvent(event);
        return this;
    };
    BaseProvider.prototype.on = function (eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    };
    BaseProvider.prototype.once = function (eventName, listener) {
        return this._addEventListener(eventName, listener, true);
    };
    BaseProvider.prototype.emit = function (eventName) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var result = false;
        var stopped = [];
        var eventTag = getEventTag(eventName);
        this._events = this._events.filter(function (event) {
            if (event.tag !== eventTag) {
                return true;
            }
            setTimeout(function () {
                event.listener.apply(_this, args);
            }, 0);
            result = true;
            if (event.once) {
                stopped.push(event);
                return false;
            }
            return true;
        });
        stopped.forEach(function (event) {
            _this._stopEvent(event);
        });
        return result;
    };
    BaseProvider.prototype.listenerCount = function (eventName) {
        if (!eventName) {
            return this._events.length;
        }
        var eventTag = getEventTag(eventName);
        return this._events.filter(function (event) {
            return (event.tag === eventTag);
        }).length;
    };
    BaseProvider.prototype.listeners = function (eventName) {
        if (eventName == null) {
            return this._events.map(function (event) { return event.listener; });
        }
        var eventTag = getEventTag(eventName);
        return this._events
            .filter(function (event) { return (event.tag === eventTag); })
            .map(function (event) { return event.listener; });
    };
    BaseProvider.prototype.off = function (eventName, listener) {
        var _this = this;
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }
        var stopped = [];
        var found = false;
        var eventTag = getEventTag(eventName);
        this._events = this._events.filter(function (event) {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            stopped.push(event);
            return false;
        });
        stopped.forEach(function (event) {
            _this._stopEvent(event);
        });
        return this;
    };
    BaseProvider.prototype.removeAllListeners = function (eventName) {
        var _this = this;
        var stopped = [];
        if (eventName == null) {
            stopped = this._events;
            this._events = [];
        }
        else {
            var eventTag_1 = getEventTag(eventName);
            this._events = this._events.filter(function (event) {
                if (event.tag !== eventTag_1) {
                    return true;
                }
                stopped.push(event);
                return false;
            });
        }
        stopped.forEach(function (event) {
            _this._stopEvent(event);
        });
        return this;
    };
    Object.defineProperty(BaseProvider.prototype, "polling", {
        get: function () {
            return (this._poller != null);
        },
        set: function (value) {
            var _this = this;
            if (value && !this._poller) {
                this._poller = setInterval(function () {
                    _this.poll();
                }, this.pollingInterval);
                if (!this._bootstrapPoll) {
                    this._bootstrapPoll = setTimeout(function () {
                        _this.poll();
                        // We block additional polls until the polling interval
                        // is done, to prevent overwhelming the poll function
                        _this._bootstrapPoll = setTimeout(function () {
                            // If polling was disabled, something may require a poke
                            // since starting the bootstrap poll and it was disabled
                            if (!_this._poller) {
                                _this.poll();
                            }
                            // Clear out the bootstrap so we can do another
                            _this._bootstrapPoll = null;
                        }, _this.pollingInterval);
                    }, 0);
                }
            }
            else if (!value && this._poller) {
                clearInterval(this._poller);
                this._poller = null;
            }
        },
        enumerable: false,
        configurable: true
    });
    BaseProvider.prototype.poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pollId, runners, now;
            var _this = this;
            return __generator(this, function (_a) {
                pollId = nextPollId++;
                // purge the old events
                this.purgeOldEvents();
                runners = [];
                now = sdk_1.Timestamp.generate();
                this.emit("poll", pollId, now.toDate().getTime());
                this._events.forEach(function (event) {
                    switch (event.type) {
                        case "filter": {
                            var filter_1 = event.filter;
                            var from = _this._previousPollingTimestamps[event.tag];
                            // ensure we don't get from == to
                            from = from.plusNanos(1);
                            filter_1.fromTimestamp = from.toString();
                            filter_1.toTimestamp = now.toString();
                            var runner = _this.getLogs(filter_1).then(function (logs) {
                                if (logs.length === 0) {
                                    return;
                                }
                                logs.forEach(function (log) {
                                    if (!_this._emittedEvents[log.timestamp]) {
                                        _this.emit(filter_1, log);
                                        _this._emittedEvents[log.timestamp] = true;
                                        var _a = log.timestamp.split(".").map(parseInt), logTsSeconds = _a[0], logTsNanos = _a[1];
                                        var logTimestamp = new sdk_1.Timestamp(logTsSeconds, logTsNanos);
                                        // longInstance.compare(other) returns -1 when other > this, 0 when they are equal and 1 then this > other
                                        if (_this._previousPollingTimestamps[event.tag].compare(logTimestamp) == -1) {
                                            _this._previousPollingTimestamps[event.tag] = logTimestamp;
                                        }
                                    }
                                });
                            }).catch(function (error) {
                                _this.emit("error", error);
                            });
                            runners.push(runner);
                            break;
                        }
                    }
                });
                // Once all events for this loop have been processed, emit "didPoll"
                Promise.all(runners).then(function () {
                    _this.emit("didPoll", pollId);
                }).catch(function (error) {
                    _this.emit("error", error);
                });
                return [2 /*return*/];
            });
        });
    };
    BaseProvider.prototype.purgeOldEvents = function () {
        for (var emittedEventsKey in this._emittedEvents) {
            var _a = emittedEventsKey.split(".").map(parseInt), sec = _a[0], nano = _a[1];
            var ts = new sdk_1.Timestamp(sec, nano);
            var now = sdk_1.Timestamp.generate();
            // clean up events which are significantly old - older than 3 minutes
            var threeMinutes = 1000 * 1000 * 1000 * 60 * 3;
            if (ts.compare(now.plusNanos(threeMinutes)) == -1) {
                delete this._emittedEvents[emittedEventsKey];
            }
        }
    };
    return BaseProvider;
}(abstract_provider_1.Provider));
exports.BaseProvider = BaseProvider;
// resolves network string to a hedera network name
function mapNetworkToHederaNetworkName(net) {
    switch (net) {
        case 'mainnet':
            return sdk_2.NetworkName.Mainnet;
        case 'previewnet':
            return sdk_2.NetworkName.Previewnet;
        case 'testnet':
            return sdk_2.NetworkName.Testnet;
        default:
            logger.throwArgumentError("Invalid network name", "network", net);
            return null;
    }
}
// resolves the mirror node url from the given provider network.
function resolveMirrorNetworkUrl(net) {
    switch (net.name) {
        case 'mainnet':
            return 'https://mainnet.mirrornode.hedera.com';
        case 'previewnet':
            return 'https://previewnet.mirrornode.hedera.com';
        case 'testnet':
            return 'https://testnet.mirrornode.hedera.com';
        default:
            logger.throwArgumentError("Invalid network name", "network", net);
            return null;
    }
}
function isHederaNetworkConfigLike(cfg) {
    return cfg.network !== undefined;
}
function getEventTag(eventName) {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if ((0, bytes_1.hexDataLength)(eventName) === 32) {
            return "tx:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    else if (Array.isArray(eventName)) {
        return "filter:*:" + serializeTopics(eventName);
    }
    else if (eventName && typeof (eventName) === "object") {
        return "filter:" + (eventName.address || "*") + ":" + serializeTopics(eventName.topics || []);
    }
    throw new Error("invalid event - " + eventName);
}
//# sourceMappingURL=base-provider.js.map