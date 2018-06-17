import { HDNode } from './hdnode';
import { ProgressCallback } from './secret-storage';
import { SigningKey } from './signing-key';
import { BlockTag, Provider, TransactionRequest, TransactionResponse } from '../providers/provider';
import { BigNumber, BigNumberish } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
import { UnsignedTransaction } from '../utils/transaction';
export interface Signer {
    address?: string;
    getAddress(): Promise<string>;
    sendTransaction(transaction: UnsignedTransaction): Promise<TransactionResponse>;
    provider: Provider;
    sign(transaction: UnsignedTransaction): string;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getGasPrice(transaction?: TransactionRequest): Promise<BigNumber>;
}
export declare class Wallet implements Signer {
    readonly address: string;
    readonly privateKey: string;
    private mnemonic;
    private path;
    private readonly signingKey;
    provider: Provider;
    defaultGasLimit: number;
    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider);
    sign(transaction: UnsignedTransaction): string;
    getAddress(): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    send(addressOrName: string, amountWei: BigNumberish, options: any): Promise<TransactionResponse>;
    static hashMessage(message: Arrayish | string): string;
    signMessage(message: Arrayish | string): string;
    static verifyMessage(message: Arrayish | string, signature: string): string;
    encrypt(password: Arrayish | string, options: any, progressCallback: ProgressCallback): Promise<string>;
    static createRandom(options: any): Wallet;
    static isEncryptedWallet(json: string): boolean;
    static fromEncryptedWallet(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, path?: string): Wallet;
    static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback: ProgressCallback): Promise<Wallet>;
}
