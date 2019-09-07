import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { BytesLike } from "@ethersproject/bytes";
import { Wordlist } from "@ethersproject/wordlists";
export declare const defaultPath = "m/44'/60'/0'/0/0";
export declare class HDNode implements ExternallyOwnedAccount {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly fingerprint: string;
    readonly parentFingerprint: string;
    readonly address: string;
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
    constructor(constructorGuard: any, privateKey: string, publicKey: string, parentFingerprint: string, chainCode: string, index: number, depth: number, mnemonic: string, path: string);
    readonly extendedKey: string;
    neuter(): HDNode;
    private _derive;
    derivePath(path: string): HDNode;
    static _fromSeed(seed: BytesLike, mnemonic: string): HDNode;
    static fromMnemonic(mnemonic: string, password?: string, wordlist?: Wordlist): HDNode;
    static fromSeed(seed: BytesLike): HDNode;
    static fromExtendedKey(extendedKey: string): HDNode;
}
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string, wordlist?: Wordlist): string;
export declare function entropyToMnemonic(entropy: BytesLike, wordlist?: Wordlist): string;
export declare function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean;
