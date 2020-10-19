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
var defaultApplicationId = "5f7f8547b90218002e9ce9dd";
var PocketProvider = /** @class */ (function (_super) {
    __extends(PocketProvider, _super);
    function PocketProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PocketProvider.getApiKey = function (apiKey) {
        var apiKeyObj = {
            applicationId: defaultApplicationId,
            applicationSecretKey: null
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
            logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"), "invalid applicationSecretKey", "applicationSecretKey", "[REDACTED]");
            apiKeyObj.applicationId = apiKey.applicationId;
            apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;
        }
        else if (apiKey.applicationId) {
            apiKeyObj.applicationId = apiKey.applicationId;
        }
        return apiKeyObj;
    };
    PocketProvider.getUrl = function (network, apiKey) {
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
            url: ("https://" + host + "/v1/" + apiKey.applicationId),
        };
        // Initialize empty headers
        connection.headers = {};
        // Apply application secret key
        if (apiKey.applicationSecretKey != null) {
            connection.user = "";
            connection.password = apiKey.applicationSecretKey;
        }
        return connection;
    };
    PocketProvider.prototype.isCommunityResource = function () {
        return (this.applicationId === defaultApplicationId);
    };
    return PocketProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.PocketProvider = PocketProvider;
//# sourceMappingURL=pocket-provider.js.map