/**
 *  SigningKey
 *
 *
 */
import { HDNode } from './hdnode';
import { Arrayish, Signature } from './bytes';
export declare class SigningKey {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly address: string;
    readonly mnemonic: string;
    readonly path: string;
    private readonly keyPair;
    constructor(privateKey: Arrayish | HDNode);
    signDigest(digest: Arrayish): Signature;
    computeSharedSecret(key: Arrayish | string): string;
    static isSigningKey(value: any): value is SigningKey;
}
