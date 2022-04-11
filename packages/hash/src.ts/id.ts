import { keccak256 } from "@ethersproject/crypto";
import { toUtf8Bytes } from "@ethersproject/strings";

export function id(value: string): string {
    return keccak256(toUtf8Bytes(value));
}
