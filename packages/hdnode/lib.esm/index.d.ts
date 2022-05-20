import { ExternallyOwnedAccount } from "@hethers/abstract-signer";
import { BytesLike } from "@ethersproject/bytes";
import { SigningKey, SigningKeyED } from "@hethers/signing-key";
import { Wordlist } from "@ethersproject/wordlists";
export declare const defaultPath = "m/44'/60'/0'/0/0";
export interface Mnemonic {
    readonly phrase: string;
    readonly path: string;
    readonly locale: string;
}
export declare class HDNode implements ExternallyOwnedAccount {
    readonly privateKey: string;
    readonly publicKey: string;
    readonly fingerprint: string;
    readonly parentFingerprint: string;
    readonly alias: string;
    readonly mnemonic?: Mnemonic;
    readonly path: string;
    readonly isED25519Type?: boolean;
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
    constructor(constructorGuard: any, privateKey: string, publicKey: string, parentFingerprint: string, chainCode: string, index: number, depth: number, mnemonicOrPath: Mnemonic | string, isED25519Type?: boolean);
    get extendedKey(): string;
    neuter(): HDNode;
    private _derive;
    derivePath(path: string): HDNode;
    static _fromSeed(seed: BytesLike, mnemonic: Mnemonic, isED25519Type?: boolean): HDNode;
    static fromMnemonic(mnemonic: string, password?: string, wordlist?: string | Wordlist, isED25519Type?: boolean): HDNode;
    static fromSeed(seed: BytesLike, isED25519Type?: boolean): HDNode;
    static fromExtendedKey(extendedKey: string): HDNode;
}
export declare function mnemonicToSeed(mnemonic: string, password?: string): string;
export declare function mnemonicToEntropy(mnemonic: string, wordlist?: string | Wordlist): string;
export declare function entropyToMnemonic(entropy: BytesLike, wordlist?: string | Wordlist): string;
export declare function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean;
export declare function getAccountPath(index: number): string;
export declare function initializeSigningKey(privateKey: BytesLike, isED25519Type: boolean): SigningKey | SigningKeyED;
//# sourceMappingURL=index.d.ts.map