'use strict';

import scrypt from 'scrypt-js';

import { getAddress } from '../utils/address';
import { BigNumber, bigNumberify, ConstantZero } from '../utils/bignumber';
import { arrayify, Arrayish, concat, hexlify, stripZeros, hexZeroPad } from '../utils/convert';
import { keccak256 } from '../utils/keccak256';
import { randomBytes } from '../utils/random-bytes';
import * as RLP from '../utils/rlp';
import { toUtf8Bytes, UnicodeNormalizationForm } from '../utils/utf8';

import * as errors from '../utils/errors';

import { entropyToMnemonic, fromMnemonic, HDNode } from './hdnode';
import * as secretStorage from './secret-storage';
import { SigningKey } from './signing-key';

// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
//import _setimmediate = require('setimmediate');


interface Provider {
    chainId: number;
    getBalance(address: string, blockTag: number | string): Promise<BigNumber>;
    getTransactionCount(address: string, blockTag: number | string): Promise<number>;
    estimateGas(transaction: any): Promise<BigNumber>;
    getGasPrice(): Promise<BigNumber>;
    sendTransaction(Bytes): Promise<string>;
    resolveName(address: string): Promise<string>
    waitForTransaction(Bytes32): Promise<TransactionResponse>;
}

interface TransactionRequest {
    nonce?: number;
    to?: string;
    from?: string;
    data?: string;
    gasLimit?: BigNumber;
    gasPrice?: BigNumber;
    r?: string;
    s?: string;
    chainId?: number;
    v?: number;
    value?: BigNumber;
}

interface TransactionResponse extends TransactionRequest {
    hash?: string;
    blockHash?: string;
    block?: number;
    wait?: (timeout?: number) => Promise<TransactionResponse>;
}


var defaultPath = "m/44'/60'/0'/0/0";

var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];

// @TODO: Bytes32 or SigningKey
export class Wallet {
    readonly address: string;
    readonly privateKey: string;

    private mnemonic: string;
    private path: string;

    private readonly signingKey: SigningKey;

    provider: any;

    //private _provider;

    public defaultGasLimit: number = 1500000;

    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider) {
        errors.checkNew(this, Wallet);

        // Make sure we have a valid signing key
        if (privateKey instanceof SigningKey) {
            this.signingKey = privateKey;
            if (this.signingKey.mnemonic) {
                Object.defineProperty(this, 'mnemonic', {
                    enumerable: true,
                    value: this.signingKey.mnemonic,
                    writable: false
                });
                //this.mnemonic = this.signingKey.mnemonic;
                this.path = this.signingKey.path;
            }
        } else {
            this.signingKey = new SigningKey(privateKey);
        }

        this.privateKey = this.signingKey.privateKey

        this.provider = provider;

        //this.address = this.signingKey.address;
        Object.defineProperty(this, 'address', {
            enumerable: true,
            value: this.signingKey.address,
            writable: false
        });
    }

    sign(transaction: TransactionRequest) {
        var chainId = transaction.chainId;
        if (chainId == null && this.provider) { chainId = this.provider.chainId; }
        if (!chainId) { chainId = 0; }

        var raw = [];
        transactionFields.forEach(function(fieldInfo) {
            let value = transaction[fieldInfo.name] || ([]);
            value = arrayify(hexlify(value));

            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
                let error: any = new Error('invalid ' + fieldInfo.name);
                error.reason = 'wrong length';
                error.value = value;
                throw error;
            }

            // Variable-width (with a maximum)
            if (fieldInfo.maxLength) {
                value = stripZeros(value);
                if (value.length > fieldInfo.maxLength) {
                    let error: any = new Error('invalid ' + fieldInfo.name);
                    error.reason = 'too long';
                    error.value = value;
                    throw error;
                }
            }

            raw.push(hexlify(value));
        });

        if (chainId) {
            raw.push(hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
        }

        var digest = keccak256(RLP.encode(raw));

        var signature = this.signingKey.signDigest(digest);

        var v = 27 + signature.recoveryParam
        if (chainId) {
            raw.pop();
            raw.pop();
            raw.pop();
            v += chainId * 2 + 8;
        }

        raw.push(hexlify(v));
        raw.push(signature.r);
        raw.push(signature.s);

        return RLP.encode(raw);
    }
/*
    set provider(provider: Provider) {
        this._provider = provider;
    }

    get provider() {
        return this._provider;
    }
*/
    static parseTransaction(rawTransaction: Arrayish): TransactionRequest {
        rawTransaction = hexlify(rawTransaction);
        var signedTransaction = RLP.decode(rawTransaction);
        if (signedTransaction.length !== 9) { throw new Error('invalid transaction'); }

        var raw = [];

        var transaction: any = { }

        transactionFields.forEach(function(fieldInfo, index) {
            transaction[fieldInfo.name] = signedTransaction[index];
            raw.push(signedTransaction[index]);
        });

        if (transaction.to) {
            if (transaction.to == '0x') {
                delete transaction.to;
            } else {
                transaction.to = getAddress(transaction.to);
            }
        }

        ['gasPrice', 'gasLimit', 'nonce', 'value'].forEach(function(name: string) {
            if (!transaction[name]) { return; }
            let value: BigNumber = ConstantZero;
            if (transaction[name].length > 0) {
                value = bigNumberify(transaction[name]);
            }
            transaction[name] = value;
        });

        transaction.nonce = transaction.nonce.toNumber();


        var v = arrayify(signedTransaction[6]);
        var r = arrayify(signedTransaction[7]);
        var s = arrayify(signedTransaction[8]);

        if (v.length >= 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
            transaction.v = bigNumberify(v).toNumber();
            transaction.r = signedTransaction[7];
            transaction.s = signedTransaction[8];

            var chainId = (transaction.v - 35) / 2;
            if (chainId < 0) { chainId = 0; }
            chainId = Math.trunc(chainId);

            transaction.chainId = chainId;

            var recoveryParam = transaction.v - 27;

            if (chainId) {
                raw.push(hexlify(chainId));
                raw.push('0x');
                raw.push('0x');
                recoveryParam -= chainId * 2 + 8;
            }

            var digest = keccak256(RLP.encode(raw));
            try {
                transaction.from = SigningKey.recover(digest, r, s, recoveryParam);
            } catch (error) {
                console.log(error);
            }
        }

        return transaction;
    }

    getAddress() {
        return Promise.resolve(this.address);
    }

    getBalance(blockTag) {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getBalance(this.address, blockTag);
    }

    getTransactionCount(blockTag) {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getTransactionCount(this.address, blockTag);
    }

    estimateGas(transaction: TransactionRequest) {
        if (!this.provider) { throw new Error('missing provider'); }

        var calculate: TransactionRequest = {};
        ['from', 'to', 'data', 'value'].forEach(function(key) {
            if (transaction[key] == null) { return; }
            calculate[key] = transaction[key];
        });

        if (transaction.from == null) { calculate.from = this.address; }

        return this.provider.estimateGas(calculate);
    }

    sendTransaction(transaction) {
        if (!this.provider) { throw new Error('missing provider'); }

        if (!transaction || typeof(transaction) !== 'object') {
            throw new Error('invalid transaction object');
        }

        var gasLimit = transaction.gasLimit;
        if (gasLimit == null) { gasLimit = this.defaultGasLimit; }

        var self = this;

        var gasPricePromise = null;
        if (transaction.gasPrice) {
            gasPricePromise = Promise.resolve(transaction.gasPrice);
        } else {
            gasPricePromise = this.provider.getGasPrice();
        }

        var noncePromise = null;
        if (transaction.nonce) {
            noncePromise = Promise.resolve(transaction.nonce);
        } else {
            noncePromise = this.provider.getTransactionCount(self.address, 'pending');
        }

        var chainId: number = this.provider.chainId;

        var toPromise = null;
        if (transaction.to) {
            toPromise = this.provider.resolveName(transaction.to);
        } else {
            toPromise = Promise.resolve(undefined);
        }

        var data = hexlify(transaction.data || '0x');
        var value = ConstantZero;

        return Promise.all([gasPricePromise, noncePromise, toPromise]).then(function(results: [ BigNumber, number, string]) {
            var signedTransaction = self.sign({
                to: results[2],
                data: data,
                gasLimit: gasLimit,
                gasPrice: results[0],
                nonce: results[1],
                value: value,
                chainId: chainId
            });

            return self.provider.sendTransaction(signedTransaction).then(function(hash) {
                var transaction: TransactionResponse = Wallet.parseTransaction(signedTransaction);
                transaction.hash = hash;
                transaction.wait = function() {
                    return self.provider.waitForTransaction(hash);
                };
                return transaction;
            });
        });
    }

    send(addressOrName, amountWei, options) {
        if (!options) { options = {}; }

        return this.sendTransaction({
            to: addressOrName,
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: amountWei,
        });
    }


    static hashMessage(message) {
        var payload = concat([
            toUtf8Bytes('\x19Ethereum Signed Message:\n'),
            toUtf8Bytes(String(message.length)),
            ((typeof(message) === 'string') ? toUtf8Bytes(message): message)
        ]);
        return keccak256(payload);
    }

    signMessage(message) {
        var signingKey = new SigningKey(this.privateKey);
        var sig = signingKey.signDigest(Wallet.hashMessage(message));

        return (hexZeroPad(sig.r, 32) + hexZeroPad(sig.s, 32).substring(2) + (sig.recoveryParam ? '1c': '1b'));
    }

    static verifyMessage(message, signature) {
        signature = hexlify(signature);
        if (signature.length != 132) { throw new Error('invalid signature'); }
        var digest = Wallet.hashMessage(message);

        var recoveryParam = parseInt(signature.substring(130), 16);
        if (recoveryParam >= 27) { recoveryParam -= 27; }
        if (recoveryParam < 0) { throw new Error('invalid signature'); }

        return SigningKey.recover(
            digest,
            signature.substring(0, 66),
            '0x' + signature.substring(66, 130),
            recoveryParam
        );
    }

    encrypt(password, options, progressCallback) {
        if (typeof(options) === 'function' && !progressCallback) {
            progressCallback = options;
            options = {};
        }

        if (progressCallback && typeof(progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }

        if (!options) { options = {}; }

        if (this.mnemonic) {
            // Make sure we don't accidentally bubble the mnemonic up the call-stack
            var safeOptions = {};
            for (var key in options) { safeOptions[key] = options[key]; }
            options = safeOptions;

            // Set the mnemonic and path
            options.mnemonic = this.mnemonic;
            options.path = this.path
        }

        return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
    }


    static createRandom(options) {
        var entropy: Uint8Array = randomBytes(16);

        if (!options) { options = { }; }

        if (options.extraEntropy) {
            entropy = arrayify(keccak256(concat([entropy, options.extraEntropy])).substring(0, 34));
        }

        var mnemonic = entropyToMnemonic(entropy);
        return Wallet.fromMnemonic(mnemonic, options.path);
    }


    static isEncryptedWallet(json: string) {
        return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
    }


    static fromEncryptedWallet(json, password, progressCallback) {
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
                    var wallet = new Wallet(signingKey);
                    /*
                    if (signingKey.mnemonic && signingKey.path) {
                        wallet.mnemonic = signingKey.mnemonic;
                        wallet.path = signingKey.path;
                    }
                    */
                    resolve(wallet);
                }, function(error) {
                    reject(error);
                });

            } else {
                reject('invalid wallet JSON');
            }
        });
    }

    static fromMnemonic(mnemonic: string, path?: string) {
        if (!path) { path = defaultPath; }
        return new Wallet(fromMnemonic(mnemonic).derivePath(path));
    }


    static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback) {
        if (progressCallback && typeof(progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }

        if (typeof(username) === 'string') {
            username =  toUtf8Bytes(username, UnicodeNormalizationForm.NFKC);
        } else {
            username = arrayify(username);
        }

        if (typeof(password) === 'string') {
            password =  toUtf8Bytes(password, UnicodeNormalizationForm.NFKC);
        } else {
            password = arrayify(password);
        }

        return new Promise(function(resolve, reject) {
            scrypt(password, username, (1 << 18), 8, 1, 32, function(error, progress, key) {
                if (error) {
                    reject(error);

                } else if (key) {
                    resolve(new Wallet(hexlify(key)));

                } else if (progressCallback) {
                    return progressCallback(progress);
                }
            });
        });
    }
}
