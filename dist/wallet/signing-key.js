'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  SigningKey
 *
 *
 */
var bytes_1 = require("../utils/bytes");
var properties_1 = require("../utils/properties");
var secp256k1_1 = require("../utils/secp256k1");
var types_1 = require("../utils/types");
var errors = require("../utils/errors");
var SigningKey = /** @class */ (function () {
    function SigningKey(privateKey) {
        errors.checkNew(this, SigningKey);
        var privateKeyBytes = null;
        if (privateKey instanceof types_1.HDNode) {
            properties_1.defineReadOnly(this, 'mnemonic', privateKey.mnemonic);
            properties_1.defineReadOnly(this, 'path', privateKey.path);
            privateKeyBytes = bytes_1.arrayify(privateKey.privateKey);
        }
        else {
            // A lot of common tools do not prefix private keys with a 0x
            if (typeof (privateKey) === 'string' && privateKey.match(/^[0-9a-f]*$/i) && privateKey.length === 64) {
                privateKey = '0x' + privateKey;
            }
            privateKeyBytes = bytes_1.arrayify(privateKey);
        }
        try {
            if (privateKeyBytes.length !== 32) {
                errors.throwError('exactly 32 bytes required', errors.INVALID_ARGUMENT, { arg: 'privateKey', value: '[REDACTED]' });
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
        properties_1.defineReadOnly(this, 'privateKey', bytes_1.hexlify(privateKeyBytes));
        properties_1.defineReadOnly(this, 'keyPair', new secp256k1_1.KeyPair(privateKeyBytes));
        properties_1.defineReadOnly(this, 'publicKey', this.keyPair.publicKey);
        properties_1.defineReadOnly(this, 'address', secp256k1_1.computeAddress(this.keyPair.publicKey));
    }
    SigningKey.prototype.signDigest = function (digest) {
        return this.keyPair.sign(digest);
    };
    return SigningKey;
}());
exports.SigningKey = SigningKey;
