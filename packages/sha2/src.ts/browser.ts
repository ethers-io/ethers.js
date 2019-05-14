"use strict";

import * as hash from "hash.js";

import { arrayify, BytesLike } from "@ethersproject/bytes";
import * as errors from "@ethersproject/errors";


export enum SupportedAlgorithms { sha256 = "sha256", sha512 = "sha512" };

export function ripemd160(data: BytesLike): string {
    return "0x" + (hash.ripemd160().update(arrayify(data)).digest("hex"));
}

export function sha256(data: BytesLike): string {
    return "0x" + (hash.sha256().update(arrayify(data)).digest("hex"));
}

export function sha512(data: BytesLike): string {
    return "0x" + (hash.sha512().update(arrayify(data)).digest("hex"));
}


export function computeHmac(algorithm: SupportedAlgorithms, key: BytesLike, data: BytesLike): string {
    if (!SupportedAlgorithms[algorithm]) {
        errors.throwError("unsupported algorithm " + algorithm, errors.UNSUPPORTED_OPERATION, {
            operation: "hmac",
            algorithm: algorithm
        });
    }

    return "0x" + hash.hmac((<any>hash)[algorithm], arrayify(key)).update(arrayify(data)).digest();
}

