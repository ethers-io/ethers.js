import { BlockTag, Provider, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { Bytes } from "@ethersproject/bytes";
export interface ExternallyOwnedAccount {
    readonly address: string;
    readonly privateKey: string;
}
export declare abstract class Signer {
    readonly provider?: Provider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(message: Bytes | string): Promise<string>;
    abstract signTransaction(transaction: TransactionRequest): Promise<string>;
    abstract connect(provider: Provider): Signer;
    readonly _isSigner: boolean;
    constructor();
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    call(transaction: TransactionRequest, blockTag?: BlockTag): Promise<string>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    getChainId(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    resolveName(name: string): Promise<string>;
    checkTransaction(transaction: TransactionRequest): TransactionRequest;
    populateTransaction(transaction: TransactionRequest): Promise<TransactionRequest>;
    _checkProvider(operation?: string): void;
    static isSigner(value: any): value is Signer;
}
export declare class VoidSigner extends Signer {
    readonly address: string;
    constructor(address: string, provider?: Provider);
    getAddress(): Promise<string>;
    _fail(message: string, operation: string): Promise<any>;
    signMessage(message: Bytes | string): Promise<string>;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    connect(provider: Provider): VoidSigner;
}
