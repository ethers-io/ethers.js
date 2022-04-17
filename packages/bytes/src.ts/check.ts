import type { BytesLike } from "./types.js";

export function isHexString(value: any, length?: number | boolean): value is string {
    if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false
    }

    if (typeof(length) === "number" && value.length !== 2 + 2 * length) { return false; }
    if (length === true && (value.length % 2) !== 0) { return false; }

    return true;
}

export function isBytesLike(value: any): value is BytesLike {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}
