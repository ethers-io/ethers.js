'use strict';

import scrypt from 'scrypt-js';

import { entropyToMnemonic, fromMnemonic, HDNode } from './hdnode';
import * as secretStorage from './secret-storage';
import { ProgressCallback } from './secret-storage';
import { recoverAddress, SigningKey } from './signing-key';

import { BlockTag, Provider, TransactionRequest, TransactionResponse } from '../providers/provider';

import { BigNumber, BigNumberish } from '../utils/bignumber';
import { arrayify, Arrayish, concat, hexlify, hexZeroPad } from '../utils/bytes';
import { keccak256 } from '../utils/keccak256';
import { defineReadOnly, resolveProperties, shallowCopy } from '../utils/properties';
import { randomBytes } from '../utils/random-bytes';
import { sign as signTransaction, UnsignedTransaction } from '../utils/transaction';
import { toUtf8Bytes, UnicodeNormalizationForm } from '../utils/utf8';

import * as errors from '../utils/errors';


// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
//import _setimmediate = require('setimmediate');

export interface Signer {
    // One of these MUST be specified
    address?: string;
    getAddress(): Promise<string>

    sendTransaction(transaction: UnsignedTransaction): Promise<TransactionResponse>;

    // If sendTransaction is not implemented, the following MUST be
    provider: Provider;
    sign(transaction: UnsignedTransaction): string;

    // The following MAY be i,plemented
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getGasPrice(transaction?: TransactionRequest): Promise<BigNumber>
}

// @TODO: Move to HDNode
var defaultPath = "m/44'/60'/0'/0/0";


export class Wallet implements Signer {
    readonly address: string;
    readonly privateKey: string;

    private mnemonic: string;
    private path: string;

    private readonly signingKey: SigningKey;

    provider: Provider;

    //private _provider;

    public defaultGasLimit: number = 1500000;

    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider) {
        errors.checkNew(this, Wallet);

        // Make sure we have a valid signing key
        if (privateKey instanceof SigningKey) {
            this.signingKey = privateKey;
            if (this.signingKey.mnemonic) {
                defineReadOnly(this, 'mnemonic', privateKey.mnemonic);
                defineReadOnly(this, 'path', privateKey.path);
            }
        } else {
            this.signingKey = new SigningKey(privateKey);
        }

        defineReadOnly(this, 'privateKey', this.signingKey.privateKey);

        this.provider = provider;

        defineReadOnly(this, 'address', this.signingKey.address);
    }

    sign(transaction: UnsignedTransaction): string {
        return signTransaction(transaction, this.signingKey.signDigest.bind(this.signingKey));
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    getBalance(blockTag?: BlockTag): Promise<BigNumber> {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getBalance(this.address, blockTag);
    }

    getTransactionCount(blockTag?: BlockTag): Promise<number> {
        if (!this.provider) { throw new Error('missing provider'); }
        return this.provider.getTransactionCount(this.address, blockTag);
    }

    getGasPrice(): Promise<BigNumber> {
        if (!this.provider) { throw new Error('missing provider'); }

        return this.provider.getGasPrice();
    }

    estimateGas(transaction: TransactionRequest): Promise<BigNumber> {
        if (!this.provider) { throw new Error('missing provider'); }

        var calculate: TransactionRequest = {};
        ['from', 'to', 'data', 'value'].forEach(function(key) {
            if (transaction[key] == null) { return; }
            calculate[key] = transaction[key];
        });

        if (transaction.from == null) { calculate.from = this.address; }

        return this.provider.estimateGas(calculate);
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
            tx.gasLimit = this.estimateGas(tx);
        }

        if (tx.gasPrice == null) {
            tx.gasPrice = this.getGasPrice();
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


    static hashMessage(message: Arrayish | string): string {
        var payload = concat([
            toUtf8Bytes('\x19Ethereum Signed Message:\n'),
            toUtf8Bytes(String(message.length)),
            ((typeof(message) === 'string') ? toUtf8Bytes(message): message)
        ]);
        return keccak256(payload);
    }

    signMessage(message: Arrayish | string): string {
        var signingKey = new SigningKey(this.privateKey);
        var sig = signingKey.signDigest(Wallet.hashMessage(message));

        return (hexZeroPad(sig.r, 32) + hexZeroPad(sig.s, 32).substring(2) + (sig.recoveryParam ? '1c': '1b'));
    }

    static verifyMessage(message: Arrayish | string, signature: string): string {
        signature = hexlify(signature);
        if (signature.length != 132) { throw new Error('invalid signature'); }
        var digest = Wallet.hashMessage(message);

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
}
