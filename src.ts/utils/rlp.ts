
/**
 *  An RLP-encoded structure.
 */
export type RlpStructuredData = string | Array<RlpStructuredData>;

export { decodeRlp } from "./rlp-decode.js";
export { encodeRlp } from "./rlp-encode.js";
