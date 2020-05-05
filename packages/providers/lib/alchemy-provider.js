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
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io
var defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
var AlchemyProvider = /** @class */ (function (_super) {
    __extends(AlchemyProvider, _super);
    function AlchemyProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
                host = "eth-mainnet.alchemyapi.io/jsonrpc/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/jsonrpc/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/jsonrpc/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/jsonrpc/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/jsonrpc/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return ("https:/" + "/" + host + apiKey);
    };
    return AlchemyProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.AlchemyProvider = AlchemyProvider;
