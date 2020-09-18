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
var defaultApplicationId = "5f3ab133f7ca96c59972ff51";
var PocketGatewayProvider = /** @class */ (function (_super) {
    __extends(PocketGatewayProvider, _super);
    function PocketGatewayProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PocketGatewayProvider.getApiKey = function (apiKey) {
        var apiKeyObj = {
            applicationId: defaultApplicationId,
            applicationSecretKey: null,
            applicationOrigin: null,
            applicationUserAgent: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        // Parse applicationId and applicationSecretKey
        if (typeof (apiKey) === "string") {
            apiKeyObj.applicationId = apiKey;
        }
        else if (apiKey.applicationSecretKey != null) {
            logger.assertArgument((typeof (apiKey.applicationId) === "string"), "applicationSecretKey requires an applicationId", "applicationId", apiKey.applicationId);
            logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"), "invalid applicationSecretKey", "applicationSecretKey", "[*********]");
            apiKeyObj.applicationId = apiKey.applicationId;
            apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;
        }
        else if (apiKey.applicationId) {
            apiKeyObj.applicationId = apiKey.applicationId;
        }
        // Parse Origin
        if (typeof (apiKey.applicationOrigin) === "string") {
            apiKeyObj.applicationOrigin = apiKey.applicationOrigin;
        }
        // Parse User Agent
        if (typeof (apiKey.applicationUserAgent) === "string") {
            apiKeyObj.applicationUserAgent = apiKey.applicationUserAgent;
        }
        return apiKeyObj;
    };
    PocketGatewayProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        var connection = {
            url: ("https:/" + "/" + host + "/v1/" + apiKey.applicationId),
        };
        // Initialize empty headers
        connection.headers = {};
        // Apply application secret key
        if (apiKey.applicationSecretKey != null) {
            connection.user = "";
            connection.password = apiKey.applicationSecretKey;
        }
        // Apply origin header
        if (apiKey.applicationOrigin != null) {
            connection.headers["Origin"] = apiKey.applicationOrigin;
        }
        // Apply user agent header
        if (apiKey.applicationUserAgent != null) {
            connection.headers["User-Agent"] = apiKey.applicationUserAgent;
        }
        return connection;
    };
    return PocketGatewayProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.PocketGatewayProvider = PocketGatewayProvider;
//# sourceMappingURL=pocket-gateway-provider.js.map