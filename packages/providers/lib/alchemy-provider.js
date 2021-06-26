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
exports.AlchemyProvider = exports.AlchemyWebSocketProvider = void 0;
var properties_1 = require("@ethersproject/properties");
var formatter_1 = require("./formatter");
var websocket_provider_1 = require("./websocket-provider");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io
var defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
var AlchemyWebSocketProvider = /** @class */ (function (_super) {
    __extends(AlchemyWebSocketProvider, _super);
    function AlchemyWebSocketProvider(network, apiKey) {
        var _this = this;
        var provider = new AlchemyProvider(network, apiKey);
        var url = provider.connection.url.replace(/^http/i, "ws")
            .replace(".alchemyapi.", ".ws.alchemyapi.");
        _this = _super.call(this, url, provider.network) || this;
        properties_1.defineReadOnly(_this, "apiKey", provider.apiKey);
        return _this;
    }
    AlchemyWebSocketProvider.prototype.isCommunityResource = function () {
        return (this.apiKey === defaultApiKey);
    };
    return AlchemyWebSocketProvider;
}(websocket_provider_1.WebSocketProvider));
exports.AlchemyWebSocketProvider = AlchemyWebSocketProvider;
var AlchemyProvider = /** @class */ (function (_super) {
    __extends(AlchemyProvider, _super);
    function AlchemyProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlchemyProvider.getWebSocketProvider = function (network, apiKey) {
        return new AlchemyWebSocketProvider(network, apiKey);
    };
    AlchemyProvider.getApiKey = function (apiKey) {
        if (apiKey == null) {
            return defaultApiKey;
        }
        if (apiKey && typeof (apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    };
    AlchemyProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/v2/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/v2/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/v2/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/v2/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/v2/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return {
            allowGzip: true,
            url: ("https:/" + "/" + host + apiKey),
            throttleCallback: function (attempt, url) {
                if (apiKey === defaultApiKey) {
                    formatter_1.showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
    };
    AlchemyProvider.prototype.perform = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if ((method === "estimateGas" && params.transaction.type === 2) || (method === "sendTransaction" && params.signedTransaction.substring(0, 4) === "0x02")) {
                    logger.throwError("AlchemyProvider does not currently support EIP-1559", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                        operation: method,
                        transaction: params.transaction
                    });
                }
                return [2 /*return*/, _super.prototype.perform.call(this, method, params)];
            });
        });
    };
    AlchemyProvider.prototype.isCommunityResource = function () {
        return (this.apiKey === defaultApiKey);
    };
    return AlchemyProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.AlchemyProvider = AlchemyProvider;
//# sourceMappingURL=alchemy-provider.js.map