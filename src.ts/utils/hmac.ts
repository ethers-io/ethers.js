'use strict';

import { createHmac } from 'crypto';

import { arrayify, Arrayish } from './bytes';

import * as errors from './errors';

const supportedAlgorithms = { sha256: true, sha512: true };
export function computeHmac(algorithm: string, key: Arrayish, data: Arrayish): Uint8Array {
    if (!supportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }
    //return arrayify(_hmac(_hash[algorithm], arrayify(key)).update(arrayify(data)).digest());
    return arrayify(createHmac(algorithm, new Buffer(arrayify(key))).update(new Buffer(arrayify(data))).digest());
}

