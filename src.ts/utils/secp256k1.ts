'use strict';



import { getAddress } from './address';

import { arrayify, hexlify, hexZeroPad, splitSignature } from './bytes';
import { hashMessage } from './hash';
import { keccak256 } from './keccak256';
import { defineReadOnly } from './properties';

import { Arrayish, Signature } from './types';

import * as errors from './errors';


export class KeyPair {

    readonly privateKey: string;

    readonly publicKey: string;
    readonly compressedPublicKey: string;

    readonly publicKeyBytes: Uint8Array;

    constructor(privateKey: Arrayish) {
        let keyPair = curve.keyFromPrivate(arrayify(privateKey));

        defineReadOnly(this, 'privateKey', hexlify(keyPair.priv.toArray('be', 32)));
        defineReadOnly(this, 'publicKey', '0x' + keyPair.getPublic(false, 'hex'));
        defineReadOnly(this, 'compressedPublicKey', '0x' + keyPair.getPublic(true, 'hex'));
        defineReadOnly(this, 'publicKeyBytes', keyPair.getPublic().encode(null, true));
    }

    sign(digest: Arrayish): Signature {
        let keyPair = curve.keyFromPrivate(arrayify(this.privateKey));
        let signature = keyPair.sign(arrayify(digest), {canonical: true});
        return {
            recoveryParam: signature.recoveryParam,
            r: hexZeroPad('0x' + signature.r.toString(16), 32),
            s: hexZeroPad('0x' + signature.s.toString(16), 32),
            v: 27 + signature.recoveryParam
        }

    }
}

export function recoverPublicKey(digest: Arrayish, signature: Signature): string {
    let sig = {
        r: arrayify(signature.r),
        s: arrayify(signature.s)
    };
    return '0x' + curve.recoverPubKey(arrayify(digest), sig, signature.recoveryParam).encode('hex', false);
}

export function computePublicKey(key: Arrayish, compressed?: boolean): string {

    let bytes = arrayify(key);

    if (bytes.length === 32) {
        let keyPair: KeyPair = new KeyPair(bytes);
        if (compressed) {
            return keyPair.compressedPublicKey;
        }
        return keyPair.publicKey;

    } else if (bytes.length === 33) {
        if (compressed) { return hexlify(bytes); }
        return '0x' + curve.keyFromPublic(bytes).getPublic(false, 'hex');

    } else if (bytes.length === 65) {
        if (!compressed) { return hexlify(bytes); }
        return '0x' + curve.keyFromPublic(bytes).getPublic(true, 'hex');
    }

    errors.throwError('invalid public or private key', errors.INVALID_ARGUMENT, { arg: 'key', value: '[REDACTED]' });
    return null;
}

export function recoverAddress(digest: Arrayish, signature: Signature): string {
    return computeAddress(recoverPublicKey(digest, signature));
}

export function computeAddress(key: string): string {
    // Strip off the leading "0x04"
    let publicKey = '0x' + computePublicKey(key).slice(4);
    return getAddress('0x' + keccak256(publicKey).substring(26));
}


export function verifyMessage(message: Arrayish | string, signature: Signature | string): string {
    let sig = splitSignature(signature);
    let digest = hashMessage(message);

    return recoverAddress(
        digest,
        {
            r: sig.r,
            s: sig.s,
            recoveryParam: sig.recoveryParam
        }
    );
}

// !!!!!! IMPORTANT !!!!!!!!
//
// This import MUST be at the bottom, otehrwise browserify executes several imports
// BEFORE they are exported, resulting in undefined

import { ec as EC } from 'elliptic';
const curve = new EC('secp256k1');

export const N = '0x' + curve.n.toString(16);
