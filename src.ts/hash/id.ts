import { keccak256 } from "../crypto/keccak.js";
import { toUtf8Bytes } from "../utils/index.js";

export function id(value: string): string {
    return keccak256(toUtf8Bytes(value));
}
