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
exports.DefaultHederaProvider = exports.HederaNetworks = void 0;
var base_provider_1 = require("./base-provider");
// contains predefined, sdk acceptable hedera network strings
var HederaNetworks;
(function (HederaNetworks) {
    HederaNetworks["TESTNET"] = "testnet";
    HederaNetworks["PREVIEWNET"] = "previewnet";
    HederaNetworks["MAINNET"] = "mainnet";
})(HederaNetworks = exports.HederaNetworks || (exports.HederaNetworks = {}));
/**
 * The hedera provider uses the hashgraph module to establish a connection to the Hedera network.
 * As every provider, this one also gives us read-only access.
 *
 * Constructable with a string or a number, which automatically resolves to a hedera network via the hashgraph SDK.
 */
var DefaultHederaProvider = /** @class */ (function (_super) {
    __extends(DefaultHederaProvider, _super);
    function DefaultHederaProvider(network) {
        return _super.call(this, network) || this;
    }
    return DefaultHederaProvider;
}(base_provider_1.BaseProvider));
exports.DefaultHederaProvider = DefaultHederaProvider;
//# sourceMappingURL=default-hedera-provider.js.map