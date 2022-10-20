import { getAddress } from "../address/index.js";
import { keccak256, SigningKey } from "../crypto/index.js";
export function computeAddress(key) {
    let pubkey;
    if (typeof (key) === "string") {
        pubkey = SigningKey.computePublicKey(key, false);
    }
    else {
        pubkey = key.publicKey;
    }
    return getAddress(keccak256("0x" + pubkey.substring(4)).substring(26));
}
export function recoverAddress(digest, signature) {
    return computeAddress(SigningKey.recoverPublicKey(digest, signature));
}
//# sourceMappingURL=address.js.map