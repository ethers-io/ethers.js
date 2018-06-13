import { BigNumber, BigNumberish } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
import { Network } from './networks';
export declare type BlockTag = string | number;
export declare type Block = {
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
};
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
export declare type TransactionResponse = {
    blockNumber?: number;
    blockHash?: string;
    hash: string;
    to?: string;
    from?: string;
    nonce?: number;
    gasLimit?: BigNumber;
    gasPrice?: BigNumber;
    data?: string;
    value: BigNumber;
    chainId?: number;
    r?: string;
    s?: string;
    v?: number;
    wait?: (timeout?: number) => Promise<TransactionResponse>;
};
export declare type TransactionReceipt = {
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
};
export declare type Filter = {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
    address?: string;
    topics?: Array<any>;
};
export declare type Log = {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;
    removed?: boolean;
    address: string;
    data?: string;
    topics?: Array<string>;
    transactionHash?: string;
    logIndex?: number;
};
export declare function checkTransactionResponse(transaction: any): any;
export declare class Provider {
    private _network;
    protected ready: Promise<Network>;
    private _events;
    protected _emitted: any;
    private _pollingInterval;
    private _poller;
    private _lastBlockNumber;
    private _balances;
    /**
     *  Sub-classing notes
     *    - If the network is standard or fully specified, ready will resolve
     *    - Otherwise, the sub-class must assign a Promise to ready
     */
    constructor(network: string | Network);
    private _doPoll;
    resetEventsBlock(blockNumber: any): void;
    readonly network: Network;
    getNetwork(): Promise<Network>;
    readonly blockNumber: number;
    polling: boolean;
    pollingInterval: number;
    waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionResponse>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag: BlockTag | Promise<BlockTag>): Promise<number>;
    getCode(addressOrName: string | Promise<string>, blockTag: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag: BlockTag | Promise<BlockTag>): Promise<string>;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<string>;
    call(transaction: TransactionRequest): Promise<string>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getTransaction(transactionHash: string): Promise<TransactionResponse>;
    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    getLogs(filter: Filter): Promise<Array<Log>>;
    getEtherPrice(): Promise<number>;
    _resolveNames(object: any, keys: any): Promise<{}>;
    _getResolver(name: any): Promise<string>;
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
