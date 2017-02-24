'use strict';

var utils = require('./utils.js');

var crypto = global.crypto || global.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    console.log('WARNING: Missing strong random number source; using weak randomBytes');
    crypto = {
        getRandomValues: function(length) {

            for (var i = 0; i < buffer.length; i++) {
                buffer[i] = parseInt(256 * Math.random());
            }

            return buffer;
        },
        _weakCrypto: true
    };
} else {
    console.log('Found strong random number source');
}

function randomBytes(length) {
    if (length <= 0 || length > 1024 || parseInt(length) != length) {
        throw new Error('invalid length');
    }

    var buffer = new Buffer(length);
    crypto.getRandomValues(buffer);
    return buffer;
};

if (crypto._weakCrypto === true) {
    utils.defineProperty(randomBytes, '_weakCrypto', true);
}

module.exports = randomBytes;
