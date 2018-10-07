import { BigNumber } from './utils/bignumber';
import { HDNode } from './utils/hdnode';
import { SigningKey } from './utils/signing-key';
import { Wordlist } from './utils/wordlist';
import { Signer as AbstractSigner } from './abstract-signer';
import { Provider } from './providers/abstract-provider';
import { ProgressCallback } from './utils/secret-storage';
import { Arrayish } from './utils/bytes';
import { BlockTag, TransactionRequest, TransactionResponse } from './providers/abstract-provider';
export declare class Wallet extends AbstractSigner {
    readonly provider: Provider;
    private readonly signingKey;
    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider);
    readonly address: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly privateKey: string;
    /**
     *  Create a new instance of this Wallet connected to provider.
     */
    connect(provider: Provider): Wallet;
    getAddress(): Promise<string>;
    sign(transaction: TransactionRequest): Promise<string>;
    signMessage(message: Arrayish | string): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    encrypt(password: Arrayish | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): Wallet;
    static fromEncryptedJson(json: string, password: Arrayish, progressCallback?: ProgressCallback): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet;
}
