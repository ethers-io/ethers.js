import { BigNumber } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
import { HDNode } from './hdnode';
import { SigningKey } from './signing-key';
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
    getBalance(blockTag: any): any;
    getTransactionCount(blockTag: any): any;
    estimateGas(transaction: TransactionRequest): any;
    sendTransaction(transaction: any): Promise<any>;
    send(addressOrName: any, amountWei: any, options: any): Promise<any>;
    static hashMessage(message: any): string;
    signMessage(message: any): string;
    static verifyMessage(message: any, signature: any): string;
    encrypt(password: any, options: any, progressCallback: any): Promise<{}>;
    static createRandom(options: any): Wallet;
    static isEncryptedWallet(json: string): boolean;
    static fromEncryptedWallet(json: any, password: any, progressCallback: any): Promise<{}>;
    static fromMnemonic(mnemonic: string, path?: string): Wallet;
    static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback: any): Promise<{}>;
}
export {};
