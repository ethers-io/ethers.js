'use strict';

var elliptic = require('elliptic');

var utils = require('./utils.js');

var secp256k1 = new (elliptic.ec)('secp256k1');


function SigningKey(privateKey) {
    if (!(this instanceof SigningKey)) { throw new Error('missing new'); }

    if (utils.isHexString(privateKey, 32)) {
        privateKey = utils.hexOrBuffer(privateKey);
    } else if (!Buffer.isBuffer(privateKey) || privateKey.length !== 32) {
        throw new Error('invalid private key');
    }
    utils.defineProperty(this, 'privateKey', '0x' + privateKey.toString('hex'))

    var keyPair = secp256k1.keyFromPrivate(privateKey);
    var publicKey = (new Buffer(keyPair.getPublic(false, 'hex'), 'hex')).slice(1);

    var address = utils.getAddress(utils.sha3(publicKey).slice(12).toString('hex'));
    utils.defineProperty(this, 'address', address)

    utils.defineProperty(this, 'signDigest', function(digest) {
        return keyPair.sign(digest, {canonical: true});
    });
}


module.exports = SigningKey;
