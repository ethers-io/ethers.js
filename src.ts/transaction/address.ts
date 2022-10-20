import { getAddress } from "../address/index.js";
import { keccak256, SigningKey } from "../crypto/index.js";

import type { SignatureLike } from "../crypto/index.js";
import type { BytesLike } from "../utils/index.js";

export function computeAddress(key: string | SigningKey): string {
    let pubkey: string;
    if (typeof(key) === "string") {
        pubkey = SigningKey.computePublicKey(key, false);
    } else {
        pubkey = key.publicKey;
    }
    return getAddress(keccak256("0x" + pubkey.substring(4)).substring(26));
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(SigningKey.recoverPublicKey(digest, signature));
}
