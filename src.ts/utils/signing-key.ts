'use strict';

/**
 *  SigningKey
 *
 *
 */

import { HDNode } from './hdnode';

import { arrayify, hexlify } from './bytes';
import { defineReadOnly, isType, setType } from './properties';
import { computeAddress, KeyPair } from './secp256k1';

import * as errors from '../errors';

///////////////////////////////
// Imported Types

import { Arrayish, Signature } from './bytes';

///////////////////////////////

export class SigningKey {

    readonly privateKey: string;
    readonly publicKey: string;
    readonly address: string;

    readonly mnemonic: string;
    readonly path: string;

    private readonly keyPair: KeyPair;

    constructor(privateKey: Arrayish | HDNode) {
        errors.checkNew(this, SigningKey);

        let privateKeyBytes = null;

        if (HDNode.isHDNode(privateKey)) {
            defineReadOnly(this, 'mnemonic', privateKey.mnemonic);
            defineReadOnly(this, 'path', privateKey.path);
            privateKeyBytes = arrayify(privateKey.privateKey);
        } else {
            // A lot of common tools do not prefix private keys with a 0x
            if (typeof(privateKey) === 'string' && privateKey.match(/^[0-9a-f]*$/i) && privateKey.length === 64) {
                privateKey = '0x' + privateKey;
            }
            privateKeyBytes = arrayify(privateKey);
        }

        try {
            if (privateKeyBytes.length !== 32) {
                errors.throwError('exactly 32 bytes required', errors.INVALID_ARGUMENT, { arg: 'privateKey', value: '[REDACTED]' });
            }
        } catch(error) {
            var params: any = { arg: 'privateKey', reason: error.reason, value: '[REDACTED]' }
            if (error.value) {
                if(typeof(error.value.length) === 'number') {
                    params.length = error.value.length;
                }
                params.type = typeof(error.value);
            }
            errors.throwError('invalid private key', error.code, params);
        }

        defineReadOnly(this, 'privateKey', hexlify(privateKeyBytes));
        defineReadOnly(this, 'keyPair', new KeyPair(privateKeyBytes));
        defineReadOnly(this, 'publicKey', this.keyPair.publicKey);
        defineReadOnly(this, 'address', computeAddress(this.keyPair.publicKey));

        setType(this, 'SigningKey');
    }

    signDigest(digest: Arrayish): Signature {
        return this.keyPair.sign(digest);
    }

    computeSharedSecret(key: Arrayish | string): string {
        return this.keyPair.computeSharedSecret(arrayify(key));
    }

    static isSigningKey(value: any): value is SigningKey {
        return isType(value, 'SigningKey');
    }
}
