import type { Addressable, NameResolver } from "@ethersproject/address";
import type { BigNumberish } from "@ethersproject/logger";
import type { EventEmitterable, Frozen } from "@ethersproject/properties";
import type { Signature } from "@ethersproject/signing-key";
import type { AccessList, AccessListish, TransactionLike } from "@ethersproject/transactions";
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
    to?: null | string | Addressable;
    from?: null | string | Addressable;
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
    to?: string | Addressable;
    from?: string | Addressable;
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
    address?: string | Addressable | Array<string | Addressable>;
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
export interface Provider extends EventEmitterable<ProviderEvent>, NameResolver {
    getBlockNumber(): Promise<number>;
    getNetwork(): Promise<Frozen<Network>>;
    getFeeData(): Promise<FeeData>;
    getBalanceOf(address: string | Addressable, blockTag?: BlockTag): Promise<bigint>;
    getTransactionCountOf(address: string | Addressable, blockTag?: BlockTag): Promise<number>;
    getCode(address: string | Addressable, blockTag?: BlockTag): Promise<string>;
    getStorageAt(address: string | Addressable, position: BigNumberish, blockTag?: BlockTag): Promise<string>;
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    call(tx: CallRequest): Promise<string>;
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;
    getBlock(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<TransactionResponse>>;
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;
    resolveName(name: string | Addressable): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;
    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block<string>>;
}
export declare const dummyProvider: Provider;
//# sourceMappingURL=provider.d.ts.map