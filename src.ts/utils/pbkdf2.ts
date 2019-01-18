'use strict';

import { pbkdf2Sync as _pbkdf2 } from 'crypto';

import { arrayify } from './bytes';

// Imported Types
import { Arrayish } from './bytes';

function bufferify(value: Arrayish): Buffer {
    return Buffer.from(arrayify(value));
}

export function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, hashAlgorithm: string): Uint8Array {
    return arrayify(_pbkdf2(bufferify(password), bufferify(salt), iterations, keylen, hashAlgorithm));
}
