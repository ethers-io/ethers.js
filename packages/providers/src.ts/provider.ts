//import { resolveAddress } from "@ethersproject/address";
import { hexlify } from "@ethersproject/bytes";
import { defineProperties } from "@ethersproject/properties";
import { accessListify } from "@ethersproject/transaction";

import { logger } from "./logger.js";

import type { Addressable, NameResolver } from "@ethersproject/address";
import type { BigNumberish } from "@ethersproject/logger";
import type { EventEmitterable, Frozen, Listener } from "@ethersproject/properties";
import type { Signature } from "@ethersproject/signing-key";
import type { AccessList, AccessListish, TransactionLike } from "@ethersproject/transaction";

import type { ContractRunner } from "./contracts.js";
import type { Network } from "./network.js";


export type BlockTag = number | string;

// -----------------------

function getValue<T>(value: undefined | null | T): null | T {
    if (value == null) { return null; }
    return value;
}

function toJson(value: null | bigint): null | string {
    if (value == null) { return null; }
    return value.toString();
}

// @TODO? <T extends FeeData = { }> implements Required<T>
export class FeeData {
    readonly gasPrice!: null | bigint;
    readonly maxFeePerGas!: null | bigint;
    readonly maxPriorityFeePerGas!: null | bigint;

    constructor(gasPrice?: null | bigint, maxFeePerGas?: null | bigint, maxPriorityFeePerGas?: null | bigint) {
        defineProperties<FeeData>(this, {
            gasPrice: getValue(gasPrice),
            maxFeePerGas: getValue(maxFeePerGas),
            maxPriorityFeePerGas: getValue(maxPriorityFeePerGas)
        });
    }

    toJSON(): any {
        const {
            gasPrice, maxFeePerGas, maxPriorityFeePerGas
        } = this;
        return {
            _type: "FeeData",
            gasPrice: toJson(gasPrice),
            maxFeePerGas: toJson(maxFeePerGas),
            maxPriorityFeePerGas: toJson(maxPriorityFeePerGas),
        };
    }
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

    // Todo?
    //gasMultiplier?: number;
};


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

export function copyRequest(req: CallRequest): PreparedRequest {
    const result: any = { };

    // These could be addresses, ENS names or Addressables
    if (req.to) { result.to = req.to; }
    if (req.from) { result.from = req.from; }

    if (req.data) { result.data = hexlify(req.data); }

    const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas, maxPriorityFeePerGas,value".split(/,/);
    for (const key in bigIntKeys) {
        if (!(key in req) || (<any>req)[key] == null) { continue; }
        result[key] = logger.getBigInt((<any>req)[key], `request.${ key }`);
    }

    const numberKeys = "type,nonce".split(/,/);
    for (const key in numberKeys) {
        if (!(key in req) || (<any>req)[key] == null) { continue; }
        result[key] = logger.getNumber((<any>req)[key], `request.${ key }`);
    }

    if (req.accessList) {
        result.accessList = accessListify(req.accessList);
    }

    if ("blockTag" in req) { result.blockTag = req.blockTag; }

    if ("enableCcipRead" in req) {
        result.enableCcipReadEnabled = !!req.enableCcipRead
    }

    if ("customData" in req) {
        result.customData = req.customData;
    }

    return result;
}

//Omit<TransactionLike<string | Addressable>, "hash" | "signature">;
/*
export async function resolveTransactionRequest(tx: TransactionRequest, provider?: Provider): Promise<TransactionRequest> {
    // A pending transaction with items that may require resolving
    const ptx: any = Object.assign({ }, tx); //await resolveProperties(await tx));
    //if (tx.hash != null || tx.signature != null) {
    //    throw new Error();
    // @TODO: Check for bad keys?
    //}
    // @TODO: Why does TS not think that to and from are reoslved and require the cast to string
    if (ptx.to != null) { ptx.to = resolveAddress(<string | Addressable>(ptx.to), provider); }
    if (ptx.from != null) { ptx.from = resolveAddress(<string | Addressable>(ptx.from), provider); }
    return await resolveProperties(ptx);
}
*/

//function canConnect<T>(value: any): value is T {
//    return (value && typeof(value.connect) === "function");
//}


//////////////////////
// Block

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
};

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

export class Block<T extends string | TransactionResponse> implements BlockParams<T>, Iterable<T> {
    readonly provider!: Provider;

    readonly number!: number;
    readonly hash!: null | string;
    readonly timestamp!: number;

    readonly parentHash!: string;

    readonly nonce!: string;
    readonly difficulty!: bigint;

    readonly gasLimit!: bigint;
    readonly gasUsed!: bigint;

    readonly miner!: string;
    readonly extraData!: string;

    readonly baseFeePerGas!: null | bigint;

    readonly #transactions: ReadonlyArray<T>;

    constructor(block: BlockParams<T>, provider?: null | Provider) {
        if (provider == null) { provider = dummyProvider; }

        this.#transactions = Object.freeze(block.transactions.map((tx) => {
            if (typeof(tx) !== "string" && tx.provider !== provider) {
                throw new Error("provider mismatch");
            }
            return <T>tx;
        }));;

        defineProperties<Block<T>>(this, {
            provider,

            hash: getValue(block.hash),

            number: block.number,
            timestamp: block.timestamp,

            parentHash: block.parentHash,

            nonce: block.nonce,
            difficulty: block.difficulty,

            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            miner: block.miner,
            extraData: block.extraData,

            baseFeePerGas: getValue(block.baseFeePerGas)
        });
    }

    get transactions(): ReadonlyArray<T> { return this.#transactions; }

    //connect(provider: Provider): Block<T> {
    //    return new Block(this, provider);
    //}

    toJSON(): any {
        const {
            baseFeePerGas, difficulty, extraData, gasLimit, gasUsed, hash,
            miner, nonce, number, parentHash, timestamp, transactions
        } = this;

        return {
            _type: "Block",
            baseFeePerGas: toJson(baseFeePerGas),
            difficulty: toJson(difficulty),
            extraData,
            gasLimit: toJson(gasLimit),
            gasUsed: toJson(gasUsed),
            hash, miner, nonce, number, parentHash, timestamp,
            transactions,
        };
    }

    [Symbol.iterator](): Iterator<T> {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    return {
                        value: this.transactions[index++], done: false
                    }
                }
                return { value: undefined, done: true };
            }
        };
    }

    get length(): number { return this.transactions.length; }

    get date(): null | Date {
        if (this.timestamp == null) { return null; }
        return new Date(this.timestamp * 1000);
    }

    async getTransaction(index: number): Promise<TransactionResponse> {
        const tx = this.transactions[index];
        if (tx == null) { throw new Error("no such tx"); }
        if (typeof(tx) === "string") {
            return <TransactionResponse>(await this.provider.getTransaction(tx));
        } else {
            return tx;
        }
    }

    isMined(): this is MinedBlock<T> { return !!this.hash; }
    isLondon(): this is LondonBlock<T> { return !!this.baseFeePerGas; }

    orphanedEvent(): OrphanFilter {
        if (!this.isMined()) { throw new Error(""); }
        return createOrphanedBlockFilter(this);
    }
}

//////////////////////
// Log

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

export class Log implements LogParams {
    readonly provider: Provider;

    readonly transactionHash!: string;
    readonly blockHash!: string;
    readonly blockNumber!: number;

    readonly removed!: boolean;

    readonly address!: string;
    readonly data!: string;

    readonly topics!: ReadonlyArray<string>;

    readonly index!: number;
    readonly transactionIndex!: number;


    constructor(log: LogParams, provider?: null | Provider) {
        if (provider == null) { provider = dummyProvider; }
        this.provider = provider;

        const topics = Object.freeze(log.topics.slice());
        defineProperties<Log>(this, {
            transactionHash: log.transactionHash,
            blockHash: log.blockHash,
            blockNumber: log.blockNumber,

            removed: log.removed,

            address: log.address,
            data: log.data,

            topics,

            index: log.index,
            transactionIndex: log.transactionIndex,
        });
    }

    //connect(provider: Provider): Log {
    //    return new Log(this, provider);
    //}

    toJSON(): any {
        const {
            address, blockHash, blockNumber, data, index,
            removed, topics, transactionHash, transactionIndex
        } = this;

        return {
            _type: "log",
            address, blockHash, blockNumber, data, index,
            removed, topics, transactionHash, transactionIndex
        };
    }

    async getBlock(): Promise<Block<string>> {
        return <Block<string>>(await this.provider.getBlock(this.blockHash));
    }

    async getTransaction(): Promise<TransactionResponse> {
        return <TransactionResponse>(await this.provider.getTransaction(this.transactionHash));
    }

    async getTransactionReceipt(): Promise<TransactionReceipt> {
        return <TransactionReceipt>(await this.provider.getTransactionReceipt(this.transactionHash));
    }

    removedEvent(): OrphanFilter {
        return createRemovedLogFilter(this);
    }
}


//////////////////////
// Transaction Receipt

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

export class TransactionReceipt implements TransactionReceiptParams, Iterable<Log> {
    readonly provider!: Provider;

    readonly to!: null | string;
    readonly from!: string;
    readonly contractAddress!: null | string;

    readonly hash!: string;
    readonly index!: number;

    readonly blockHash!: string;
    readonly blockNumber!: number;

    readonly logsBloom!: string;

    readonly gasUsed!: bigint;
    readonly cumulativeGasUsed!: bigint;
    readonly gasPrice!: bigint;

    readonly byzantium!: boolean;
    readonly status!: null | number;
    readonly root!: null | string;

    readonly #logs: ReadonlyArray<Log>;

    constructor(tx: TransactionReceiptParams, provider?: null | Provider) {
        if (provider == null) { provider = dummyProvider; }
        this.#logs = Object.freeze(tx.logs.map((log) => {
            if (provider !== log.provider) {
            //return log.connect(provider);
                throw new Error("provider mismatch");
            }
            return log;
        }));

        defineProperties<TransactionReceipt>(this, {
            provider,

            to: tx.to,
            from: tx.from,
            contractAddress: tx.contractAddress,

            hash: tx.hash,
            index: tx.index,

            blockHash: tx.blockHash,
            blockNumber: tx.blockNumber,

            logsBloom: tx.logsBloom,

            gasUsed: tx.gasUsed,
            cumulativeGasUsed: tx.cumulativeGasUsed,
            gasPrice: ((tx.effectiveGasPrice || tx.gasPrice) as bigint),

            byzantium: tx.byzantium,
            status: tx.status,
            root: tx.root
        });
    }

    get logs(): ReadonlyArray<Log> { return this.#logs; }

    //connect(provider: Provider): TransactionReceipt {
    //    return new TransactionReceipt(this, provider);
    //}

    toJSON(): any {
        const {
            to, from, contractAddress, hash, index, blockHash, blockNumber, logsBloom,
            logs, byzantium, status, root
        } = this;

        return {
            _type: "TransactionReceipt",
            blockHash, blockNumber, byzantium, contractAddress,
            cumulativeGasUsed: toJson(this.cumulativeGasUsed),
            from,
            gasPrice: toJson(this.gasPrice),
            gasUsed: toJson(this.gasUsed),
            hash, index, logs, logsBloom, root, status, to
        };
    }

    get length(): number { return this.logs.length; }

    [Symbol.iterator](): Iterator<Log> {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    return { value: this.logs[index++], done: false }
                }
                return { value: undefined, done: true };
            }
        };
    }

    get fee(): bigint {
        return this.gasUsed * this.gasPrice;
    }

    async getBlock(): Promise<Block<string>> {
        const block = await this.provider.getBlock(this.blockHash);
        if (block == null) { throw new Error("TODO"); }
        return block;
    }

    async getTransaction(): Promise<TransactionResponse> {
        const tx = await this.provider.getTransaction(this.hash);
        if (tx == null) { throw new Error("TODO"); }
        return tx;
    }

    async confirmations(): Promise<number> {
        return (await this.provider.getBlockNumber()) - this.blockNumber + 1;
    }

    removedEvent(): OrphanFilter {
        return createRemovedTransactionFilter(this);
    }

    reorderedEvent(other?: TransactionResponse): OrphanFilter {
        if (other && !other.isMined()) {
            return logger.throwError("unmined 'other' transction cannot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "reorderedEvent(other)" });
        }
        return createReorderedTransactionFilter(this, other);
    }
}


//////////////////////
// Transaction Response

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
};

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

export class TransactionResponse implements TransactionLike<string>, TransactionResponseParams {
    readonly provider: Provider;

    readonly blockNumber: null | number;
    readonly blockHash: null | string;

    readonly index!: number;

    readonly hash!: string;

    readonly type!: number;

    readonly to!: null | string;
    readonly from!: string;

    readonly nonce!: number;

    readonly gasLimit!: bigint;

    readonly gasPrice!: bigint;

    readonly maxPriorityFeePerGas!: null | bigint;
    readonly maxFeePerGas!: null | bigint;

    readonly data!: string;
    readonly value!: bigint;
    readonly chainId!: bigint;

    readonly signature!: Signature;

    readonly accessList!: null | AccessList;

    constructor(tx: TransactionResponseParams, provider?: null | Provider) {
        if (provider == null) { provider = dummyProvider; }
        this.provider = provider;

        this.blockNumber = (tx.blockNumber != null) ? tx.blockNumber: null;
        this.blockHash = (tx.blockHash != null) ? tx.blockHash: null;

        this.hash = tx.hash;
        this.index = tx.index;

        this.type = tx.type;

        this.from = tx.from;
        this.to = tx.to || null;

        this.gasLimit = tx.gasLimit;
        this.nonce = tx.nonce;
        this.data = tx.data;
        this.value = tx.value;

        this.gasPrice = tx.gasPrice;
        this.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas != null) ? tx.maxPriorityFeePerGas: null;
        this.maxFeePerGas = (tx.maxFeePerGas != null) ? tx.maxFeePerGas: null;

        this.chainId = tx.chainId;
        this.signature = tx.signature;

        this.accessList = (tx.accessList != null) ? tx.accessList: null;
    }

    //connect(provider: Provider): TransactionResponse {
    //    return new TransactionResponse(this, provider);
    //}

    toJSON(): any {
        const {
            blockNumber, blockHash, index, hash, type, to, from, nonce,
            data, signature, accessList
        } = this;

        return {
            _type: "TransactionReceipt",
            accessList, blockNumber, blockHash,
            chainId: toJson(this.chainId),
            data, from,
            gasLimit: toJson(this.gasLimit),
            gasPrice: toJson(this.gasPrice),
            hash,
            maxFeePerGas: toJson(this.maxFeePerGas),
            maxPriorityFeePerGas: toJson(this.maxPriorityFeePerGas),
            nonce, signature, to, index, type,
            value: toJson(this.value),
        };
    }

    async getBlock(): Promise<null | Block<string>> {
        let blockNumber = this.blockNumber;
        if (blockNumber == null) {
            const tx = await this.getTransaction();
            if (tx) { blockNumber = tx.blockNumber; }
        }
        if (blockNumber == null) { return null; }
        const block = this.provider.getBlock(blockNumber);
        if (block == null) { throw new Error("TODO"); }
        return block;
    }

    async getTransaction(): Promise<null | TransactionResponse> {
        return this.provider.getTransaction(this.hash);
    }

    async wait(confirms?: number): Promise<null | TransactionReceipt> {
        return this.provider.waitForTransaction(this.hash, confirms);
    }

    isMined(): this is MinedTransactionResponse {
        return (this.blockHash != null);
    }

    isLegacy(): this is LegacyTransactionResponse {
        return (this.type === 0)
    }

    isBerlin(): this is BerlinTransactionResponse {
        return (this.type === 1);
    }

    isLondon(): this is LondonTransactionResponse {
        return (this.type === 2);
    }

    removedEvent(): OrphanFilter {
        if (!this.isMined()) {
            return logger.throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        return createRemovedTransactionFilter(this);
    }

    reorderedEvent(other?: TransactionResponse): OrphanFilter {
        if (!this.isMined()) {
            return logger.throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        if (other && !other.isMined()) {
            return logger.throwError("unmined 'other' transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        return createReorderedTransactionFilter(this, other);
    }
}


//////////////////////
// OrphanFilter

export type OrphanFilter = {
    orphan: "drop-block",
    hash: string,
    number: number
} | {
    orphan: "drop-transaction",
    tx: { hash: string, blockHash: string, blockNumber: number },
    other?: { hash: string, blockHash: string, blockNumber: number }
} | {
    orphan: "reorder-transaction",
    tx: { hash: string, blockHash: string, blockNumber: number },
    other?: { hash: string, blockHash: string, blockNumber: number }
} | {
    orphan: "drop-log",
    log: {
        transactionHash: string,
        blockHash: string,
        blockNumber: number,
        address: string,
        data: string,
        topics: ReadonlyArray<string>,
        index: number
    }
};

function createOrphanedBlockFilter(block: { hash: string, number: number }): OrphanFilter {
    return { orphan: "drop-block", hash: block.hash, number: block.number };
}

function createReorderedTransactionFilter(tx: { hash: string, blockHash: string, blockNumber: number }, other?: { hash: string, blockHash: string, blockNumber: number }): OrphanFilter {
    return { orphan: "reorder-transaction", tx, other };
}

function createRemovedTransactionFilter(tx: { hash: string, blockHash: string, blockNumber: number }): OrphanFilter {
    return { orphan: "drop-transaction", tx };
}

function createRemovedLogFilter(log: { blockHash: string, transactionHash: string, blockNumber: number, address: string, data: string, topics: ReadonlyArray<string>, index: number }): OrphanFilter {
    return { orphan: "drop-log", log: {
        transactionHash: log.transactionHash,
        blockHash: log.blockHash,
        blockNumber: log.blockNumber,
        address: log.address,
        data: log.data,
        topics: Object.freeze(log.topics.slice()),
        index: log.index
    } };
}

//////////////////////
// EventFilter

export type TopicFilter = Array<null | string | Array<string>>;

// @TODO:
//export type DeferableTopicFilter = Array<null | string | Promise<string> | Array<string | Promise<string>>>;

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


//////////////////////
// ProviderEvent

export type ProviderEvent = string | Array<string | Array<string>> | EventFilter | OrphanFilter;


//////////////////////
// Provider

export interface Provider extends ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {
    provider: this;

    // State
    getBlockNumber(): Promise<number>;
    getNetwork(): Promise<Frozen<Network>>;
    getFeeData(): Promise<FeeData>;

    // Account
    getBalanceOf(address: string | Addressable, blockTag?: BlockTag): Promise<bigint>;
    getTransactionCountOf(address: string | Addressable, blockTag?: BlockTag): Promise<number>;

    getCode(address: string | Addressable, blockTag?: BlockTag): Promise<string>
    getStorageAt(address: string | Addressable, position: BigNumberish, blockTag?: BlockTag): Promise<string>

    // Execution
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    // If call fails, throws CALL_EXCEPTION { data: string, error, errorString?, panicReason? }
    call(tx: CallRequest): Promise<string>
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;

    // Queries
    getBlock(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<TransactionResponse>>
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;

    // Bloom-filter Queries
    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;

    // ENS
    resolveName(name: string | Addressable): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;

    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block<string>>;
}


function fail<T>(): T {
    throw new Error("this provider should not be used");
}

class DummyProvider implements Provider {
    get provider(): this { return this; }

    async getNetwork() { return fail<Frozen<Network>>(); }
    async getFeeData() { return fail<FeeData>(); }

    async estimateGas(tx: TransactionRequest) { return fail<bigint>(); }
    async call(tx: CallRequest) { return fail<string>(); }

    async resolveName(name: string | Addressable) { return fail<null | string>(); }

    // State
    async getBlockNumber() { return fail<number>(); }

    // Account
    async getBalanceOf(address: string | Addressable, blockTag?: BlockTag) {
        return fail<bigint>();
    }
    async getTransactionCountOf(address: string | Addressable, blockTag?: BlockTag) {
        return fail<number>();
    }

    async getCode(address: string | Addressable, blockTag?: BlockTag) {
        return fail<string>();
    }
    async getStorageAt(address: string | Addressable, position: BigNumberish, blockTag?: BlockTag) {
        return fail<string>();
    }

    // Write
    async broadcastTransaction(signedTx: string) { return fail<TransactionResponse>(); }

    // Queries
    async getBlock(blockHashOrBlockTag: BlockTag | string){
        return fail<null | Block<string>>();
    }
    async getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string) {
        return fail<null | Block<TransactionResponse>>();
    }
    async getTransaction(hash: string) {
        return fail<null | TransactionResponse>();
    }
    async getTransactionReceipt(hash: string) {
        return fail<null | TransactionReceipt>();
    }

    // Bloom-filter Queries
    async getLogs(filter: Filter | FilterByBlockHash) {
        return fail<Array<Log>>();
    }

    // ENS
    async lookupAddress(address: string) {
        return fail<null | string>();
    }

    async waitForTransaction(hash: string, confirms?: number, timeout?: number) {
        return fail<null | TransactionReceipt>();
    }

    async waitForBlock(blockTag?: BlockTag) {
        return fail<Block<string>>();
    }

    // EventEmitterable
    async on(event: ProviderEvent, listener: Listener): Promise<this> { return fail(); }
    async once(event: ProviderEvent, listener: Listener): Promise<this> { return fail(); }
    async emit(event: ProviderEvent, ...args: Array<any>): Promise<boolean> { return fail(); }
    async listenerCount(event?: ProviderEvent): Promise<number> { return fail(); }
    async listeners(event?: ProviderEvent): Promise<Array<Listener>> { return fail(); }
    async off(event: ProviderEvent, listener?: Listener): Promise<this> { return fail(); }
    async removeAllListeners(event?: ProviderEvent): Promise<this> { return fail(); }

    async addListener(event: ProviderEvent, listener: Listener): Promise<this> { return fail(); }
    async removeListener(event: ProviderEvent, listener: Listener): Promise<this> { return fail(); }
}

// A singleton provider instance that can be used as a placeholder. This
// allows API that have a Provider added later to not require a null check.
export const dummyProvider: Provider = new DummyProvider();
