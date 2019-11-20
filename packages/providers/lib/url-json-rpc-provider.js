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
var UrlJsonRpcProvider = /** @class */ (function (_super) {
    __extends(UrlJsonRpcProvider, _super);
    function UrlJsonRpcProvider(network, apiKey) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkAbstract(_newTarget, UrlJsonRpcProvider);
        // Normalize the Network and API Key
        network = properties_1.getStatic((_newTarget), "getNetwork")(network);
        apiKey = properties_1.getStatic((_newTarget), "getApiKey")(apiKey);
        var connection = properties_1.getStatic((_newTarget), "getUrl")(network, apiKey);
        _this = _super.call(this, connection, network) || this;
        if (typeof (apiKey) === "string") {
            properties_1.defineReadOnly(_this, "apiKey", apiKey);
        }
        else if (apiKey != null) {
            Object.keys(apiKey).forEach(function (key) {
                properties_1.defineReadOnly(_this, key, apiKey[key]);
            });
        }
        return _this;
    }
    UrlJsonRpcProvider.prototype._startPending = function () {
        logger.warn("WARNING: API provider does not support pending filters");
    };
    UrlJsonRpcProvider.prototype.getSigner = function (address) {
        return logger.throwError("API provider does not support signing", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "getSigner" });
    };
    UrlJsonRpcProvider.prototype.listAccounts = function () {
        return Promise.resolve([]);
    };
    // Return a defaultApiKey if null, otherwise validate the API key
    UrlJsonRpcProvider.getApiKey = function (apiKey) {
        return apiKey;
    };
    // Returns the url or connection for the given network and API key. The
    // API key will have been sanitized by the getApiKey first, so any validation
    // or transformations can be done there.
    UrlJsonRpcProvider.getUrl = function (network, apiKey) {
        return logger.throwError("not implemented; sub-classes must override getUrl", logger_1.Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    };
    return UrlJsonRpcProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.UrlJsonRpcProvider = UrlJsonRpcProvider;
