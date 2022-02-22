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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFactory = exports.Contract = exports.BaseContract = void 0;
var abi_1 = require("@ethersproject/abi");
var abstract_provider_1 = require("@hethers/abstract-provider");
var providers_1 = require("@hethers/providers");
var abstract_signer_1 = require("@hethers/abstract-signer");
var address_1 = require("@hethers/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var properties_1 = require("@ethersproject/properties");
var transactions_1 = require("@hethers/transactions");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
///////////////////////////////
var allowedTransactionKeys = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice: true, to: true, value: true,
    type: true,
    maxFeePerGas: true, maxPriorityFeePerGas: true,
    customData: true, nodeId: true,
};
function populateTransaction(contract, fragment, args) {
    return __awaiter(this, void 0, void 0, function () {
        var overrides, resolved, data, tx, ro, intrinsic, contractCreationExtraGasCost, bytes, i, txGas, roValue, leftovers;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    overrides = {};
                    if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
                        overrides = (0, properties_1.shallowCopy)(args.pop());
                    }
                    // Make sure the parameter count matches
                    logger.checkArgumentCount(args.length, fragment.inputs.length, "passed to contract");
                    // Populate "from" override (allow promises)
                    if (contract.signer) {
                        if (overrides.from) {
                            // Contracts with a Signer are from the Signer's frame-of-reference;
                            // but we allow overriding "from" if it matches the signer
                            overrides.from = (0, properties_1.resolveProperties)({
                                override: overrides.from,
                                signer: contract.signer.getAddress()
                            }).then(function (check) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if ((0, address_1.getAddress)(check.signer) !== check.override) {
                                        logger.throwError("Contract with a Signer cannot override from", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                                            operation: "overrides.from"
                                        });
                                    }
                                    return [2 /*return*/, check.override];
                                });
                            }); });
                        }
                        else {
                            overrides.from = contract.signer.getAddress();
                        }
                    }
                    return [4 /*yield*/, (0, properties_1.resolveProperties)({
                            args: args,
                            address: contract.address,
                            overrides: ((0, properties_1.resolveProperties)(overrides) || {})
                        })];
                case 1:
                    resolved = _a.sent();
                    data = contract.interface.encodeFunctionData(fragment, resolved.args);
                    tx = {
                        data: data,
                        to: resolved.address
                    };
                    ro = resolved.overrides;
                    // Populate simple overrides
                    if (ro.gasLimit != null) {
                        tx.gasLimit = bignumber_1.BigNumber.from(ro.gasLimit);
                    }
                    if (ro.maxFeePerGas != null) {
                        tx.maxFeePerGas = bignumber_1.BigNumber.from(ro.maxFeePerGas);
                    }
                    if (ro.maxPriorityFeePerGas != null) {
                        tx.maxPriorityFeePerGas = bignumber_1.BigNumber.from(ro.maxPriorityFeePerGas);
                    }
                    if (ro.from != null) {
                        tx.from = ro.from;
                    }
                    if (ro.type != null) {
                        tx.type = ro.type;
                    }
                    if (ro.accessList != null) {
                        tx.accessList = (0, transactions_1.accessListify)(ro.accessList);
                    }
                    if (ro.nodeId != null) {
                        tx.nodeId = ro.nodeId;
                    }
                    // If there was no "gasLimit" override, but the ABI specifies a default, use it
                    if (tx.gasLimit == null && fragment.gas != null) {
                        intrinsic = 21000;
                        contractCreationExtraGasCost = 11000;
                        bytes = (0, bytes_1.arrayify)(data);
                        for (i = 0; i < bytes.length; i++) {
                            intrinsic += 4;
                            if (bytes[i]) {
                                intrinsic += 16;
                            }
                        }
                        txGas = tx.to != null ? intrinsic : intrinsic + contractCreationExtraGasCost;
                        tx.gasLimit = bignumber_1.BigNumber.from(fragment.gas).add(txGas);
                    }
                    // Populate "value" override
                    if (ro.value) {
                        roValue = bignumber_1.BigNumber.from(ro.value);
                        if (!roValue.isZero() && !fragment.payable) {
                            logger.throwError("non-payable method cannot override value", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                                operation: "overrides.value",
                                value: overrides.value
                            });
                        }
                        tx.value = roValue;
                    }
                    if (ro.customData) {
                        tx.customData = (0, properties_1.shallowCopy)(ro.customData);
                    }
                    // Remove the overrides
                    delete overrides.gasLimit;
                    delete overrides.from;
                    delete overrides.value;
                    delete overrides.type;
                    delete overrides.accessList;
                    delete overrides.maxFeePerGas;
                    delete overrides.maxPriorityFeePerGas;
                    delete overrides.customData;
                    delete overrides.nodeId;
                    leftovers = Object.keys(overrides).filter(function (key) { return (overrides[key] != null); });
                    if (leftovers.length) {
                        logger.throwError("cannot override " + leftovers.map(function (l) { return JSON.stringify(l); }).join(","), logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                            operation: "overrides",
                            overrides: leftovers
                        });
                    }
                    return [2 /*return*/, tx];
            }
        });
    });
}
function buildPopulate(contract, fragment) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return populateTransaction(contract, fragment, args);
    };
}
// @ts-ignore
function buildEstimate(contract, fragment) {
    var signerOrProvider = (contract.signer || contract.provider);
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!signerOrProvider) {
                            logger.throwError("estimate require a provider or signer", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                                operation: "estimateGas"
                            });
                        }
                        return [4 /*yield*/, populateTransaction(contract, fragment, args)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, signerOrProvider.estimateGas(tx)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
}
function addContractWait(contract, tx) {
    var wait = tx.wait.bind(tx);
    tx.wait = function (timeout) {
        return wait(timeout).then(function (receipt) {
            receipt.events = receipt.logs.map(function (log) {
                var event = (0, properties_1.deepCopy)(log);
                var parsed = null;
                try {
                    parsed = contract.interface.parseLog(log);
                }
                catch (e) { }
                // Successfully parsed the event log; include it
                if (parsed) {
                    event.args = parsed.args;
                    event.decode = function (data, topics) {
                        return contract.interface.decodeEventLog(parsed.eventFragment, data, topics);
                    };
                    event.event = parsed.name;
                    event.eventSignature = parsed.signature;
                }
                // Useful operations
                event.removeListener = function () { return contract.provider; };
                event.getTransaction = function () {
                    return contract.provider.getTransaction(receipt.transactionId);
                };
                event.getTransactionReceipt = function () {
                    return Promise.resolve(receipt);
                };
                return event;
            });
            return receipt;
        });
    };
}
function buildCall(contract, fragment, collapseSimple) {
    var signer = contract.signer;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var overrides, tx, result, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
                            overrides = (0, properties_1.shallowCopy)(args.pop());
                            args.push(overrides);
                        }
                        if (!(contract.deployTransaction != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, contract._deployed()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, populateTransaction(contract, fragment, args)];
                    case 3:
                        tx = _a.sent();
                        return [4 /*yield*/, signer.call(tx)];
                    case 4:
                        result = _a.sent();
                        try {
                            value = contract.interface.decodeFunctionResult(fragment, result);
                            if (collapseSimple && fragment.outputs.length === 1) {
                                value = value[0];
                            }
                            return [2 /*return*/, value];
                        }
                        catch (error) {
                            if (error.code === logger_1.Logger.errors.CALL_EXCEPTION) {
                                error.address = contract.address;
                                error.args = args;
                                error.transaction = tx;
                            }
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
}
function buildSend(contract, fragment) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var txRequest, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!contract.signer) {
                            logger.throwError("sending a transaction requires a signer", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                                operation: "sendTransaction"
                            });
                        }
                        if (!(contract.deployTransaction != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, contract._deployed()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, populateTransaction(contract, fragment, args)];
                    case 3:
                        txRequest = _a.sent();
                        return [4 /*yield*/, contract.signer.sendTransaction(txRequest)];
                    case 4:
                        tx = _a.sent();
                        // Tweak the tx.wait so the receipt has extra properties
                        addContractWait(contract, tx);
                        return [2 /*return*/, tx];
                }
            });
        });
    };
}
function buildDefault(contract, fragment, collapseSimple) {
    if (fragment.constant) {
        return buildCall(contract, fragment, collapseSimple);
    }
    return buildSend(contract, fragment);
}
function getEventTag(filter) {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return "*";
    }
    return (filter.address || "*") + "@" + (filter.topics ? filter.topics.map(function (topic) {
        if (Array.isArray(topic)) {
            return topic.join("|");
        }
        return topic;
    }).join(":") : "");
}
var RunningEvent = /** @class */ (function () {
    function RunningEvent(tag, filter) {
        (0, properties_1.defineReadOnly)(this, "tag", tag);
        (0, properties_1.defineReadOnly)(this, "filter", filter);
        this._listeners = [];
    }
    RunningEvent.prototype.addListener = function (listener, once) {
        this._listeners.push({ listener: listener, once: once });
    };
    RunningEvent.prototype.removeListener = function (listener) {
        var done = false;
        this._listeners = this._listeners.filter(function (item) {
            if (done || item.listener !== listener) {
                return true;
            }
            done = true;
            return false;
        });
    };
    RunningEvent.prototype.removeAllListeners = function () {
        this._listeners = [];
    };
    RunningEvent.prototype.listeners = function () {
        return this._listeners.map(function (i) { return i.listener; });
    };
    RunningEvent.prototype.listenerCount = function () {
        return this._listeners.length;
    };
    RunningEvent.prototype.run = function (args) {
        var _this = this;
        var listenerCount = this.listenerCount();
        this._listeners = this._listeners.filter(function (item) {
            var argsCopy = args.slice();
            // Call the callback in the next event loop
            setTimeout(function () {
                item.listener.apply(_this, argsCopy);
            }, 0);
            // Reschedule it if it not "once"
            return !(item.once);
        });
        return listenerCount;
    };
    RunningEvent.prototype.prepareEvent = function (event) {
    };
    // Returns the array that will be applied to an emit
    RunningEvent.prototype.getEmit = function (event) {
        return [event];
    };
    return RunningEvent;
}());
var ErrorRunningEvent = /** @class */ (function (_super) {
    __extends(ErrorRunningEvent, _super);
    function ErrorRunningEvent() {
        return _super.call(this, "error", null) || this;
    }
    return ErrorRunningEvent;
}(RunningEvent));
// @TODO Fragment should inherit Wildcard? and just override getEmit?
//       or have a common abstract super class, with enough constructor
//       options to configure both.
// A Fragment Event will populate all the properties that Wildcard
// will, and additionally dereference the arguments when emitting
var FragmentRunningEvent = /** @class */ (function (_super) {
    __extends(FragmentRunningEvent, _super);
    function FragmentRunningEvent(address, contractInterface, fragment, topics) {
        var _this = this;
        var filter = {
            address: address
        };
        var topic = contractInterface.getEventTopic(fragment);
        if (topics) {
            if (topic !== topics[0]) {
                logger.throwArgumentError("topic mismatch", "topics", topics);
            }
            filter.topics = topics.slice();
        }
        else {
            filter.topics = [topic];
        }
        _this = _super.call(this, getEventTag(filter), filter) || this;
        (0, properties_1.defineReadOnly)(_this, "address", address);
        (0, properties_1.defineReadOnly)(_this, "interface", contractInterface);
        (0, properties_1.defineReadOnly)(_this, "fragment", fragment);
        return _this;
    }
    FragmentRunningEvent.prototype.prepareEvent = function (event) {
        var _this = this;
        _super.prototype.prepareEvent.call(this, event);
        event.event = this.fragment.name;
        event.eventSignature = this.fragment.format();
        event.decode = function (data, topics) {
            return _this.interface.decodeEventLog(_this.fragment, data, topics);
        };
        try {
            event.args = this.interface.decodeEventLog(this.fragment, event.data, event.topics);
        }
        catch (error) {
            event.args = null;
            event.decodeError = error;
        }
    };
    FragmentRunningEvent.prototype.getEmit = function (event) {
        var errors = (0, abi_1.checkResultErrors)(event.args);
        if (errors.length) {
            throw errors[0].error;
        }
        var args = (event.args || []).slice();
        args.push(event);
        return args;
    };
    return FragmentRunningEvent;
}(RunningEvent));
// A Wildcard Event will attempt to populate:
//  - event            The name of the event name
//  - eventSignature   The full signature of the event
//  - decode           A function to decode data and topics
//  - args             The decoded data and topics
var WildcardRunningEvent = /** @class */ (function (_super) {
    __extends(WildcardRunningEvent, _super);
    function WildcardRunningEvent(address, contractInterface) {
        var _this = _super.call(this, "*", { address: address }) || this;
        (0, properties_1.defineReadOnly)(_this, "address", address);
        (0, properties_1.defineReadOnly)(_this, "interface", contractInterface);
        return _this;
    }
    WildcardRunningEvent.prototype.prepareEvent = function (event) {
        var _this = this;
        _super.prototype.prepareEvent.call(this, event);
        try {
            var parsed_1 = this.interface.parseLog(event);
            event.event = parsed_1.name;
            event.eventSignature = parsed_1.signature;
            event.decode = function (data, topics) {
                return _this.interface.decodeEventLog(parsed_1.eventFragment, data, topics);
            };
            event.args = parsed_1.args;
        }
        catch (error) {
            // No matching event
        }
    };
    return WildcardRunningEvent;
}(RunningEvent));
var BaseContract = /** @class */ (function () {
    function BaseContract(address, contractInterface, signerOrProvider) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, Contract);
        if (address) {
            this.address = (0, address_1.getAddressFromAccount)(address);
        }
        (0, properties_1.defineReadOnly)(this, "interface", (0, properties_1.getStatic)(_newTarget, "getInterface")(contractInterface));
        if (signerOrProvider == null) {
            (0, properties_1.defineReadOnly)(this, "provider", null);
            (0, properties_1.defineReadOnly)(this, "signer", null);
        }
        else if (abstract_signer_1.Signer.isSigner(signerOrProvider)) {
            (0, properties_1.defineReadOnly)(this, "provider", signerOrProvider.provider || null);
            (0, properties_1.defineReadOnly)(this, "signer", signerOrProvider);
        }
        else if (abstract_provider_1.Provider.isProvider(signerOrProvider)) {
            (0, properties_1.defineReadOnly)(this, "provider", signerOrProvider);
            (0, properties_1.defineReadOnly)(this, "signer", null);
        }
        else {
            logger.throwArgumentError("invalid signer or provider", "signerOrProvider", signerOrProvider);
        }
        (0, properties_1.defineReadOnly)(this, "callStatic", {});
        (0, properties_1.defineReadOnly)(this, "functions", {});
        (0, properties_1.defineReadOnly)(this, "populateTransaction", {});
        (0, properties_1.defineReadOnly)(this, "filters", {});
        {
            var uniqueFilters_1 = {};
            Object.keys(this.interface.events).forEach(function (eventSignature) {
                var event = _this.interface.events[eventSignature];
                (0, properties_1.defineReadOnly)(_this.filters, eventSignature, function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return {
                        address: _this.address,
                        topics: _this.interface.encodeFilterTopics(event, args)
                    };
                });
                if (!uniqueFilters_1[event.name]) {
                    uniqueFilters_1[event.name] = [];
                }
                uniqueFilters_1[event.name].push(eventSignature);
            });
            Object.keys(uniqueFilters_1).forEach(function (name) {
                var filters = uniqueFilters_1[name];
                if (filters.length === 1) {
                    (0, properties_1.defineReadOnly)(_this.filters, name, _this.filters[filters[0]]);
                }
                else {
                    logger.warn("Duplicate definition of " + name + " (" + filters.join(", ") + ")");
                }
            });
        }
        (0, properties_1.defineReadOnly)(this, "_runningEvents", {});
        (0, properties_1.defineReadOnly)(this, "_wrappedEmits", {});
        var uniqueNames = {};
        var uniqueSignatures = {};
        Object.keys(this.interface.functions).forEach(function (signature) {
            var fragment = _this.interface.functions[signature];
            // Check that the signature is unique; if not the ABI generation has
            // not been cleaned or may be incorrectly generated
            if (uniqueSignatures[signature]) {
                logger.warn("Duplicate ABI entry for " + JSON.stringify(signature));
                return;
            }
            uniqueSignatures[signature] = true;
            // Track unique names; we only expose bare named functions if they
            // are ambiguous
            {
                var name_1 = fragment.name;
                if (!uniqueNames["%" + name_1]) {
                    uniqueNames["%" + name_1] = [];
                }
                uniqueNames["%" + name_1].push(signature);
            }
            if (_this[signature] == null) {
                (0, properties_1.defineReadOnly)(_this, signature, buildDefault(_this, fragment, true));
            }
            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (_this.functions[signature] == null) {
                (0, properties_1.defineReadOnly)(_this.functions, signature, buildDefault(_this, fragment, false));
            }
            if (_this.callStatic[signature] == null) {
                (0, properties_1.defineReadOnly)(_this.callStatic, signature, buildCall(_this, fragment, true));
            }
            if (_this.populateTransaction[signature] == null) {
                (0, properties_1.defineReadOnly)(_this.populateTransaction, signature, buildPopulate(_this, fragment));
            }
        });
        Object.keys(uniqueNames).forEach(function (name) {
            // Ambiguous names to not get attached as bare names
            var signatures = uniqueNames[name];
            if (signatures.length > 1) {
                return;
            }
            // Strip off the leading "%" used for prototype protection
            name = name.substring(1);
            var signature = signatures[0];
            // If overwriting a member property that is null, swallow the error
            try {
                if (_this[name] == null) {
                    (0, properties_1.defineReadOnly)(_this, name, _this[signature]);
                }
            }
            catch (e) { }
            if (_this.functions[name] == null) {
                (0, properties_1.defineReadOnly)(_this.functions, name, _this.functions[signature]);
            }
            if (_this.callStatic[name] == null) {
                (0, properties_1.defineReadOnly)(_this.callStatic, name, _this.callStatic[signature]);
            }
            if (_this.populateTransaction[name] == null) {
                (0, properties_1.defineReadOnly)(_this.populateTransaction, name, _this.populateTransaction[signature]);
            }
        });
    }
    Object.defineProperty(BaseContract.prototype, "address", {
        get: function () {
            return this._address;
        },
        set: function (val) {
            this._address = (0, address_1.getAddressFromAccount)(val);
        },
        enumerable: false,
        configurable: true
    });
    BaseContract.getInterface = function (contractInterface) {
        if (abi_1.Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new abi_1.Interface(contractInterface);
    };
    // @TODO: Allow timeout?
    BaseContract.prototype.deployed = function () {
        return this._deployed();
    };
    BaseContract.prototype._deployed = function () {
        var _this = this;
        if (!this._deployedPromise) {
            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(function () {
                    return _this;
                });
            }
            else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode
                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address).then(function (code) {
                    if (code === "0x") {
                        logger.throwError("contract not deployed", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                            contractAddress: _this._address,
                            operation: "getDeployed"
                        });
                    }
                    return _this;
                });
            }
        }
        return this._deployedPromise;
    };
    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>
    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>
    BaseContract.prototype.fallback = function (overrides) {
        var _this = this;
        if (!this.signer) {
            logger.throwError("sending a transactions require a signer", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" });
        }
        var tx = (0, properties_1.shallowCopy)(overrides || {});
        ["from", "to"].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            logger.throwError("cannot override " + key, logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.resolvedAddress;
        return this.deployed().then(function () {
            return _this.signer.sendTransaction(tx);
        });
    };
    // Reconnect to a different signer or provider
    BaseContract.prototype.connect = function (signerOrProvider) {
        if (typeof (signerOrProvider) === "string") {
            signerOrProvider = new abstract_signer_1.VoidSigner(signerOrProvider, this.provider);
        }
        var contract = new (this.constructor)(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            (0, properties_1.defineReadOnly)(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    };
    // Re-attach to a different on-chain instance of this contract
    BaseContract.prototype.attach = function (addressOrName) {
        return new (this.constructor)(addressOrName, this.interface, this.signer || this.provider);
    };
    BaseContract.isIndexed = function (value) {
        return abi_1.Indexed.isIndexed(value);
    };
    BaseContract.prototype._normalizeRunningEvent = function (runningEvent) {
        // Already have an instance of this event running; we can re-use it
        if (this._runningEvents[runningEvent.tag]) {
            return this._runningEvents[runningEvent.tag];
        }
        return runningEvent;
    };
    BaseContract.prototype._getRunningEvent = function (eventName) {
        if (typeof (eventName) === "string") {
            // Listen for "error" events (if your contract has an error event, include
            // the full signature to bypass this special event keyword)
            if (eventName === "error") {
                return this._normalizeRunningEvent(new ErrorRunningEvent());
            }
            // Listen for any event that is registered
            if (eventName === "event") {
                return this._normalizeRunningEvent(new RunningEvent("event", null));
            }
            // Listen for any event
            if (eventName === "*") {
                return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
            }
            // Get the event Fragment (throws if ambiguous/unknown event)
            var fragment = this.interface.getEvent(eventName);
            return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
        }
        // We have topics to filter by...
        if (eventName.topics && eventName.topics.length > 0) {
            // Is it a known topichash? (throws if no matching topichash)
            try {
                var topic = eventName.topics[0];
                if (typeof (topic) !== "string") {
                    throw new Error("invalid topic"); // @TODO: May happen for anonymous events
                }
                var fragment = this.interface.getEvent(topic);
                return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment, eventName.topics));
            }
            catch (error) { }
            // Filter by the unknown topichash
            var filter = {
                address: this.address,
                topics: eventName.topics
            };
            return this._normalizeRunningEvent(new RunningEvent(getEventTag(filter), filter));
        }
        return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
    };
    BaseContract.prototype._requireAddressSet = function () {
        if (!this.address || this.address == "") {
            logger.throwArgumentError("Missing address", logger_1.Logger.errors.INVALID_ARGUMENT, this.address);
        }
    };
    BaseContract.prototype._checkRunningEvents = function (runningEvent) {
        if (runningEvent.listenerCount() === 0) {
            delete this._runningEvents[runningEvent.tag];
            // If we have a poller for this, remove it
            var emit = this._wrappedEmits[runningEvent.tag];
            if (emit && runningEvent.filter) {
                this.provider.off(runningEvent.filter, emit);
                delete this._wrappedEmits[runningEvent.tag];
            }
        }
    };
    // Subclasses can override this to gracefully recover
    // from parse errors if they wish
    BaseContract.prototype._wrapEvent = function (runningEvent, log, listener) {
        var _this = this;
        var event = (0, properties_1.deepCopy)(log);
        event.removeListener = function () {
            if (!listener) {
                return;
            }
            runningEvent.removeListener(listener);
            _this._checkRunningEvents(runningEvent);
        };
        event.getTransaction = function () {
            return _this.provider.getTransaction(log.timestamp);
        };
        event.getTransactionReceipt = function () {
            return logger.throwError("NOT_SUPPORTED", logger_1.Logger.errors.UNSUPPORTED_OPERATION);
        };
        // This may throw if the topics and data mismatch the signature
        runningEvent.prepareEvent(event);
        return event;
    };
    BaseContract.prototype._addEventListener = function (runningEvent, listener, once) {
        var _this = this;
        if (!this.provider) {
            logger.throwError("events require a provider or a signer with a provider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "once" });
        }
        runningEvent.addListener(listener, once);
        // Track this running event and its listeners (may already be there; but no hard in updating)
        this._runningEvents[runningEvent.tag] = runningEvent;
        // If we are not polling the provider, start polling
        if (!this._wrappedEmits[runningEvent.tag]) {
            var wrappedEmit = function (log) {
                var event = _this._wrapEvent(runningEvent, log, listener);
                // Try to emit the result for the parameterized event...
                if (event.decodeError == null) {
                    try {
                        var args = runningEvent.getEmit(event);
                        _this.emit.apply(_this, __spreadArray([runningEvent.filter], args, false));
                    }
                    catch (error) {
                        event.decodeError = error.error;
                    }
                }
                // Always emit "event" for fragment-base events
                if (runningEvent.filter != null) {
                    _this.emit("event", event);
                }
                // Emit "error" if there was an error
                if (event.decodeError != null) {
                    _this.emit("error", event.decodeError, event);
                }
            };
            this._wrappedEmits[runningEvent.tag] = wrappedEmit;
            // Special events, like "error" do not have a filter
            if (runningEvent.filter != null) {
                this.provider.on(runningEvent.filter, wrappedEmit);
            }
        }
    };
    BaseContract.prototype.queryFilter = function (event, fromTimestamp, toTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var runningEvent, filter, logs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._requireAddressSet();
                        runningEvent = this._getRunningEvent(event);
                        filter = (0, properties_1.shallowCopy)(runningEvent.filter);
                        if (fromTimestamp) {
                            filter.fromTimestamp = (0, providers_1.composeHederaTimestamp)(fromTimestamp);
                        }
                        if (toTimestamp) {
                            filter.toTimestamp = (0, providers_1.composeHederaTimestamp)(toTimestamp);
                        }
                        return [4 /*yield*/, this.provider.getLogs(filter)];
                    case 1:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return _this._wrapEvent(runningEvent, log, null); })];
                }
            });
        });
    };
    BaseContract.prototype.on = function (event, listener) {
        this._requireAddressSet();
        this._addEventListener(this._getRunningEvent(event), listener, false);
        return this;
    };
    BaseContract.prototype.once = function (event, listener) {
        this._requireAddressSet();
        this._addEventListener(this._getRunningEvent(event), listener, true);
        return this;
    };
    BaseContract.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.provider) {
            return false;
        }
        this._requireAddressSet();
        var runningEvent = this._getRunningEvent(eventName);
        var result = (runningEvent.run(args) > 0);
        // May have drained all the "once" events; check for living events
        this._checkRunningEvents(runningEvent);
        return result;
    };
    BaseContract.prototype.listenerCount = function (eventName) {
        var _this = this;
        if (!this.provider) {
            return 0;
        }
        this._requireAddressSet();
        if (eventName == null) {
            return Object.keys(this._runningEvents).reduce(function (accum, key) {
                return accum + _this._runningEvents[key].listenerCount();
            }, 0);
        }
        return this._getRunningEvent(eventName).listenerCount();
    };
    BaseContract.prototype.listeners = function (eventName) {
        if (!this.provider) {
            return [];
        }
        this._requireAddressSet();
        if (eventName == null) {
            var result_1 = [];
            for (var tag in this._runningEvents) {
                this._runningEvents[tag].listeners().forEach(function (listener) {
                    result_1.push(listener);
                });
            }
            return result_1;
        }
        return this._getRunningEvent(eventName).listeners();
    };
    BaseContract.prototype.removeAllListeners = function (eventName) {
        if (!this.provider) {
            return this;
        }
        this._requireAddressSet();
        if (eventName == null) {
            for (var tag in this._runningEvents) {
                var runningEvent_1 = this._runningEvents[tag];
                runningEvent_1.removeAllListeners();
                this._checkRunningEvents(runningEvent_1);
            }
            return this;
        }
        // Delete any listeners
        var runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeAllListeners();
        this._checkRunningEvents(runningEvent);
        return this;
    };
    BaseContract.prototype.off = function (eventName, listener) {
        if (!this.provider) {
            return this;
        }
        this._requireAddressSet();
        var runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeListener(listener);
        this._checkRunningEvents(runningEvent);
        return this;
    };
    BaseContract.prototype.removeListener = function (eventName, listener) {
        this._requireAddressSet();
        return this.off(eventName, listener);
    };
    return BaseContract;
}());
exports.BaseContract = BaseContract;
var Contract = /** @class */ (function (_super) {
    __extends(Contract, _super);
    function Contract() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Contract;
}(BaseContract));
exports.Contract = Contract;
var ContractFactory = /** @class */ (function () {
    function ContractFactory(contractInterface, bytecode, signer) {
        var _newTarget = this.constructor;
        var bytecodeHex = null;
        if (typeof (bytecode) === "string") {
            bytecodeHex = bytecode;
        }
        else if ((0, bytes_1.isBytes)(bytecode)) {
            bytecodeHex = (0, bytes_1.hexlify)(bytecode);
        }
        else if (bytecode && typeof (bytecode.object) === "string") {
            // Allow the bytecode object from the Solidity compiler
            bytecodeHex = bytecode.object;
        }
        else {
            // Crash in the next verification step
            bytecodeHex = "!";
        }
        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== "0x") {
            bytecodeHex = "0x" + bytecodeHex;
        }
        // Make sure the final result is valid bytecode
        if (!(0, bytes_1.isHexString)(bytecodeHex) || (bytecodeHex.length % 2)) {
            logger.throwArgumentError("invalid bytecode", "bytecode", bytecode);
        }
        // If we have a signer, make sure it is valid
        if (signer && !abstract_signer_1.Signer.isSigner(signer)) {
            logger.throwArgumentError("invalid signer", "signer", signer);
        }
        (0, properties_1.defineReadOnly)(this, "bytecode", bytecodeHex);
        (0, properties_1.defineReadOnly)(this, "interface", (0, properties_1.getStatic)(_newTarget, "getInterface")(contractInterface));
        (0, properties_1.defineReadOnly)(this, "signer", signer || null);
    }
    ContractFactory.prototype.getDeployTransaction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var contractCreateTx = {};
        if (args.length === this.interface.deploy.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
            contractCreateTx = (0, properties_1.shallowCopy)(args.pop());
            for (var key in contractCreateTx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error("unknown transaction override " + key);
                }
            }
        }
        // Allow only these to be overwritten in a deployment transaction
        Object.keys(contractCreateTx).forEach(function (key) {
            if (["gasLimit", "value"].indexOf(key) > -1) {
                return;
            }
            logger.throwError("cannot override " + key, logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        if (contractCreateTx.value) {
            var value = bignumber_1.BigNumber.from(contractCreateTx.value);
            if (!value.isZero() && !this.interface.deploy.payable) {
                logger.throwError("non-payable constructor cannot override value", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.value",
                    value: contractCreateTx.value
                });
            }
        }
        // Make sure the call matches the constructor signature
        logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
        contractCreateTx = __assign(__assign({}, contractCreateTx), { data: (0, bytes_1.hexlify)((0, bytes_1.concat)([
                this.bytecode,
                this.interface.encodeDeploy(args)
            ])), customData: {} });
        return contractCreateTx;
    };
    ContractFactory.prototype.deploy = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var overrides, contractCreate, contractCreateResponse, address, contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        overrides = {};
                        // If 1 extra parameter was passed in, it contains overrides
                        if (args.length === this.interface.deploy.inputs.length + 1) {
                            overrides = args.pop();
                        }
                        // Make sure the call matches the constructor signature
                        logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
                        args.push(overrides);
                        contractCreate = this.getDeployTransaction.apply(this, args);
                        return [4 /*yield*/, this.signer.sendTransaction(contractCreate)];
                    case 1:
                        contractCreateResponse = _a.sent();
                        address = contractCreateResponse.customData.contractId;
                        contract = (0, properties_1.getStatic)(this.constructor, "getContract")(address, this.interface, this.signer);
                        // Add the modified wait that wraps events
                        addContractWait(contract, contractCreateResponse);
                        (0, properties_1.defineReadOnly)(contract, "deployTransaction", contractCreateResponse);
                        return [2 /*return*/, contract];
                }
            });
        });
    };
    ContractFactory.prototype.attach = function (address) {
        return new (this.constructor).getContract(address, this.interface, this.signer);
    };
    ContractFactory.prototype.connect = function (signer) {
        return new (this.constructor)(this.interface, this.bytecode, signer);
    };
    ContractFactory.fromSolidity = function (compilerOutput, signer) {
        if (compilerOutput == null) {
            logger.throwError("missing compiler output", logger_1.Logger.errors.MISSING_ARGUMENT, { argument: "compilerOutput" });
        }
        if (typeof (compilerOutput) === "string") {
            compilerOutput = JSON.parse(compilerOutput);
        }
        var abi = compilerOutput.abi;
        var bytecode = null;
        if (compilerOutput.bytecode) {
            bytecode = compilerOutput.bytecode;
        }
        else if (compilerOutput.evm && compilerOutput.evm.bytecode) {
            bytecode = compilerOutput.evm.bytecode;
        }
        return new this(abi, bytecode, signer);
    };
    ContractFactory.getInterface = function (contractInterface) {
        return Contract.getInterface(contractInterface);
    };
    ContractFactory.getContract = function (address, contractInterface, signer) {
        return new Contract(address, contractInterface, signer);
    };
    return ContractFactory;
}());
exports.ContractFactory = ContractFactory;
//# sourceMappingURL=index.js.map