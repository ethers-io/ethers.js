import { keccak256 } from "@ethersproject/crypto";
import { toUtf8Bytes } from "@ethersproject/strings";
export function id(value) {
    return keccak256(toUtf8Bytes(value));
}
//# sourceMappingURL=id.js.map