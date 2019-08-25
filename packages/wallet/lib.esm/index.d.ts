import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount, Signer } from "@ethersproject/abstract-signer";
import { Bytes, BytesLike, SignatureLike } from "@ethersproject/bytes";
import { SigningKey } from "@ethersproject/signing-key";
import { ProgressCallback } from "@ethersproject/json-wallets";
import { Wordlist } from "@ethersproject/wordlists/wordlist";
export declare class Wallet extends Signer implements ExternallyOwnedAccount {
    readonly address: string;
    readonly provider: Provider;
    readonly path: string;
    readonly _signingKey: () => SigningKey;
    readonly _mnemonic: () => string;
    constructor(privateKey: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: Provider);
    readonly mnemonic: string;
    readonly privateKey: string;
    readonly publicKey: string;
    getAddress(): Promise<string>;
    connect(provider: Provider): Wallet;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    signMessage(message: Bytes | string): Promise<string>;
    encrypt(password: Bytes | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): Wallet;
    static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet;
}
export declare function verifyMessage(message: Bytes | string, signature: SignatureLike): string;
