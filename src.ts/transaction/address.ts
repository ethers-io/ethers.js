import { getAddress } from "../address/index.js";
import { keccak256, SigningKey } from "../crypto/index.js";

import type { SignatureLike } from "../crypto/index.js";
import type { BytesLike } from "../utils/index.js";


export function computeAddress(key: string): string {
    const publicKey = SigningKey.computePublicKey(key, false);
    return getAddress(keccak256("0x" + publicKey.substring(4)).substring(26));
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(SigningKey.recoverPublicKey(digest, signature));
}
