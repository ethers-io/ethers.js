'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./utils/bytes");
var hash_1 = require("./utils/hash");
var hdnode_1 = require("./utils/hdnode");
var json_wallet_1 = require("./utils/json-wallet");
var keccak256_1 = require("./utils/keccak256");
var properties_1 = require("./utils/properties");
var random_bytes_1 = require("./utils/random-bytes");
var secretStorage = __importStar(require("./utils/secret-storage"));
var signing_key_1 = require("./utils/signing-key");
var transaction_1 = require("./utils/transaction");
// Imported Abstracts
var abstract_signer_1 = require("./abstract-signer");
var abstract_provider_1 = require("./providers/abstract-provider");
var errors = __importStar(require("./errors"));
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(privateKey, provider) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, Wallet);
        // Make sure we have a valid signing key
        if (signing_key_1.SigningKey.isSigningKey(privateKey)) {
            properties_1.defineReadOnly(_this, 'signingKey', privateKey);
        }
        else {
            properties_1.defineReadOnly(_this, 'signingKey', new signing_key_1.SigningKey(privateKey));
        }
        properties_1.defineReadOnly(_this, 'provider', provider);
        return _this;
    }
    Object.defineProperty(Wallet.prototype, "address", {
        get: function () { return this.signingKey.address; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "mnemonic", {
        get: function () { return this.signingKey.mnemonic; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "path", {
        get: function () { return this.signingKey.path; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "privateKey", {
        get: function () { return this.signingKey.privateKey; },
        enumerable: true,
        configurable: true
    });
    /**
     *  Create a new instance of this Wallet connected to provider.
     */
    Wallet.prototype.connect = function (provider) {
        if (!(abstract_provider_1.Provider.isProvider(provider))) {
            errors.throwError('invalid provider', errors.INVALID_ARGUMENT, { argument: 'provider', value: provider });
        }
        return new Wallet(this.signingKey, provider);
    };
    Wallet.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    Wallet.prototype.sign = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(transaction).then(function (tx) {
            var rawTx = transaction_1.serialize(tx);
            var signature = _this.signingKey.signDigest(keccak256_1.keccak256(rawTx));
            return transaction_1.serialize(tx, signature);
        });
    };
    Wallet.prototype.signMessage = function (message) {
        return Promise.resolve(bytes_1.joinSignature(this.signingKey.signDigest(hash_1.hashMessage(message))));
    };
    Wallet.prototype.getBalance = function (blockTag) {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        return this.provider.getBalance(this.address, blockTag);
    };
    Wallet.prototype.getTransactionCount = function (blockTag) {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        return this.provider.getTransactionCount(this.address, blockTag);
    };
    Wallet.prototype.sendTransaction = function (transaction) {
        var _this = this;
        if (!this.provider) {
            throw new Error('missing provider');
        }
        if (transaction.nonce == null) {
            transaction = properties_1.shallowCopy(transaction);
            transaction.nonce = this.getTransactionCount("pending");
        }
        return transaction_1.populateTransaction(transaction, this.provider, this.address).then(function (tx) {
            return _this.sign(tx).then(function (signedTransaction) {
                return _this.provider.sendTransaction(signedTransaction);
            });
        });
    };
    Wallet.prototype.encrypt = function (password, options, progressCallback) {
        if (typeof (options) === 'function' && !progressCallback) {
            progressCallback = options;
            options = {};
        }
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        if (!options) {
            options = {};
        }
        if (this.mnemonic) {
            // Make sure we don't accidentally bubble the mnemonic up the call-stack
            options = properties_1.shallowCopy(options);
            // Set the mnemonic and path
            options.mnemonic = this.mnemonic;
            options.path = this.path;
        }
        return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
    };
    /**
     *  Static methods to create Wallet instances.
     */
    Wallet.createRandom = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var entropy, mnemonic;
            return __generator(this, function (_a) {
                entropy = random_bytes_1.randomBytes(16);
                if (!options) {
                    options = {};
                }
                if (options.extraEntropy) {
                    entropy = bytes_1.arrayify(keccak256_1.keccak256(bytes_1.concat([entropy, options.extraEntropy])).substring(0, 34));
                }
                mnemonic = hdnode_1.entropyToMnemonic(entropy, options.locale);
                return [2 /*return*/, Wallet.fromMnemonic(mnemonic, options.path, options.locale)];
            });
        });
    };
    Wallet.fromEncryptedJson = function (json, password, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKey, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!json_wallet_1.isCrowdsaleWallet(json)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (progressCallback) {
                            progressCallback(0);
                        }
                        return [4 /*yield*/, secretStorage.decryptCrowdsale(json, password)];
                    case 2:
                        privateKey = _a.sent();
                        if (progressCallback) {
                            progressCallback(1);
                        }
                        return [2 /*return*/, Promise.resolve(new Wallet(privateKey))];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        if (json_wallet_1.isSecretStorageWallet(json)) {
                            return [2 /*return*/, secretStorage.decrypt(json, password, progressCallback).then(function (signingKey) {
                                    return new Wallet(signingKey);
                                })];
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/, Promise.reject('invalid wallet JSON')];
                }
            });
        });
    };
    Wallet.fromMnemonic = function (mnemonic, path, wordlist) {
        if (!path) {
            path = hdnode_1.defaultPath;
        }
        return new Wallet(hdnode_1.fromMnemonic(mnemonic, wordlist).derivePath(path));
    };
    return Wallet;
}(abstract_signer_1.Signer));
exports.Wallet = Wallet;
