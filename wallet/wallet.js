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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var hdnode_1 = require("./hdnode");
var secretStorage = __importStar(require("./secret-storage"));
var signing_key_1 = require("./signing-key");
var bytes_1 = require("../utils/bytes");
var hash_1 = require("../utils/hash");
var keccak256_1 = require("../utils/keccak256");
var properties_1 = require("../utils/properties");
var random_bytes_1 = require("../utils/random-bytes");
var transaction_1 = require("../utils/transaction");
var utf8_1 = require("../utils/utf8");
var errors = __importStar(require("../utils/errors"));
// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
//import _setimmediate = require('setimmediate');
var Signer = /** @class */ (function () {
    function Signer() {
    }
    return Signer;
}());
exports.Signer = Signer;
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    function Wallet(privateKey, provider) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, Wallet);
        // Make sure we have a valid signing key
        if (privateKey instanceof signing_key_1.SigningKey) {
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
        get: function () { return this.signingKey.mnemonic; },
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
        return new Wallet(this.signingKey, provider);
    };
    Wallet.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    Wallet.prototype.sign = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(transaction).then(function (tx) {
            return transaction_1.sign(tx, _this.signingKey.signDigest.bind(_this.signingKey));
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
        if (!this.provider) {
            throw new Error('missing provider');
        }
        if (!transaction || typeof (transaction) !== 'object') {
            throw new Error('invalid transaction object');
        }
        var tx = properties_1.shallowCopy(transaction);
        if (tx.to != null) {
            tx.to = this.provider.resolveName(tx.to);
        }
        if (tx.gasLimit == null) {
            tx.gasLimit = this.provider.estimateGas(tx);
        }
        if (tx.gasPrice == null) {
            tx.gasPrice = this.provider.getGasPrice();
        }
        if (tx.nonce == null) {
            tx.nonce = this.getTransactionCount();
        }
        if (tx.chainId == null) {
            tx.chainId = this.provider.getNetwork().then(function (network) { return network.chainId; });
        }
        return this.provider.sendTransaction(this.sign(tx));
    };
    Wallet.prototype.send = function (addressOrName, amountWei, options) {
        if (!options) {
            options = {};
        }
        return this.sendTransaction({
            to: addressOrName,
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: amountWei,
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
            var safeOptions = {};
            for (var key in options) {
                safeOptions[key] = options[key];
            }
            options = safeOptions;
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
        var entropy = random_bytes_1.randomBytes(16);
        if (!options) {
            options = {};
        }
        if (options.extraEntropy) {
            entropy = bytes_1.arrayify(keccak256_1.keccak256(bytes_1.concat([entropy, options.extraEntropy])).substring(0, 34));
        }
        var mnemonic = hdnode_1.entropyToMnemonic(entropy, options.locale);
        return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
    };
    Wallet.fromEncryptedWallet = function (json, password, progressCallback) {
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        return new Promise(function (resolve, reject) {
            if (secretStorage.isCrowdsaleWallet(json)) {
                try {
                    var privateKey = secretStorage.decryptCrowdsale(json, password);
                    resolve(new Wallet(privateKey));
                }
                catch (error) {
                    reject(error);
                }
            }
            else if (secretStorage.isValidWallet(json)) {
                secretStorage.decrypt(json, password, progressCallback).then(function (signingKey) {
                    var wallet = new Wallet(signingKey);
                    /*
                    if (signingKey.mnemonic && signingKey.path) {
                        wallet.mnemonic = signingKey.mnemonic;
                        wallet.path = signingKey.path;
                    }
                    */
                    resolve(wallet);
                }, function (error) {
                    reject(error);
                });
            }
            else {
                reject('invalid wallet JSON');
            }
        });
    };
    Wallet.fromMnemonic = function (mnemonic, path, wordlist) {
        if (!path) {
            path = hdnode_1.defaultPath;
        }
        return new Wallet(hdnode_1.fromMnemonic(mnemonic, wordlist).derivePath(path));
    };
    Wallet.fromBrainWallet = function (username, password, progressCallback) {
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        if (typeof (username) === 'string') {
            username = utf8_1.toUtf8Bytes(username, utf8_1.UnicodeNormalizationForm.NFKC);
        }
        else {
            username = bytes_1.arrayify(username);
        }
        if (typeof (password) === 'string') {
            password = utf8_1.toUtf8Bytes(password, utf8_1.UnicodeNormalizationForm.NFKC);
        }
        else {
            password = bytes_1.arrayify(password);
        }
        return new Promise(function (resolve, reject) {
            scrypt_js_1.default(password, username, (1 << 18), 8, 1, 32, function (error, progress, key) {
                if (error) {
                    reject(error);
                }
                else if (key) {
                    resolve(new Wallet(bytes_1.hexlify(key)));
                }
                else if (progressCallback) {
                    return progressCallback(progress);
                }
            });
        });
    };
    /**
     *  Determine if this is an encryped JSON wallet.
     */
    Wallet.isEncryptedWallet = function (json) {
        return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
    };
    /**
     *  Verify a signed message, returning the address of the signer.
     */
    Wallet.verifyMessage = function (message, signature) {
        signature = bytes_1.hexlify(signature);
        if (signature.length != 132) {
            throw new Error('invalid signature');
        }
        var digest = hash_1.hashMessage(message);
        var recoveryParam = parseInt(signature.substring(130), 16);
        if (recoveryParam >= 27) {
            recoveryParam -= 27;
        }
        if (recoveryParam < 0) {
            throw new Error('invalid signature');
        }
        return signing_key_1.recoverAddress(digest, {
            r: signature.substring(0, 66),
            s: '0x' + signature.substring(66, 130),
            recoveryParam: recoveryParam
        });
    };
    return Wallet;
}(Signer));
exports.Wallet = Wallet;
