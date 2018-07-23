'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("../utils/bytes");
var properties_1 = require("../utils/properties");
var crypto = global.crypto || global.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    console.log('WARNING: Missing strong random number source; using weak randomBytes');
    crypto = {
        getRandomValues: function (buffer) {
            for (var round = 0; round < 20; round++) {
                for (var i = 0; i < buffer.length; i++) {
                    if (round) {
                        buffer[i] ^= Math.trunc(256 * Math.random());
                    }
                    else {
                        buffer[i] = Math.trunc(256 * Math.random());
                    }
                }
            }
            return buffer;
        },
        _weakCrypto: true
    };
}
function randomBytes(length) {
    if (length <= 0 || length > 1024 || parseInt(String(length)) != length) {
        throw new Error('invalid length');
    }
    var result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return bytes_1.arrayify(result);
}
exports.randomBytes = randomBytes;
;
if (crypto._weakCrypto === true) {
    properties_1.defineReadOnly(randomBytes, '_weakCrypto', true);
}
