import { Arrayish } from '../utils/convert';
export declare type Signature = {
    r: string;
    s: string;
    recoveryParam: number;
};
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
export declare const N: string;
