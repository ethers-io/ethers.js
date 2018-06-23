
import * as hash from 'hash.js';

import { arrayify, Arrayish } from '../src.ts/utils/bytes';

import * as errors from '../src.ts/utils/errors';

export type SupportedAlgorithms = 'sha256' | 'sha512';

const supportedAlgorithms = { sha256: true, sha512: true };
export function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array {
    if (!supportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }

    return arrayify(
        hash.hmac(hash[algorithm], arrayify(key)).update(arrayify(data)).digest()
    );
}

