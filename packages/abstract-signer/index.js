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
var allowedTransactionKeys = [
    "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "value"
];
// Sub-Class Notes:
//  - A Signer MUST always make sure, that if present, the "from" field
//    matches the Signer, before sending or signing a transaction
//  - A Signer SHOULD always wrap private information (such as a private
//    key or mnemonic) in a function, so that console.log does not leak
//    the data
var Signer = /** @class */ (function () {
    ///////////////////
    // Sub-classes MUST call super
    function Signer() {
        var _newTarget = this.constructor;
        logger.checkAbstract(_newTarget, Signer);
        properties_1.defineReadOnly(this, "_isSigner", true);
    }
    ///////////////////
    // Sub-classes MAY override these
    Signer.prototype.getBalance = function (blockTag) {
        this._checkProvider("getBalance");
        return this.provider.getBalance(this.getAddress(), blockTag);
    };
    Signer.prototype.getTransactionCount = function (blockTag) {
        this._checkProvider("getTransactionCount");
        return this.provider.getTransactionCount(this.getAddress(), blockTag);
    };
    // Populates "from" if unspecified, and estimates the gas for the transation
    Signer.prototype.estimateGas = function (transaction) {
        var _this = this;
        this._checkProvider("estimateGas");
        return properties_1.resolveProperties(this.checkTransaction(transaction)).then(function (tx) {
            return _this.provider.estimateGas(tx);
        });
    };
    // Populates "from" if unspecified, and calls with the transation
    Signer.prototype.call = function (transaction, blockTag) {
        var _this = this;
        this._checkProvider("call");
        return properties_1.resolveProperties(this.checkTransaction(transaction)).then(function (tx) {
            return _this.provider.call(tx);
        });
    };
    // Populates all fields in a transaction, signs it and sends it to the network
    Signer.prototype.sendTransaction = function (transaction) {
        var _this = this;
        this._checkProvider("sendTransaction");
        return this.populateTransaction(transaction).then(function (tx) {
            return _this.signTransaction(tx).then(function (signedTx) {
                return _this.provider.sendTransaction(signedTx);
            });
        });
    };
    Signer.prototype.getChainId = function () {
        this._checkProvider("getChainId");
        return this.provider.getNetwork().then(function (network) { return network.chainId; });
    };
    Signer.prototype.getGasPrice = function () {
        this._checkProvider("getGasPrice");
        return this.provider.getGasPrice();
    };
    Signer.prototype.resolveName = function (name) {
        this._checkProvider("resolveName");
        return this.provider.resolveName(name);
    };
    // Checks a transaction does not contain invalid keys and if
    // no "from" is provided, populates it.
    // - does NOT require a provider
    // - adds "from" is not present
    // - returns a COPY (safe to mutate the result)
    // By default called from: (overriding these prevents it)
    //   - call
    //   - estimateGas
    //   - populateTransaction (and therefor sendTransaction)
    Signer.prototype.checkTransaction = function (transaction) {
        for (var key in transaction) {
            if (allowedTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }
        var tx = properties_1.shallowCopy(transaction);
        if (tx.from == null) {
            tx.from = this.getAddress();
        }
        return tx;
    };
    // Populates ALL keys for a transaction and checks that "from" matches
    // this Signer. Should be used by sendTransaction but NOT by signTransaction.
    // By default called from: (overriding these prevents it)
    //   - sendTransaction
    Signer.prototype.populateTransaction = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(this.checkTransaction(transaction)).then(function (tx) {
            if (tx.to != null) {
                tx.to = Promise.resolve(tx.to).then(function (to) { return _this.resolveName(to); });
            }
            if (tx.gasPrice == null) {
                tx.gasPrice = _this.getGasPrice();
            }
            if (tx.nonce == null) {
                tx.nonce = _this.getTransactionCount("pending");
            }
            // Make sure any provided address matches this signer
            if (tx.from == null) {
                tx.from = _this.getAddress();
            }
            else {
                tx.from = Promise.all([
                    _this.getAddress(),
                    _this.provider.resolveName(tx.from)
                ]).then(function (results) {
                    if (results[0] !== results[1]) {
                        logger.throwArgumentError("from address mismatch", "transaction", transaction);
                    }
                    return results[0];
                });
            }
            if (tx.gasLimit == null) {
                tx.gasLimit = _this.estimateGas(tx).catch(function (error) {
                    logger.throwError("unable to estimate gas; specify manually", logger_1.Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
                        tx: tx
                    });
                });
            }
            if (tx.chainId == null) {
                tx.chainId = _this.getChainId();
            }
            return properties_1.resolveProperties(tx);
        });
    };
    ///////////////////
    // Sub-classes SHOULD leave these alone
    Signer.prototype._checkProvider = function (operation) {
        if (!this.provider) {
            logger.throwError("missing provider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: (operation || "_checkProvider")
            });
        }
    };
    Signer.isSigner = function (value) {
        return !!(value && value._isSigner);
    };
    return Signer;
}());
exports.Signer = Signer;
var VoidSigner = /** @class */ (function (_super) {
    __extends(VoidSigner, _super);
    function VoidSigner(address, provider) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, VoidSigner);
        _this = _super.call(this) || this;
        properties_1.defineReadOnly(_this, "address", address);
        properties_1.defineReadOnly(_this, "provider", provider || null);
        return _this;
    }
    VoidSigner.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    VoidSigner.prototype._fail = function (message, operation) {
        return Promise.resolve().then(function () {
            logger.throwError(message, logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: operation });
        });
    };
    VoidSigner.prototype.signMessage = function (message) {
        return this._fail("VoidSigner cannot sign messages", "signMessage");
    };
    VoidSigner.prototype.signTransaction = function (transaction) {
        return this._fail("VoidSigner cannot sign transactions", "signTransaction");
    };
    VoidSigner.prototype.connect = function (provider) {
        return new VoidSigner(this.address, provider);
    };
    return VoidSigner;
}(Signer));
exports.VoidSigner = VoidSigner;
