"use strict";
/**
 *  Add details about signing here.
 *
 *  @_subsection: api/crypto:Signing  [about-signing]
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigningKey = void 0;
const secp256k1 = __importStar(require("@noble/secp256k1"));
const index_js_1 = require("../utils/index.js");
const hmac_js_1 = require("./hmac.js");
const signature_js_1 = require("./signature.js");
//const N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
// Make noble-secp256k1 sync
secp256k1.utils.hmacSha256Sync = function (key, ...messages) {
    return (0, index_js_1.getBytes)((0, hmac_js_1.computeHmac)("sha256", key, (0, index_js_1.concat)(messages)));
};
/**
 *  A **SigningKey** provides high-level access to the elliptic curve
 *  cryptography (ECC) operations and key management.
 */
class SigningKey {
    #privateKey;
    /**
     *  Creates a new **SigningKey** for %%privateKey%%.
     */
    constructor(privateKey) {
        (0, index_js_1.assertArgument)((0, index_js_1.dataLength)(privateKey) === 32, "invalid private key", "privateKey", "[REDACTED]");
        this.#privateKey = (0, index_js_1.hexlify)(privateKey);
    }
    /**
     *  The private key.
     */
    get privateKey() { return this.#privateKey; }
    /**
     *  The uncompressed public key.
     *
     * This will always begin with the prefix ``0x04`` and be 132
     * characters long (the ``0x`` prefix and 130 hexadecimal nibbles).
     */
    get publicKey() { return SigningKey.computePublicKey(this.#privateKey); }
    /**
     *  The compressed public key.
     *
     *  This will always begin with either the prefix ``0x02`` or ``0x03``
     *  and be 68 characters long (the ``0x`` prefix and 33 hexadecimal
     *  nibbles)
     */
    get compressedPublicKey() { return SigningKey.computePublicKey(this.#privateKey, true); }
    /**
     *  Return the signature of the signed %%digest%%.
     */
    sign(digest) {
        (0, index_js_1.assertArgument)((0, index_js_1.dataLength)(digest) === 32, "invalid digest length", "digest", digest);
        const [sigDer, recid] = secp256k1.signSync((0, index_js_1.getBytesCopy)(digest), (0, index_js_1.getBytesCopy)(this.#privateKey), {
            recovered: true,
            canonical: true
        });
        const sig = secp256k1.Signature.fromHex(sigDer);
        return signature_js_1.Signature.from({
            r: (0, index_js_1.toBeHex)("0x" + sig.r.toString(16), 32),
            s: (0, index_js_1.toBeHex)("0x" + sig.s.toString(16), 32),
            v: (recid ? 0x1c : 0x1b)
        });
    }
    /**
     *  Returns the [[link-wiki-ecdh]] shared secret between this
     *  private key and the %%other%% key.
     *
     *  The %%other%% key may be any type of key, a raw public key,
     *  a compressed/uncompressed pubic key or aprivate key.
     *
     *  Best practice is usually to use a cryptographic hash on the
     *  returned value before using it as a symetric secret.
     *
     *  @example:
     *    sign1 = new SigningKey(id("some-secret-1"))
     *    sign2 = new SigningKey(id("some-secret-2"))
     *
     *    // Notice that privA.computeSharedSecret(pubB)...
     *    sign1.computeSharedSecret(sign2.publicKey)
     *    //_result:
     *
     *    // ...is equal to privB.computeSharedSecret(pubA).
     *    sign2.computeSharedSecret(sign1.publicKey)
     *    //_result:
     */
    computeSharedSecret(other) {
        const pubKey = SigningKey.computePublicKey(other);
        console.log(pubKey);
        return (0, index_js_1.hexlify)(secp256k1.getSharedSecret((0, index_js_1.getBytesCopy)(this.#privateKey), (0, index_js_1.getBytes)(pubKey)));
    }
    /**
     *  Compute the public key for %%key%%, optionally %%compressed%%.
     *
     *  The %%key%% may be any type of key, a raw public key, a
     *  compressed/uncompressed public key or private key.
     *
     *  @example:
     *    sign = new SigningKey(id("some-secret"));
     *
     *    // Compute the uncompressed public key for a private key
     *    SigningKey.computePublicKey(sign.privateKey)
     *    //_result:
     *
     *    // Compute the compressed public key for a private key
     *    SigningKey.computePublicKey(sign.privateKey, true)
     *    //_result:
     *
     *    // Compute the uncompressed public key
     *    SigningKey.computePublicKey(sign.publicKey, false);
     *    //_result:
     *
     *    // Compute the Compressed a public key
     *    SigningKey.computePublicKey(sign.publicKey, true);
     *    //_result:
     */
    static computePublicKey(key, compressed) {
        let bytes = (0, index_js_1.getBytes)(key, "key");
        // private key
        if (bytes.length === 32) {
            const pubKey = secp256k1.getPublicKey(bytes, !!compressed);
            return (0, index_js_1.hexlify)(pubKey);
        }
        // raw public key; use uncompressed key with 0x04 prefix
        if (bytes.length === 64) {
            const pub = new Uint8Array(65);
            pub[0] = 0x04;
            pub.set(bytes, 1);
            bytes = pub;
        }
        const point = secp256k1.Point.fromHex(bytes);
        return (0, index_js_1.hexlify)(point.toRawBytes(compressed));
    }
    /**
     *  Returns the public key for the private key which produced the
     *  %%signature%% for the given %%digest%%.
     *
     *  @example:
     *    key = new SigningKey(id("some-secret"))
     *    digest = id("hello world")
     *    sig = key.sign(digest)
     *
     *    // Notice the signer public key...
     *    key.publicKey
     *    //_result:
     *
     *    // ...is equal to the recovered public key
     *    SigningKey.recoverPublicKey(digest, sig)
     *    //_result:
     *
     */
    static recoverPublicKey(digest, signature) {
        (0, index_js_1.assertArgument)((0, index_js_1.dataLength)(digest) === 32, "invalid digest length", "digest", digest);
        const sig = signature_js_1.Signature.from(signature);
        const der = secp256k1.Signature.fromCompact((0, index_js_1.getBytesCopy)((0, index_js_1.concat)([sig.r, sig.s]))).toDERRawBytes();
        const pubKey = secp256k1.recoverPublicKey((0, index_js_1.getBytesCopy)(digest), der, sig.yParity);
        if (pubKey != null) {
            return (0, index_js_1.hexlify)(pubKey);
        }
        (0, index_js_1.assertArgument)(false, "invalid signautre for digest", "signature", signature);
    }
    /**
     *  Returns the point resulting from adding the ellipic curve points
     *  %%p0%% and %%p1%%.
     *
     *  This is not a common function most developers should require, but
     *  can be useful for certain privacy-specific techniques.
     *
     *  For example, it is used by [[HDNodeWallet]] to compute child
     *  addresses from parent public keys and chain codes.
     */
    static addPoints(p0, p1, compressed) {
        const pub0 = secp256k1.Point.fromHex(SigningKey.computePublicKey(p0).substring(2));
        const pub1 = secp256k1.Point.fromHex(SigningKey.computePublicKey(p1).substring(2));
        return "0x" + pub0.add(pub1).toHex(!!compressed);
    }
}
exports.SigningKey = SigningKey;
//# sourceMappingURL=signing-key.js.map