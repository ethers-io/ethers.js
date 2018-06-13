'use strict';

import * as _hash from 'hash.js';

import { arrayify, Arrayish } from './convert';

interface HashFunc {
    (): HashFunc;
    update(chunk: Uint8Array): HashFunc;

    // This is cheating, but safe for our purposes
    digest(encoding: string): string;
    digest(): Uint8Array;
}

export interface HmacFunc extends HashFunc{
    (hashFunc: HashFunc, key: Arrayish): HmacFunc;
}

const _hmac: HmacFunc = _hash['hmac'];
const _sha256: HashFunc = _hash['sha256'];
const _sha512: HashFunc = _hash['sha512'];


// @TODO: Make this use create-hmac in node

export function createSha256Hmac(key: Arrayish): HmacFunc {
    if (!key['buffer']) { key = arrayify(key); }
    return _hmac(_sha256, key);
}

export function createSha512Hmac(key: Arrayish): HmacFunc {
    if (!key['buffer']) { key = arrayify(key); }
    return _hmac(_sha512, key);
}
