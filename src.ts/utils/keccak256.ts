'use strict';

import sha3 = require('js-sha3');

import { arrayify } from './bytes';

// Imported Types
import { Arrayish } from './bytes';

export function keccak256(data: Arrayish): string {
    return '0x' + sha3.keccak_256(arrayify(data));
}

//export default keccak256;
