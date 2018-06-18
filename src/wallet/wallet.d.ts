import { HDNode } from './hdnode';
import { ProgressCallback } from './secret-storage';
import { SigningKey } from './signing-key';
import { BlockTag, Provider, TransactionRequest, TransactionResponse } from '../providers/provider';
import { BigNumber, BigNumberish } from '../utils/bignumber';
import { Arrayish } from '../utils/bytes';
export declare abstract class Signer {
    provider?: Provider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(transaction: Arrayish | string): Promise<string>;
    abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
export declare class Wallet extends Signer {
    readonly address: string;
    readonly privateKey: string;
    readonly provider: Provider;
    private mnemonic;
    private path;
    private readonly signingKey;
    defaultGasLimit: number;
    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider);
    connect(provider: Provider): Wallet;
    getAddress(): Promise<string>;
    sign(transaction: TransactionRequest): Promise<string>;
    signMessage(message: Arrayish | string): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    send(addressOrName: string, amountWei: BigNumberish, options: any): Promise<TransactionResponse>;
    encrypt(password: Arrayish | string, options: any, progressCallback: ProgressCallback): Promise<string>;
    static createRandom(options: any): Wallet;
    static isEncryptedWallet(json: string): boolean;
    static fromEncryptedWallet(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, path?: string): Wallet;
    static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback: ProgressCallback): Promise<Wallet>;
    static verifyMessage(message: Arrayish | string, signature: string): string;
}
