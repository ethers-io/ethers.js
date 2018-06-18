'use strict';

import { getAddress } from './address';
import { arrayify, Arrayish, hexlify, hexZeroPad } from './bytes';
import { keccak256 } from './keccak256';
import { defineReadOnly } from './properties';

import * as errors from './errors';

interface _BN {
    toString(radix: number): string;
    encode(encoding: string, compact: boolean): Uint8Array;
    toArray(endian: string, width: number): Uint8Array;
}

interface _Signature {
    r: _BN,
    s: _BN,
    recoveryParam: number
}

interface _KeyPair {
    sign(message: Uint8Array, options: { canonical?: boolean }): _Signature;
    getPublic(compressed: boolean, encoding?: string): string;
    getPublic(): _BN;
    getPrivate(encoding?: string): string;
    encode(encoding: string, compressed: boolean): string;
    priv: _BN;
}

interface _EC {
    constructor(curve: string);

    n: _BN;

    keyFromPublic(publicKey: string | Uint8Array): _KeyPair;
    keyFromPrivate(privateKey: string | Uint8Array): _KeyPair;
    recoverPubKey(data: Uint8Array, signature: { r: Uint8Array, s: Uint8Array }, recoveryParam: number): _KeyPair;
}

import * as elliptic from 'elliptic';

const curve:_EC = new elliptic.ec('secp256k1');


export const N = '0x' + curve.n.toString(16);

export interface Signature {
    r: string;
    s: string;
    recoveryParam: number;
    v?: number;
}

export class KeyPair {

    readonly privateKey: string;

    readonly publicKey: string;
    readonly compressedPublicKey: string;

    readonly publicKeyBytes: Uint8Array;

    constructor(privateKey: Arrayish) {
        let keyPair: _KeyPair = curve.keyFromPrivate(arrayify(privateKey));

        defineReadOnly(this, 'privateKey', hexlify(keyPair.priv.toArray('be', 32)));
        defineReadOnly(this, 'publicKey', '0x' + keyPair.getPublic(false, 'hex'));
        defineReadOnly(this, 'compressedPublicKey', '0x' + keyPair.getPublic(true, 'hex'));
        defineReadOnly(this, 'publicKeyBytes', keyPair.getPublic().encode(null, true));
    }

    sign(digest: Arrayish): Signature {
        let keyPair: _KeyPair = curve.keyFromPrivate(arrayify(this.privateKey));
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

