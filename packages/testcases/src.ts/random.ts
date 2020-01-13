"use strict";

import { ethers } from "ethers";

export function randomBytes(seed: string, lower: number, upper?: number): Uint8Array {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    let result = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = ethers.utils.concat([result, ethers.utils.keccak256(result)]);
    }

    let top = ethers.utils.arrayify(ethers.utils.keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}

export function randomHexString(seed: string, lower: number, upper?: number): string {
    return ethers.utils.hexlify(randomBytes(seed, lower, upper));
}

export function randomNumber(seed: string, lower: number, upper: number): number {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
