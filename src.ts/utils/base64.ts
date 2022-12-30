/**
 *  [Base64 encoding](link-wiki-base64) using 6-bit words to encode
 *  arbitrary bytes into a string using 65 printable symbols, the
 *  upper-case and lower-case alphabet, the digits ``0`` through ``9``,
 *  ``"+"`` and ``"/"`` with the ``"="`` used for padding.
 *
 *  @_subsection: api/utils:Base64 Encoding  [about-base64]
 */
import { getBytes, getBytesCopy } from "./data.js";

import type { BytesLike } from "./data.js";


/**
 *  Decodes the base-64 encoded %%value%%.
 */
export function decodeBase64(value: string): Uint8Array {
    return getBytesCopy(Buffer.from(value, "base64"));
};

/**
 *  Encodes %%data%% as a base-64 encoded string.
 */
export function encodeBase64(data: BytesLike): string {
    return Buffer.from(getBytes(data)).toString("base64");
}
