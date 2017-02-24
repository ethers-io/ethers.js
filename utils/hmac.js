'use strict';

// See: https://github.com/dominictarr/hmac
//
// The only difference between this and the original is this uses Uint8Array instead of Buffer


// @TODO: Use the hmac in hash.js instead

var convert = require('./convert.js');

var zeroBuffer = new Uint8Array(128)

function Hmac (createHash, blocksize, key) {
    if(!(this instanceof Hmac)) { throw new Error('missing new'); }

    this._opad = opad
    this._createHash = createHash

    if(blocksize !== 128 && blocksize !== 64) {
        throw new Error('blocksize must be either 64 for or 128 , but was:' + blocksize);
    }

    key = this._key = convert.arrayify(key);

    if(key.length > blocksize) {
        key = this._createHash().update(key).digest()
    } else if(key.length < blocksize) {
        key = convert.concat([key, zeroBuffer], blocksize)
    }

    var ipad = this._ipad = new Uint8Array(blocksize)
    var opad = this._opad = new Uint8Array(blocksize)

    for(var i = 0; i < blocksize; i++) {
        ipad[i] = key[i] ^ 0x36
        opad[i] = key[i] ^ 0x5C
    }

    this._hash = this._createHash().update(ipad)
}

Hmac.prototype.update = function (data, enc) {
    this._hash.update(data, enc)
    return this;
}

Hmac.prototype.digest = function (enc) {
    var h = this._hash.digest()
    return this._createHash().update(this._opad).update(h).digest(enc)
}

module.exports = Hmac
