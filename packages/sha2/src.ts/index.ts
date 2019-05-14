"use strict";

import { createHash, createHmac } from 'crypto';

import { arrayify, BytesLike } from '@ethersproject/bytes';
import * as errors from '@ethersproject/errors';


export enum SupportedAlgorithms { sha256 = "sha256", sha512 = "sha512" };


export function ripemd160(data: BytesLike): string {
    return "0x" + createHash("ripemd160").update(Buffer.from(arrayify(data))).digest("hex")
}

export function sha256(data: BytesLike): string {
    return "0x" + createHash("sha256").update(Buffer.from(arrayify(data))).digest("hex")
}

export function sha512(data: BytesLike): string {
    return "0x" + createHash("sha512").update(Buffer.from(arrayify(data))).digest("hex")
}


export function computeHmac(algorithm: SupportedAlgorithms, key: BytesLike, data: BytesLike): string {
    if (!SupportedAlgorithms[algorithm]) {
        errors.throwError("unsupported algorithm - " + algorithm, errors.UNSUPPORTED_OPERATION, {
            operation: "computeHmac",
            algorithm: algorithm
        });
    }

    return "0x" + createHmac(algorithm, Buffer.from(arrayify(key))).update(Buffer.from(arrayify(data))).digest("hex");
}

