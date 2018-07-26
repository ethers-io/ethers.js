'use strict';

import { defaultPath, entropyToMnemonic, fromMnemonic } from './hdnode';
import * as secretStorage from './secret-storage';
import { SigningKey } from './signing-key';

import { arrayify, concat, joinSignature } from '../utils/bytes';
import { hashMessage } from '../utils/hash';
import { isCrowdsaleWallet, isSecretStorageWallet } from '../utils/json-wallet';
import { keccak256 } from '../utils/keccak256';
import { defineReadOnly, resolveProperties, shallowCopy } from '../utils/properties';
import { randomBytes } from '../utils/random-bytes';
import { serialize as serializeTransaction } from '../utils/transaction';

import { Arrayish, BigNumber, BlockTag, HDNode, MinimalProvider, ProgressCallback, Signer, TransactionRequest, TransactionResponse, Wordlist } from '../utils/types';

import * as errors from '../utils/errors';


export class Wallet extends Signer {

    readonly provider: MinimalProvider;

    private readonly signingKey: SigningKey;

    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: MinimalProvider) {
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
    get path(): string { return this.signingKey.mnemonic; }

    get privateKey(): string { return this.signingKey.privateKey; }


    /**
     *  Create a new instance of this Wallet connected to provider.
     */
    connect(provider: MinimalProvider): Wallet {
        if (!(MinimalProvider.isProvider(provider))) {
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
            return Promise.resolve(serializeTransaction(tx, signature));
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
            tx.chainId = this.provider.getNetwork().then((network) => network.chainId);
        }

        return this.provider.sendTransaction(this.sign(tx));
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
            var safeOptions: any = {};
            for (var key in options) { safeOptions[key] = options[key]; }
            options = safeOptions;

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

    static fromEncryptedJson(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet> {
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
