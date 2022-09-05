import type { AddressLike, NameResolver } from "../address/index.js";
import type { BigNumberish, EventEmitterable, Frozen } from "../utils/index.js";
import type { Signature } from "../crypto/index.js";
import type { AccessList, AccessListish, TransactionLike } from "../transaction/index.js";
import type { ContractRunner } from "./contracts.js";
import type { Network } from "./network.js";
export declare type BlockTag = number | string;
export declare class FeeData {
    readonly gasPrice: null | bigint;
    readonly maxFeePerGas: null | bigint;
    readonly maxPriorityFeePerGas: null | bigint;
    constructor(gasPrice?: null | bigint, maxFeePerGas?: null | bigint, maxPriorityFeePerGas?: null | bigint);
    toJSON(): any;
}
export interface TransactionRequest {
    type?: null | number;
    to?: null | AddressLike;
    from?: null | AddressLike;
    nonce?: null | number;
    gasLimit?: null | BigNumberish;
    gasPrice?: null | BigNumberish;
    maxPriorityFeePerGas?: null | BigNumberish;
    maxFeePerGas?: null | BigNumberish;
    data?: null | string;
    value?: null | BigNumberish;
    chainId?: null | BigNumberish;
    accessList?: null | AccessListish;
    customData?: any;
}
export interface CallRequest extends TransactionRequest {
    blockTag?: BlockTag;
    enableCcipRead?: boolean;
}
export interface PreparedRequest {
    type?: number;
    to?: AddressLike;
    from?: AddressLike;
    nonce?: number;
    gasLimit?: bigint;
    gasPrice?: bigint;
    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;
    data?: string;
    value?: bigint;
    chainId?: bigint;
    accessList?: AccessList;
    customData?: any;
    blockTag?: BlockTag;
    enableCcipRead?: boolean;
}
export declare function copyRequest(req: CallRequest): PreparedRequest;
export interface BlockParams<T extends string | TransactionResponse> {
    hash?: null | string;
    number: number;
    timestamp: number;
    parentHash: string;
    nonce: string;
    difficulty: bigint;
    gasLimit: bigint;
    gasUsed: bigint;
    miner: string;
    extraData: string;
    baseFeePerGas: null | bigint;
    transactions: ReadonlyArray<T>;
}
export interface MinedBlock<T extends string | TransactionResponse = string> extends Block<T> {
    readonly number: number;
    readonly hash: string;
    readonly timestamp: number;
    readonly date: Date;
    readonly miner: string;
}
export interface LondonBlock<T extends string | TransactionResponse> extends Block<T> {
    readonly baseFeePerGas: bigint;
}
export declare class Block<T extends string | TransactionResponse> implements BlockParams<T>, Iterable<T> {
    #private;
    readonly provider: Provider;
    readonly number: number;
    readonly hash: null | string;
    readonly timestamp: number;
    readonly parentHash: string;
    readonly nonce: string;
    readonly difficulty: bigint;
    readonly gasLimit: bigint;
    readonly gasUsed: bigint;
    readonly miner: string;
    readonly extraData: string;
    readonly baseFeePerGas: null | bigint;
    constructor(block: BlockParams<T>, provider?: null | Provider);
    get transactions(): ReadonlyArray<T>;
    toJSON(): any;
    [Symbol.iterator](): Iterator<T>;
    get length(): number;
    get date(): null | Date;
    getTransaction(index: number): Promise<TransactionResponse>;
    isMined(): this is MinedBlock<T>;
    isLondon(): this is LondonBlock<T>;
    orphanedEvent(): OrphanFilter;
}
export interface LogParams {
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    removed: boolean;
    address: string;
    data: string;
    topics: ReadonlyArray<string>;
    index: number;
    transactionIndex: number;
}
export declare class Log implements LogParams {
    readonly provider: Provider;
    readonly transactionHash: string;
    readonly blockHash: string;
    readonly blockNumber: number;
    readonly removed: boolean;
    readonly address: string;
    readonly data: string;
    readonly topics: ReadonlyArray<string>;
    readonly index: number;
    readonly transactionIndex: number;
    constructor(log: LogParams, provider?: null | Provider);
    toJSON(): any;
    getBlock(): Promise<Block<string>>;
    getTransaction(): Promise<TransactionResponse>;
    getTransactionReceipt(): Promise<TransactionReceipt>;
    removedEvent(): OrphanFilter;
}
export interface TransactionReceiptParams {
    to: null | string;
    from: string;
    contractAddress: null | string;
    hash: string;
    index: number;
    blockHash: string;
    blockNumber: number;
    logsBloom: string;
    logs: ReadonlyArray<Log>;
    gasUsed: bigint;
    cumulativeGasUsed: bigint;
    gasPrice?: null | bigint;
    effectiveGasPrice?: null | bigint;
    byzantium: boolean;
    status: null | number;
    root: null | string;
}
export interface LegacyTransactionReceipt {
    byzantium: false;
    status: null;
    root: string;
}
export interface ByzantiumTransactionReceipt {
    byzantium: true;
    status: number;
    root: null;
}
export declare class TransactionReceipt implements TransactionReceiptParams, Iterable<Log> {
    #private;
    readonly provider: Provider;
    readonly to: null | string;
    readonly from: string;
    readonly contractAddress: null | string;
    readonly hash: string;
    readonly index: number;
    readonly blockHash: string;
    readonly blockNumber: number;
    readonly logsBloom: string;
    readonly gasUsed: bigint;
    readonly cumulativeGasUsed: bigint;
    readonly gasPrice: bigint;
    readonly byzantium: boolean;
    readonly status: null | number;
    readonly root: null | string;
    constructor(tx: TransactionReceiptParams, provider?: null | Provider);
    get logs(): ReadonlyArray<Log>;
    toJSON(): any;
    get length(): number;
    [Symbol.iterator](): Iterator<Log>;
    get fee(): bigint;
    getBlock(): Promise<Block<string>>;
    getTransaction(): Promise<TransactionResponse>;
    confirmations(): Promise<number>;
    removedEvent(): OrphanFilter;
    reorderedEvent(other?: TransactionResponse): OrphanFilter;
}
export interface TransactionResponseParams {
    blockNumber: null | number;
    blockHash: null | string;
    hash: string;
    index: number;
    type: number;
    to: null | string;
    from: string;
    nonce: number;
    gasLimit: bigint;
    gasPrice: bigint;
    maxPriorityFeePerGas: null | bigint;
    maxFeePerGas: null | bigint;
    data: string;
    value: bigint;
    chainId: bigint;
    signature: Signature;
    accessList: null | AccessList;
}
export interface MinedTransactionResponse extends TransactionResponse {
    blockNumber: number;
    blockHash: string;
    date: Date;
}
export interface LegacyTransactionResponse extends TransactionResponse {
    accessList: null;
    maxFeePerGas: null;
    maxPriorityFeePerGas: null;
}
export interface BerlinTransactionResponse extends TransactionResponse {
    accessList: AccessList;
    maxFeePerGas: null;
    maxPriorityFeePerGas: null;
}
export interface LondonTransactionResponse extends TransactionResponse {
    accessList: AccessList;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}
export declare class TransactionResponse implements TransactionLike<string>, TransactionResponseParams {
    readonly provider: Provider;
    readonly blockNumber: null | number;
    readonly blockHash: null | string;
    readonly index: number;
    readonly hash: string;
    readonly type: number;
    readonly to: null | string;
    readonly from: string;
    readonly nonce: number;
    readonly gasLimit: bigint;
    readonly gasPrice: bigint;
    readonly maxPriorityFeePerGas: null | bigint;
    readonly maxFeePerGas: null | bigint;
    readonly data: string;
    readonly value: bigint;
    readonly chainId: bigint;
    readonly signature: Signature;
    readonly accessList: null | AccessList;
    constructor(tx: TransactionResponseParams, provider?: null | Provider);
    toJSON(): any;
    getBlock(): Promise<null | Block<string>>;
    getTransaction(): Promise<null | TransactionResponse>;
    wait(confirms?: number): Promise<null | TransactionReceipt>;
    isMined(): this is MinedTransactionResponse;
    isLegacy(): this is LegacyTransactionResponse;
    isBerlin(): this is BerlinTransactionResponse;
    isLondon(): this is LondonTransactionResponse;
    removedEvent(): OrphanFilter;
    reorderedEvent(other?: TransactionResponse): OrphanFilter;
}
export declare type OrphanFilter = {
    orphan: "drop-block";
    hash: string;
    number: number;
} | {
    orphan: "drop-transaction";
    tx: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
    other?: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
} | {
    orphan: "reorder-transaction";
    tx: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
    other?: {
        hash: string;
        blockHash: string;
        blockNumber: number;
    };
} | {
    orphan: "drop-log";
    log: {
        transactionHash: string;
        blockHash: string;
        blockNumber: number;
        address: string;
        data: string;
        topics: ReadonlyArray<string>;
        index: number;
    };
};
export declare type TopicFilter = Array<null | string | Array<string>>;
export interface EventFilter {
    address?: AddressLike | Array<AddressLike>;
    topics?: TopicFilter;
}
export interface Filter extends EventFilter {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
}
export interface FilterByBlockHash extends EventFilter {
    blockHash?: string;
}
export declare type ProviderEvent = string | Array<string | Array<string>> | EventFilter | OrphanFilter;
export interface Provider extends ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {
    provider: this;
    /**
     *  Get the current block number.
     */
    getBlockNumber(): Promise<number>;
    /**
     *  Get the connected [[Network]].
     */
    getNetwork(): Promise<Frozen<Network>>;
    /**
     *  Get the best guess at the recommended [[FeeData]].
     */
    getFeeData(): Promise<FeeData>;
    /**
     *  Get the account balance (in wei) of %%address%%. If %%blockTag%% is specified and
     *  the node supports archive access, the balance is as of that [[BlockTag]].
     *
     *  @param {Address | Addressable} address - The account to lookup the balance of
     *  @param blockTag - The block tag to use for historic archive access. [default: ``"latest"``]
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getBalance(address: AddressLike, blockTag?: BlockTag): Promise<bigint>;
    /**
     *  Get the number of transactions ever sent for %%address%%, which is used as
     *  the ``nonce`` when sending a transaction. If %%blockTag%% is specified and
     *  the node supports archive access, the transaction count is as of that [[BlockTag]].
     *
     *  @param {Address | Addressable} address - The account to lookup the transaction count of
     *  @param blockTag - The block tag to use for historic archive access. [default: ``"latest"``]
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getTransactionCount(address: AddressLike, blockTag?: BlockTag): Promise<number>;
    /**
     *  Get the bytecode for //address//.
     *
     *  @param {Address | Addressable} address - The account to lookup the bytecode of
     *  @param blockTag - The block tag to use for historic archive access. [default: ``"latest"``]
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getCode(address: AddressLike, blockTag?: BlockTag): Promise<string>;
    /**
     *  Get the storage slot value for a given //address// and slot //position//.
     *
     *  @param {Address | Addressable} address - The account to lookup the storage of
     *  @param position - The storage slot to fetch the value of
     *  @param blockTag - The block tag to use for historic archive access. [default: ``"latest"``]
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getStorageAt(address: AddressLike, position: BigNumberish, blockTag?: BlockTag): Promise<string>;
    /**
     *  Estimates the amount of gas required to executre %%tx%%.
     *
     *  @param tx - The transaction to estimate the gas requirement for
     */
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    /**
     *  Uses call to simulate execution of %%tx%%.
     *
     *  @param tx - The transaction to simulate
     */
    call(tx: CallRequest): Promise<string>;
    /**
     *  Broadcasts the %%signedTx%% to the network, adding it to the memory pool
     *  of any node for which the transaction meets the rebroadcast requirements.
     *
     *  @param signedTx - The transaction to broadcast
     */
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    getBlock(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<TransactionResponse>>;
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    resolveName(name: string): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;
    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block<string>>;
}
/**
 *  A singleton [[Provider]] instance that can be used as a placeholder. This
 *  allows API that have a Provider added later to not require a null check.
 *
 *  All operations performed on this [[Provider]] will throw.
 */
export declare const dummyProvider: Provider;
//# sourceMappingURL=provider.d.ts.map