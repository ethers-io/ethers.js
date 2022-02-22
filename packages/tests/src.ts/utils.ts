/* istanbul ignore file */

'use strict';

import { hethers } from "hethers";

function randomBytes(seed: string, lower: number, upper?: number): Uint8Array {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    let result = hethers.utils.arrayify(hethers.utils.keccak256(hethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = hethers.utils.concat([result, hethers.utils.keccak256(hethers.utils.concat([seed, result]))]);
    }

    let top = hethers.utils.arrayify(hethers.utils.keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}

function randomHexString(seed: string, lower: number, upper?: number): string {
    return hethers.utils.hexlify(randomBytes(seed, lower, upper));
}

function randomNumber(seed: string, lower: number, upper: number): number {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}

function equals(a: any, b: any): boolean {

    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    // BigNumber
    if (a.eq) {
        if (!b.eq || !a.eq(b)) { return false; }
        return true;
    }

    // Uint8Array
    if (a.buffer) {
        if (!b.buffer || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    // Something else
    return a === b;
}

export {
    randomBytes,
    randomHexString,
    randomNumber,
    equals
}
