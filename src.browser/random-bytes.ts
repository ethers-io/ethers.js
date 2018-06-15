'use strict';

import { arrayify } from '../src.ts/utils/convert';
import { defineReadOnly } from '../src.ts/utils/properties';

let crypto: any = global['crypto'] || global['msCrypto'];
if (!crypto || !crypto.getRandomValues) {

    console.log('WARNING: Missing strong random number source; using weak randomBytes');

    crypto = {
        getRandomValues: function(buffer: Uint8Array) {
            for (var round = 0; round < 20; round++) {
                for (var i = 0; i < buffer.length; i++) {
                    if (round) {
                        buffer[i] ^= Math.trunc(256 * Math.random());
                    } else {
                        buffer[i] = Math.trunc(256 * Math.random());
                    }
                }
            }

            return buffer;
        },
        _weakCrypto: true
    };
}

export function randomBytes(length) {
    if (length <= 0 || length > 1024 || parseInt(length) != length) {
        throw new Error('invalid length');
    }

    var result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return arrayify(result);
};

if (crypto._weakCrypto === true) {
    defineReadOnly(randomBytes, '_weakCrypto', true);
}
