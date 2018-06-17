import { BigNumber, BigNumberish } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
import { Network } from './networks';
import { Transaction } from '../utils/transaction';
export declare type BlockTag = string | number;
export interface Block {
    hash: string;
    parentHash: string;
    number: number;
    timestamp: number;
    nonce: string;
    difficulty: string;
    gasLimit: BigNumber;
    gasUsed: BigNumber;
    miner: string;
    extraData: string;
    transactions: Array<string>;
}
export declare type TransactionRequest = {
    to?: string | Promise<string>;
    from?: string | Promise<string>;
    nonce?: number | string | Promise<number | string>;
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    gasPrice?: BigNumberish | Promise<BigNumberish>;
    data?: Arrayish | Promise<Arrayish>;
    value?: BigNumberish | Promise<BigNumberish>;
    chainId?: number | Promise<number>;
};
export interface TransactionResponse extends Transaction {
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    from: string;
    wait: (timeout?: number) => Promise<TransactionResponse>;
}
export interface TransactionReceipt {
    contractAddress?: string;
    transactionIndex?: number;
    root?: string;
    gasUsed?: BigNumber;
    logsBloom?: string;
    blockHash?: string;
    transactionHash?: string;
    logs?: Array<Log>;
    blockNumber?: number;
    cumulativeGasUsed?: BigNumber;
    status?: number;
}
export declare type Filter = {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
    address?: string;
    topics?: Array<any>;
};
export interface Log {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;
    removed?: boolean;
    address: string;
    data?: string;
    topics?: Array<string>;
    transactionHash?: string;
    logIndex?: number;
}
export declare function checkTransactionResponse(transaction: any): TransactionResponse;
export declare class Provider {
    private _network;
    private _events;
    protected _emitted: any;
    private _pollingInterval;
    private _poller;
    private _lastBlockNumber;
    private _balances;
    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    protected ready: Promise<Network>;
    constructor(network: string | Network);
    private _doPoll;
    resetEventsBlock(blockNumber: number): void;
    readonly network: Network;
    getNetwork(): Promise<Network>;
    readonly blockNumber: number;
    polling: boolean;
    pollingInterval: number;
    waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionResponse>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    call(transaction: TransactionRequest): Promise<string>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getTransaction(transactionHash: string): Promise<TransactionResponse>;
    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    getLogs(filter: Filter): Promise<Array<Log>>;
    getEtherPrice(): Promise<number>;
    _resolveNames(object: any, keys: Array<string>): Promise<any>;
    _getResolver(name: string): Promise<string>;
    resolveName(name: string | Promise<string>): Promise<string>;
    lookupAddress(address: string | Promise<string>): Promise<string>;
    doPoll(): void;
    perform(method: string, params: any): Promise<any>;
    _startPending(): void;
    _stopPending(): void;
    on(eventName: any, listener: any): Provider;
    once(eventName: any, listener: any): Provider;
    emit(eventName: any, ...args: any[]): boolean;
    listenerCount(eventName?: any): number;
    listeners(eventName: any): Array<any>;
    removeAllListeners(eventName: any): Provider;
    removeListener(eventName: any, listener: any): Provider;
}
