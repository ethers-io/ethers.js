import { keccak256 } from "../crypto/keccak.js";
import { MessagePrefix } from "../constants/index.js";
import { concat, toUtf8Bytes } from "../utils/index.js";


export function hashMessage(message: Uint8Array | string): string {
    if (typeof(message) === "string") { message = toUtf8Bytes(message); }
    return keccak256(concat([
        toUtf8Bytes(MessagePrefix),
        toUtf8Bytes(String(message.length)),
        message
    ]));
}
