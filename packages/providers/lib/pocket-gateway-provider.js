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
var defaultApplicationId = "defaultApp";
var defaultLoadBalancer = "defaultLoadBalancer";
var EndpointType;
(function (EndpointType) {
    EndpointType["LoadBalancer"] = "LoadBalancer";
    EndpointType["Application"] = "Application";
})(EndpointType || (EndpointType = {}));
var PocketGatewayProvider = /** @class */ (function (_super) {
    __extends(PocketGatewayProvider, _super);
    function PocketGatewayProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PocketGatewayProvider.getApiKey = function (apiKey) {
        var apiKeyObj = PocketApiKeyObject.build(apiKey);
        return apiKeyObj;
    };
    PocketGatewayProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            case "mainnet":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            case "ropsten":
                host = "eth-ropsten.gateway.pokt.network";
                break;
            case "goerli":
                host = "eth-ropsten.gateway.pokt.network";
                break;
            case "rinkeby":
                host = "eth-rinkeby.gateway.pokt.network";
                break;
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        var connection = {
            url: PocketApiKeyObject.getUrl(apiKey, host),
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
    PocketGatewayProvider.prototype.isCommunityResource = function () {
        if (typeof (this.apiKey) === "string") {
            return (this.apiKey === defaultApplicationId || this.apiKey === defaultLoadBalancer);
        }
        else if (typeof (this.apiKey) === "object") {
            return (this.apiKey.applicationId === defaultApplicationId || this.apiKey.applicationId === defaultLoadBalancer);
        }
        return true;
    };
    return PocketGatewayProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.PocketGatewayProvider = PocketGatewayProvider;
var PocketApiKeyObject = /** @class */ (function () {
    function PocketApiKeyObject() {
        this.applicationId = defaultLoadBalancer;
        this.endpointType = EndpointType.LoadBalancer;
        this.applicationSecretKey = null;
        this.applicationOrigin = null;
        this.applicationUserAgent = null;
    }
    PocketApiKeyObject.build = function (apiKey) {
        if (apiKey == null)
            return new PocketApiKeyObject();
        var apiKeyObj = new PocketApiKeyObject();
        // Parse Origin
        if (typeof (apiKey.applicationOrigin) === "string") {
            apiKeyObj.applicationOrigin = apiKey.applicationOrigin;
        }
        // Parse User Agent
        if (typeof (apiKey.applicationUserAgent) === "string") {
            apiKeyObj.applicationUserAgent = apiKey.applicationUserAgent;
        }
        if (typeof (apiKey.endpointType) === "string") {
            switch (apiKey.endpointType.toLowerCase()) {
                case "application":
                    apiKeyObj.endpointType = EndpointType.Application;
                    apiKeyObj.applicationId = defaultApplicationId;
                    break;
                default:
                    apiKeyObj.endpointType = EndpointType.LoadBalancer;
                    apiKeyObj.applicationId = defaultLoadBalancer;
                    break;
            }
        }
        switch (true) {
            case typeof (apiKey) === "string":
                apiKeyObj.applicationId = apiKey;
                break;
            case apiKey.applicationSecretKey != null:
                logger.assertArgument((typeof (apiKey.applicationId) === "string"), "applicationSecretKey requires an applicationId", "applicationId", apiKey.applicationId);
                logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"), "invalid applicationSecretKey", "applicationSecretKey", "[*********]");
                apiKeyObj.applicationId = apiKey.applicationId;
                apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;
                break;
            case apiKey !== null && typeof (apiKey.applicationId) === "string":
                apiKeyObj.applicationId = apiKey.applicationId;
                break;
        }
        return apiKeyObj;
    };
    PocketApiKeyObject.getDefaultAppForHost = function (host) {
        var defaultAppId = null;
        switch (host) {
            case "eth-mainnet.gateway.pokt.network":
                defaultAppId = "6004b7060aea5b606775f4d9";
                break;
            case "eth-ropsten.gateway.pokt.network":
                defaultAppId = "6004b9aa0aea5b606775f4de";
                break;
            case "eth-goerli.gateway.pokt.network":
                defaultAppId = "6004b9e30aea5b606775f4df";
                break;
            case "eth-rinkeby.gateway.pokt.network":
                defaultAppId = "6004ba310aea5b606775f4e0";
                break;
            default:
                logger.throwError("unsupported host for default app", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "host",
                    value: host
                });
        }
        return defaultAppId;
    };
    PocketApiKeyObject.getDefaultLoadBalancerForHost = function (host) {
        var defaultLbId = null;
        switch (host) {
            case "eth-mainnet.gateway.pokt.network":
                defaultLbId = "6004bcd10040261633ade990";
                break;
            case "eth-ropsten.gateway.pokt.network":
                defaultLbId = "6004bd4d0040261633ade991";
                break;
            case "eth-goerli.gateway.pokt.network":
                defaultLbId = "6004bd860040261633ade992";
                break;
            case "eth-rinkeby.gateway.pokt.network":
                defaultLbId = "6004bda20040261633ade994";
                break;
            default:
                logger.throwError("unsupported host for default app", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "host",
                    value: host
                });
        }
        return defaultLbId;
    };
    PocketApiKeyObject.getUrl = function (apiKey, host) {
        var appId = null;
        if (apiKey.applicationId === defaultLoadBalancer) {
            appId = PocketApiKeyObject.getDefaultLoadBalancerForHost(host);
        }
        else {
            appId = apiKey.applicationId;
        }
        var url = "https://" + host + "/v1/lb/" + appId;
        if (typeof (apiKey.endpointType) === "string" && apiKey.endpointType.toLowerCase() === "application") {
            if (appId === defaultApplicationId) {
                appId = PocketApiKeyObject.getDefaultAppForHost(host);
            }
            else {
                appId = apiKey.applicationId;
            }
            url = ("https:/" + "/" + host + "/v1/" + appId);
        }
        return url;
    };
    return PocketApiKeyObject;
}());
exports.PocketApiKeyObject = PocketApiKeyObject;
//# sourceMappingURL=pocket-gateway-provider.js.map