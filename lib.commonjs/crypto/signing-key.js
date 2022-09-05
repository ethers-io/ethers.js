"use strict";
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
    return index_js_1.logger.getBytes((0, hmac_js_1.computeHmac)("sha256", key, (0, index_js_1.concat)(messages)));
};
class SigningKey {
    #privateKey;
    constructor(privateKey) {
        /* @TODO
        logger.assertArgument(() => {
            if (dataLength(privateKey) !== 32) { throw new Error("bad length"); }
            return toBigInt(privateKey) < N;
        }, "invalid private key", "privateKey", "[REDACTED]");
        */
        this.#privateKey = (0, index_js_1.hexlify)(privateKey);
    }
    get privateKey() { return this.#privateKey; }
    get publicKey() { return SigningKey.computePublicKey(this.#privateKey); }
    get compressedPublicKey() { return SigningKey.computePublicKey(this.#privateKey, true); }
    sign(digest) {
        /* @TODO
        logger.assertArgument(() => (dataLength(digest) === 32), "invalid digest length", "digest", digest);
        */
        const [sigDer, recid] = secp256k1.signSync(index_js_1.logger.getBytesCopy(digest), index_js_1.logger.getBytesCopy(this.#privateKey), {
            recovered: true,
            canonical: true
        });
        const sig = secp256k1.Signature.fromHex(sigDer);
        return signature_js_1.Signature.from({
            r: (0, index_js_1.toHex)("0x" + sig.r.toString(16), 32),
            s: (0, index_js_1.toHex)("0x" + sig.s.toString(16), 32),
            v: (recid ? 0x1c : 0x1b)
        }).freeze();
    }
    computeShardSecret(other) {
        const pubKey = SigningKey.computePublicKey(other);
        return (0, index_js_1.hexlify)(secp256k1.getSharedSecret(index_js_1.logger.getBytesCopy(this.#privateKey), pubKey));
    }
    static computePublicKey(key, compressed) {
        let bytes = index_js_1.logger.getBytes(key, "key");
        if (bytes.length === 32) {
            const pubKey = secp256k1.getPublicKey(bytes, !!compressed);
            return (0, index_js_1.hexlify)(pubKey);
        }
        if (bytes.length === 64) {
            const pub = new Uint8Array(65);
            pub[0] = 0x04;
            pub.set(bytes, 1);
            bytes = pub;
        }
        const point = secp256k1.Point.fromHex(bytes);
        return (0, index_js_1.hexlify)(point.toRawBytes(compressed));
    }
    static recoverPublicKey(digest, signature) {
        const sig = signature_js_1.Signature.from(signature);
        const der = secp256k1.Signature.fromCompact(index_js_1.logger.getBytesCopy((0, index_js_1.concat)([sig.r, sig.s]))).toDERRawBytes();
        const pubKey = secp256k1.recoverPublicKey(index_js_1.logger.getBytesCopy(digest), der, sig.yParity);
        if (pubKey != null) {
            return (0, index_js_1.hexlify)(pubKey);
        }
        return index_js_1.logger.throwArgumentError("invalid signautre for digest", "signature", signature);
    }
    static _addPoints(p0, p1, compressed) {
        const pub0 = secp256k1.Point.fromHex(SigningKey.computePublicKey(p0).substring(2));
        const pub1 = secp256k1.Point.fromHex(SigningKey.computePublicKey(p1).substring(2));
        return "0x" + pub0.add(pub1).toHex(!!compressed);
    }
}
exports.SigningKey = SigningKey;
/*
const key = new SigningKey("0x1234567890123456789012345678901234567890123456789012345678901234");
console.log(key);
console.log(key.sign("0x1234567890123456789012345678901234567890123456789012345678901234"));
{
  const privKey = "0x1234567812345678123456781234567812345678123456781234567812345678";
  const signingKey = new SigningKey(privKey);
  console.log("0", signingKey, signingKey.publicKey, signingKey.publicKeyCompressed);

  let pubKey = SigningKey.computePublicKey(privKey);
  let pubKeyComp = SigningKey.computePublicKey(privKey, true);
  let pubKeyRaw = "0x" + SigningKey.computePublicKey(privKey).substring(4);
  console.log("A", pubKey, pubKeyComp);

  let a = SigningKey.computePublicKey(pubKey);
  let b = SigningKey.computePublicKey(pubKey, true);
  console.log("B", a, b);

  a = SigningKey.computePublicKey(pubKeyComp);
  b = SigningKey.computePublicKey(pubKeyComp, true);
  console.log("C", a, b);

  a = SigningKey.computePublicKey(pubKeyRaw);
  b = SigningKey.computePublicKey(pubKeyRaw, true);
  console.log("D", a, b);

  const digest = "0x1122334411223344112233441122334411223344112233441122334411223344";
  const sig = signingKey.sign(digest);
  console.log("SS", sig, sig.r, sig.s, sig.yParity);

  console.log("R", SigningKey.recoverPublicKey(digest, sig));
}
*/
//# sourceMappingURL=signing-key.js.map