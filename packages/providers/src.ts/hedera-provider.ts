import {BaseProvider, EnsResolver, Resolver} from "./base-provider";
import {
    Block,
    BlockTag,
    BlockWithTransactions,
    EventType, Filter,
    FilterByBlockHash,
    Listener, Log,
    Provider, TransactionReceipt, TransactionRequest, TransactionResponse
} from "@ethersproject/abstract-provider";
import {Network} from "@ethersproject/networks";
import {Formatter} from "./formatter";
import {Deferrable} from "@ethersproject/properties";
import {Transaction} from "@ethersproject/transactions";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";

export class HederaJSONRpcProvider implements BaseProvider {
    _bootstrapPoll: NodeJS.Timer;
    _emitted: { [p: string]: number | "pending" };
    // @ts-ignore
    _events: Array<Event>;
    _fastBlockNumber: number;
    _fastBlockNumberPromise: Promise<number>;
    _fastQueryDate: number;
    _internalBlockNumber: Promise<{ blockNumber: number; reqTime: number; respTime: number }>;
    _lastBlockNumber: number;
    _maxInternalBlockNumber: number;
    _network: Network;
    _networkPromise: Promise<Network>;
    _poller: NodeJS.Timer;
    _pollingInterval: number;
    readonly anyNetwork: boolean;
    formatter: Formatter;

    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this {
        return undefined;
    }

    async _getAddress(addressOrName: string | Promise<string>): Promise<string> {
        return Promise.resolve("");
    }

    async _getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block | BlockWithTransactions> {
        return Promise.resolve(undefined);
    }

    async _getBlockTag(blockTag: BlockTag | Promise<BlockTag>): Promise<BlockTag> {
        return Promise.resolve(undefined);
    }

    _getFastBlockNumber(): Promise<number> {
        return Promise.resolve(0);
    }

    async _getFilter(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Filter | FilterByBlockHash> {
        return Promise.resolve(undefined);
    }

    async _getInternalBlockNumber(maxAge: number): Promise<number> {
        return Promise.resolve(0);
    }

    async _getResolver(name: string): Promise<string> {
        return Promise.resolve("");
    }

    async _getTransactionRequest(transaction: Deferrable<TransactionRequest>): Promise<Transaction> {
        return Promise.resolve(undefined);
    }

    async _ready(): Promise<Network> {
        return Promise.resolve(undefined);
    }

    _setFastBlockNumber(blockNumber: number): void {
    }

    // @ts-ignore
    _startEvent(event: Event): void {
    }

    // @ts-ignore
    _stopEvent(event: Event): void {
    }

    async _waitForTransaction(transactionHash: string, confirmations: number, timeout: number, replaceable: { data: string; from: string; nonce: number; to: string; value: BigNumber; startBlock: number }): Promise<TransactionReceipt> {
        return Promise.resolve(undefined);
    }

    _wrapTransaction(tx: Transaction, hash?: string, startBlock?: number): TransactionResponse {
        return undefined;
    }

    get blockNumber(): number {
        return 0;
    }

    call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return Promise.resolve("");
    }

    async detectNetwork(): Promise<Network> {
        return Promise.resolve(undefined);
    }

    emit(eventName: EventType, ...args: Array<any>): boolean;
    emit(eventName: EventType, ...args: Array<any>): boolean;
    emit(eventName: EventType, ...args: Array<any>): boolean {
        return false;
    }

    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
        return Promise.resolve(undefined);
    }

    async getAvatar(nameOrAddress: string): Promise<string | null> {
        return Promise.resolve(undefined);
    }

    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    async getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> {
        return Promise.resolve(undefined);
    }

    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> {
        return Promise.resolve(undefined);
    }

    getBlockNumber(): Promise<number>;
    async getBlockNumber(): Promise<number>;
    getBlockNumber(): Promise<number> {
        return Promise.resolve(0);
    }

    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions> {
        return Promise.resolve(undefined);
    }

    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    async getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return Promise.resolve("");
    }

    async getEtherPrice(): Promise<number> {
        return Promise.resolve(0);
    }

    getGasPrice(): Promise<BigNumber> {
        return Promise.resolve(undefined);
    }

    getLogs(filter: Filter): Promise<Array<Log>>;
    async getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Array<Log>>;
    getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Array<Log>> {
        return Promise.resolve(undefined);
    }

    getNetwork(): Promise<Network> {
        return Promise.resolve(undefined);
    }

    async getResolver(name: string): Promise<Resolver | null>;
    getResolver(name: string): Promise<EnsResolver | null>;
    getResolver(name: string): Promise<Resolver | null> | Promise<EnsResolver | null> {
        return Promise.resolve(undefined);
    }

    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    async getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return Promise.resolve("");
    }

    getTransaction(transactionHash: string): Promise<TransactionResponse>;
    async getTransaction(transactionHash: string | Promise<string>): Promise<TransactionResponse>;
    getTransaction(transactionHash: string | Promise<string>): Promise<TransactionResponse> {
        return Promise.resolve(undefined);
    }

    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    async getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> {
        return Promise.resolve(0);
    }

    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    async getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt>;
    getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt> {
        return Promise.resolve(undefined);
    }

    listenerCount(eventName?: EventType): number;
    listenerCount(eventName?: EventType): number;
    listenerCount(eventName?: EventType): number {
        return 0;
    }

    listeners(eventName?: EventType): Array<Listener>;
    listeners(eventName?: EventType): Array<Listener>;
    listeners(eventName?: EventType): Array<Listener> {
        return undefined;
    }

    lookupAddress(address: string | Promise<string>): Promise<string | null>;
    async lookupAddress(address: string | Promise<string>): Promise<string | null>;
    lookupAddress(address: string): Promise<string | null>;
    lookupAddress(address: string | Promise<string>): Promise<string | null> {
        return Promise.resolve(undefined);
    }

    get network(): Network {
        return undefined;
    }

    off(eventName: EventType, listener?: Listener): Provider;
    off(eventName: EventType, listener?: Listener): this;
    off(eventName: EventType, listener?: Listener): Provider | this {
        return undefined;
    }

    on(eventName: EventType, listener: Listener): Provider;
    on(eventName: EventType, listener: Listener): this;
    on(eventName: EventType, listener: Listener): Provider | this {
        return undefined;
    }

    once(eventName: EventType, listener: Listener): Provider;
    once(eventName: "block", handler: () => void): void;
    once(eventName: EventType, listener: Listener): this;
    once(eventName: EventType | "block", listener: Listener | (() => void)): Provider | void | this {
        return undefined;
    }

    perform(method: string, params: any): Promise<any> {
        return Promise.resolve(undefined);
    }

    async poll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    get polling(): boolean {
        return false;
    }

    get pollingInterval(): number {
        return 0;
    }

    get ready(): Promise<Network> {
        return Promise.resolve(undefined);
    }

    removeAllListeners(eventName?: EventType): Provider;
    removeAllListeners(eventName?: EventType): this;
    removeAllListeners(eventName?: EventType): Provider | this {
        return undefined;
    }

    resetEventsBlock(blockNumber: number): void {
    }

    resolveName(name: string | Promise<string>): Promise<string | null>;
    async resolveName(name: string | Promise<string>): Promise<string | null>;
    resolveName(name: string): Promise<string | null>;
    resolveName(name: string | Promise<string>): Promise<string | null> {
        return Promise.resolve(undefined);
    }

    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    async sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        return Promise.resolve(undefined);
    }

    waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt>;
    async waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt>;
    waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt> {
        return Promise.resolve(undefined);
    }

}
