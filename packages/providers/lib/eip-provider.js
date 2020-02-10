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
var EipWrappedProvider = /** @class */ (function (_super) {
    __extends(EipWrappedProvider, _super);
    function EipWrappedProvider(provider, network) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, EipWrappedProvider);
        // HTTP has a host; IPC has a path.
        _this = _super.call(this, "eip1193:/\/", network) || this;
        properties_1.defineReadOnly(_this, "provider", provider);
        return _this;
    }
    EipWrappedProvider.prototype.send = function (method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && this.provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        return this.provider.send(method, params);
    };
    return EipWrappedProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.EipWrappedProvider = EipWrappedProvider;
