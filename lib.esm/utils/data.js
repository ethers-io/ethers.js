import { logger } from "./logger.js";
export function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (typeof (length) === "number" && value.length !== 2 + 2 * length) {
        return false;
    }
    if (length === true && (value.length % 2) !== 0) {
        return false;
    }
    return true;
}
export function isBytesLike(value) {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}
const HexCharacters = "0123456789abcdef";
export function hexlify(data) {
    const bytes = logger.getBytes(data);
    let result = "0x";
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}
export function concat(datas) {
    return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}
export function dataLength(data) {
    if (isHexString(data, true)) {
        return (data.length - 2) / 2;
    }
    return logger.getBytes(data).length;
}
export function dataSlice(data, start, end) {
    const bytes = logger.getBytes(data);
    if (end != null && end > bytes.length) {
        logger.throwError("cannot slice beyond data bounds", "BUFFER_OVERRUN", {
            buffer: bytes, length: bytes.length, offset: end
        });
    }
    return hexlify(bytes.slice((start == null) ? 0 : start, (end == null) ? bytes.length : end));
}
export function stripZerosLeft(data) {
    let bytes = hexlify(data).substring(2);
    while (bytes.substring(0, 2) == "00") {
        bytes = bytes.substring(2);
    }
    return "0x" + bytes;
}
function zeroPad(data, length, left) {
    const bytes = logger.getBytes(data);
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
export function zeroPadValue(data, length) {
    return zeroPad(data, length, true);
}
export function zeroPadBytes(data, length) {
    return zeroPad(data, length, false);
}
//# sourceMappingURL=data.js.map