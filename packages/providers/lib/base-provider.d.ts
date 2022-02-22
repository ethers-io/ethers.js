/// <reference types="node" />
import { EventType, Filter, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { Network, Networkish, HederaNetworkConfigLike } from "@hethers/networks";
import { Deferrable } from "@ethersproject/properties";
import { Transaction } from "@hethers/transactions";
import { Timestamp, TransactionReceipt as HederaTransactionReceipt } from '@hashgraph/sdk';
import { Formatter } from "./formatter";
import { AccountLike } from "@hethers/address";
import { AccountId, Client } from "@hashgraph/sdk";
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
export interface Avatar {
    url: string;
    linkage: Array<{
        type: string;
        content: string;
    }>;
}
export declare class BaseProvider extends Provider {
    _networkPromise: Promise<Network>;
    _network: Network;
    _events: Array<Event>;
    _pollingInterval: number;
    _poller: NodeJS.Timer;
    _bootstrapPoll: NodeJS.Timer;
    formatter: Formatter;
    _emittedEvents: {
        [key: string]: boolean;
    };
    _previousPollingTimestamps: {
        [key: string]: Timestamp;
    };
    readonly anyNetwork: boolean;
    private readonly hederaClient;
    private readonly _mirrorNodeUrl;
    constructor(network: Networkish | Promise<Network> | HederaNetworkConfigLike);
    _ready(): Promise<Network>;
    static getFormatter(): Formatter;
    static getNetwork(network: Networkish): Network;
    get network(): Network;
    _checkMirrorNode(): void;
    detectNetwork(): Promise<Network>;
    getNetwork(): Promise<Network>;
    get pollingInterval(): number;
    set pollingInterval(value: number);
    waitForTransaction(transactionId: string, timeout?: number): Promise<TransactionReceipt>;
    _waitForTransaction(transactionId: string, timeout: number): Promise<TransactionReceipt>;
    /**
     *  AccountBalance query implementation, using the hashgraph sdk.
     *  It returns the tinybar balance of the given address.
     *
     * @param accountLike The address to check balance of
     */
    getBalance(accountLike: AccountLike | Promise<AccountLike>): Promise<BigNumber>;
    /**
     *  Get contract bytecode implementation, using the REST Api.
     *  It returns the bytecode, or a default value as string.
     *
     * @param accountLike The address to get code for
     * @param throwOnNonExisting Whether or not to throw exception if address is not a contract
     */
    getCode(accountLike: AccountLike | Promise<AccountLike>, throwOnNonExisting?: boolean): Promise<string>;
    _wrapTransaction(tx: Transaction, hash?: string, receipt?: HederaTransactionReceipt): TransactionResponse;
    getHederaClient(): Client;
    getHederaNetworkConfig(): AccountId[];
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    _getFilter(filter: Filter | Promise<Filter>): Promise<Filter>;
    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionIdOrTimestamp - id or consensus timestamp of the transaction to search for
     */
    getTransaction(transactionIdOrTimestamp: string | Promise<string>): Promise<TransactionResponse>;
    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionId - id of the transaction to search for
     */
    getTransactionReceipt(transactionId: string | Promise<string>): Promise<TransactionReceipt>;
    /**
     *  Get contract logs implementation, using the REST Api.
     *  It returns the logs array, or a default value [].
     *  Throws an exception, when the result size exceeds the given limit.
     *
     * @param filter The parameters to filter logs by.
     */
    getLogs(filter: Filter | Promise<Filter>): Promise<Array<Log>>;
    getHbarPrice(): Promise<number>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    perform(method: string, params: any): Promise<any>;
    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this;
    on(eventName: EventType, listener: Listener): this;
    once(eventName: EventType, listener: Listener): this;
    emit(eventName: EventType, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventType): number;
    listeners(eventName?: EventType): Array<Listener>;
    off(eventName: EventType, listener?: Listener): this;
    removeAllListeners(eventName?: EventType): this;
    get polling(): boolean;
    set polling(value: boolean);
    poll(): Promise<void>;
    purgeOldEvents(): void;
}
//# sourceMappingURL=base-provider.d.ts.map