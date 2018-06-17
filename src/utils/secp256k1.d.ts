import { Arrayish } from '../utils/convert';
export declare const N: string;
export interface Signature {
    r: string;
    s: string;
    recoveryParam: number;
    v?: number;
}
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
