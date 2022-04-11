import { EnsResolver } from "./ens-resolver.js";
import { Network } from "./network.js";
import { Block, FeeData, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import type { Addressable } from "@ethersproject/address";
import type { BigNumberish } from "@ethersproject/logger";
import type { Frozen, Listener } from "@ethersproject/properties";
import type { AccessList } from "@ethersproject/transactions";
import type { Networkish } from "./network.js";
import type { BlockTag, CallRequest, EventFilter, Filter, FilterByBlockHash, OrphanFilter, Provider, ProviderEvent, TransactionRequest } from "./provider.js";
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
    blockHash?: string;
};
export declare type PerformActionTransaction = {
    type?: number;
    to?: string;
    from?: string;
    nonce?: number;
    gasLimit?: bigint;
    gasPrice?: bigint;
    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;
    data?: string;
    value?: bigint;
    chainId?: bigint;
    accessList?: AccessList;
};
export declare function copyRequest<T extends PerformActionTransaction>(tx: T): T;
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
    method: "sendTransaction";
    signedTransaction: string;
};
export declare class AbstractProvider implements Provider {
    #private;
    constructor(_network?: "any" | Networkish);
    get plugins(): Array<ProviderPlugin>;
    attachPlugin(plugin: ProviderPlugin): this;
    getPlugin<T extends ProviderPlugin = ProviderPlugin>(name: string): null | T;
    set disableCcipRead(value: boolean);
    get disableCcipRead(): boolean;
    ccipReadFetch(tx: PerformActionTransaction, calldata: string, urls: Array<string>): Promise<null | string>;
    _wrapTransaction(tx: TransactionResponse, hash: string, blockNumber: number): TransactionResponse;
    _detectNetwork(): Promise<Frozen<Network>>;
    _perform<T = any>(req: PerformActionRequest): Promise<T>;
    getBlockNumber(): Promise<number>;
    _getAddress(address: string | Addressable): Promise<string>;
    _getBlockTag(blockTag?: BlockTag): Promise<string>;
    getNetwork(): Promise<Frozen<Network>>;
    getFeeData(): Promise<FeeData>;
    _getTransaction(_request: CallRequest): Promise<PerformActionTransaction>;
    estimateGas(_tx: TransactionRequest): Promise<bigint>;
    call(_tx: CallRequest): Promise<string>;
    getBalanceOf(_address: string | Addressable, _blockTag?: BlockTag): Promise<bigint>;
    getTransactionCountOf(_address: string | Addressable, _blockTag?: BlockTag): Promise<number>;
    getCode(_address: string | Addressable, _blockTag?: BlockTag): Promise<string>;
    getStorageAt(_address: string | Addressable, _position: BigNumberish, _blockTag?: BlockTag): Promise<string>;
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    getBlock(block: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(block: BlockTag | string): Promise<null | Block<TransactionResponse>>;
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    _getFilter(filter: Filter | FilterByBlockHash): Promise<PerformActionFilter>;
    getLogs(_filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    _getProvider(chainId: number): AbstractProvider;
    getResolver(name: string): Promise<null | EnsResolver>;
    getAvatar(name: string): Promise<null | string>;
    resolveName(name: string | Addressable): Promise<null | string>;
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
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
//# sourceMappingURL=abstract-provider.d.ts.map