'use strict';

import { createHmac } from 'crypto';

import { arrayify } from './bytes';

// Imported Types
import { Arrayish } from './bytes';

import * as errors from '../errors';

export enum SupportedAlgorithms { sha256 = 'sha256', sha512 = 'sha512' };

export function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array {
    if (!SupportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }
    return arrayify(createHmac(algorithm, Buffer.from(arrayify(key))).update(Buffer.from(arrayify(data))).digest());
}

