'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  SigningKey
 *
 *
 */
var secp256k1 = __importStar(require("./secp256k1"));
var address_1 = require("../utils/address");
var convert_1 = require("../utils/convert");
var keccak256_1 = require("../utils/keccak256");
var errors = require("../utils/errors");
var SigningKey = /** @class */ (function () {
    function SigningKey(privateKey) {
        //errors.checkNew(this, SigningKey);
        if (privateKey.privateKey) {
            this.mnemonic = privateKey.mnemonic;
            this.path = privateKey.path;
            privateKey = privateKey.privateKey;
        }
        try {
            privateKey = convert_1.arrayify(privateKey);
            if (privateKey.length !== 32) {
                errors.throwError('exactly 32 bytes required', errors.INVALID_ARGUMENT, { value: privateKey });
            }
        }
        catch (error) {
            var params = { arg: 'privateKey', reason: error.reason, value: '[REDACTED]' };
            if (error.value) {
                if (typeof (error.value.length) === 'number') {
                    params.length = error.value.length;
                }
                params.type = typeof (error.value);
            }
            errors.throwError('invalid private key', error.code, params);
        }
        this.privateKey = convert_1.hexlify(privateKey);
        this.keyPair = secp256k1.curve.keyFromPrivate(privateKey);
        //utils.defineProperty(this, 'publicKey', '0x' + keyPair.getPublic(true, 'hex'))
        this.publicKey = '0x' + this.keyPair.getPublic(true, 'hex');
        this.address = SigningKey.publicKeyToAddress('0x' + this.keyPair.getPublic(false, 'hex'));
    }
    SigningKey.prototype.signDigest = function (digest) {
        var signature = this.keyPair.sign(convert_1.arrayify(digest), { canonical: true });
        return {
            recoveryParam: signature.recoveryParam,
            r: '0x' + signature.r.toString(16),
            s: '0x' + signature.s.toString(16)
        };
    };
    SigningKey.recover = function (digest, r, s, recoveryParam) {
        var signature = {
            r: convert_1.arrayify(r),
            s: convert_1.arrayify(s)
        };
        var publicKey = secp256k1.curve.recoverPubKey(convert_1.arrayify(digest), signature, recoveryParam);
        return SigningKey.publicKeyToAddress('0x' + publicKey.encode('hex', false));
    };
    SigningKey.getPublicKey = function (value, compressed) {
        value = convert_1.arrayify(value);
        compressed = !!compressed;
        if (value.length === 32) {
            var keyPair = secp256k1.curve.keyFromPrivate(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');
        }
        else if (value.length === 33) {
            var keyPair = secp256k1.curve.keyFromPublic(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');
        }
        else if (value.length === 65) {
            var keyPair = secp256k1.curve.keyFromPublic(value);
            return '0x' + keyPair.getPublic(compressed, 'hex');
        }
        throw new Error('invalid value');
    };
    SigningKey.publicKeyToAddress = function (publicKey) {
        publicKey = '0x' + SigningKey.getPublicKey(publicKey, false).slice(4);
        return address_1.getAddress('0x' + keccak256_1.keccak256(publicKey).substring(26));
    };
    return SigningKey;
}());
exports.SigningKey = SigningKey;
