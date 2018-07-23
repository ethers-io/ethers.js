import { BigNumber, BigNumberish, Block, BlockTag, EventType, Filter, Listener, Log, MinimalProvider, Network, Networkish, Transaction, TransactionReceipt, TransactionRequest, TransactionResponse } from '../utils/types';
export declare class Provider extends MinimalProvider {
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
    constructor(network: Networkish | Promise<Network>);
    private _doPoll;
    resetEventsBlock(blockNumber: number): void;
    readonly network: Network;
    getNetwork(): Promise<Network>;
    readonly blockNumber: number;
    polling: boolean;
    pollingInterval: number;
    waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionReceipt>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    _wrapTransaction(tx: Transaction, hash?: string): TransactionResponse;
    call(transaction: TransactionRequest): Promise<string>;
    estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getTransaction(transactionHash: string): Promise<TransactionResponse>;
    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    getLogs(filter: Filter): Promise<Array<Log>>;
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
    removeAllListeners(eventName: EventType): Provider;
    removeListener(eventName: EventType, listener: Listener): Provider;
}
//# sourceMappingURL=provider.d.ts.map