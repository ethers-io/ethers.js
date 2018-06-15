'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var convert_1 = require("../utils/convert");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
var elliptic = __importStar(require("elliptic"));
var curve = new elliptic.ec('secp256k1');
var KeyPair = /** @class */ (function () {
    function KeyPair(privateKey) {
        var keyPair = curve.keyFromPrivate(convert_1.arrayify(privateKey));
        properties_1.defineReadOnly(this, 'privateKey', convert_1.hexlify(keyPair.priv.toArray('be', 32)));
        properties_1.defineReadOnly(this, 'publicKey', '0x' + keyPair.getPublic(false, 'hex'));
        properties_1.defineReadOnly(this, 'compressedPublicKey', '0x' + keyPair.getPublic(true, 'hex'));
        properties_1.defineReadOnly(this, 'publicKeyBytes', keyPair.getPublic().encode(null, true));
    }
    KeyPair.prototype.sign = function (digest) {
        var keyPair = curve.keyFromPrivate(convert_1.arrayify(this.privateKey));
        var signature = keyPair.sign(convert_1.arrayify(digest), { canonical: true });
        return {
            recoveryParam: signature.recoveryParam,
            r: '0x' + signature.r.toString(16),
            s: '0x' + signature.s.toString(16)
        };
    };
    return KeyPair;
}());
exports.KeyPair = KeyPair;
function recoverPublicKey(digest, signature) {
    var sig = {
        r: convert_1.arrayify(signature.r),
        s: convert_1.arrayify(signature.s)
    };
    return '0x' + curve.recoverPubKey(convert_1.arrayify(digest), sig, signature.recoveryParam).getPublic(false, 'hex');
}
exports.recoverPublicKey = recoverPublicKey;
function computePublicKey(key, compressed) {
    var bytes = convert_1.arrayify(key);
    if (bytes.length === 32) {
        var keyPair = new KeyPair(bytes);
        if (compressed) {
            return keyPair.compressedPublicKey;
        }
        return keyPair.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return convert_1.hexlify(bytes);
        }
        return '0x' + curve.keyFromPublic(bytes).getPublic(false, 'hex');
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return convert_1.hexlify(bytes);
        }
        return '0x' + curve.keyFromPublic(bytes).getPublic(true, 'hex');
    }
    errors.throwError('invalid public or private key', errors.INVALID_ARGUMENT, { arg: 'key', value: '[REDACTED]' });
    return null;
}
exports.computePublicKey = computePublicKey;
exports.N = '0x' + curve.n.toString(16);
