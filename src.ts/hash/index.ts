/**
 *  About hashing here...
 *
 *  @_section: api/hashing:Hashing Utilities  [about-hashing]
 */

export { id } from "./id.js"
export { ensNormalize, isValidName, namehash, dnsEncode } from "./namehash.js";
export { hashMessage, verifyMessage } from "./message.js";
export {
    solidityPacked, solidityPackedKeccak256, solidityPackedSha256
} from "./solidity.js";
export { TypedDataEncoder } from "./typed-data.js";

export type { TypedDataDomain, TypedDataField } from "./typed-data.js";
