import { getAddress } from "../address/index.js";
import { keccak256, SigningKey } from "../crypto/index.js";
export function computeAddress(key) {
    const publicKey = SigningKey.computePublicKey(key, false);
    return getAddress(keccak256("0x" + publicKey.substring(4)).substring(26));
}
export function recoverAddress(digest, signature) {
    return computeAddress(SigningKey.recoverPublicKey(digest, signature));
}
//# sourceMappingURL=address.js.map