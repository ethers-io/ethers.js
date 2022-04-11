import { _noCopyArrayify } from "./array.js";
import { isHexString } from "./check.js";
import { hexlify } from "./hex.js";
import { logger } from "./logger.js";

import type { BytesLike } from "./types.js";


export function concat(datas: ReadonlyArray<BytesLike>): string {
    return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}

export function dataLength(data: BytesLike): number {
    if (isHexString(data, true)) { return (data.length - 2) / 2; }
    return _noCopyArrayify(data).length;
}

export function dataSlice(data: BytesLike, start?: number, end?: number): string {
    const bytes = _noCopyArrayify(data);
    if (end != null && end > bytes.length) { logger.throwError("cannot slice beyond data bounds", "BUFFER_OVERRUN", {
        buffer: bytes, length: bytes.length, offset: end
    }); }
    return hexlify(bytes.slice((start == null) ? 0: start, (end == null) ? bytes.length: end));
}

export function stripZerosLeft(data: BytesLike): string {
    let bytes = hexlify(data).substring(2);
    while (bytes.substring(0, 2) == "00") { bytes = bytes.substring(2); }
    return "0x" + bytes;
}
