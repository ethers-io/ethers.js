import { SigningKey } from './signing-key';
import { Arrayish, BigNumber, BlockTag, HDNode, MinimalProvider, ProgressCallback, Signer, TransactionRequest, TransactionResponse, Wordlist } from '../utils/types';
export declare class Wallet extends Signer {
    readonly provider: MinimalProvider;
    private readonly signingKey;
    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: MinimalProvider);
    readonly address: string;
    readonly mnemonic: string;
    readonly path: string;
    readonly privateKey: string;
    /**
     *  Create a new instance of this Wallet connected to provider.
     */
    connect(provider: MinimalProvider): Wallet;
    getAddress(): Promise<string>;
    sign(transaction: TransactionRequest): Promise<string>;
    signMessage(message: Arrayish | string): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    encrypt(password: Arrayish | string, options: any, progressCallback: ProgressCallback): Promise<string>;
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): Wallet;
    static fromEncryptedJson(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet;
}
//# sourceMappingURL=wallet.d.ts.map