"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePublicKey = exports.recoverPublicKey = exports.SigningKey = exports.SigningKeyED = void 0;
var elliptic_1 = require("./elliptic");
var bytes_1 = require("@ethersproject/bytes");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var _ecCurve = null;
var _edCurve = null;
function getECCurve() {
    if (!_ecCurve) {
        _ecCurve = new elliptic_1.EC("secp256k1");
    }
    return _ecCurve;
}
function getEDCurve() {
    if (!_edCurve) {
        _edCurve = new elliptic_1.ED("ed25519");
    }
    return _edCurve;
}
var SigningKeyED = /** @class */ (function () {
    function SigningKeyED(privateKey) {
        (0, properties_1.defineReadOnly)(this, "curve", "ed25519");
        (0, properties_1.defineReadOnly)(this, "privateKey", (0, bytes_1.hexlify)(privateKey));
        var privKey = this.privateKey.startsWith("0x") ? this.privateKey.slice(2) : this.privateKey;
        var keyPair = getEDCurve().keyFromSecret(privKey);
        (0, properties_1.defineReadOnly)(this, "publicKey", "0x" + keyPair.getPublic("hex"));
        (0, properties_1.defineReadOnly)(this, "compressedPublicKey", "0x" + keyPair.getPublic("hex"));
        (0, properties_1.defineReadOnly)(this, "_isSigningKey", true);
    }
    SigningKeyED.prototype._addPoint = function (other) {
        return logger.throwError("_addPoint not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: '_addPoint'
        });
    };
    SigningKeyED.prototype.signDigest = function (digest) {
        return logger.throwError("signDigest not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: 'signDigest'
        });
    };
    SigningKeyED.prototype.computeSharedSecret = function (otherKey) {
        return logger.throwError("computeSharedSecret not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: 'computeSharedSecret'
        });
    };
    SigningKeyED.isSigningKey = function (value) {
        return !!(value && value._isSigningKey);
    };
    return SigningKeyED;
}());
exports.SigningKeyED = SigningKeyED;
var SigningKey = /** @class */ (function () {
    function SigningKey(privateKey) {
        (0, properties_1.defineReadOnly)(this, "curve", "secp256k1");
        (0, properties_1.defineReadOnly)(this, "privateKey", (0, bytes_1.hexlify)(privateKey));
        var keyPair = getECCurve().keyFromPrivate((0, bytes_1.arrayify)(this.privateKey));
        (0, properties_1.defineReadOnly)(this, "publicKey", "0x" + keyPair.getPublic(false, "hex"));
        (0, properties_1.defineReadOnly)(this, "compressedPublicKey", "0x" + keyPair.getPublic(true, "hex"));
        (0, properties_1.defineReadOnly)(this, "_isSigningKey", true);
    }
    SigningKey.prototype._addPoint = function (other) {
        var p0 = getECCurve().keyFromPublic((0, bytes_1.arrayify)(this.publicKey));
        var p1 = getECCurve().keyFromPublic((0, bytes_1.arrayify)(other));
        return "0x" + p0.pub.add(p1.pub).encodeCompressed("hex");
    };
    SigningKey.prototype.signDigest = function (digest) {
        var keyPair = getECCurve().keyFromPrivate((0, bytes_1.arrayify)(this.privateKey));
        var digestBytes = (0, bytes_1.arrayify)(digest);
        if (digestBytes.length !== 32) {
            logger.throwArgumentError("bad digest length", "digest", digest);
        }
        var signature = keyPair.sign(digestBytes, { canonical: true });
        return (0, bytes_1.splitSignature)({
            recoveryParam: signature.recoveryParam,
            r: (0, bytes_1.hexZeroPad)("0x" + signature.r.toString(16), 32),
            s: (0, bytes_1.hexZeroPad)("0x" + signature.s.toString(16), 32),
        });
    };
    SigningKey.prototype.computeSharedSecret = function (otherKey) {
        var keyPair = getECCurve().keyFromPrivate((0, bytes_1.arrayify)(this.privateKey));
        var otherKeyPair = getECCurve().keyFromPublic((0, bytes_1.arrayify)(computePublicKey(otherKey)));
        return (0, bytes_1.hexZeroPad)("0x" + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    };
    SigningKey.isSigningKey = function (value) {
        return !!(value && value._isSigningKey);
    };
    return SigningKey;
}());
exports.SigningKey = SigningKey;
function recoverPublicKey(digest, signature, isED25519Type) {
    if (isED25519Type) {
        return logger.throwError("recoverPublicKey not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "recoverPublicKey" });
    }
    var sig = (0, bytes_1.splitSignature)(signature);
    var rs = { r: (0, bytes_1.arrayify)(sig.r), s: (0, bytes_1.arrayify)(sig.s) };
    return "0x" + getECCurve().recoverPubKey((0, bytes_1.arrayify)(digest), rs, sig.recoveryParam).encode("hex", false);
}
exports.recoverPublicKey = recoverPublicKey;
function computePublicKey(key, compressed, isED25519Type) {
    var bytes = (0, bytes_1.arrayify)(key);
    if (isED25519Type) {
        return (new SigningKeyED(bytes)).publicKey;
    }
    if (bytes.length === 32) {
        var signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + getECCurve().keyFromPrivate(bytes).getPublic(true, "hex");
        }
        return signingKey.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return (0, bytes_1.hexlify)(bytes);
        }
        return "0x" + getECCurve().keyFromPublic(bytes).getPublic(false, "hex");
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return (0, bytes_1.hexlify)(bytes);
        }
        return "0x" + getECCurve().keyFromPublic(bytes).getPublic(true, "hex");
    }
    return logger.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}
exports.computePublicKey = computePublicKey;
//# sourceMappingURL=index.js.map