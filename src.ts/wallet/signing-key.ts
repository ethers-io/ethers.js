'use strict';

/**
 *  SigningKey
 *
 *
 */

import * as secp256k1 from './secp256k1';

import { getAddress } from '../utils/address';
import { arrayify, hexlify } from '../utils/convert';
import { keccak256 } from '../utils/keccak256';

import errors = require('../utils/errors');


export class SigningKey {

    readonly privateKey: string;
    readonly publicKey: string;
    readonly address: string;

    readonly mnemonic: string;
    readonly path: string;

    private readonly keyPair: secp256k1.KeyPair;

    constructor(privateKey: any) {
        //errors.checkNew(this, SigningKey);

        if (privateKey.privateKey) {
            this.mnemonic = privateKey.mnemonic;
            this.path = privateKey.path;
            privateKey = privateKey.privateKey;
        }

        try {
            privateKey = arrayify(privateKey);
            if (privateKey.length !== 32) {
                errors.throwError('exactly 32 bytes required', errors.INVALID_ARGUMENT, { value: privateKey });
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

        this.privateKey = hexlify(privateKey);

        this.keyPair = secp256k1.curve.keyFromPrivate(privateKey);

        //utils.defineProperty(this, 'publicKey', '0x' + keyPair.getPublic(true, 'hex'))
        this.publicKey = '0x' + this.keyPair.getPublic(true, 'hex');

        this.address = SigningKey.publicKeyToAddress('0x' + this.keyPair.getPublic(false, 'hex'));
    }

    signDigest(digest) {
        var signature = this.keyPair.sign(arrayify(digest), {canonical: true});
        return {
            recoveryParam: signature.recoveryParam,
            r: '0x' + signature.r.toString(16),
            s: '0x' + signature.s.toString(16)
        }
    }

    static recover(digest, r, s, recoveryParam) {
        var signature = {
            r: arrayify(r),
            s: arrayify(s)
        };
        var publicKey = secp256k1.curve.recoverPubKey(arrayify(digest), signature, recoveryParam);
        return SigningKey.publicKeyToAddress('0x' + publicKey.encode('hex', false));
    }


    static getPublicKey(value, compressed) {
        value = arrayify(value);
        compressed = !!compressed;

        if (value.length === 32) {
            var keyPair = secp256k1.curve.keyFromPrivate(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');

        } else if (value.length === 33) {
            var keyPair = secp256k1.curve.keyFromPublic(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');

        } else if (value.length === 65) {
            var keyPair = secp256k1.curve.keyFromPublic(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');
        }

        throw new Error('invalid value');
    }

    static publicKeyToAddress(publicKey) {
        publicKey = '0x' + SigningKey.getPublicKey(publicKey, false).slice(4);
        return getAddress('0x' + keccak256(publicKey).substring(26));
    }
}

//export default SigningKey;
