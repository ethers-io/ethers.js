import { KeyPair } from './secp256k1';
import { Arrayish } from '../utils/convert';
export declare class HDNode {
    private readonly keyPair;
    readonly privateKey: string;
    readonly publicKey: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly chainCode: string;
    readonly index: number;
    readonly depth: number;
    constructor(keyPair: KeyPair, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string);
    private _derive;
    derivePath(path: string): HDNode;
}
export declare function fromMnemonic(mnemonic: string): HDNode;
export declare function fromSeed(seed: Arrayish): HDNode;
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string): string;
export declare function entropyToMnemonic(entropy: Arrayish): string;
export declare function isValidMnemonic(mnemonic: string): boolean;
