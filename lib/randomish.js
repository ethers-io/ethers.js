'use strict';

var aes = require('aes-js');
var randomBytes = require('./random-bytes.js');

var utils = require('./utils.js');

function Randomish() {
    if (!(this instanceof Randomish)) { throw new Error('missing new'); }

    var weak = (randomBytes._weakCrypto || false);

    var entropyBits = (weak ? 0: ((32 + 16) * 8));
    Object.defineProperty(this, 'entropy', {
        enumerable: true,
        get: function() { return entropyBits; }
    });

    var entropy = new aes.ModeOfOperation.cbc(
        Randomish.randomishBytes(32),
        Randomish.randomishBytes(16)
    );

    utils.defineProperty(this, 'feedEntropy', function(data, expectedEntropyBits) {
        if (!data) { data = ''; }
        if (!expectedEntropyBits) { expectedEntropyBits = 0; }

        if (parseInt(expectedEntropyBits) != expectedEntropyBits) {
            throw new Error('invalid expectedEntropyBits');
        }

        data = (new Date()).getTime() + '-' + JSON.stringify(data) + '-' + data.toString();
        var hashed = utils.sha3(new Buffer(data, 'utf8'));

        entropyBits += expectedEntropyBits + (weak ? 0: ((32) * 8));

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
            result = Buffer.concat([result, this.feedEntropy()]);
        }

        return result.slice(0, length);
    });

    this.feedEntropy();
}

utils.defineProperty(Randomish, 'randomishBytes', function(length) {
    return randomBytes(length);
});

module.exports = Randomish
