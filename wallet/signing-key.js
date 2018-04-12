'use strict';

/**
 *  SigningKey
 *
 *
 */

var secp256k1 = new (require('elliptic')).ec('secp256k1');
var utils = (function() {
    var convert = require('../utils/convert');
    return {
        defineProperty: require('../utils/properties').defineProperty,

        arrayify: convert.arrayify,
        hexlify: convert.hexlify,

        getAddress: require('../utils/address').getAddress,

        keccak256: require('../utils/keccak256')
    };
})();

var errors = require('../utils/errors');


function SigningKey(privateKey) {
    errors.checkNew(this, SigningKey);

    try {
        privateKey = utils.arrayify(privateKey);
        if (privateKey.length !== 32) {
            errors.throwError('exactly 32 bytes required', errors.INVALID_ARGUMENT, { value: privateKey });
        }
    } catch(error) {
        var params = { arg: 'privateKey', reason: error.reason, value: '[REDACTED]' }
        if (error.value) {
            if(typeof(error.value.length) === 'number') {
                params.length = error.value.length;
            }
            params.type = typeof(error.value);
        }
        errors.throwError('invalid private key', error.code, params);
    }

    utils.defineProperty(this, 'privateKey', utils.hexlify(privateKey))

    var keyPair = secp256k1.keyFromPrivate(privateKey);

    utils.defineProperty(this, 'publicKey', '0x' + keyPair.getPublic(true, 'hex'))

    var address = SigningKey.publicKeyToAddress('0x' + keyPair.getPublic(false, 'hex'));
    utils.defineProperty(this, 'address', address)

    utils.defineProperty(this, 'signDigest', function(digest) {
        var signature = keyPair.sign(utils.arrayify(digest), {canonical: true});
        return {
            recoveryParam: signature.recoveryParam,
            r: '0x' + signature.r.toString(16),
            s: '0x' + signature.s.toString(16)
        }
    });
}

utils.defineProperty(SigningKey, 'recover', function(digest, r, s, recoveryParam) {
    var signature = {
        r: utils.arrayify(r),
        s: utils.arrayify(s)
    };
    var publicKey = secp256k1.recoverPubKey(utils.arrayify(digest), signature, recoveryParam);
    return SigningKey.publicKeyToAddress('0x' + publicKey.encode('hex', false));
});


utils.defineProperty(SigningKey, 'getPublicKey', function(value, compressed) {
    value = utils.arrayify(value);
    compressed = !!compressed;

    if (value.length === 32) {
        var keyPair = secp256k1.keyFromPrivate(value);
        return '0x' + keyPair.getPublic(compressed, 'hex');

    } else if (value.length === 33) {
        var keyPair = secp256k1.keyFromPublic(value);
        return '0x' + keyPair.getPublic(compressed, 'hex');

    } else if (value.length === 65) {
        var keyPair = secp256k1.keyFromPublic(value);
        return '0x' + keyPair.getPublic(compressed, 'hex');
    }

    throw new Error('invalid value');
});

utils.defineProperty(SigningKey, 'publicKeyToAddress', function(publicKey) {
    publicKey = '0x' + SigningKey.getPublicKey(publicKey, false).slice(4);
    return utils.getAddress('0x' + utils.keccak256(publicKey).substring(26));
});

module.exports = SigningKey;
