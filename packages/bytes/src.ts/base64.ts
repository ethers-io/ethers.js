
import type { BytesLike } from "@ethersproject/logger";

import { logger } from "./logger.js";


export function decodeBase64(textData: string): Uint8Array {
    return new Uint8Array(Buffer.from(textData, "base64"));
};

export function encodeBase64(data: BytesLike): string {
    return Buffer.from(logger.getBytes(data, "data")).toString("base64");
}
