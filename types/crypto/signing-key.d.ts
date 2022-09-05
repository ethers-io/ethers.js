import { Signature } from "./signature.js";
import type { BytesLike, Frozen } from "../utils/index.js";
import type { SignatureLike } from "./index.js";
export declare class SigningKey {
    #private;
    constructor(privateKey: BytesLike);
    get privateKey(): string;
    get publicKey(): string;
    get compressedPublicKey(): string;
    sign(digest: BytesLike): Frozen<Signature>;
    computeShardSecret(other: BytesLike): string;
    static computePublicKey(key: BytesLike, compressed?: boolean): string;
    static recoverPublicKey(digest: BytesLike, signature: SignatureLike): string;
    static _addPoints(p0: BytesLike, p1: BytesLike, compressed?: boolean): string;
}
//# sourceMappingURL=signing-key.d.ts.map