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
exports.FastIpcProvider = void 0;
var net_1 = require("net");
var bignumber_1 = require("@ethersproject/bignumber");
var logger_1 = require("@ethersproject/logger");
var properties_1 = require("@ethersproject/properties");
var json_rpc_provider_1 = require("./json-rpc-provider");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
// For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub
var FastIpcProvider = /** @class */ (function (_super) {
    __extends(FastIpcProvider, _super);
    function FastIpcProvider(path, network) {
        var _this = _super.call(this, "ipc://" + path, network) || this;
        // Maps all registered requests
        _this._requests = {};
        // Maps event tag to subscription ID (we dedupe identical events)
        _this._subIds = {};
        // Maps Subscription ID to Subscription
        _this._subs = {};
        _this._lastChunk = "";
        _this._socket = net_1.connect({ path: path });
        _this._pollingInterval = -1;
        // Stall sending requests until the socket is open...
        _this._socket.on("connect", function () {
            Object.keys(_this._requests).forEach(function (id) {
                _this._socket.write(_this._requests[id].payload);
            });
        });
        // Reject all pending requests on "error" or "close"
        _this._socket.on("error", function (err) { return _this.rejectAllAndDestroy(err); });
        _this._socket.on("close", function (hadErr) {
            if (!hadErr) {
                _this.rejectAllAndDestroy(new Error("IPC socket was closed"));
            }
        });
        // Parse incoming messages and handle them by type
        _this._socket.on("data", function (buf) {
            _this.parseBuffer(buf).forEach(function (msg) {
                if (typeof (msg === null || msg === void 0 ? void 0 : msg.id) === "number") {
                    _this.handleNotification(msg);
                }
                else if ((msg === null || msg === void 0 ? void 0 : msg.method) === "eth_subscription") {
                    _this.handleSubscription(msg);
                }
                else {
                    logger.warn("unexpected RPC response");
                }
            });
        });
        // This Provider does not actually poll, but we want to trigger poll events
        // for things that depend on them (like stalling for block and transaction
        // lookups)
        var fauxPoll = setInterval(function () {
            _this.emit("poll");
        }, 1000);
        if (fauxPoll.unref) {
            fauxPoll.unref();
        }
        return _this;
    }
    Object.defineProperty(FastIpcProvider.prototype, "pollingInterval", {
        get: function () {
            return 0;
        },
        set: function (_) {
            logger.throwError("cannot set polling interval on FastIpcProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "pollingInterval",
            });
        },
        enumerable: false,
        configurable: true
    });
    FastIpcProvider.prototype.resetEventsBlock = function (_) {
        var context = { operation: "resetEventsBlock" };
        logger.throwError("cannot reset events block on FastIpcProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, context);
    };
    FastIpcProvider.prototype.poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(FastIpcProvider.prototype, "polling", {
        set: function (value) {
            if (!value) {
                return;
            }
            var context = { operation: "setPolling" };
            logger.throwError("cannot set polling on FastIpcProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, context);
        },
        enumerable: false,
        configurable: true
    });
    FastIpcProvider.prototype.send = function (method, params) {
        var _this = this;
        if (this._socket.destroyed) {
            logger.throwError("provider has already been destroyed");
        }
        var id = FastIpcProvider.NEXT_ID++;
        return new Promise(function (resolve, reject) {
            var payload = JSON.stringify({ method: method, params: params, id: id, jsonrpc: "2.0" });
            _this.emit("debug", {
                action: "request",
                request: JSON.parse(payload),
                provider: _this,
            });
            // requests are buffered and sent later if the socket is not yet ready
            _this._requests[String(id)] = { resolve: resolve, reject: reject, payload: payload };
            if (!_this._socket.connecting) {
                _this._socket.write(payload);
            }
        });
    };
    FastIpcProvider.prototype._subscribe = function (tag, param, process) {
        return __awaiter(this, void 0, void 0, function () {
            var subIdPromise, subId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subIdPromise = this._subIds[tag];
                        if (subIdPromise == null) {
                            subIdPromise = Promise.all(param).then(function (param) {
                                return _this.send("eth_subscribe", param);
                            });
                            this._subIds[tag] = subIdPromise;
                        }
                        return [4 /*yield*/, subIdPromise];
                    case 1:
                        subId = _a.sent();
                        this._subs[subId] = { tag: tag, process: process };
                        return [2 /*return*/];
                }
            });
        });
    };
    FastIpcProvider.prototype._startEvent = function (event) {
        var _this = this;
        switch (event.type) {
            case "block":
                this._subscribe("block", ["newHeads"], function (res) {
                    var blockNumber = bignumber_1.BigNumber.from(res.number).toNumber();
                    _this._emitted.block = blockNumber;
                    _this.emit("block", blockNumber);
                });
                break;
            case "pending":
                this._subscribe("pending", ["newPendingTransactions"], function (res) {
                    return _this.emit("pending", res);
                });
                break;
            case "filter":
                this._subscribe(event.tag, ["logs", this._getFilter(event.filter)], function (res) {
                    if (res.removed === null) {
                        res.removed = false;
                    }
                    _this.emit(event.filter, _this.formatter.filterLog(res));
                });
                break;
            case "tx": {
                var emitReceipt_1 = function (event) {
                    var hash = event.hash;
                    _this.getTransactionReceipt(hash).then(function (receipt) {
                        if (!receipt)
                            return;
                        _this.emit(hash, receipt);
                    });
                };
                // In case it is already mined
                emitReceipt_1(event);
                // To keep things simple, we start up a single newHeads subscription
                // to keep an eye out for transactions we are watching for.
                // Starting a subscription for an event (i.e. "tx") that is already
                // running is (basically) a nop.
                this._subscribe("tx", ["newHeads"], function () {
                    _this._events
                        .filter(function (event) { return event.type === "tx"; })
                        .forEach(emitReceipt_1);
                });
                break;
            }
            // Nothing is needed
            case "debug":
            case "poll":
            case "willPoll":
            case "didPoll":
            case "error":
                break;
            default:
                logger.warn("unhandled: ", event);
                break;
        }
    };
    FastIpcProvider.prototype._stopEvent = function (event) {
        var _this = this;
        var tag = event.tag;
        if (event.type === "tx") {
            // There are remaining transaction event listeners
            if (this._events.filter(function (e) { return e.type === "tx"; }).length) {
                return;
            }
            tag = "tx";
        }
        else if (this.listenerCount(event.event)) {
            // There are remaining event listeners
            return;
        }
        var subId = this._subIds[tag];
        if (!subId) {
            return;
        }
        delete this._subIds[tag];
        subId.then(function (subId) {
            if (!_this._subs[subId])
                return;
            delete _this._subs[subId];
            _this.send("eth_unsubscribe", [subId]);
        });
    };
    FastIpcProvider.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this._socket.destroyed) {
                    logger.throwError("provider has already been destroyed");
                }
                this.rejectAllAndDestroy(new Error("IPC provider was destroyed"));
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._socket.once("error", function (err) { return reject(err); });
                        _this._socket.once("close", function () { return resolve(); });
                    })];
            });
        });
    };
    FastIpcProvider.prototype.rejectAllAndDestroy = function (err) {
        var _this = this;
        // reject all registered requests
        Object.keys(this._requests).forEach(function (id) {
            var request = _this._requests[id];
            request.reject(err);
        });
        // destroy the IPC socket
        this._socket.removeAllListeners();
        this._socket.destroy();
    };
    FastIpcProvider.prototype.parseBuffer = function (buf) {
        var chunks = buf
            .toString()
            .replace(/\}[\n\r]?\{/g, "}|--|{") // }{
            .replace(/\}\][\n\r]?\[\{/g, "}]|--|[{") // }][{
            .replace(/\}[\n\r]?\[\{/g, "}|--|[{") // }[{
            .replace(/\}\][\n\r]?\{/g, "}]|--|{") // }]{
            .split("|--|");
        var results = [];
        for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
            var chunk = chunks_1[_i];
            var msg = this._lastChunk + chunk;
            try {
                results.push(JSON.parse(msg));
                // todo: cancel timeout
                this._lastChunk = "";
            }
            catch (err) {
                this._lastChunk = msg;
                // todo: clear timeout, start new one
                break;
            }
        }
        return results;
    };
    FastIpcProvider.prototype.handleNotification = function (msg) {
        var id = String(msg.id);
        var request = this._requests[id];
        delete this._requests[id];
        if (msg.result !== undefined) {
            request.resolve(msg.result);
            this.emit("debug", {
                action: "response",
                request: JSON.parse(request.payload),
                response: msg.result,
                provider: this,
            });
        }
        else {
            if (msg.error !== undefined) {
                var err = new Error(msg.error.message || "unknown error");
                properties_1.defineReadOnly(err, "code", msg.error.code || null);
                properties_1.defineReadOnly(err, "response", msg);
                request.reject(err);
            }
            else {
                request.reject(new Error("unknown error"));
            }
            this.emit("debug", {
                action: "response",
                request: JSON.parse(request.payload),
                provider: this,
            });
        }
    };
    FastIpcProvider.prototype.handleSubscription = function (msg) {
        var sub = this._subs[msg.params.subscription];
        if (sub !== undefined) {
            sub.process(msg.params.result);
        }
    };
    // Global subscription ID
    FastIpcProvider.NEXT_ID = 1;
    return FastIpcProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.FastIpcProvider = FastIpcProvider;
//# sourceMappingURL=fast-ipc-provider.js.map