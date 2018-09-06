'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var elliptic_1 = require("elliptic");
var address_1 = require("./address");
var bytes_1 = require("./bytes");
var hash_1 = require("./hash");
var keccak256_1 = require("./keccak256");
var properties_1 = require("./properties");
var errors = __importStar(require("./errors"));
///////////////////////////////
var _curve = null;
function getCurve() {
    if (!_curve) {
        _curve = new elliptic_1.ec('secp256k1');
    }
    return _curve;
}
var KeyPair = /** @class */ (function () {
    function KeyPair(privateKey) {
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(privateKey));
        properties_1.defineReadOnly(this, 'privateKey', bytes_1.hexlify(keyPair.priv.toArray('be', 32)));
        properties_1.defineReadOnly(this, 'publicKey', '0x' + keyPair.getPublic(false, 'hex'));
        properties_1.defineReadOnly(this, 'compressedPublicKey', '0x' + keyPair.getPublic(true, 'hex'));
        properties_1.defineReadOnly(this, 'publicKeyBytes', keyPair.getPublic().encode(null, true));
    }
    KeyPair.prototype.sign = function (digest) {
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        var signature = keyPair.sign(bytes_1.arrayify(digest), { canonical: true });
        return {
            recoveryParam: signature.recoveryParam,
            r: bytes_1.hexZeroPad('0x' + signature.r.toString(16), 32),
            s: bytes_1.hexZeroPad('0x' + signature.s.toString(16), 32),
            v: 27 + signature.recoveryParam
        };
    };
    KeyPair.prototype.computeSharedSecret = function (otherKey) {
        var keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        var otherKeyPair = getCurve().keyFromPublic(bytes_1.arrayify(computePublicKey(otherKey)));
        return bytes_1.hexZeroPad('0x' + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    };
    return KeyPair;
}());
exports.KeyPair = KeyPair;
function computePublicKey(key, compressed) {
    var bytes = bytes_1.arrayify(key);
    if (bytes.length === 32) {
        var keyPair = new KeyPair(bytes);
        if (compressed) {
            return keyPair.compressedPublicKey;
        }
        return keyPair.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return bytes_1.hexlify(bytes);
        }
        return '0x' + getCurve().keyFromPublic(bytes).getPublic(false, 'hex');
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return bytes_1.hexlify(bytes);
        }
        return '0x' + getCurve().keyFromPublic(bytes).getPublic(true, 'hex');
    }
    errors.throwError('invalid public or private key', errors.INVALID_ARGUMENT, { arg: 'key', value: '[REDACTED]' });
    return null;
}
exports.computePublicKey = computePublicKey;
function computeAddress(key) {
    // Strip off the leading "0x04"
    var publicKey = '0x' + computePublicKey(key).slice(4);
    return address_1.getAddress('0x' + keccak256_1.keccak256(publicKey).substring(26));
}
exports.computeAddress = computeAddress;
function recoverPublicKey(digest, signature) {
    var sig = bytes_1.splitSignature(signature);
    var rs = { r: bytes_1.arrayify(sig.r), s: bytes_1.arrayify(sig.s) };
    return '0x' + getCurve().recoverPubKey(bytes_1.arrayify(digest), rs, sig.recoveryParam).encode('hex', false);
}
exports.recoverPublicKey = recoverPublicKey;
function recoverAddress(digest, signature) {
    return computeAddress(recoverPublicKey(bytes_1.arrayify(digest), signature));
}
exports.recoverAddress = recoverAddress;
function verifyMessage(message, signature) {
    return recoverAddress(hash_1.hashMessage(message), signature);
}
exports.verifyMessage = verifyMessage;
