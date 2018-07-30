'use strict';

import { arrayify } from '../utils/bytes';
import { computeHmac, SupportedAlgorithms } from './hmac';

// Imported Types
import { Arrayish } from '../utils/bytes';

export function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, hashAlgorithm: SupportedAlgorithms): Uint8Array {
    password = arrayify(password);
    salt = arrayify(salt);
    var hLen
    var l = 1
    var DK = new Uint8Array(keylen)
    var block1 = new Uint8Array(salt.length + 4)
    block1.set(salt);
    //salt.copy(block1, 0, 0, salt.length)

    let r: number;
    let T: Uint8Array;

    for (var i = 1; i <= l; i++) {
        //block1.writeUInt32BE(i, salt.length)
        block1[salt.length] = (i >> 24) & 0xff;
        block1[salt.length + 1] = (i >> 16) & 0xff;
        block1[salt.length + 2] = (i >> 8) & 0xff;
        block1[salt.length + 3] = i & 0xff;

        //var U = createHmac(password).update(block1).digest();
        var U = computeHmac(hashAlgorithm, password, block1);

        if (!hLen) {
            hLen = U.length
            T = new Uint8Array(hLen)
            l = Math.ceil(keylen / hLen)
            r = keylen - (l - 1) * hLen
        }

        //U.copy(T, 0, 0, hLen)
        T.set(U);


        for (var j = 1; j < iterations; j++) {
            //U = createHmac(password).update(U).digest();
            U = computeHmac(hashAlgorithm, password, U);
            for (var k = 0; k < hLen; k++) T[k] ^= U[k]
        }


        var destPos = (i - 1) * hLen
        var len = (i === l ? r : hLen)
        //T.copy(DK, destPos, 0, len)
        DK.set(arrayify(T).slice(0, len), destPos);
    }

    return arrayify(DK)
}

