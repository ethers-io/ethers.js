
import { zeroPadBytes } from "@ethersproject/bytes";

import { logger } from "./logger.js";
import { toUtf8Bytes, toUtf8String } from "./utf8.js";

import type { BytesLike } from "@ethersproject/logger";


export function formatBytes32String(text: string): string {

    // Get the bytes
    const bytes = toUtf8Bytes(text);

    // Check we have room for null-termination
    if (bytes.length > 31) { throw new Error("bytes32 string must be less than 32 bytes"); }

    // Zero-pad (implicitly null-terminates)
    return zeroPadBytes(bytes, 32);
}

export function parseBytes32String(_bytes: BytesLike): string {
    const data = logger.getBytes(_bytes, "bytes");

    // Must be 32 bytes with a null-termination
    if (data.length !== 32) { throw new Error("invalid bytes32 - not 32 bytes long"); }
    if (data[31] !== 0) { throw new Error("invalid bytes32 string - no null terminator"); }

    // Find the null termination
    let length = 31;
    while (data[length - 1] === 0) { length--; }

    // Determine the string value
    return toUtf8String(data.slice(0, length));
}

