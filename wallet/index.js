'use strict';

var utils = require('ethers-utils');

var secretStorage = require('./secret-storage.js');
var SigningKey = require('./signing-key.js');

var scrypt = require('scrypt-js');

// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
require('setimmediate');

var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];

function Wallet(privateKey, provider) {
    if (!(this instanceof Wallet)) { throw new Error('missing new'); }

    // Make sure we have a valid signing key
    var signingKey = privateKey;
    if (!(privateKey instanceof SigningKey)) {
        signingKey = new SigningKey(privateKey);
    }
    utils.defineProperty(this, 'privateKey', signingKey.privateKey);

    // Provider
    Object.defineProperty(this, 'provider', {
        enumerable: true,
        get: function() { return provider; },
        set: function(value) {
            provider = value;
        }
    });
    if (provider) { this.provider = provider; }

    var defaultGasLimit = 2000000;
    Object.defineProperty(this, 'defaultGasLimit', {
        enumerable: true,
        get: function() { return defaultGasLimit; },
        set: function(value) {
            if (typeof(value) !== 'number') { throw new Error('invalid defaultGasLimit'); }
            defaultGasLimit = value;
        }
    });

    utils.defineProperty(this, 'address', signingKey.address);

    utils.defineProperty(this, 'sign', function(transaction) {
        var raw = [];
        transactionFields.forEach(function(fieldInfo) {
            var value = transaction[fieldInfo.name] || ([]);
            value = utils.arrayify(utils.hexlify(value), fieldInfo.name);

            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
                var error = new Error('invalid ' + fieldInfo.name);
                error.reason = 'wrong length';
                error.value = value;
                throw error;
            }

            // Variable-width (with a maximum)
            if (fieldInfo.maxLength) {
                value = utils.stripZeros(value);
                if (value.length > fieldInfo.maxLength) {
                    var error = new Error('invalid ' + fieldInfo.name);
                    error.reason = 'too long';
                    error.value = value;
                    throw error;
                }
            }

            raw.push(utils.hexlify(value));
        });

        var digest = utils.keccak256(utils.rlp.encode(raw));

        var signature = signingKey.signDigest(digest);

        raw.push(utils.hexlify([27 + signature.recoveryParam]));
        raw.push(signature.r);
        raw.push(signature.s);

        return (utils.rlp.encode(raw));
    });
}

utils.defineProperty(Wallet, 'parseTransaction', function(rawTransaction) {
    rawTransaction = utils.hexlify(rawTransaction, 'rawTransaction');
    var signedTransaction = utils.rlp.decode(rawTransaction);
    var raw = [];

    var transaction = {};
    transactionFields.forEach(function(fieldInfo, index) {
        transaction[fieldInfo.name] = signedTransaction[index];
        raw.push(signedTransaction[index]);
    });

    if (transaction.to) {
        if (transaction.to == '0x') {
            delete transaction.to;
        } else {
            transaction.to = utils.getAddress(transaction.to);
        }
    }

    ['gasPrice', 'gasLimit', 'nonce', 'value'].forEach(function(name) {
        if (!transaction[name]) { return; }
        if (transaction[name].length === 0) {
            transaction[name] = utils.bigNumberify(0);
        } else {
            transaction[name] = utils.bigNumberify(transaction[name]);
        }
    });

    if (transaction.nonce) {
        transaction.nonce = transaction.nonce.toNumber();
    } else {
        transaction.nonce = 0;
    }

    if (signedTransaction.length > 6) {
        var v = utils.arrayify(signedTransaction[6]);
        var r = utils.arrayify(signedTransaction[7]);
        var s = utils.arrayify(signedTransaction[8]);

        if (v.length === 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
            transaction.v = v[0];
            transaction.r = signedTransaction[7];
            transaction.s = signedTransaction[8];

            var digest = utils.keccak256(utils.rlp.encode(raw));
            try {
                transaction.from = SigningKey.recover(digest, r, s, transaction.v - 27);
            } catch (error) {
                console.log(error);
            }
        }
    }

    return transaction;
});

utils.defineProperty(Wallet.prototype, 'getBalance', function(blockTag) {
    if (!this.provider) { throw new Error('missing provider'); }
    return this.provider.getBalance(this.address, blockTag);
});

utils.defineProperty(Wallet.prototype, 'getTransactionCount', function(blockTag) {
    if (!this.provider) { throw new Error('missing provider'); }
    return this.provider.getTransactionCount(this.address, blockTag);
});

utils.defineProperty(Wallet.prototype, 'estimateGas', function(transaction) {
    if (!this.provider) { throw new Error('missing provider'); }

    var calculate = {};
    ['from', 'to', 'data', 'value'].forEach(function(key) {
        if (transaction[key] == null) { return; }
        calculate[key] = transaction[key];
    });

    if (transaction.from == null) { calculate.from = this.address; }

    return this.provider.estimateGas(calculate);
});

utils.defineProperty(Wallet.prototype, 'sendTransaction', function(transaction) {
    if (!this.provider) { throw new Error('missing provider'); }

    var gasLimit = transaction.gasLimit;
    if (gasLimit == null) { gasLimit = this.defaultGasLimit; }

    var self = this;

    var gasPrice = new Promise(function(resolve, reject) {
        if (transaction.gasPrice) {
            resolve(transaction.gasPrice);
            return;
        }

        self.provider.getGasPrice().then(function(gasPrice) {
            resolve(gasPrice);
        }, function(error) {
            reject(error);
        });
    });

    var nonce = new Promise(function(resolve, reject) {
        if (transaction.nonce) {
            resolve(transaction.nonce);
            return;
        }

        self.provider.getTransactionCount(self.address, 'pending').then(function(transactionCount) {
            resolve(transactionCount);
        }, function(error) {
            reject(error);
        });
    });

    var toAddress = undefined;
    if (transaction.to) { toAddress = utils.getAddress(transaction.to); }

    var data = utils.hexlify(transaction.data || '0x');
    var value = utils.hexlify(transaction.value || 0);

    return Promise.all([gasPrice, nonce]).then(function(results) {
        var signedTransaction = self.sign({
            to: toAddress,
            data: data,
            gasLimit: gasLimit,
            gasPrice: results[0],
            nonce: results[1],
            value: value
        });

        return self.provider.sendTransaction(signedTransaction);
    });
});

utils.defineProperty(Wallet.prototype, 'send', function(address, amountWei, options) {
    if (!options) { options = {}; }

    return this.sendTransaction({
        to: address,
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice,
        nonce: options.nonce,
        value: amountWei,
    });
});


utils.defineProperty(Wallet.prototype, 'encrypt', function(password, options, progressCallback) {
    if (typeof(options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }

    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    if (!options) { options = {}; }

    return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
});

utils.defineProperty(Wallet, 'isValidWallet', function(json) {
    return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
});

utils.defineProperty(Wallet, 'decrypt', function(json, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }
    return new Promise(function(resolve, reject) {

        if (secretStorage.isCrowdsaleWallet(json)) {
            try {
                var privateKey = secretStorage.decryptCrowdsale(json, password);
                resolve(new Wallet(privateKey));
            } catch (error) {
                reject(error);
            }

        } else if (secretStorage.isValidWallet(json)) {

            secretStorage.decrypt(json, password, progressCallback).then(function(signingKey) {
                resolve(new Wallet(signingKey));
            }, function(error) {
                reject(error);
            });

        } else {
            reject('invalid wallet JSON');
        }
    });
});


utils.defineProperty(Wallet, 'summonBrainWallet', function(username, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    if (typeof(username) === 'string') {
        username =  utils.toUtf8Bytes(username, 'NFKC');
    } else {
        username = utils.arrayify(username, 'password');
    }

    if (typeof(password) === 'string') {
        password =  utils.toUtf8Bytes(password, 'NFKC');
    } else {
        password = utils.arrayify(password, 'password');
    }

    return new Promise(function(resolve, reject) {
        scrypt(password, username, (1 << 18), 8, 1, 32, function(error, progress, key) {
            if (error) {
                reject(error);
            } else if (key) {
                resolve(new Wallet(utils.hexlify(key)));
            } else if (progressCallback) {
                progressCallback(progress);
            }
        });
    });
});


//utils.defineProperty(Wallet, 'isCrowdsaleWallet', secretStorage.isCrowdsaleWallet);

//utils.defineProperty(Wallet, 'decryptCrowdsale', function(json, password) {
//    return new Wallet(secretStorage.decryptCrowdsale(json, password));
//});


utils.defineProperty(Wallet, '_SigningKey', SigningKey);

module.exports = Wallet;

require('ethers-utils/standalone.js')({
    Wallet: module.exports
});

