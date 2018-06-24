'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  SigningKey
 *
 *
 */
var address_1 = require("../utils/address");
var bytes_1 = require("../utils/bytes");
var hdnode_1 = require("./hdnode");
var keccak256_1 = require("../utils/keccak256");
var properties_1 = require("../utils/properties");
var secp256k1_1 = require("../utils/secp256k1");
var errors = require("../utils/errors");
var SigningKey = /** @class */ (function () {
    function SigningKey(privateKey) {
        errors.checkNew(this, SigningKey);
        var privateKeyBytes = null;
        if (privateKey instanceof hdnode_1.HDNode) {
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
        properties_1.defineReadOnly(this, 'address', computeAddress(this.keyPair.publicKey));
    }
    SigningKey.prototype.signDigest = function (digest) {
        return this.keyPair.sign(digest);
    };
    return SigningKey;
}());
exports.SigningKey = SigningKey;
function recoverAddress(digest, signature) {
    return computeAddress(secp256k1_1.recoverPublicKey(digest, signature));
}
exports.recoverAddress = recoverAddress;
function computeAddress(key) {
    // Strip off the leading "0x04"
    var publicKey = '0x' + secp256k1_1.computePublicKey(key).slice(4);
    return address_1.getAddress('0x' + keccak256_1.keccak256(publicKey).substring(26));
}
exports.computeAddress = computeAddress;
