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
var defaultProjectId = "84842078b09946638c03157f83405213";
var InfuraProvider = /** @class */ (function (_super) {
    __extends(InfuraProvider, _super);
    function InfuraProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(InfuraProvider.prototype, "projectId", {
        get: function () { return this.apiKey; },
        enumerable: true,
        configurable: true
    });
    InfuraProvider.getApiKey = function (apiKey) {
        if (apiKey == null) {
            return defaultProjectId;
        }
        return apiKey;
    };
    InfuraProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network.name) {
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
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        return "https:/" + "/" + host + "/v3/" + apiKey;
    };
    return InfuraProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.InfuraProvider = InfuraProvider;
