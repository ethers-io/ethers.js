/**
 *  Explain HD Wallets..
 *
 *  @_subsection: api/wallet:HD Wallets  [hd-wallets]
 */
import { SigningKey } from "../crypto/index.js";
import { VoidSigner } from "../providers/index.js";
import { BaseWallet } from "./base-wallet.js";
import { Mnemonic } from "./mnemonic.js";
import type { ProgressCallback } from "../crypto/index.js";
import type { Provider } from "../providers/index.js";
import type { BytesLike, Numeric } from "../utils/index.js";
import type { Wordlist } from "../wordlists/index.js";
export declare const defaultPath: string;
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
    /**
     *  @private
     */
    constructor(guard: any, signingKey: SigningKey, parentFingerprint: string, chainCode: string, path: null | string, index: number, depth: number, mnemonic: null | Mnemonic, provider: null | Provider);
    connect(provider: null | Provider): HDNodeWallet;
    /**
     *  Resolves to a [JSON Keystore Wallet](json-wallets) encrypted with
     *  %%password%%.
     *
     *  If %%progressCallback%% is specified, it will receive periodic
     *  updates as the encryption process progreses.
     */
    encrypt(password: Uint8Array | string, progressCallback?: ProgressCallback): Promise<string>;
    /**
     *  Returns a [JSON Keystore Wallet](json-wallets) encryped with
     *  %%password%%.
     *
     *  It is preferred to use the [async version](encrypt) instead,
     *  which allows a [[ProgressCallback]] to keep the user informed.
     *
     *  This method will block the event loop (freezing all UI) until
     *  it is complete, which may be a non-trivial duration.
     */
    encryptSync(password: Uint8Array | string): string;
    get extendedKey(): string;
    hasPath(): this is {
        path: string;
    };
    neuter(): HDNodeVoidWallet;
    deriveChild(_index: Numeric): HDNodeWallet;
    derivePath(path: string): HDNodeWallet;
    static fromExtendedKey(extendedKey: string): HDNodeWallet | HDNodeVoidWallet;
    static createRandom(password?: string, path?: string, wordlist?: Wordlist): HDNodeWallet;
    static fromMnemonic(mnemonic: Mnemonic, path?: string): HDNodeWallet;
    static fromPhrase(phrase: string, password?: string, path?: string, wordlist?: Wordlist): HDNodeWallet;
    static fromSeed(seed: BytesLike): HDNodeWallet;
}
export declare class HDNodeVoidWallet extends VoidSigner {
    readonly publicKey: string;
    readonly fingerprint: string;
    readonly parentFingerprint: string;
    readonly chainCode: string;
    readonly path: null | string;
    readonly index: number;
    readonly depth: number;
    /**
     *  @private
     */
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
    constructor(phrase: string, password?: null | string, path?: null | string, locale?: null | Wordlist);
    getSigner(index?: number): HDNodeWallet;
}
export declare function getAccountPath(_index: Numeric): string;
//# sourceMappingURL=hdwallet.d.ts.map