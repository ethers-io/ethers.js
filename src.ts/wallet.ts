'use strict';

import { arrayify, concat, joinSignature } from './utils/bytes';
import { BigNumber } from './utils/bignumber';
import { hashMessage } from './utils/hash';
import { defaultPath, HDNode, entropyToMnemonic, fromMnemonic } from './utils/hdnode';
import { isCrowdsaleWallet, isSecretStorageWallet } from './utils/json-wallet';
import { keccak256 } from './utils/keccak256';
import { defineReadOnly, resolveProperties, shallowCopy } from './utils/properties';
import { randomBytes } from './utils/random-bytes';
import * as secretStorage from './utils/secret-storage';
import { SigningKey } from './utils/signing-key';
import { populateTransaction, serialize as serializeTransaction } from './utils/transaction';
import { Wordlist } from './utils/wordlist';

// Imported Abstracts
import { Signer as AbstractSigner } from './abstract-signer';
import { Provider } from './providers/abstract-provider';

// Imported Types
import { ProgressCallback } from './utils/secret-storage';
import { Arrayish } from './utils/bytes';
import { BlockTag, TransactionRequest, TransactionResponse } from './providers/abstract-provider';

import * as errors from './errors';

export class Wallet extends AbstractSigner {

    readonly provider: Provider;

    private readonly signingKey: SigningKey;

    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider) {
        super();
        errors.checkNew(this, Wallet);

        // Make sure we have a valid signing key
        if (SigningKey.isSigningKey(privateKey)) {
            defineReadOnly(this, 'signingKey', privateKey);
        } else {
            defineReadOnly(this, 'signingKey', new SigningKey(privateKey));
        }

        defineReadOnly(this, 'provider', provider);
    }

    get address(): string { return this.signingKey.address; }

    get mnemonic(): string { return this.signingKey.mnemonic; }
    get path(): string { return this.signingKey.path; }

    get privateKey(): string { return this.signingKey.privateKey; }


    /**
     *  Create a new instance of this Wallet connected to provider.
     */
    connect(provider: Provider): Wallet {
        if (!(Provider.isProvider(provider))) {
            errors.throwError('invalid provider', errors.INVALID_ARGUMENT, { argument: 'provider', value: provider });
        }
        return new Wallet(this.signingKey, provider);
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    sign(transaction: TransactionRequest): Promise<string> {
        return resolveProperties(transaction).then((tx) => {
            let rawTx = serializeTransaction(tx);
            let signature = this.signingKey.signDigest(keccak256(rawTx));
            return serializeTransaction(tx, signature);
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

        if (transaction.nonce == null) {
            transaction = shallowCopy(transaction);
            transaction.nonce = this.getTransactionCount("pending");
        }

        return populateTransaction(transaction, this.provider, this.address).then((tx) => {
             return this.sign(tx).then((signedTransaction) => {
                 return this.provider.sendTransaction(signedTransaction);
             });
        });
    }

    encrypt(password: Arrayish | string, options?: any, progressCallback?: ProgressCallback): Promise<string> {
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
            options = shallowCopy(options);

            // Set the mnemonic and path
            options.mnemonic = this.mnemonic;
            options.path = this.path
        }

        return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
    }


    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): Wallet {
        var entropy: Uint8Array = randomBytes(16);

        if (!options) { options = { }; }

        if (options.extraEntropy) {
            entropy = arrayify(keccak256(concat([entropy, options.extraEntropy])).substring(0, 34));
        }

        var mnemonic = entropyToMnemonic(entropy, options.locale);
        return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
    }

    static fromEncryptedJson(json: string, password: Arrayish, progressCallback?: ProgressCallback): Promise<Wallet> {
        if (isCrowdsaleWallet(json)) {
            try {
                if (progressCallback) { progressCallback(0); }
                let privateKey = secretStorage.decryptCrowdsale(json, password);
                if (progressCallback) { progressCallback(1); }
                return Promise.resolve(new Wallet(privateKey));
            } catch (error) {
                return Promise.reject(error);
            }

        } else if (isSecretStorageWallet(json)) {

            return secretStorage.decrypt(json, password, progressCallback).then(function(signingKey) {
                return new Wallet(signingKey);
            });
        }

        return Promise.reject('invalid wallet JSON');
    }

    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet {
        if (!path) { path = defaultPath; }
        return new Wallet(fromMnemonic(mnemonic, wordlist).derivePath(path));
    }
}
