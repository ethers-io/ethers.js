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
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var CloudflareProvider = /** @class */ (function (_super) {
    __extends(CloudflareProvider, _super);
    function CloudflareProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CloudflareProvider.getUrl = function (network, apiKey) {
        if (apiKey != null) {
            logger.throwArgumentError("apiKey not supported for cloudflare", "apiKey", apiKey);
        }
        var host = null;
        switch (network.name) {
            case "homestead":
                host = "https://cloudflare-eth.com/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return host;
    };
    return CloudflareProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.CloudflareProvider = CloudflareProvider;
