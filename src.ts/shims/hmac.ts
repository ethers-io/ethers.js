
import * as hash from 'hash.js';

import { arrayify } from '../utils/bytes';

import * as errors from '../errors';

///////////////////////////////
// Imported Types

import { Arrayish } from '../utils/bytes';

///////////////////////////////

export enum SupportedAlgorithms { sha256 = 'sha256', sha512 = 'sha512' };

export function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array {
    if (!SupportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }

    return arrayify(
        hash.hmac(hash[algorithm], arrayify(key)).update(arrayify(data)).digest()
    );
}

