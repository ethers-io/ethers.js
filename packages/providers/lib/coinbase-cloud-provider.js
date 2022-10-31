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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinbaseCloudProvider = void 0;
var formatter_1 = require("./formatter");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
var CoinbaseCloudProvider = /** @class */ (function (_super) {
    __extends(CoinbaseCloudProvider, _super);
    function CoinbaseCloudProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoinbaseCloudProvider.getApiKey = function (apiKey) {
        if (apiKey == null) {
            logger.throwError("invalid apiKey, cannot be null");
        }
        if (apiKey.apiUsername == null || apiKey.apiPassword == null) {
            logger.throwError("invalid apiKey, apiUsername and apiPassword cannot be null");
        }
        logger.assertArgument((typeof (apiKey.apiUsername) === "string"), "apiUsername is required", "apiUsername", apiKey.apiUsername);
        logger.assertArgument((typeof (apiKey.apiPassword) === "string"), "apiPassword is required", "apiPassword", apiKey.apiPassword);
        return apiKey;
    };
    CoinbaseCloudProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network.name) {
            case "homestead":
                host = "mainnet.ethereum.coinbasecloud.net";
                break;
            case "goerli":
                host = "goerli.ethereum.coinbasecloud.net";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return {
            allowGzip: true,
            url: ("https:/" + "/" + host),
            throttleCallback: function (attempt, url) {
                (0, formatter_1.showThrottleMessage)();
                return Promise.resolve(true);
            },
            user: apiKey.apiUsername,
            password: apiKey.apiPassword
        };
    };
    return CoinbaseCloudProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.CoinbaseCloudProvider = CoinbaseCloudProvider;
//# sourceMappingURL=coinbase-cloud-provider.js.map