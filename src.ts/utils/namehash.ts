'use strict';

import { concat, hexlify } from './bytes';
import { toUtf8Bytes } from './utf8';
import { keccak256 } from './keccak256';

var Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var Partition = new RegExp("^((.*)\\.)?([^.]+)$");
var UseSTD3ASCIIRules = new RegExp("^[a-z0-9.-]*$");

export function namehash(name: string): string {
    name = name.toLowerCase();

    // Supporting the full UTF-8 space requires additional (and large)
    // libraries, so for now we simply do not support them.
    // It should be fairly easy in the future to support systems with
    // String.normalize, but that is future work.
    if (!name.match(UseSTD3ASCIIRules)) {
        throw new Error('contains invalid UseSTD3ASCIIRules characters');
    }

    var result: string | Uint8Array = Zeros;
    while (name.length) {
        var partition = name.match(Partition);
        var label = toUtf8Bytes(partition[3]);
        result = keccak256(concat([result, keccak256(label)]));

        name = partition[2] || '';
    }

    return hexlify(result);
}


