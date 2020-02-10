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
var ethers_1 = require("ethers");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var EipWrappedProvider = /** @class */ (function (_super) {
    __extends(EipWrappedProvider, _super);
    function EipWrappedProvider(provider, network) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, EipWrappedProvider);
        _this = _super.call(this, "eip1193:/\/", network) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "provider", provider);
        return _this;
    }
    EipWrappedProvider.prototype.send = function (method, params) {
        return this.provider.send(method, params);
    };
    return EipWrappedProvider;
}(ethers_1.ethers.providers.JsonRpcProvider));
exports.EipWrappedProvider = EipWrappedProvider;
