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
exports.MetamaskProvider = void 0;
var ethers_1 = require("ethers");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var MetamaskProvider = /** @class */ (function (_super) {
    __extends(MetamaskProvider, _super);
    function MetamaskProvider(ethereum) {
        var _this = this;
        if (!ethereum) {
            ethereum = global.ethereum;
            if (!ethereum) {
                logger.throwError("could not auto-detect global.ethereum", ethers_1.ethers.errors.UNSUPPORTED_OPERATION, {
                    operation: "window.ethereum"
                });
            }
        }
        _this = _super.call(this, ethereum) || this;
        var _account = null;
        ethers_1.ethers.utils.defineReadOnly(_this, "_pollAccountFunc", function () {
            var account = null;
            if (account === _account) {
                return;
            }
            console.log("poll");
            _this.emit("account", account, _account);
            _account = account;
        });
        _this = _super.call(this, ethereum) || this;
        return _this;
    }
    MetamaskProvider.prototype.getSigner = function (addressOrIndex) {
        if (!this.enabled) {
            return null;
        }
        return _super.prototype.getSigner.call(this, addressOrIndex);
    };
    Object.defineProperty(MetamaskProvider.prototype, "enabled", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    MetamaskProvider.prototype._startPollingAccount = function () {
        if (this._pollingAccount) {
            return;
        }
        console.log("start polling for account changes including to/from null");
        this._pollingAccount = setInterval(this._pollAccountFunc, 1000);
    };
    MetamaskProvider.prototype._stopPollingAccount = function () {
        if (!this._pollingAccount) {
            return;
        }
        console.log("stop polling for account changes including to/from null");
        clearInterval(this._pollingAccount);
        this._pollingAccount = null;
    };
    MetamaskProvider.prototype.on = function (eventName, listener) {
        _super.prototype.on.call(this, eventName, listener);
        if (this.listenerCount("account") > 0) {
            this._startPollingAccount();
        }
        return this;
    };
    MetamaskProvider.prototype.off = function (eventName, listener) {
        _super.prototype.off.call(this, eventName, listener);
        if (this.listenerCount("account") === 0) {
            this._stopPollingAccount();
        }
        return this;
    };
    return MetamaskProvider;
}(ethers_1.ethers.providers.Web3Provider));
exports.MetamaskProvider = MetamaskProvider;
//# sourceMappingURL=metamask-provider.js.map