'use strict';

import hash from 'hash.js';

import { arrayify } from './bytes';

// Types
import { Arrayish } from './bytes';

export function ripemd160(data: Arrayish): string {
    return '0x' + (hash.ripemd160().update(arrayify(data)).digest('hex'));
}

export function sha256(data: Arrayish): string {
    return '0x' + (hash.sha256().update(arrayify(data)).digest('hex'));
}

export function sha512(data: Arrayish): string {
    return '0x' + (hash.sha512().update(arrayify(data)).digest('hex'));
}
