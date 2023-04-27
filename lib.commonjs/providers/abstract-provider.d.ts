/**
 *  About Subclassing the Provider...
 *
 *  @_section: api/providers/abstract-provider: Subclassing Provider  [abstract-provider]
 */
import { FetchRequest } from "../utils/index.js";
import { EnsResolver } from "./ens-resolver.js";
import { Network } from "./network.js";
import { Block, FeeData, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import type { AddressLike } from "../address/index.js";
import type { BigNumberish } from "../utils/index.js";
import type { Listener } from "../utils/index.js";
import type { Networkish } from "./network.js";
import type { BlockParams, LogParams, TransactionReceiptParams, TransactionResponseParams } from "./formatting.js";
import type { BlockTag, EventFilter, Filter, FilterByBlockHash, OrphanFilter, PreparedTransactionRequest, Provider, ProviderEvent, TransactionRequest } from "./provider.js";
export type DebugEventAbstractProvider = {
    action: "sendCcipReadFetchRequest";
    request: FetchRequest;
    index: number;
    urls: Array<string>;
} | {
    action: "receiveCcipReadFetchResult";
    request: FetchRequest;
    result: any;
} | {
    action: "receiveCcipReadFetchError";
    request: FetchRequest;
    result: any;
} | {
    action: "sendCcipReadCall";
    transaction: {
        to: string;
        data: string;
    };
} | {
    action: "receiveCcipReadCallResult";
    transaction: {
        to: string;
        data: string;
    };
    result: string;
} | {
    action: "receiveCcipReadCallError";
    transaction: {
        to: string;
        data: string;
    };
    error: Error;
};
export type Subscription = {
    type: "block" | "close" | "debug" | "error" | "network" | "pending";
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
export interface AbstractProviderPlugin {
    readonly name: string;
    connect(provider: AbstractProvider): AbstractProviderPlugin;
}
export type PerformActionFilter = {
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
export type PerformActionRequest = {
    method: "broadcastTransaction";
    signedTransaction: string;
} | {
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
    method: "getStorage";
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
};
export declare class AbstractProvider implements Provider {
    #private;
    constructor(_network?: "any" | Networkish);
    get provider(): this;
    get plugins(): Array<AbstractProviderPlugin>;
    attachPlugin(plugin: AbstractProviderPlugin): this;
    getPlugin<T extends AbstractProviderPlugin = AbstractProviderPlugin>(name: string): null | T;
    get disableCcipRead(): boolean;
    set disableCcipRead(value: boolean);
    ccipReadFetch(tx: PerformActionTransaction, calldata: string, urls: Array<string>): Promise<null | string>;
    _wrapBlock(value: BlockParams, network: Network): Block;
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
    getStorage(address: AddressLike, _position: BigNumberish, blockTag?: BlockTag): Promise<string>;
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    getBlock(block: BlockTag | string, prefetchTxs?: boolean): Promise<null | Block>;
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    getTransactionResult(hash: string): Promise<null | string>;
    getLogs(_filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    _getProvider(chainId: number): AbstractProvider;
    getResolver(name: string): Promise<null | EnsResolver>;
    getAvatar(name: string): Promise<null | string>;
    resolveName(name: string): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;
    waitForTransaction(hash: string, _confirms?: null | number, timeout?: null | number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block>;
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
    destroy(): void;
    get paused(): boolean;
    set paused(pause: boolean);
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
//# sourceMappingURL=abstract-provider.d.ts.map