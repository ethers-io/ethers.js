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
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var json_rpc_provider_1 = require("./json-rpc-provider");
var _nextId = 1;
function buildWeb3LegacyFetcher(provider, sendFunc) {
    return function (method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        var request = {
            method: method,
            params: params,
            id: (_nextId++),
            jsonrpc: "2.0"
        };
        return new Promise(function (resolve, reject) {
            sendFunc(request, function (error, result) {
                if (error) {
                    return reject(error);
                }
                if (result.error) {
                    var error_1 = new Error(result.error.message);
                    error_1.code = result.error.code;
                    error_1.data = result.error.data;
                    return reject(error_1);
                }
                resolve(result.result);
            });
        });
    };
}
function buildEip1193Fetcher(provider) {
    return function (method, params) {
        if (params == null) {
            params = [];
        }
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        return provider.request({ method: method, params: params });
    };
}
var Web3Provider = /** @class */ (function (_super) {
    __extends(Web3Provider, _super);
    function Web3Provider(provider, network) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, Web3Provider);
        if (provider == null) {
            logger.throwArgumentError("missing provider", "provider", provider);
        }
        var path = null;
        var jsonRpcFetchFunc = null;
        var subprovider = null;
        if (typeof (provider) === "function") {
            path = "unknown:";
            jsonRpcFetchFunc = provider;
        }
        else {
            path = provider.host || provider.path || "";
            if (!path && provider.isMetaMask) {
                path = "metamask";
            }
            subprovider = provider;
            if (provider.request) {
                if (path === "") {
                    path = "eip-1193:";
                }
                jsonRpcFetchFunc = buildEip1193Fetcher(provider);
            }
            else if (provider.sendAsync) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
            }
            else if (provider.send) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
            }
            else {
                logger.throwArgumentError("unsupported provider", "provider", provider);
            }
            if (!path) {
                path = "unknown:";
            }
        }
        _this = _super.call(this, path, network) || this;
        properties_1.defineReadOnly(_this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
        properties_1.defineReadOnly(_this, "provider", subprovider);
        return _this;
    }
    Web3Provider.prototype.send = function (method, params) {
        return this.jsonRpcFetchFunc(method, params);
    };
    return Web3Provider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.Web3Provider = Web3Provider;
//# sourceMappingURL=web3-provider.js.map