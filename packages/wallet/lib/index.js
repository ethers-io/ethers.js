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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTypedData = exports.verifyMessage = exports.Wallet = void 0;
var address_1 = require("@hethers/address");
var abstract_provider_1 = require("@hethers/abstract-provider");
var abstract_signer_1 = require("@hethers/abstract-signer");
var bytes_1 = require("@ethersproject/bytes");
var hash_1 = require("@ethersproject/hash");
var hdnode_1 = require("@hethers/hdnode");
var keccak256_1 = require("@ethersproject/keccak256");
var properties_1 = require("@ethersproject/properties");
var random_1 = require("@ethersproject/random");
var signing_key_1 = require("@ethersproject/signing-key");
var json_wallets_1 = require("@hethers/json-wallets");
var transactions_1 = require("@hethers/transactions");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var sdk_1 = require("@hashgraph/sdk");
var logger = new logger_1.Logger(_version_1.version);
function isAccount(value) {
    return value != null && (0, bytes_1.isHexString)(value.privateKey, 32);
}
function hasMnemonic(value) {
    var mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}
function hasAlias(value) {
    return isAccount(value) && value.alias != null;
}
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(identity, provider) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, Wallet);
        _this = _super.call(this) || this;
        if (isAccount(identity) && !signing_key_1.SigningKey.isSigningKey(identity)) {
            var signingKey_1 = new signing_key_1.SigningKey(identity.privateKey);
            (0, properties_1.defineReadOnly)(_this, "_signingKey", function () { return signingKey_1; });
            if (identity.address || identity.account) {
                (0, properties_1.defineReadOnly)(_this, "address", identity.address ? (0, address_1.getAddress)(identity.address) : (0, address_1.getAddressFromAccount)(identity.account));
                (0, properties_1.defineReadOnly)(_this, "account", identity.account ? identity.account : (0, address_1.getAccountFromAddress)(identity.address));
            }
            if (hasAlias(identity)) {
                (0, properties_1.defineReadOnly)(_this, "alias", identity.alias);
                if (_this.alias !== (0, transactions_1.computeAlias)(signingKey_1.privateKey)) {
                    logger.throwArgumentError("privateKey/alias mismatch", "privateKey", "[REDACTED]");
                }
            }
            if (hasMnemonic(identity)) {
                var srcMnemonic_1 = identity.mnemonic;
                (0, properties_1.defineReadOnly)(_this, "_mnemonic", function () { return ({
                    phrase: srcMnemonic_1.phrase,
                    path: srcMnemonic_1.path || hdnode_1.defaultPath,
                    locale: srcMnemonic_1.locale || "en"
                }); });
                var mnemonic = _this.mnemonic;
                var node = hdnode_1.HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path);
                if (node.privateKey !== _this._signingKey().privateKey) {
                    logger.throwArgumentError("mnemonic/privateKey mismatch", "privateKey", "[REDACTED]");
                }
            }
            else {
                (0, properties_1.defineReadOnly)(_this, "_mnemonic", function () { return null; });
            }
        }
        else {
            if (signing_key_1.SigningKey.isSigningKey(identity)) {
                /* istanbul ignore if */
                if (identity.curve !== "secp256k1") {
                    logger.throwArgumentError("unsupported curve; must be secp256k1", "privateKey", "[REDACTED]");
                }
                (0, properties_1.defineReadOnly)(_this, "_signingKey", function () { return identity; });
            }
            else {
                // A lot of common tools do not prefix private keys with a 0x (see: #1166)
                if (typeof (identity) === "string") {
                    if (identity.match(/^[0-9a-f]*$/i) && identity.length === 64) {
                        identity = "0x" + identity;
                    }
                }
                var signingKey_2 = new signing_key_1.SigningKey(identity);
                (0, properties_1.defineReadOnly)(_this, "_signingKey", function () { return signingKey_2; });
            }
            (0, properties_1.defineReadOnly)(_this, "_mnemonic", function () { return null; });
            (0, properties_1.defineReadOnly)(_this, "alias", (0, transactions_1.computeAlias)(_this._signingKey().privateKey));
        }
        /* istanbul ignore if */
        if (provider && !abstract_provider_1.Provider.isProvider(provider)) {
            logger.throwArgumentError("invalid provider", "provider", provider);
        }
        (0, properties_1.defineReadOnly)(_this, "provider", provider || null);
        return _this;
    }
    Object.defineProperty(Wallet.prototype, "mnemonic", {
        get: function () {
            return this._mnemonic();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "privateKey", {
        get: function () {
            return this._signingKey().privateKey;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "publicKey", {
        get: function () {
            return this._signingKey().publicKey;
        },
        enumerable: false,
        configurable: true
    });
    Wallet.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    Wallet.prototype.getAccount = function () {
        return Promise.resolve(this.account);
    };
    Wallet.prototype.getAlias = function () {
        return Promise.resolve(this.alias);
    };
    Wallet.prototype.connect = function (provider) {
        return new Wallet(this, provider);
    };
    Wallet.prototype.connectAccount = function (accountLike) {
        var eoa = {
            privateKey: this._signingKey().privateKey,
            address: (0, address_1.getAddressFromAccount)(accountLike),
            alias: this.alias,
            mnemonic: this._mnemonic()
        };
        return new Wallet(eoa, this.provider);
    };
    Wallet.prototype.signTransaction = function (transaction) {
        var _this = this;
        this._checkAddress('signTransaction');
        var tx = this.checkTransaction(transaction);
        return this.populateTransaction(tx).then(function (readyTx) { return __awaiter(_this, void 0, void 0, function () {
            var pubKey, tx, privKey, signed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pubKey = sdk_1.PublicKey.fromString(this._signingKey().compressedPublicKey);
                        tx = (0, transactions_1.serializeHederaTransaction)(readyTx, pubKey);
                        privKey = sdk_1.PrivateKey.fromStringECDSA(this._signingKey().privateKey);
                        return [4 /*yield*/, tx.sign(privKey)];
                    case 1:
                        signed = _a.sent();
                        return [2 /*return*/, (0, bytes_1.hexlify)(signed.toBytes())];
                }
            });
        }); });
    };
    Wallet.prototype.signMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, bytes_1.joinSignature)(this._signingKey().signDigest((0, hash_1.hashMessage)(message)))];
            });
        });
    };
    Wallet.prototype._signTypedData = function (domain, types, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, logger.throwError("_signTypedData not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                        operation: '_signTypedData'
                    })];
            });
        });
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
        return (0, json_wallets_1.encryptKeystore)(this, password, options, progressCallback);
    };
    /**
     * Performs a contract local call (ContractCallQuery) against the given contract in the provider's network.
     * In the future, this method should automatically perform getCost and apply the results for gasLimit/txFee.
     * TODO: utilize getCost when implemented
     *
     * @param txRequest - the call request to be submitted
     */
    /**
     *  Static methods to create Wallet instances.
     */
    Wallet.createRandom = function (options) {
        var entropy = (0, random_1.randomBytes)(16);
        if (!options) {
            options = {};
        }
        if (options.extraEntropy) {
            entropy = (0, bytes_1.arrayify)((0, bytes_1.hexDataSlice)((0, keccak256_1.keccak256)((0, bytes_1.concat)([entropy, options.extraEntropy])), 0, 16));
        }
        var mnemonic = (0, hdnode_1.entropyToMnemonic)(entropy, options.locale);
        return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
    };
    Wallet.prototype.createAccount = function (pubKey, initialBalance) {
        return __awaiter(this, void 0, void 0, function () {
            var signed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!initialBalance)
                            initialBalance = BigInt(0);
                        return [4 /*yield*/, this.signTransaction({
                                customData: {
                                    publicKey: pubKey,
                                    initialBalance: initialBalance
                                }
                            })];
                    case 1:
                        signed = _a.sent();
                        return [2 /*return*/, this.provider.sendTransaction(signed)];
                }
            });
        });
    };
    ;
    Wallet.fromEncryptedJson = function (json, password, progressCallback) {
        return (0, json_wallets_1.decryptJsonWallet)(json, password, progressCallback).then(function (account) {
            return new Wallet(account);
        });
    };
    Wallet.fromEncryptedJsonSync = function (json, password) {
        return new Wallet((0, json_wallets_1.decryptJsonWalletSync)(json, password));
    };
    Wallet.fromMnemonic = function (mnemonic, path, wordlist) {
        if (!path) {
            path = hdnode_1.defaultPath;
        }
        return new Wallet(hdnode_1.HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path));
    };
    Wallet.prototype._checkAddress = function (operation) {
        if (!this.address) {
            logger.throwError("missing address", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: (operation || "_checkAddress")
            });
        }
    };
    return Wallet;
}(abstract_signer_1.Signer));
exports.Wallet = Wallet;
function verifyMessage(message, signature) {
    return (0, signing_key_1.recoverPublicKey)((0, bytes_1.arrayify)((0, hash_1.hashMessage)(message)), signature);
}
exports.verifyMessage = verifyMessage;
function verifyTypedData(domain, types, value, signature) {
    return logger.throwError("verifyTypedData not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'verifyTypedData'
    });
}
exports.verifyTypedData = verifyTypedData;
//# sourceMappingURL=index.js.map