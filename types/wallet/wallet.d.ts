import { SigningKey } from "../crypto/index.js";
import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import type { ProgressCallback } from "../crypto/index.js";
import type { Provider } from "../providers/index.js";
/**
 *  A **Wallet** manages a single private key which is used to sign
 *  transactions, messages and other common payloads.
 *
 *  This class is generally the main entry point for developers
 *  that wish to use a private key directly, as it can create
 *  instances from a large variety of common sources, including
 *  raw private key, [[link-bip-39]] mnemonics and encrypte JSON
 *  wallets.
 */
export declare class Wallet extends BaseWallet {
    #private;
    constructor(key: string | SigningKey, provider?: null | Provider);
    connect(provider: null | Provider): Wallet;
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
    static fromEncryptedJson(json: string, password: Uint8Array | string, progress?: ProgressCallback): Promise<HDNodeWallet | Wallet>;
    static fromEncryptedJsonSync(json: string, password: Uint8Array | string): HDNodeWallet | Wallet;
    static createRandom(provider?: null | Provider): HDNodeWallet;
    static fromPhrase(phrase: string, provider?: Provider): HDNodeWallet;
}
//# sourceMappingURL=wallet.d.ts.map