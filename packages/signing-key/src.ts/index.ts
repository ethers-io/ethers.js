"use strict";
import * as secp256k1 from "noble-secp256k1";
import { computeHmac, SupportedAlgorithm } from "@ethersproject/sha2";
import { arrayify, BytesLike, hexlify, hexZeroPad, Signature, SignatureLike, splitSignature } from "@ethersproject/bytes";
import { defineReadOnly } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

// @ts-ignore
secp256k1.utils.hmacSha256 = function(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
    return arrayify(computeHmac(SupportedAlgorithm.sha256, key, Buffer.concat(messages)));
}

export class SigningKey {
    readonly curve: string;
    readonly privateKey: string;
    readonly publicKey: string;
    readonly compressedPublicKey: string;
    readonly _isSigningKey: boolean;

    constructor(privateKey: BytesLike) {
        defineReadOnly(this, "curve", "secp256k1");
        defineReadOnly(this, "privateKey", hexlify(privateKey));
        const bytes = arrayify(this.privateKey);
        defineReadOnly(this, "publicKey", "0x" + secp256k1.getPublicKey(bytes, false));
        defineReadOnly(this, "compressedPublicKey", "0x" + secp256k1.getPublicKey(bytes, true));
        defineReadOnly(this, "_isSigningKey", true);
    }

    _addPoint(other: BytesLike): string {
        const p0 =  secp256k1.Point.fromHex(arrayify(this.publicKey));
        const p1 =  secp256k1.Point.fromHex(arrayify(other));
        return "0x" + p0.add(p1).toHex(true);
    }

    signDigest(digest: BytesLike): Signature {
        const digestBytes = arrayify(digest);
        if (digestBytes.length !== 32) {
            logger.throwArgumentError("bad digest length", "digest", digest);
        }
        const [sigBytes, recoveryParam] = secp256k1._syncSign(
            digestBytes, arrayify(this.privateKey), {canonical: true, recovered: true}
        );
        const {r, s} = secp256k1.Signature.fromHex(sigBytes);
        return splitSignature({
            recoveryParam: recoveryParam,
            r: hexZeroPad("0x" + r.toString(16), 32),
            s: hexZeroPad("0x" + s.toString(16), 32),
        })
    }

    computeSharedSecret(otherKey: BytesLike): string {
        return "0x" + secp256k1.getSharedSecret(arrayify(this.privateKey), arrayify(computePublicKey(otherKey)));
    }

    static isSigningKey(value: any): value is SigningKey {
        return !!(value && value._isSigningKey);
    }
}

export function recoverPublicKey(digest: BytesLike, signature: SignatureLike): string {
    const sig = splitSignature(signature);
    const rs = new secp256k1.Signature(BigInt(sig.r), BigInt(sig.s));
    return "0x" + secp256k1.recoverPublicKey(hexlify(digest), rs.toHex(), sig.recoveryParam);
}

export function computePublicKey(key: BytesLike, compressed?: boolean): string {
    const bytes = arrayify(key);

    if (bytes.length === 32) {
        const signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + secp256k1.getPublicKey(bytes, true);
        }
        return signingKey.publicKey;
    } else if (bytes.length === 33) {
        if (compressed) { return hexlify(bytes); }
        return "0x" + secp256k1.getPublicKey(bytes, false);
    } else if (bytes.length === 65) {
        if (!compressed) { return hexlify(bytes); }
        return "0x" + secp256k1.getPublicKey(bytes, true);
    }

    return logger.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}

