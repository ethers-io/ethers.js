'use strict';

var aes = require('aes-js');
var randomBytes = require('./random-bytes.js');

var utils = require('./utils.js');

function Randomish() {
    if (!(this instanceof Randomish)) { throw new Error('missing new'); }

    var bits = 0;
    Object.defineProperty(this, 'entropy', {
        enumerable: true,
        get: function() { return bits; }
    });

    var weak = !!(randomBytes._weakCrypto);

    var entropy = new aes.ModeOfOperation.cbc(
        Randomish.randomishBytes(32),
        Randomish.randomishBytes(16)
    );

    if (!weak) { bits += (32 + 16) * 8; }

    utils.defineProperty(this, 'feedEntropy', function(data, expectedBits) {
        if (!data) { data = ''; }
        if (!expectedBits) { expectedBits = 0; }

        if (parseInt(expectedBits) != expectedBits) { throw new Error('invalid expectedBits'); }

        data = (new Date()).getTime() + '-' + JSON.stringify(data) + '-' + data.toString();
        var hashed = utils.sha3(new Buffer(data, 'utf8'));

        bits += expectedBits + (weak ? 0: ((32) * 8));

        // Feed the hashed data and random data to the mode of operation
        entropy.encrypt(hashed.slice(0, 16));
        entropy.encrypt(randomBytes(16));
        entropy.encrypt(hashed.slice(0, 16));
        return new Buffer(entropy.encrypt(randomBytes(16)));
    });

    utils.defineProperty(this, 'randomBytes', function(length, key) {
        if (parseInt(length) != length || length <= 0 || length > 1024) {
            throw new Error('invalid length');
        }

        // If we don't have a key, create one
        if (!key) {
            key = Buffer.concat([this.feedEntropy(), this.feedEntropy()]);
        }

        if (!Buffer.isBuffer(key) || key.length !== 32) {
            throw new Error('invalid key');
        }

        var aesCbc = new aes.ModeOfOperation.cbc(key, this.feedEntropy());
        var result = new Buffer(0);
        while (result.length < length) {
            result = result.concat([result, this.feedEntropy()]);
        }

        return result;
    });

    this.feedEntropy();
}

utils.defineProperty(Randomish, 'randomishBytes', function(length) {
    return randomBytes(length);
});

module.exports = Randomish
