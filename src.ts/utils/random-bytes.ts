'use strict';

import { arrayify } from './bytes';

import { randomBytes as _randomBytes } from 'crypto';

export function randomBytes(length: number): Uint8Array {
    return arrayify(_randomBytes(length));
}

