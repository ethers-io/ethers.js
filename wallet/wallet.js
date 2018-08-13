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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hdnode_1 = require("./hdnode");
var secretStorage = __importStar(require("./secret-storage"));
var signing_key_1 = require("./signing-key");
var bytes_1 = require("../utils/bytes");
var hash_1 = require("../utils/hash");
var json_wallet_1 = require("../utils/json-wallet");
var keccak256_1 = require("../utils/keccak256");
var properties_1 = require("../utils/properties");
var random_bytes_1 = require("../utils/random-bytes");
var transaction_1 = require("../utils/transaction");
// Imported Abstracts
var abstract_signer_1 = require("./abstract-signer");
var abstract_provider_1 = require("../providers/abstract-provider");
var errors = __importStar(require("../utils/errors"));
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
            return Promise.resolve(transaction_1.serialize(tx, signature));
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
            tx.from = this.getAddress();
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
    Wallet.fromEncryptedJson = function (json, password, progressCallback) {
        if (json_wallet_1.isCrowdsaleWallet(json)) {
            try {
                if (progressCallback) {
                    progressCallback(0);
                }
                var privateKey = secretStorage.decryptCrowdsale(json, password);
                if (progressCallback) {
                    progressCallback(1);
                }
                return Promise.resolve(new Wallet(privateKey));
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        else if (json_wallet_1.isSecretStorageWallet(json)) {
            return secretStorage.decrypt(json, password, progressCallback).then(function (signingKey) {
                return new Wallet(signingKey);
            });
        }
        return Promise.reject('invalid wallet JSON');
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
