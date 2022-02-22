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
var base_provider_1 = require("./base-provider");
/**
 * Provides support for connecting to custom network by specifying consensus and mirror node url.
 */
var HederaProvider = /** @class */ (function (_super) {
    __extends(HederaProvider, _super);
    function HederaProvider(nodeId, consensusNodeUrl, mirrorNodeUrl) {
        var _this = this;
        var props = {
            network: {}
        };
        props.network[consensusNodeUrl] = nodeId.toString();
        _this = _super.call(this, {
            network: props.network,
            mirrorNodeUrl: mirrorNodeUrl,
        }) || this;
        return _this;
    }
    return HederaProvider;
}(base_provider_1.BaseProvider));
exports.default = HederaProvider;
//# sourceMappingURL=hedera-provider.js.map