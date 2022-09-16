import { SigningKey } from "../crypto/index.js";
import { VoidSigner } from "../providers/index.js";
import { Mnemonic } from "./mnemonic.js";
import { BaseWallet } from "./base-wallet.js";
import type { BytesLike, Numeric } from "../utils/index.js";
import type { Provider } from "../providers/index.js";
import type { Wordlist } from "../wordlists/index.js";
export declare const defaultPath = "m/44'/60'/0'/0/0";
export declare class HDNodeWallet extends BaseWallet {
    #private;
    readonly publicKey: string;
    readonly fingerprint: string;
    readonly parentFingerprint: string;
    readonly mnemonic: null | Mnemonic;
    readonly chainCode: string;
    readonly path: null | string;
    readonly index: number;
    readonly depth: number;
    constructor(guard: any, signingKey: SigningKey, parentFingerprint: string, chainCode: string, path: null | string, index: number, depth: number, mnemonic: null | Mnemonic, provider: null | Provider);
    connect(provider: null | Provider): HDNodeWallet;
    get extendedKey(): string;
    hasPath(): this is {
        path: string;
    };
    neuter(): HDNodeVoidWallet;
    deriveChild(_index: Numeric): HDNodeWallet;
    derivePath(path: string): HDNodeWallet;
    static fromSeed(seed: BytesLike): HDNodeWallet;
    static fromPhrase(phrase: string, password?: string, path?: null | string, wordlist?: Wordlist): HDNodeWallet;
    static fromMnemonic(mnemonic: Mnemonic, path?: null | string): HDNodeWallet;
    static fromExtendedKey(extendedKey: string): HDNodeWallet | HDNodeVoidWallet;
    static createRandom(password?: string, path?: null | string, wordlist?: Wordlist): HDNodeWallet;
}
export declare class HDNodeVoidWallet extends VoidSigner {
    readonly publicKey: string;
    readonly fingerprint: string;
    readonly parentFingerprint: string;
    readonly chainCode: string;
    readonly path: null | string;
    readonly index: number;
    readonly depth: number;
    constructor(guard: any, address: string, publicKey: string, parentFingerprint: string, chainCode: string, path: null | string, index: number, depth: number, provider: null | Provider);
    connect(provider: null | Provider): HDNodeVoidWallet;
    get extendedKey(): string;
    hasPath(): this is {
        path: string;
    };
    deriveChild(_index: Numeric): HDNodeVoidWallet;
    derivePath(path: string): HDNodeVoidWallet;
}
export declare class HDNodeWalletManager {
    #private;
    constructor(phrase: string, password?: string, path?: string, locale?: Wordlist);
    getSigner(index?: number): HDNodeWallet;
}
export declare function getAccountPath(_index: Numeric): string;
//# sourceMappingURL=hdwallet.d.ts.map