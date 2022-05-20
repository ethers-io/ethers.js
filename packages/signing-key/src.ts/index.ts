"use strict";

import { EC, ED } from "./elliptic";

import { arrayify, BytesLike, hexlify, hexZeroPad, Signature, SignatureLike, splitSignature } from "@ethersproject/bytes";
import { defineReadOnly } from "@ethersproject/properties";

import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);

let _ecCurve: EC = null
let _edCurve: ED = null
function getECCurve() {
    if (!_ecCurve) {
        _ecCurve = new EC("secp256k1");
    }
    return _ecCurve;
}
function getEDCurve() {
    if (!_edCurve) {
        _edCurve = new ED("ed25519");
    }
    return _edCurve;
}



export class SigningKeyED {

    readonly curve: string;

    readonly privateKey: string;
    readonly publicKey: string;
    readonly compressedPublicKey: string;

    //readonly address: string;

    readonly _isSigningKey: boolean;

    constructor(privateKey: BytesLike) {
        defineReadOnly(this, "curve", "ed25519");

        defineReadOnly(this, "privateKey", hexlify(privateKey));

        const privKey = this.privateKey.startsWith("0x") ? this.privateKey.slice(2) : this.privateKey;
        const keyPair = getEDCurve().keyFromSecret(privKey);

        defineReadOnly(this, "publicKey", "0x" + keyPair.getPublic("hex"));
        defineReadOnly(this, "compressedPublicKey", "0x" + keyPair.getPublic("hex"));

        defineReadOnly(this, "_isSigningKey", true);
    }

    _addPoint(other: BytesLike): string {
        return logger.throwError("_addPoint not supported", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: '_addPoint'
        });
    }

    signDigest(digest: BytesLike): Signature {
        return logger.throwError("signDigest not supported", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: 'signDigest'
        });
    }

    computeSharedSecret(otherKey: BytesLike): string {
        return logger.throwError("computeSharedSecret not supported", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: 'computeSharedSecret'
        });
    }

    static isSigningKey(value: any): value is SigningKeyED {
        return !!(value && value._isSigningKey);
    }
}

export class SigningKey {

    readonly curve: string;

    readonly privateKey: string;
    readonly publicKey: string;
    readonly compressedPublicKey: string;

    //readonly address: string;

    readonly _isSigningKey: boolean;

    constructor(privateKey: BytesLike) {
        defineReadOnly(this, "curve", "secp256k1");

        defineReadOnly(this, "privateKey", hexlify(privateKey));

        const keyPair = getECCurve().keyFromPrivate(arrayify(this.privateKey));

        defineReadOnly(this, "publicKey", "0x" + keyPair.getPublic(false, "hex"));
        defineReadOnly(this, "compressedPublicKey", "0x" + keyPair.getPublic(true, "hex"));

        defineReadOnly(this, "_isSigningKey", true);
    }

    _addPoint(other: BytesLike): string {
        const p0 = getECCurve().keyFromPublic(arrayify(this.publicKey));
        const p1 = getECCurve().keyFromPublic(arrayify(other));
        return "0x" + p0.pub.add(p1.pub).encodeCompressed("hex");
    }

    signDigest(digest: BytesLike): Signature {
        const keyPair = getECCurve().keyFromPrivate(arrayify(this.privateKey));
        const digestBytes = arrayify(digest);
        if (digestBytes.length !== 32) {
            logger.throwArgumentError("bad digest length", "digest", digest);
        }
        const signature = keyPair.sign(digestBytes, { canonical: true });
        return splitSignature({
            recoveryParam: signature.recoveryParam,
            r: hexZeroPad("0x" + signature.r.toString(16), 32),
            s: hexZeroPad("0x" + signature.s.toString(16), 32),
        })
    }

    computeSharedSecret(otherKey: BytesLike): string {
        const keyPair = getECCurve().keyFromPrivate(arrayify(this.privateKey));
        const otherKeyPair = getECCurve().keyFromPublic(arrayify(computePublicKey(otherKey)));
        return hexZeroPad("0x" + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    }

    static isSigningKey(value: any): value is SigningKey {
        return !!(value && value._isSigningKey);
    }
}

export function recoverPublicKey(digest: BytesLike, signature: SignatureLike, isED25519Type?: boolean): string {
    if (isED25519Type) {
        return logger.throwError("recoverPublicKey not supported", Logger.errors.UNSUPPORTED_OPERATION, { operation: "recoverPublicKey" });
    }

    const sig = splitSignature(signature);
    const rs = { r: arrayify(sig.r), s: arrayify(sig.s) };
    return "0x" + getECCurve().recoverPubKey(arrayify(digest), rs, sig.recoveryParam).encode("hex", false);
}

export function computePublicKey(key: BytesLike, compressed?: boolean, isED25519Type?: boolean): string {
    const bytes = arrayify(key);

    if (isED25519Type) {
        return (new SigningKeyED(bytes)).publicKey;
    }

    if (bytes.length === 32) {
        const signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + getECCurve().keyFromPrivate(bytes).getPublic(true, "hex");
        }
        return signingKey.publicKey;

    } else if (bytes.length === 33) {
        if (compressed) { return hexlify(bytes); }
        return "0x" + getECCurve().keyFromPublic(bytes).getPublic(false, "hex");

    } else if (bytes.length === 65) {
        if (!compressed) { return hexlify(bytes); }
        return "0x" + getECCurve().keyFromPublic(bytes).getPublic(true, "hex");
    }

    return logger.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}

