import * as secp256k1 from './secp256k1';
export declare class HDNode {
    private readonly keyPair;
    readonly privateKey: string;
    readonly publicKey: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly chainCode: string;
    readonly index: number;
    readonly depth: number;
    constructor(keyPair: secp256k1.KeyPair, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string);
    private _derive;
    derivePath(path: string): HDNode;
}
export declare function fromMnemonic(mnemonic: string): HDNode;
export declare function fromSeed(seed: any): HDNode;
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string): string;
export declare function entropyToMnemonic(entropy: any): string;
export declare function isValidMnemonic(mnemonic: string): boolean;
