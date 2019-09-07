"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elliptic_1 = require("elliptic");
var bytes_1 = require("@ethersproject/bytes");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var _curve = null;
function getCurve() {
    if (!_curve) {
        _curve = new elliptic_1.ec("secp256k1");
    }
    return _curve;
}
var SigningKey = /** @class */ (function () {
    function SigningKey(privateKey) {
        properties_1.defineReadOnly(this, "curve", "secp256k1");
        properties_1.defineReadOnly(this, "privateKey", bytes_1.hexlify(privateKey));
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        properties_1.defineReadOnly(this, "publicKey", "0x" + keyPair.getPublic(false, "hex"));
        properties_1.defineReadOnly(this, "compressedPublicKey", "0x" + keyPair.getPublic(true, "hex"));
        properties_1.defineReadOnly(this, "_isSigningKey", true);
    }
    SigningKey.prototype._addPoint = function (other) {
        var p0 = getCurve().keyFromPublic(bytes_1.arrayify(this.publicKey));
        var p1 = getCurve().keyFromPublic(bytes_1.arrayify(other));
        return "0x" + p0.pub.add(p1.pub).encodeCompressed("hex");
    };
    SigningKey.prototype.signDigest = function (digest) {
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        var signature = keyPair.sign(bytes_1.arrayify(digest), { canonical: true });
        return bytes_1.splitSignature({
            recoveryParam: signature.recoveryParam,
            r: bytes_1.hexZeroPad("0x" + signature.r.toString(16), 32),
            s: bytes_1.hexZeroPad("0x" + signature.s.toString(16), 32),
        });
    };
    SigningKey.prototype.computeSharedSecret = function (otherKey) {
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        var otherKeyPair = getCurve().keyFromPublic(bytes_1.arrayify(computePublicKey(otherKey)));
        return bytes_1.hexZeroPad("0x" + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    };
    SigningKey.isSigningKey = function (value) {
        return !!(value && value._isSigningKey);
    };
    return SigningKey;
}());
exports.SigningKey = SigningKey;
function recoverPublicKey(digest, signature) {
    var sig = bytes_1.splitSignature(signature);
    var rs = { r: bytes_1.arrayify(sig.r), s: bytes_1.arrayify(sig.s) };
    return "0x" + getCurve().recoverPubKey(bytes_1.arrayify(digest), rs, sig.recoveryParam).encode("hex", false);
}
exports.recoverPublicKey = recoverPublicKey;
function computePublicKey(key, compressed) {
    var bytes = bytes_1.arrayify(key);
    if (bytes.length === 32) {
        var signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + getCurve().keyFromPrivate(bytes).getPublic(true, "hex");
        }
        return signingKey.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return bytes_1.hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(false, "hex");
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return bytes_1.hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(true, "hex");
    }
    return logger.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}
exports.computePublicKey = computePublicKey;
