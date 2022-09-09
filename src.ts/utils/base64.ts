import { getBytes, getBytesCopy } from "./data.js";

import type { BytesLike } from "./data.js";


/**
 *  Decodes the base-64 encoded %%base64Data%%.
 */
export function decodeBase64(base64Data: string): Uint8Array {
    return getBytesCopy(Buffer.from(base64Data, "base64"));
};

/**
 *  Encodes %%data%% as base-64 encoded data.
 */
export function encodeBase64(data: BytesLike): string {
    return Buffer.from(getBytes(data)).toString("base64");
}
