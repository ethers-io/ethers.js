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
exports.InfuraProvider = exports.InfuraWebSocketProvider = void 0;
var properties_1 = require("@ethersproject/properties");
var websocket_provider_1 = require("./websocket-provider");
var formatter_1 = require("./formatter");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
var defaultProjectId = "84842078b09946638c03157f83405213";
var InfuraWebSocketProvider = /** @class */ (function (_super) {
    __extends(InfuraWebSocketProvider, _super);
    function InfuraWebSocketProvider(network, apiKey) {
        var _this = this;
        var provider = new InfuraProvider(network, apiKey);
        var connection = provider.connection;
        if (connection.password) {
            logger.throwError("INFURA WebSocket project secrets unsupported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }
        var url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        _this = _super.call(this, url, network) || this;
        properties_1.defineReadOnly(_this, "apiKey", provider.projectId);
        properties_1.defineReadOnly(_this, "projectId", provider.projectId);
        properties_1.defineReadOnly(_this, "projectSecret", provider.projectSecret);
        return _this;
    }
    InfuraWebSocketProvider.prototype.isCommunityResource = function () {
        return (this.projectId === defaultProjectId);
    };
    return InfuraWebSocketProvider;
}(websocket_provider_1.WebSocketProvider));
exports.InfuraWebSocketProvider = InfuraWebSocketProvider;
var InfuraProvider = /** @class */ (function (_super) {
    __extends(InfuraProvider, _super);
    function InfuraProvider(network, apiKey) {
        var _this = _super.call(this, network, apiKey) || this;
        properties_1.defineReadOnly(_this, "installedFilters", {});
        return _this;
    }
    InfuraProvider.getWebSocketProvider = function (network, apiKey) {
        return new InfuraWebSocketProvider(network, apiKey);
    };
    InfuraProvider.getApiKey = function (apiKey) {
        var apiKeyObj = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        if (typeof (apiKey) === "string") {
            apiKeyObj.projectId = apiKey;
        }
        else if (apiKey.projectSecret != null) {
            logger.assertArgument((typeof (apiKey.projectId) === "string"), "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger.assertArgument((typeof (apiKey.projectSecret) === "string"), "invalid projectSecret", "projectSecret", "[REDACTED]");
            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;
        }
        else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }
        apiKeyObj.apiKey = apiKeyObj.projectId;
        return apiKeyObj;
    };
    InfuraProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            case "matic":
                host = "polygon-mainnet.infura.io";
                break;
            case "maticmum":
                host = "polygon-mumbai.infura.io";
                break;
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        var connection = {
            allowGzip: true,
            url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId),
            throttleCallback: function (attempt, url) {
                if (apiKey.projectId === defaultProjectId) {
                    formatter_1.showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret;
        }
        return connection;
    };
    InfuraProvider.prototype.isCommunityResource = function () {
        return (this.projectId === defaultProjectId);
    };
    // Override this method to work on filters
    InfuraProvider.prototype.updateTransactionEvents = function (runners, blockNumber) {
        var _this = this;
        // Find all transaction hashes we are waiting on
        this._events.forEach(function (event) {
            switch (event.type) {
                case "tx": {
                    var hash_1 = event.hash;
                    var runner = _this.getTransactionReceipt(hash_1).then(function (receipt) {
                        if (!receipt || receipt.blockNumber == null) {
                            return null;
                        }
                        _this._emitted["t:" + hash_1] = receipt.blockNumber;
                        _this.emit(hash_1, receipt);
                        return null;
                    }).catch(function (error) { _this.emit("error", error); });
                    runners.push(runner);
                    break;
                }
                case "filter": {
                    _this.checkInstalledFilters(event).then(function (filter) {
                        var runner = _this.getFilterChanges(filter.filterId).then(function (logs) {
                            if (logs.length === 0) {
                                return;
                            }
                            logs.forEach(function (log) {
                                _this._emitted["b:" + log.blockHash] = log.blockNumber;
                                _this._emitted["t:" + log.transactionHash] = log.blockNumber;
                                _this.emit(event.filter, log);
                            });
                        }).catch(function (error) { _this.emit("error", error); });
                        runners.push(runner);
                    });
                    break;
                }
            }
        });
    };
    InfuraProvider.prototype.checkInstalledFilters = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var filter, filterResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = this.installedFilters[event.tag];
                        if (!!filter) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.newFilter(event.filter)];
                    case 1:
                        filterResult = _a.sent();
                        this.installedFilters[event.tag] = {
                            topics: event.filter.topics,
                            address: event.filter.address,
                            filterId: filterResult
                        };
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.installedFilters[event.tag]];
                }
            });
        });
    };
    return InfuraProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.InfuraProvider = InfuraProvider;
//# sourceMappingURL=infura-provider.js.map