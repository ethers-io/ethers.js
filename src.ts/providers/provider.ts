//import { resolveAddress } from "@ethersproject/address";
import {
    defineProperties, getBigInt, getNumber, hexlify, resolveProperties,
    assertArgument, isError, makeError, throwError
} from "../utils/index.js";
import { accessListify } from "../transaction/index.js";

import type { AddressLike, NameResolver } from "../address/index.js";
import type { BigNumberish, EventEmitterable } from "../utils/index.js";
import type { Signature } from "../crypto/index.js";
import type { AccessList, AccessListish, TransactionLike } from "../transaction/index.js";

import type { ContractRunner } from "./contracts.js";
import type { Network } from "./network.js";


const BN_0 = BigInt(0);

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

    // Only meaningful when used for call
    blockTag?: BlockTag;
    enableCcipRead?: boolean;

    // Todo?
    //gasMultiplier?: number;
};

export interface PreparedTransactionRequest {
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

export function copyRequest(req: TransactionRequest): PreparedTransactionRequest {
    const result: any = { };

    // These could be addresses, ENS names or Addressables
    if (req.to) { result.to = req.to; }
    if (req.from) { result.from = req.from; }

    if (req.data) { result.data = hexlify(req.data); }

    const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas, maxPriorityFeePerGas,value".split(/,/);
    for (const key of bigIntKeys) {
        if (!(key in req) || (<any>req)[key] == null) { continue; }
        result[key] = getBigInt((<any>req)[key], `request.${ key }`);
    }

    const numberKeys = "type,nonce".split(/,/);
    for (const key of numberKeys) {
        if (!(key in req) || (<any>req)[key] == null) { continue; }
        result[key] = getNumber((<any>req)[key], `request.${ key }`);
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

export interface BlockParams<T extends string | TransactionResponseParams> {
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

    constructor(block: BlockParams<T>, provider: Provider) {

        this.#transactions = Object.freeze(block.transactions.map((tx) => {
            if (typeof(tx) !== "string" && tx.provider !== provider) {
                return <T>(new TransactionResponse(tx, provider));
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
    isLondon(): this is (Block<T> & { baseFeePerGas: bigint }) {
        return !!this.baseFeePerGas;
    }

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


    constructor(log: LogParams, provider: Provider) {
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
    logs: ReadonlyArray<LogParams>;

    gasUsed: bigint;
    cumulativeGasUsed: bigint;
    gasPrice?: null | bigint;
    effectiveGasPrice?: null | bigint;

    type: number;
    //byzantium: boolean;
    status: null | number;
    root: null | string;
}

/*
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
*/

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

    readonly type!: number;
    //readonly byzantium!: boolean;
    readonly status!: null | number;
    readonly root!: null | string;

    readonly #logs: ReadonlyArray<Log>;

    constructor(tx: TransactionReceiptParams, provider: Provider) {
        this.#logs = Object.freeze(tx.logs.map((log) => {
            return new Log(log, provider);
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

            type: tx.type,
            //byzantium: tx.byzantium,
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
            logs, //byzantium, 
            status, root
        } = this;

        return {
            _type: "TransactionReceipt",
            blockHash, blockNumber,
            //byzantium, 
            contractAddress,
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

    async getResult(): Promise<string> {
        return <string>(await this.provider.getTransactionResult(this.hash));
    }

    async confirmations(): Promise<number> {
        return (await this.provider.getBlockNumber()) - this.blockNumber + 1;
    }

    removedEvent(): OrphanFilter {
        return createRemovedTransactionFilter(this);
    }

    reorderedEvent(other?: TransactionResponse): OrphanFilter {
        if (other && !other.isMined()) {
            return throwError("unmined 'other' transction cannot be orphaned", "UNSUPPORTED_OPERATION", {
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

export type ReplacementDetectionSetup = {
    to: string;
    from: string;
    value: bigint;
    data: string;
    nonce: number;
    block: number;
};

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

    #startBlock: number;

    constructor(tx: TransactionResponseParams, provider: Provider) {
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

        this.#startBlock = -1;
    }

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

    async wait(_confirms?: number, _timeout?: number): Promise<null | TransactionReceipt> {
        const confirms = (_confirms == null) ? 1: _confirms;
        const timeout = (_timeout == null) ? 0: _timeout;

        let startBlock = this.#startBlock
        let nextScan = -1;
        let stopScanning = (startBlock === -1) ? true: false;
        const checkReplacement = async () => {

            // Get the current transaction count for this sender
            if (stopScanning) { return null; }
            const { blockNumber, nonce } = await resolveProperties({
                blockNumber: this.provider.getBlockNumber(),
                nonce: this.provider.getTransactionCount(this.from)
            });

            // No transaction for our nonce has been mined yet; but we can start
            // scanning later when we do start
            if (nonce < this.nonce) {
                startBlock = blockNumber;
                return;
            }

            // We were mined; no replacement
            if (stopScanning) { return null; }
            const mined = await this.getTransaction();
            if (mined && mined.blockNumber != null) { return; }

            // We were replaced; start scanning for that transaction

            // Starting to scan; look back a few extra blocks for safety
            if (nextScan === -1) {
                nextScan = startBlock - 3;
                if (nextScan < this.#startBlock) { nextScan = this.#startBlock; }
            }

            while (nextScan <= blockNumber) {

                // Get the next block to scan
                if (stopScanning) { return null; }
                const block = await this.provider.getBlockWithTransactions(nextScan);

                // This should not happen; but we'll try again shortly
                if (block == null) { return; }

                for (const tx of block.transactions) {

                    // We were mined; no replacement
                    if (tx.hash === this.hash) { return; }

                    if (tx.from === this.from && tx.nonce === this.nonce) {
                        // Get the receipt
                        if (stopScanning) { return null; }
                        const receipt = await this.provider.getTransactionReceipt(tx.hash);

                        // This should not happen; but we'll try again shortly
                        if (receipt == null) { return; }

                        // We will retry this on the next block (this case could be optimized)
                        if ((blockNumber - receipt.blockNumber + 1) < confirms) { return; }

                        // The reason we were replaced
                        let reason: "replaced" | "repriced" | "cancelled" = "replaced";
                        if (tx.data === this.data && tx.to === this.to && tx.value === this.value) {
                            reason = "repriced";
                        } else  if (tx.data === "0x" && tx.from === tx.to && tx.value === BN_0) {
                            reason = "cancelled"
                        }

                        throwError("transaction was replaced", "TRANSACTION_REPLACED", {
                            cancelled: (reason === "replaced" || reason === "cancelled"),
                            reason,
                            replacement: tx.replaceableTransaction(startBlock),
                            hash: tx.hash,
                            receipt
                        });
                    }
                }

                nextScan++;
            }
            return;
        };

        const receipt = await this.provider.getTransactionReceipt(this.hash);

        if (receipt) {
            if ((await receipt.confirmations()) >= confirms) { return receipt; }
        } else {
            // Check for a replacement; throws if a replacement was found
            await checkReplacement();

            // Allow null only when the confirms is 0
            if (confirms === 0) { return null; }
        }

        const waiter = new Promise((resolve, reject) => {
            // List of things to cancel when we have a result (one way or the other)
            const cancellers: Array<() => void> = [ ];
            const cancel = () => { cancellers.forEach((c) => c()); };

            // On cancel, stop scanning for replacements
            cancellers.push(() => { stopScanning = true; });

            // Set up any timeout requested
            if (timeout > 0) {
                const timer = setTimeout(() => {
                    cancel();
                    reject(makeError("wait for transaction timeout", "TIMEOUT"));
                }, timeout);
                cancellers.push(() => { clearTimeout(timer); });
            }

            const txListener = async (receipt: TransactionReceipt) => {
                // Done; return it!
                if ((await receipt.confirmations()) >= confirms) {
                    cancel();
                    resolve(receipt);
                }

            };
            cancellers.push(() => { this.provider.off(this.hash, txListener); });
            this.provider.on(this.hash, txListener);

            // We support replacement detection; start checking
            if (startBlock >= 0) {
                const replaceListener = async () => {
                    try {
                        // Check for a replacement; this throws only if one is found
                        await checkReplacement();

                    } catch (error) {
                        // We were replaced (with enough confirms); re-throw the error
                        if (isError(error, "TRANSACTION_REPLACED")) {
                            cancel();
                            reject(error);
                            return;
                        }
                    }

                    // Rescheudle a check on the next block
                    this.provider.once("block", replaceListener);
                };
                cancellers.push(() => { this.provider.off("block", replaceListener); });
                this.provider.once("block", replaceListener);
            }
        });

        return await <Promise<TransactionReceipt>>waiter;
    }

    isMined(): this is MinedTransactionResponse {
        return (this.blockHash != null);
    }

    isLegacy(): this is (TransactionResponse & { accessList: null, maxFeePerGas: null, maxPriorityFeePerGas: null }) {
        return (this.type === 0)
    }

    isBerlin(): this is (TransactionResponse & { accessList: AccessList, maxFeePerGas: null, maxPriorityFeePerGas: null }) {
        return (this.type === 1);
    }

    isLondon(): this is (TransactionResponse & { accessList: AccessList, maxFeePerGas: bigint, maxPriorityFeePerGas: bigint }){
        return (this.type === 2);
    }

    removedEvent(): OrphanFilter {
        if (!this.isMined()) {
            return throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        return createRemovedTransactionFilter(this);
    }

    reorderedEvent(other?: TransactionResponse): OrphanFilter {
        if (!this.isMined()) {
            return throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        if (other && !other.isMined()) {
            return throwError("unmined 'other' transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()" });
        }
        return createReorderedTransactionFilter(this, other);
    }

    /**
     *  Returns a new TransactionResponse instance which has the ability to
     *  detect (and throw an error) if the transaction is replaced, which
     *  will begin scanning at %%startBlock%%.
     *
     *  This should generally not be used by developers and is intended
     *  primarily for internal use. Setting an incorrect %%startBlock%% can
     *  have devastating performance consequences if used incorrectly.
     */
    replaceableTransaction(startBlock: number): TransactionResponse {
        assertArgument(Number.isInteger(startBlock) && startBlock >= 0, "invalid startBlock", "startBlock", startBlock);
        const tx = new TransactionResponse(this, this.provider);
        tx.#startBlock = startBlock;
        return tx;
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


//////////////////////
// ProviderEvent

export type ProviderEvent = string | Array<string | Array<string>> | EventFilter | OrphanFilter;


//////////////////////
// Provider

export interface Provider extends ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {
    provider: this;


    ////////////////////
    // State

    /**
     *  Get the current block number.
     */
    getBlockNumber(): Promise<number>;

    /**
     *  Get the connected [[Network]].
     */
    getNetwork(): Promise<Network>;

    /**
     *  Get the best guess at the recommended [[FeeData]].
     */
    getFeeData(): Promise<FeeData>;


    ////////////////////
    // Account

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
    getCode(address: AddressLike, blockTag?: BlockTag): Promise<string>

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
    getStorage(address: AddressLike, position: BigNumberish, blockTag?: BlockTag): Promise<string>


    ////////////////////
    // Execution

    /**
     *  Estimates the amount of gas required to executre %%tx%%.
     *
     *  @param tx - The transaction to estimate the gas requirement for
     */
    estimateGas(tx: TransactionRequest): Promise<bigint>;

    // If call fails, throws CALL_EXCEPTION { data: string, error, errorString?, panicReason? }
    /**
     *  Uses call to simulate execution of %%tx%%.
     *
     *  @param tx - The transaction to simulate
     */
    call(tx: TransactionRequest): Promise<string>

    /**
     *  Broadcasts the %%signedTx%% to the network, adding it to the memory pool
     *  of any node for which the transaction meets the rebroadcast requirements.
     *
     *  @param signedTx - The transaction to broadcast
     */
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;


    ////////////////////
    // Queries

    getBlock(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<string>>;
    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string): Promise<null | Block<TransactionResponse>>
    getTransaction(hash: string): Promise<null | TransactionResponse>;
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;
    getTransactionResult(hash: string): Promise<null | string>;


    ////////////////////
    // Bloom-filter Queries

    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;


    ////////////////////
    // ENS

    resolveName(name: string): Promise<null | string>;
    lookupAddress(address: string): Promise<null | string>;

    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    waitForBlock(blockTag?: BlockTag): Promise<Block<string>>;
}
