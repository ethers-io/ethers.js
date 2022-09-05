"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeroPadBytes = exports.zeroPadValue = exports.stripZerosLeft = exports.dataSlice = exports.dataLength = exports.concat = exports.hexlify = exports.isBytesLike = exports.isHexString = void 0;
const logger_js_1 = require("./logger.js");
function isHexString(value, length) {
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
exports.isHexString = isHexString;
function isBytesLike(value) {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}
exports.isBytesLike = isBytesLike;
const HexCharacters = "0123456789abcdef";
function hexlify(data) {
    const bytes = logger_js_1.logger.getBytes(data);
    let result = "0x";
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}
exports.hexlify = hexlify;
function concat(datas) {
    return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}
exports.concat = concat;
function dataLength(data) {
    if (isHexString(data, true)) {
        return (data.length - 2) / 2;
    }
    return logger_js_1.logger.getBytes(data).length;
}
exports.dataLength = dataLength;
function dataSlice(data, start, end) {
    const bytes = logger_js_1.logger.getBytes(data);
    if (end != null && end > bytes.length) {
        logger_js_1.logger.throwError("cannot slice beyond data bounds", "BUFFER_OVERRUN", {
            buffer: bytes, length: bytes.length, offset: end
        });
    }
    return hexlify(bytes.slice((start == null) ? 0 : start, (end == null) ? bytes.length : end));
}
exports.dataSlice = dataSlice;
function stripZerosLeft(data) {
    let bytes = hexlify(data).substring(2);
    while (bytes.substring(0, 2) == "00") {
        bytes = bytes.substring(2);
    }
    return "0x" + bytes;
}
exports.stripZerosLeft = stripZerosLeft;
function zeroPad(data, length, left) {
    const bytes = logger_js_1.logger.getBytes(data);
    if (length < bytes.length) {
        logger_js_1.logger.throwError("padding exceeds data length", "BUFFER_OVERRUN", {
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
function zeroPadValue(data, length) {
    return zeroPad(data, length, true);
}
exports.zeroPadValue = zeroPadValue;
function zeroPadBytes(data, length) {
    return zeroPad(data, length, false);
}
exports.zeroPadBytes = zeroPadBytes;
//# sourceMappingURL=data.js.map