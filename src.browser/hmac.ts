
import * as hash from 'hash.js';

import { arrayify, Arrayish } from '../src.ts/utils/bytes';

import * as errors from '../src.ts/utils/errors';

interface HashFunc {
    update(chunk: Uint8Array): HashFunc;
    digest(): Uint8Array;
}

interface HmacFunc extends HashFunc {
    (hashFunc: HashFunc, key: Uint8Array): HashFunc;
}

const hmac: HmacFunc = hash['hmac'];

const supportedAlgorithms = { sha256: true, sha512: true };

export function computeHmac(algorithm: string, key: Arrayish, data: Arrayish): Uint8Array {
    if (!supportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }

    return arrayify(
        hmac(hash[algorithm], arrayify(key)).update(arrayify(data)).digest()
    );
}

