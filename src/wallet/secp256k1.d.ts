export interface BN {
    toString(radix: number): string;
    encode(encoding: string, compact: boolean): Uint8Array;
    toArray(endian: string, width: number): Uint8Array;
}
export interface Signature {
    r: BN;
    s: BN;
    recoveryParam: number;
}
export interface KeyPair {
    sign(message: Uint8Array, options: {
        canonical?: boolean;
    }): Signature;
    getPublic(compressed: boolean, encoding?: string): string;
    getPublic(): BN;
    getPrivate(encoding?: string): string;
    encode(encoding: string, compressed: boolean): string;
    priv: BN;
}
export interface EC {
    constructor(curve: string): any;
    n: BN;
    keyFromPublic(publicKey: string | Uint8Array): KeyPair;
    keyFromPrivate(privateKey: string | Uint8Array): KeyPair;
    recoverPubKey(data: Uint8Array, signature: {
        r: Uint8Array;
        s: Uint8Array;
    }, recoveryParam: number): KeyPair;
}
export declare const curve: EC;
