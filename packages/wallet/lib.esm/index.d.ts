import { Account, AccountLike } from "@hethers/address";
import { Provider, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import { ExternallyOwnedAccount, Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from "@hethers/abstract-signer";
import { Bytes, BytesLike, SignatureLike } from "@ethersproject/bytes";
import { Mnemonic } from "@hethers/hdnode";
import { SigningKey } from "@ethersproject/signing-key";
import { ProgressCallback } from "@hethers/json-wallets";
import { Wordlist } from "@ethersproject/wordlists";
export declare class Wallet extends Signer implements ExternallyOwnedAccount, TypedDataSigner {
    readonly address?: string;
    readonly account?: Account;
    readonly alias?: string;
    readonly provider: Provider;
    readonly _signingKey: () => SigningKey;
    readonly _mnemonic: () => Mnemonic;
    constructor(identity: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: Provider);
    get mnemonic(): Mnemonic;
    get privateKey(): string;
    get publicKey(): string;
    getAddress(): Promise<string>;
    getAccount(): Promise<Account>;
    getAlias(): Promise<string>;
    connect(provider: Provider): Wallet;
    connectAccount(accountLike: AccountLike): Wallet;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    signMessage(message: Bytes | string): Promise<string>;
    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string>;
    encrypt(password: Bytes | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
    /**
     * Performs a contract local call (ContractCallQuery) against the given contract in the provider's network.
     * In the future, this method should automatically perform getCost and apply the results for gasLimit/txFee.
     * TODO: utilize getCost when implemented
     *
     * @param txRequest - the call request to be submitted
     */
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): Wallet;
    createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse>;
    static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<Wallet>;
    static fromEncryptedJsonSync(json: string, password: Bytes | string): Wallet;
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet;
    _checkAddress(operation?: string): void;
}
export declare function verifyMessage(message: Bytes | string, signature: SignatureLike): string;
export declare function verifyTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike): string;
//# sourceMappingURL=index.d.ts.map