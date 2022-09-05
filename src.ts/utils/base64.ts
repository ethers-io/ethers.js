import { logger } from "./logger.js";

import type { BytesLike } from "./data.js";


export function decodeBase64(textData: string): Uint8Array {
    return logger.getBytesCopy(Buffer.from(textData, "base64"));
};

export function encodeBase64(data: BytesLike): string {
    return Buffer.from(logger.getBytes(data)).toString("base64");
}
