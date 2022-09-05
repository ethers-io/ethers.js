import { keccak256 } from "../crypto/keccak.js";
import { toUtf8Bytes } from "../utils/index.js";
export function id(value) {
    return keccak256(toUtf8Bytes(value));
}
//# sourceMappingURL=id.js.map