'use strict';

import { arrayify } from './convert';

import { randomBytes as _randomBytes } from 'crypto';

//function _randomBytes(length) { return "0x00"; }

export function randomBytes(length: number): Uint8Array {
    return arrayify(_randomBytes(length));
}

