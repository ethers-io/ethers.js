import { getAddress } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/crypto";
import { SigningKey } from "@ethersproject/signing-key";

import type { BytesLike } from "@ethersproject/logger";
import type { SignatureLike } from "@ethersproject/signing-key";

export function computeAddress(key: string): string {
    const publicKey = SigningKey.computePublicKey(key, false);
    return getAddress(keccak256("0x" + publicKey.substring(4)).substring(26));
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(SigningKey.recoverPublicKey(digest, signature));
}
