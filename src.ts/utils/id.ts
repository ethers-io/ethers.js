'use strict';

import { keccak256 } from './keccak256';
import { toUtf8Bytes } from './utf8';

export function id(text: string): string {
    return keccak256(toUtf8Bytes(text));
}
