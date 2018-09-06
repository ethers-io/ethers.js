import { Arrayish, Signature } from './bytes';
export declare class KeyPair {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly compressedPublicKey: string;
    readonly publicKeyBytes: Uint8Array;
    constructor(privateKey: Arrayish | string);
    sign(digest: Arrayish | string): Signature;
    computeSharedSecret(otherKey: Arrayish | string): string;
}
export declare function computePublicKey(key: Arrayish | string, compressed?: boolean): string;
export declare function computeAddress(key: Arrayish | string): string;
export declare function recoverPublicKey(digest: Arrayish | string, signature: Signature | string): string;
export declare function recoverAddress(digest: Arrayish | string, signature: Signature | string): string;
export declare function verifyMessage(message: Arrayish | string, signature: Signature | string): string;
