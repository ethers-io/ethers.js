
import { arrayify, _noCopyArrayify } from "./array.js";

import type { BytesLike, Hexable } from "./types.js";


const HexCharacters: string = "0123456789abcdef";
export function hexlify(data: BytesLike | Hexable): string {
    const bytes = _noCopyArrayify(data);

    let result = "0x";
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}

export function quantity(value: BytesLike | Hexable | number | bigint): string {
    let result = hexlify(arrayify(value)).substring(2);
    while (result.substring(0, 1) === "0") { result = result.substring(1); }
    if (result === "") { result = "0"; }
    return "0x" + result;
}
