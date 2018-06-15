import { HDNode } from './hdnode';
import { ProgressCallback } from './secret-storage';
import { SigningKey } from './signing-key';
import { BlockTag } from '../providers/provider';
import { BigNumber, BigNumberish } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
interface Provider {
    chainId: number;
    getBalance(address: string, blockTag: number | string): Promise<BigNumber>;
    getTransactionCount(address: string, blockTag: number | string): Promise<number>;
    estimateGas(transaction: any): Promise<BigNumber>;
    getGasPrice(): Promise<BigNumber>;
    sendTransaction(Bytes: any): Promise<string>;
    resolveName(address: string): Promise<string>;
    waitForTransaction(Bytes32: any): Promise<TransactionResponse>;
}
interface TransactionRequest {
    nonce?: number;
    to?: string;
    from?: string;
    data?: string;
    gasLimit?: BigNumber;
    gasPrice?: BigNumber;
    r?: string;
    s?: string;
    chainId?: number;
    v?: number;
    value?: BigNumber;
}
interface TransactionResponse extends TransactionRequest {
    hash?: string;
    blockHash?: string;
    block?: number;
    wait?: (timeout?: number) => Promise<TransactionResponse>;
}
export declare class Wallet {
    readonly address: string;
    readonly privateKey: string;
    private mnemonic;
    private path;
    private readonly signingKey;
    provider: any;
    defaultGasLimit: number;
    constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider);
    sign(transaction: TransactionRequest): string;
    static parseTransaction(rawTransaction: Arrayish): TransactionRequest;
    getAddress(): Promise<string>;
    getBalance(blockTag: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag: BlockTag): Promise<number>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    sendTransaction(transaction: any): Promise<TransactionResponse>;
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
export {};
