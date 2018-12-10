'use strict';

import * as errors from '../errors';

import { concat, hexlify } from './bytes';
import { toUtf8Bytes } from './utf8';
import { keccak256 } from './keccak256';

///////////////////////////////
// Imported Types

import { Arrayish } from './bytes';

///////////////////////////////

const Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const Partition = new RegExp("^((.*)\\.)?([^.]+)$");
const UseSTD3ASCIIRules = new RegExp("^[a-z0-9.-]*$");

export function namehash(name: string): string {
    if (typeof(name) !== 'string') {
        errors.throwError('invalid address - ' + String(name), errors.INVALID_ARGUMENT, {
            argument: 'name',
            value: name
        });
    }

    name = name.toLowerCase();

    // Supporting the full UTF-8 space requires additional (and large)
    // libraries, so for now we simply do not support them.
    // It should be fairly easy in the future to support systems with
    // String.normalize, but that is future work.
    if (!name.match(UseSTD3ASCIIRules)) {
        errors.throwError('contains invalid UseSTD3ASCIIRules characters', errors.INVALID_ARGUMENT, {
            argument: 'name',
            value: name
        });
    }

    let result: string | Uint8Array = Zeros;
    while (name.length) {
        let partition = name.match(Partition);
        let label = toUtf8Bytes(partition[3]);
        result = keccak256(concat([result, keccak256(label)]));

        name = partition[2] || '';
    }

    return hexlify(result);
}


export function id(text: string): string {
    return keccak256(toUtf8Bytes(text));
}

export function hashMessage(message: Arrayish | string): string {
    return keccak256(concat([
        toUtf8Bytes('\x19Ethereum Signed Message:\n'),
        toUtf8Bytes(String(message.length)),
        ((typeof(message) === 'string') ? toUtf8Bytes(message): message)
    ]));
}

