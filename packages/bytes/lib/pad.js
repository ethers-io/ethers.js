import { _noCopyArrayify } from "./array.js";
import { hexlify } from "./hex.js";
import { logger } from "./logger.js";
function zeroPad(data, length, left) {
    const bytes = _noCopyArrayify(data);
    if (length < bytes.length) {
        logger.throwError("padding exceeds data length", "BUFFER_OVERRUN", {
            buffer: new Uint8Array(bytes),
            length: length,
            offset: length + 1
        });
    }
    const result = new Uint8Array(length);
    result.fill(0);
    if (left) {
        result.set(bytes, length - bytes.length);
    }
    else {
        result.set(bytes, 0);
    }
    return hexlify(result);
}
export function zeroPadLeft(data, length) {
    return zeroPad(data, length, true);
}
export function zeroPadRight(data, length) {
    return zeroPad(data, length, false);
}
//# sourceMappingURL=pad.js.map