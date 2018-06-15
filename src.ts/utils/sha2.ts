'use strict';

import * as _hash from 'hash.js';

import { arrayify, Arrayish } from './convert';


interface HashFunc {
    (): HashFunc;
    update(chunk: Uint8Array): HashFunc;
    digest(encoding?: string): string;
}

const _sha256: HashFunc = _hash['sha256'];
const _sha512: HashFunc = _hash['sha512'];


export function sha256(data: Arrayish): string {
    return '0x' + (_sha256().update(arrayify(data)).digest('hex'));
}

export function sha512(data: Arrayish): string {
    return '0x' + (_sha512().update(arrayify(data)).digest('hex'));
}
