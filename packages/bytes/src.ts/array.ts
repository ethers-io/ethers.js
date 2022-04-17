import { isBytesLike } from "./check.js";
import { logger } from "./logger.js";

import type { BytesLike, Hexable } from "./types.js";


let BN_8: bigint | null = null;
let BN_255: bigint | null = null;
try {
    BN_8 = BigInt("8");
    BN_255 = BigInt("255");
} catch (error) {
    console.log("Unsupported bigint", error);
}

function isHexable(value: any): value is Hexable {
    return (value && typeof(value.toHexString) === "function");
}

export function arrayify(data: BytesLike | Hexable | number | bigint): Uint8Array {
    if (data == null) {
        logger.throwArgumentError("cannot arrayify nullish", "data", data);
    }

    if (typeof(data) === "number") {
        let v = logger.getNumber(data, "data");

        const result = [];
        while (v) {
            result.unshift(v & 0xff);
            v = parseInt(String(v / 256));
        }
        if (result.length === 0) { result.push(0); }
        return new Uint8Array(result);
    }

    if (BN_8 && typeof(data) === "bigint") {
        const result = [];
        while (data) {
            result.unshift(Number(data & <bigint>BN_255));
            data >>= <bigint>BN_8;
        }
        if (result.length === 0) { result.push(0); }

        return new Uint8Array(result);
    }

    if (isHexable(data)) {
        return arrayify(data.toHexString());
    }

    if (typeof(data) === "string") {
        let hex = data;
        //if (options.allowMissingPrefix && hex.substring(0, 2) !== "0x") {
        //    hex = "0x" + hex;
        //}
        if (!hex.match(/^0x[0-9a-f]*$/i)) {
            throw new RangeError(`invalid hex data string (${ JSON.stringify(data) })`);
        }

        const result = [];
        for (let i = 2; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }

        return new Uint8Array(result);
    }

    if (data instanceof Uint8Array) { return new Uint8Array(data); }

    throw new TypeError(`cannot arrayify ${ JSON.stringify(data) }`);
}

export function _noCopyArrayify(data: BytesLike | Hexable): Uint8Array {
    if (!isBytesLike(data)) {
        logger.throwArgumentError("invalid BytesLike value", "data", data);
    } // @TODO: ArgumentE>
    if (data instanceof Uint8Array) { return data; }
    return arrayify(data);
}
