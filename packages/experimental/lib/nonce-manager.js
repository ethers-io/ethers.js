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
exports.NonceManager = void 0;
var ethers_1 = require("ethers");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
// @TODO: Keep a per-NonceManager pool of sent but unmined transactions for
//        rebroadcasting, in case we overrun the transaction pool
var NonceManager = /** @class */ (function (_super) {
    __extends(NonceManager, _super);
    function NonceManager(signer) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, NonceManager);
        _this = _super.call(this) || this;
        _this._deltaCount = 0;
        ethers_1.ethers.utils.defineReadOnly(_this, "signer", signer);
        ethers_1.ethers.utils.defineReadOnly(_this, "provider", signer.provider || null);
        return _this;
    }
    NonceManager.prototype.connect = function (provider) {
        return new NonceManager(this.signer.connect(provider));
    };
    NonceManager.prototype.getAddress = function () {
        return this.signer.getAddress();
    };
    NonceManager.prototype.getTransactionCount = function (blockTag) {
        if (blockTag === "pending") {
            if (!this._initialPromise) {
                this._initialPromise = this.signer.getTransactionCount("pending");
            }
            var deltaCount_1 = this._deltaCount;
            return this._initialPromise.then(function (initial) { return (initial + deltaCount_1); });
        }
        return this.signer.getTransactionCount(blockTag);
    };
    NonceManager.prototype.setTransactionCount = function (transactionCount) {
        this._initialPromise = Promise.resolve(transactionCount).then(function (nonce) {
            return ethers_1.ethers.BigNumber.from(nonce).toNumber();
        });
        this._deltaCount = 0;
    };
    NonceManager.prototype.incrementTransactionCount = function (count) {
        this._deltaCount += (count ? count : 1);
    };
    NonceManager.prototype.signMessage = function (message) {
        return this.signer.signMessage(message);
        ;
    };
    NonceManager.prototype.signTransaction = function (transaction) {
        return this.signer.signTransaction(transaction);
    };
    NonceManager.prototype.sendTransaction = function (transaction) {
        if (transaction.nonce == null) {
            transaction = ethers_1.ethers.utils.shallowCopy(transaction);
            transaction.nonce = this.getTransactionCount("pending");
            this.incrementTransactionCount();
        }
        else {
            this.setTransactionCount(transaction.nonce);
        }
        return this.signer.sendTransaction(transaction).then(function (tx) {
            return tx;
        });
    };
    return NonceManager;
}(ethers_1.ethers.Signer));
exports.NonceManager = NonceManager;
//# sourceMappingURL=nonce-manager.js.map