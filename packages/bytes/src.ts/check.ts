import type { BytesLike } from "./types.js";

export function isHexString(value: any, length?: number | boolean): value is string {
    if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false
    }

    if (typeof(length) === "number" && value.length !== 2 + 2 * length) { return false; }
    if (length === true && (value.length % 2) !== 0) { return false; }

    return true;
}

/*
function _isByte(value: number): boolean {
    return (typeof(value) === "number" && value >= 0 && value < 256 && Math.floor(value) === value);
}
export function isBytes(value: any): value is Bytes {
    if (value == null) { return false; }

    if (value instanceof Uint8Array) { return true; }
    if (typeof(value) === "string") { return false; }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            if (!_isByte(value[i])) { return false; }
        }
        return true;
    }

    return false;
}
*/

export function isBytesLike(value: any): value is BytesLike {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}
