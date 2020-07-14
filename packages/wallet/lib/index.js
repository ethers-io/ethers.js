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
var address_1 = require("@ethersproject/address");
var abstract_provider_1 = require("@ethersproject/abstract-provider");
var abstract_signer_1 = require("@ethersproject/abstract-signer");
var bytes_1 = require("@ethersproject/bytes");
var hash_1 = require("@ethersproject/hash");
var hdnode_1 = require("@ethersproject/hdnode");
var keccak256_1 = require("@ethersproject/keccak256");
var properties_1 = require("@ethersproject/properties");
var random_1 = require("@ethersproject/random");
var signing_key_1 = require("@ethersproject/signing-key");
var json_wallets_1 = require("@ethersproject/json-wallets");
var transactions_1 = require("@ethersproject/transactions");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function isAccount(value) {
    return (value != null && bytes_1.isHexString(value.privateKey, 32) && value.address != null);
}
function hasMnemonic(value) {
    var mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(privateKey, provider) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, Wallet);
        _this = _super.call(this) || this;
        if (isAccount(privateKey)) {
            var signingKey_1 = new signing_key_1.SigningKey(privateKey.privateKey);
            properties_1.defineReadOnly(_this, "_signingKey", function () { return signingKey_1; });
            properties_1.defineReadOnly(_this, "address", transactions_1.computeAddress(_this.publicKey));
            if (_this.address !== address_1.getAddress(privateKey.address)) {
                logger.throwArgumentError("privateKey/address mismatch", "privateKey", "[REDACTED]");
            }
            if (hasMnemonic(privateKey)) {
                var srcMnemonic_1 = privateKey.mnemonic;
                properties_1.defineReadOnly(_this, "_mnemonic", function () { return ({
                    phrase: srcMnemonic_1.phrase,
                    path: srcMnemonic_1.path || hdnode_1.defaultPath,
                    locale: srcMnemonic_1.locale || "en"
                }); });
                var mnemonic = _this.mnemonic;
                var node = hdnode_1.HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path);
                if (transactions_1.computeAddress(node.privateKey) !== _this.address) {
                    logger.throwArgumentError("mnemonic/address mismatch", "privateKey", "[REDACTED]");
                }
            }
            else {
                properties_1.defineReadOnly(_this, "_mnemonic", function () { return null; });
            }
        }
        else {
            if (signing_key_1.SigningKey.isSigningKey(privateKey)) {
                /* istanbul ignore if */
                if (privateKey.curve !== "secp256k1") {
                    logger.throwArgumentError("unsupported curve; must be secp256k1", "privateKey", "[REDACTED]");
                }
                properties_1.defineReadOnly(_this, "_signingKey", function () { return privateKey; });
            }
            else {
                var signingKey_2 = new signing_key_1.SigningKey(privateKey);
                properties_1.defineReadOnly(_this, "_signingKey", function () { return signingKey_2; });
            }
            properties_1.defineReadOnly(_this, "_mnemonic", function () { return null; });
            properties_1.defineReadOnly(_this, "address", transactions_1.computeAddress(_this.publicKey));
        }
        /* istanbul ignore if */
        if (provider && !abstract_provider_1.Provider.isProvider(provider)) {
            logger.throwArgumentError("invalid provider", "provider", provider);
        }
        properties_1.defineReadOnly(_this, "provider", provider || null);
        return _this;
    }
    Object.defineProperty(Wallet.prototype, "mnemonic", {
        get: function () { return this._mnemonic(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "privateKey", {
        get: function () { return this._signingKey().privateKey; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "publicKey", {
        get: function () { return this._signingKey().publicKey; },
        enumerable: true,
        configurable: true
    });
    Wallet.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    Wallet.prototype.connect = function (provider) {
        return new Wallet(this, provider);
    };
    Wallet.prototype.signTransaction = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(transaction).then(function (tx) {
            if (tx.from != null) {
                if (address_1.getAddress(tx.from) !== _this.address) {
                    logger.throwArgumentError("transaction from address mismatch", "transaction.from", transaction.from);
                }
                delete tx.from;
            }
            var signature = _this._signingKey().signDigest(keccak256_1.keccak256(transactions_1.serialize(tx)));
            return transactions_1.serialize(tx, signature);
        });
    };
    Wallet.prototype.signMessage = function (message) {
        return Promise.resolve(bytes_1.joinSignature(this._signingKey().signDigest(hash_1.hashMessage(message))));
    };
    Wallet.prototype.encrypt = function (password, options, progressCallback) {
        if (typeof (options) === "function" && !progressCallback) {
            progressCallback = options;
            options = {};
        }
        if (progressCallback && typeof (progressCallback) !== "function") {
            throw new Error("invalid callback");
        }
        if (!options) {
            options = {};
        }
        return json_wallets_1.encryptKeystore(this, password, options, progressCallback);
    };
    /**
     *  Static methods to create Wallet instances.
     */
    Wallet.createRandom = function (options) {
        var entropy = random_1.randomBytes(16);
        if (!options) {
            options = {};
        }
        if (options.extraEntropy) {
            entropy = bytes_1.arrayify(bytes_1.hexDataSlice(keccak256_1.keccak256(bytes_1.concat([entropy, options.extraEntropy])), 0, 16));
        }
        var mnemonic = hdnode_1.entropyToMnemonic(entropy, options.locale);
        return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
    };
    Wallet.fromEncryptedJson = function (json, password, progressCallback) {
        return json_wallets_1.decryptJsonWallet(json, password, progressCallback).then(function (account) {
            return new Wallet(account);
        });
    };
    Wallet.fromEncryptedJsonSync = function (json, password) {
        return new Wallet(json_wallets_1.decryptJsonWalletSync(json, password));
    };
    Wallet.fromMnemonic = function (mnemonic, path, wordlist) {
        if (!path) {
            path = hdnode_1.defaultPath;
        }
        return new Wallet(hdnode_1.HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path));
    };
    return Wallet;
}(abstract_signer_1.Signer));
exports.Wallet = Wallet;
function verifyMessage(message, signature) {
    return transactions_1.recoverAddress(hash_1.hashMessage(message), signature);
}
exports.verifyMessage = verifyMessage;
//# sourceMappingURL=index.js.map