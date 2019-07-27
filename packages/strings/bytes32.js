"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("@ethersproject/constants");
var bytes_1 = require("@ethersproject/bytes");
var utf8_1 = require("./utf8");
function formatBytes32String(text) {
    // Get the bytes
    var bytes = utf8_1.toUtf8Bytes(text);
    // Check we have room for null-termination
    if (bytes.length > 31) {
        throw new Error("bytes32 string must be less than 32 bytes");
    }
    // Zero-pad (implicitly null-terminates)
    return bytes_1.hexlify(bytes_1.concat([bytes, constants_1.HashZero]).slice(0, 32));
}
exports.formatBytes32String = formatBytes32String;
function parseBytes32String(bytes) {
    var data = bytes_1.arrayify(bytes);
    // Must be 32 bytes with a null-termination
    if (data.length !== 32) {
        throw new Error("invalid bytes32 - not 32 bytes long");
    }
    if (data[31] !== 0) {
        throw new Error("invalid bytes32 string - no null terminator");
    }
    // Find the null termination
    var length = 31;
    while (data[length - 1] === 0) {
        length--;
    }
    // Determine the string value
    return utf8_1.toUtf8String(data.slice(0, length));
}
exports.parseBytes32String = parseBytes32String;
