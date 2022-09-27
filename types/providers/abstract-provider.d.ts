import { EnsResolver } from "./ens-resolver.js";
import { Network } from "./network.js";
import { Block, FeeData, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import type { AddressLike } from "../address/index.js";
import type { BigNumberish } from "../utils/index.js";
import type { Listener } from "../utils/index.js";
import type { Networkish } from "./network.js";
import type { BlockParams, BlockTag, EventFilter, Filter, FilterByBlockHash, LogParams, OrphanFilter, PreparedTransactionRequest, Provider, ProviderEvent, TransactionReceiptParams, TransactionRequest, TransactionResponseParams } from "./provider.js";
export declare type Subscription = {
    type: "block" | "close" | "debug" | "network" | "pending";
    tag: string;
} | {
    type: "transaction";
    tag: string;
    hash: string;
} | {
    type: "event";
    tag: string;
    filter: EventFilter;
} | {
    type: "orphan";
    tag: string;
    filter: OrphanFilter;
};
export interface Subscriber {
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
    pollingInterval?: number;
}
export declare class UnmanagedSubscriber implements Subscriber {
    name: string;
    constructor(name: string);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export interface ProviderPlugin {
    readonly name: string;
    validate(provider: Provider): ProviderPlugin;
}
export declare type PerformActionFilter = {
    address?: string | Array<string>;
    topics?: Array<null | string | Array<string>>;
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
} | {
    address?: string | Array<string>;
    topics?: Array<null | string | Array<string>>;
    blockHash?: string;
};
export interface PerformActionTransaction extends PreparedTransactionRequest {
    to?: string;
    from?: string;
}
export declare type PerformActionRequest = {
    method: "call";
    transaction: PerformActionTransaction;
    blockTag: BlockTag;
} | {
    method: "chainId";
} | {
    method: "estimateGas";
    transaction: PerformActionTransaction;
} | {
    method: "getBalance";
    address: string;
    blockTag: BlockTag;
} | {
    method: "getBlock";
    blockTag: BlockTag;
    includeTransactions: boolean;
} | {
    method: "getBlock";
    blockHash: string;
    includeTransactions: boolean;
} | {
    method: "getBlockNumber";
} | {
    method: "getCode";
    address: string;
    blockTag: BlockTag;
} | {
    method: "getGasPrice";
} | {
    method: "getLogs";
    filter: PerformActionFilter;
} | {
    method: "getStorageAt";
    address: string;
    position: bigint;
    blockTag: BlockTag;
} | {
    method: "getTransaction";
    hash: string;
} | {
    method: "getTransactionCount";
    address: string;
    blockTag: BlockTag;
} | {
    method: "getTransactionReceipt";
    hash: string;
} | {
    method: "getTransactionResult";
    hash: string;
} | {
    method: "broadcastTransaction";
    signedTransaction: string;
};
export declare class AbstractProvider implements Provider {
    #private;
    constructor(_network?: "any" | Networkish);
    get provider(): this;
    get plugins(): Array<ProviderPlugin>;
    attachPlugin(plugin: ProviderPlugin): this;
    getPlugin<T extends ProviderPlugin = ProviderPlugin>(name: string): null | T;
    set disableCcipRead(value: boolean);
    get disableCcipRead(): boolean;
    ccipReadFetch(tx: PerformActionTransaction, calldata: string, urls: Array<string>): Promise<null | string>;
    _wrapBlock(value: BlockParams<string>, network: Network): Block<string>;
    _wrapBlockWithTransactions(value: BlockParams<TransactionResponseParams>, network: Network): Block<TransactionResponse>;
    _wrapLog(value: LogParams, network: Network): Log;
    _wrapTransactionReceipt(value: TransactionReceiptParams, network: Network): TransactionReceipt;
    _wrapTransactionResponse(tx: TransactionResponseParams, network: Network): TransactionResponse;
    _detectNetwork(): Promise<Network>;
    _perform<T = any>(req: PerformActionRequest): Promise<T>;
    getBlockNumber(): Promise<number>;
    _getAddress(address: AddressLike): string | Promise<string>;
    _getBlockTag(blockTag?: BlockTag): string | Promise<string>;
    _getFilter(filter: Filter | FilterByBlockHash): PerformActionFilter | Promise<PerformActionFilter>;
    _getTransactionRequest(_request: TransactionRequest): PerformActionTransaction | Promise<PerformActionTransaction>;
    getNetwork(): Promise<Network>;
    getFeeData(): Promise<FeeData>;
    estimateGas(_tx: TransactionRequest): Promise<bigint>;
    call(_tx: TransactionRequest): Promise<string>;
    getBalance(address: AddressLike, blockTag?: BlockTag): Promise<bigint>;
    getTransactionCount(address: AddressLike, blockTag?: BlockTag): Promise<number>;
    getCode(address: AddressLike, blockTag?: BlockTag): Promise<string>;
    getStorageAt(address: AddressLike, _position: BigNumberish, blockTag?: BlockTag): Promise<string>;
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    getBlock(block: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(block: BlockTag | string): Promise<null | Block<TransactionResponse>>;
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    getTransactionResult(hash: string): Promise<null | string>;
    getLogs(_filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    _getProvider(chainId: number): AbstractProvider;
    getResolver(name: string): Promise<null | EnsResolver>;
    getAvatar(name: string): Promise<null | string>;
    resolveName(name: string): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;
    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block<string>>;
    _clearTimeout(timerId: number): void;
    _setTimeout(_func: () => void, timeout?: number): number;
    _forEachSubscriber(func: (s: Subscriber) => void): void;
    _getSubscriber(sub: Subscription): Subscriber;
    _recoverSubscriber(oldSub: Subscriber, newSub: Subscriber): void;
    on(event: ProviderEvent, listener: Listener): Promise<this>;
    once(event: ProviderEvent, listener: Listener): Promise<this>;
    emit(event: ProviderEvent, ...args: Array<any>): Promise<boolean>;
    listenerCount(event?: ProviderEvent): Promise<number>;
    listeners(event?: ProviderEvent): Promise<Array<Listener>>;
    off(event: ProviderEvent, listener?: Listener): Promise<this>;
    removeAllListeners(event?: ProviderEvent): Promise<this>;
    addListener(event: ProviderEvent, listener: Listener): Promise<this>;
    removeListener(event: ProviderEvent, listener: Listener): Promise<this>;
    shutdown(): Promise<void>;
    get paused(): boolean;
    set paused(pause: boolean);
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
//# sourceMappingURL=abstract-provider.d.ts.map