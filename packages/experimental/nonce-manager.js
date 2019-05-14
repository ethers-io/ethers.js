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
var NonceManager = /** @class */ (function (_super) {
    __extends(NonceManager, _super);
    function NonceManager(signer) {
        var _newTarget = this.constructor;
        var _this = this;
        ethers_1.ethers.errors.checkNew(_newTarget, NonceManager);
        _this = _super.call(this) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "signer", signer);
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
            if (!this._transactionCount) {
                this._transactionCount = this.signer.getTransactionCount("pending");
            }
            return this._transactionCount;
        }
        return this.signer.getTransactionCount(blockTag);
    };
    NonceManager.prototype.setTransactionCount = function (transactionCount) {
        this._transactionCount = Promise.resolve(transactionCount).then(function (nonce) {
            return ethers_1.ethers.BigNumber.from(nonce).toNumber();
        });
    };
    NonceManager.prototype.incrementTransactionCount = function (count) {
        if (!count) {
            count = 1;
        }
        this._transactionCount = this.getTransactionCount("pending").then(function (nonce) {
            return nonce + count;
        });
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
            transaction.nonce = this.getTransactionCount();
        }
        this.setTransactionCount(transaction.nonce);
        return this.signer.sendTransaction(transaction);
    };
    return NonceManager;
}(ethers_1.ethers.Signer));
exports.NonceManager = NonceManager;
