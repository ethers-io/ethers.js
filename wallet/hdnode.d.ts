import { Arrayish } from '../utils/bytes';
import { Wordlist } from '../wordlists/wordlist';
export declare const defaultPath = "m/44'/60'/0'/0/0";
export declare class HDNode {
    private readonly keyPair;
    readonly privateKey: string;
    readonly publicKey: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly chainCode: string;
    readonly index: number;
    readonly depth: number;
    /**
     *  This constructor should not be called directly.
     *
     *  Please use:
     *   - fromMnemonic
     *   - fromSeed
     */
    constructor(constructorGuard: any, privateKey: Arrayish, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string);
    private _derive;
    derivePath(path: string): HDNode;
    static isHDNode(value: any): value is HDNode;
}
export declare function fromMnemonic(mnemonic: string, wordlist?: Wordlist): HDNode;
export declare function fromSeed(seed: Arrayish): HDNode;
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string, wordlist?: Wordlist): string;
export declare function entropyToMnemonic(entropy: Arrayish, wordlist?: Wordlist): string;
export declare function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean;
