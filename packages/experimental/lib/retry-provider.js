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
// RetryProvider
//
// Wraps an existing Provider to provide retry logic.
//
// See: https://github.com/ethers-io/ethers.js/issues/427
var ethers_1 = require("ethers");
var web_1 = require("@ethersproject/web");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var RetryProvider = /** @class */ (function (_super) {
    __extends(RetryProvider, _super);
    function RetryProvider(provider, options) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, RetryProvider);
        _this = _super.call(this, provider.getNetwork()) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "provider", provider);
        ethers_1.ethers.utils.defineReadOnly(_this, "options", options || {});
        return _this;
    }
    RetryProvider.prototype.perform = function (method, params) {
        var _this = this;
        return web_1.poll(function () {
            return _this.provider.perform(method, params).then(function (result) {
                return result;
            }, function (error) {
                return undefined;
            });
        }, this.options);
    };
    return RetryProvider;
}(ethers_1.ethers.providers.BaseProvider));
exports.RetryProvider = RetryProvider;
//# sourceMappingURL=retry-provider.js.map