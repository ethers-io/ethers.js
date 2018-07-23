import { Arrayish, Signature } from './types';
export declare class KeyPair {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly compressedPublicKey: string;
    readonly publicKeyBytes: Uint8Array;
    constructor(privateKey: Arrayish);
    sign(digest: Arrayish): Signature;
}
export declare function recoverPublicKey(digest: Arrayish, signature: Signature): string;
export declare function computePublicKey(key: Arrayish, compressed?: boolean): string;
export declare function recoverAddress(digest: Arrayish, signature: Signature): string;
export declare function computeAddress(key: string): string;
export declare function verifyMessage(message: Arrayish | string, signature: Signature | string): string;
//# sourceMappingURL=secp256k1.d.ts.map