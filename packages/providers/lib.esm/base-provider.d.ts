/// <reference types="node" />
import { Block, BlockTag, BlockWithTransactions, EventType, Filter, FilterByBlockHash, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Network, Networkish } from "@ethersproject/networks";
import { Deferrable } from "@ethersproject/properties";
import { Transaction } from "@ethersproject/transactions";
import { Formatter } from "./formatter";
export declare class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    constructor(tag: string, listener: Listener, once: boolean);
    get event(): EventType;
    get type(): string;
    get hash(): string;
    get filter(): Filter;
    pollable(): boolean;
}
export interface EnsResolver {
    readonly name: string;
    readonly address: string;
    getAddress(coinType?: 60): Promise<string>;
    getContentHash(): Promise<string>;
    getText(key: string): Promise<string>;
}
export interface EnsProvider {
    resolveName(name: string): Promise<string>;
    lookupAddress(address: string): Promise<string>;
    getResolver(name: string): Promise<EnsResolver>;
}
export declare class Resolver implements EnsResolver {
    readonly provider: BaseProvider;
    readonly name: string;
    readonly address: string;
    constructor(provider: BaseProvider, address: string, name: string);
    _fetchBytes(selector: string, parameters?: string): Promise<string>;
    _getAddress(coinType: number, hexBytes: string): string;
    getAddress(coinType?: number): Promise<string>;
    getContentHash(): Promise<string>;
    getText(key: string): Promise<string>;
}
export declare class BaseProvider extends Provider implements EnsProvider {
    _networkPromise: Promise<Network>;
    _network: Network;
    _events: Array<Event>;
    formatter: Formatter;
    _emitted: {
        [eventName: string]: number | "pending";
    };
    _pollingInterval: number;
    _poller: NodeJS.Timer;
    _bootstrapPoll: NodeJS.Timer;
    _lastBlockNumber: number;
    _fastBlockNumber: number;
    _fastBlockNumberPromise: Promise<number>;
    _fastQueryDate: number;
    _maxInternalBlockNumber: number;
    _internalBlockNumber: Promise<{
        blockNumber: number;
        reqTime: number;
        respTime: number;
    }>;
    readonly anyNetwork: boolean;
    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    constructor(network: Networkish | Promise<Network>);
    _ready(): Promise<Network>;
    get ready(): Promise<Network>;
    static getFormatter(): Formatter;
    static getNetwork(network: Networkish): Network;
    _getInternalBlockNumber(maxAge: number): Promise<number>;
    poll(): Promise<void>;
    updateTransactionEvents(runners: Array<Promise<void>>, blockNumber?: number): void;
    resetEventsBlock(blockNumber: number): void;
    get network(): Network;
    detectNetwork(): Promise<Network>;
    getNetwork(): Promise<Network>;
    get blockNumber(): number;
    get polling(): boolean;
    set polling(value: boolean);
    get pollingInterval(): number;
    set pollingInterval(value: number);
    _getFastBlockNumber(): Promise<number>;
    _setFastBlockNumber(blockNumber: number): void;
    waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt>;
    _waitForTransaction(transactionHash: string, confirmations: number, timeout: number, replaceable: {
        data: string;
        from: string;
        nonce: number;
        to: string;
        value: BigNumber;
        startBlock: number;
    }): Promise<TransactionReceipt>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    _wrapTransaction(tx: Transaction, hash?: string, startBlock?: number): TransactionResponse;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    _getTransactionRequest(transaction: Deferrable<TransactionRequest>): Promise<Transaction>;
    _getFilter(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Filter | FilterByBlockHash>;
    call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
    _getAddress(addressOrName: string | Promise<string>): Promise<string>;
    _getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block | BlockWithTransactions>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    getTransaction(transactionHash: string | Promise<string>): Promise<TransactionResponse>;
    getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt>;
    getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Array<Log>>;
    getEtherPrice(): Promise<number>;
    newFilter(filter: Filter): Promise<string>;
    /**
     * Assumes that Filter Changes are Logs only. At the current time, ethers does not support newBlockFilter or pendingTransactionFilter.
     * Both of those filters will cause the output to only output the respective hashes instead of an array of Log objects
     *
     * @param filterId - the filter ID returned by newFilter
     * @returns Promise<Array<Log>>
     */
    getFilterChanges(filterId: string): Promise<Array<Log>>;
    _getBlockTag(blockTag: BlockTag | Promise<BlockTag>): Promise<BlockTag>;
    getResolver(name: string): Promise<Resolver>;
    _getResolver(name: string): Promise<string>;
    resolveName(name: string | Promise<string>): Promise<string>;
    lookupAddress(address: string | Promise<string>): Promise<string>;
    perform(method: string, params: any): Promise<any>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this;
    on(eventName: EventType, listener: Listener): this;
    once(eventName: EventType, listener: Listener): this;
    emit(eventName: EventType, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventType): number;
    listeners(eventName?: EventType): Array<Listener>;
    off(eventName: EventType, listener?: Listener): this;
    removeAllListeners(eventName?: EventType): this;
}
//# sourceMappingURL=base-provider.d.ts.map