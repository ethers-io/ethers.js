
import * as hash from 'hash.js';

import { arrayify } from '../src.ts/utils/bytes';

import { Arrayish, SupportedAlgorithms } from '../src.ts/utils/types';

import * as errors from '../src.ts/utils/errors';

const supportedAlgorithms = { sha256: true, sha512: true };
export function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array {
    if (!supportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }

    return arrayify(
        hash.hmac(hash[algorithm], arrayify(key)).update(arrayify(data)).digest()
    );
}

