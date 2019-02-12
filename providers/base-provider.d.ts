import { BigNumber } from '../utils/bignumber';
import { Provider } from './abstract-provider';
import { Block, BlockTag, EventType, Filter, FilterByBlock, Listener, Log, TransactionReceipt, TransactionRequest, TransactionResponse } from './abstract-provider';
import { BigNumberish } from '../utils/bignumber';
import { Transaction } from '../utils/transaction';
import { Network, Networkish } from '../utils/networks';
export declare class BaseProvider extends Provider {
    private _network;
    private _events;
    protected _emitted: {
        [eventName: string]: number | 'pending';
    };
    private _pollingInterval;
    private _poller;
    private _lastBlockNumber;
    private _balances;
    private _fastBlockNumber;
    private _fastBlockNumberPromise;
    private _fastQueryDate;
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
    constructor(network: Networkish | Promise<Network>);
    private _doPoll;
    resetEventsBlock(blockNumber: number): void;
    readonly network: Network;
    getNetwork(): Promise<Network>;
    readonly blockNumber: number;
    polling: boolean;
    pollingInterval: number;
    _getFastBlockNumber(): Promise<number>;
    _setFastBlockNumber(blockNumber: number): void;
    waitForTransaction(transactionHash: string, confirmations?: number): Promise<TransactionReceipt>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    _wrapTransaction(tx: Transaction, hash?: string): TransactionResponse;
    call(transaction: TransactionRequest, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block>;
    getTransaction(transactionHash: string): Promise<TransactionResponse>;
    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    getLogs(filter: Filter | FilterByBlock): Promise<Array<Log>>;
    getEtherPrice(): Promise<number>;
    private _resolveNames;
    private _getResolver;
    resolveName(name: string | Promise<string>): Promise<string>;
    lookupAddress(address: string | Promise<string>): Promise<string>;
    static checkTransactionResponse(transaction: any): TransactionResponse;
    doPoll(): void;
    perform(method: string, params: any): Promise<any>;
    protected _startPending(): void;
    protected _stopPending(): void;
    private _addEventListener;
    on(eventName: EventType, listener: Listener): Provider;
    once(eventName: EventType, listener: Listener): Provider;
    addEventListener(eventName: EventType, listener: Listener): Provider;
    emit(eventName: EventType, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventType): number;
    listeners(eventName: EventType): Array<Listener>;
    removeAllListeners(eventName?: EventType): Provider;
    removeListener(eventName: EventType, listener: Listener): Provider;
}
