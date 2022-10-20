import { SigningKey } from "../crypto/index.js";
import type { SignatureLike } from "../crypto/index.js";
import type { BytesLike } from "../utils/index.js";
export declare function computeAddress(key: string | SigningKey): string;
export declare function recoverAddress(digest: BytesLike, signature: SignatureLike): string;
//# sourceMappingURL=address.d.ts.map