'use strict';

import scrypt from 'scrypt-js';

import { defaultPath, entropyToMnemonic, fromMnemonic, HDNode } from './hdnode';
import * as secretStorage from './secret-storage';
import { ProgressCallback } from './secret-storage';
import { recoverAddress, SigningKey } from './signing-key';

import { BlockTag, Provider, TransactionRequest, TransactionResponse } from '../providers/provider';

import { BigNumber, BigNumberish } from '../utils/bignumber';
import { arrayify, Arrayish, concat, hexlify, joinSignature } from '../utils/bytes';
import { hashMessage } from '../utils/hash';
import { keccak256 } from '../utils/keccak256';
import { defineReadOnly, resolveProperties, shallowCopy } from '../utils/properties';
import { randomBytes } from '../utils/random-bytes';
import { sign as signTransaction } from '../utils/transaction';
import { toUtf8Bytes, UnicodeNormalizationForm } from '../utils/utf8';

import * as errors from '../utils/errors';


// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
//import _setimmediate = require('setimmediate');

export abstract class Signer {
    provider?: Provider;

    abstract getAddress(): Promise<string>

    abstract signMessage(transaction: Arrayish | string): Promise<string>;
    abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}


export class Wallet extends Signer {

    readonly address: string;
    readonly privateKey: string;

    readonly provider: Provider;


    private mnemonic: string;
    private path: string;

    private readonly signingKey: SigningKey;

    public defaultGasLimit: number = 1500000;

    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider) {
        super();
        errors.checkNew(this, Wallet);

        // Make sure we have a valid signing key
        if (privateKey instanceof SigningKey) {
            defineReadOnly(this, 'signingKey', privateKey);
            if (this.signingKey.mnemonic) {
                defineReadOnly(this, 'mnemonic', privateKey.mnemonic);
                defineReadOnly(this, 'path', privateKey.path);
            }
        } else {
            defineReadOnly(this, 'signingKey', new SigningKey(privateKey));
        }

        defineReadOnly(this, 'privateKey', this.signingKey.privateKey);

        defineReadOnly(this, 'provider', provider);

        defineReadOnly(this, 'address', this.signingKey.address);
    }

    connect(provider: Provider): Wallet {
        return new Wallet(this.signingKey, provider);
    }


    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    sign(transaction: TransactionRequest): Promise<string> {
        return resolveProperties(transaction).then((tx) => {
            return signTransaction(tx, this.signingKey.signDigest.bind(this.signingKey));
        });
    }

    signMessage(message: Arrayish | string): Promise<string> {
        return Promise.resolve(joinSignature(this.signingKey.signDigest(hashMessage(message))));
    }


    getBalance(blockTag?: BlockTag): Promise<BigNumber> {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getBalance(this.address, blockTag);
    }

    getTransactionCount(blockTag?: BlockTag): Promise<number> {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getTransactionCount(this.address, blockTag);
    }

    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        if (!this.provider) { throw new Error('missing provider'); }

        if (!transaction || typeof(transaction) !== 'object') {
            throw new Error('invalid transaction object');
        }

        var tx = shallowCopy(transaction);

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
            tx.chainId = this.provider.getNetwork().then((network) => network.chainId);
        }

        return resolveProperties(tx).then((tx) => {
            console.log('To Sign', tx);
            return this.provider.sendTransaction(this.sign(tx));
        });

    }

    send(addressOrName: string, amountWei: BigNumberish, options: any): Promise<TransactionResponse> {
        if (!options) { options = {}; }

        return this.sendTransaction({
            to: addressOrName,
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: amountWei,
        });
    }


    encrypt(password: Arrayish | string, options: any, progressCallback: ProgressCallback): Promise<string> {
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


    static createRandom(options: any): Wallet {
        var entropy: Uint8Array = randomBytes(16);

        if (!options) { options = { }; }

        if (options.extraEntropy) {
            entropy = arrayify(keccak256(concat([entropy, options.extraEntropy])).substring(0, 34));
        }

        var mnemonic = entropyToMnemonic(entropy);
        return Wallet.fromMnemonic(mnemonic, options.path);
    }


    static isEncryptedWallet(json: string): boolean {
        return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
    }


    static fromEncryptedWallet(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet> {
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

    static fromMnemonic(mnemonic: string, path?: string): Wallet {
        if (!path) { path = defaultPath; }
        return new Wallet(fromMnemonic(mnemonic).derivePath(path));
    }


    static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback: ProgressCallback): Promise<Wallet> {
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


    static verifyMessage(message: Arrayish | string, signature: string): string {
        signature = hexlify(signature);
        if (signature.length != 132) { throw new Error('invalid signature'); }
        var digest = hashMessage(message);

        var recoveryParam = parseInt(signature.substring(130), 16);
        if (recoveryParam >= 27) { recoveryParam -= 27; }
        if (recoveryParam < 0) { throw new Error('invalid signature'); }

        return recoverAddress(
            digest,
            {
                r: signature.substring(0, 66),
                s: '0x' + signature.substring(66, 130),
                recoveryParam: recoveryParam
            }
        );
    }

}
