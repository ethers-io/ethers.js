import type { BytesLike } from "@ethersproject/logger";
import type { SignatureLike } from "@ethersproject/signing-key";
export declare function computeAddress(key: string): string;
export declare function recoverAddress(digest: BytesLike, signature: SignatureLike): string;
//# sourceMappingURL=address.d.ts.map