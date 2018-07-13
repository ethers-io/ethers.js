'use strict';

/**
 *  SigningKey
 *
 *
 */

import { arrayify, Arrayish, hexlify, Signature } from '../utils/bytes';
import { HDNode } from './hdnode';
import { defineReadOnly } from '../utils/properties';
import { computeAddress, KeyPair } from '../utils/secp256k1';

import errors = require('../utils/errors');

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

        if (privateKey instanceof HDNode) {
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
    }

    signDigest(digest: Arrayish): Signature {
        return this.keyPair.sign(digest);
    }
}
/*
export function recoverAddress(digest: Arrayish, signature: Signature): string {
    return computeAddress(recoverPublicKey(digest, signature));
}

export function computeAddress(key: string): string {
    // Strip off the leading "0x04"
    let publicKey = '0x' + computePublicKey(key).slice(4);
    return getAddress('0x' + keccak256(publicKey).substring(26));
}
*/
