//import { resolveAddress } from "@ethersproject/address";
import {
    defineProperties, getBigInt, getNumber, hexlify, resolveProperties,
    assert, assertArgument, isError, makeError
} from "../utils/index.js";
import { accessListify } from "../transaction/index.js";

import type { AddressLike, NameResolver } from "../address/index.js";
import type { BigNumberish, EventEmitterable } from "../utils/index.js";
import type { Signature } from "../crypto/index.js";
import type { AccessList, AccessListish, TransactionLike } from "../transaction/index.js";

import type { ContractRunner } from "./contracts.js";
import type { Network } from "./network.js";


const BN_0 = BigInt(0);

export type BlockTag = BigNumberish | string;

import {
    BlockParams, LogParams, TransactionReceiptParams,
    TransactionResponseParams
} from "./formatting.js";

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

/**
 *  A **FeeData** wraps all the fee-related values associated with
 *  the network.
 */
export class FeeData {
    /**
     *  The gas price for legacy networks.
     */
    readonly gasPrice!: null | bigint;

    /**
     *  The maximum fee to pay per gas.
     *
     *  The base fee per gas is defined by the network and based on
     *  congestion, increasing the cost during times of heavy load
     *  and lowering when less busy.
     *
     *  The actual fee per gas will be the base fee for the block
     *  and the priority fee, up to the max fee per gas.
     *
     *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
     */
    readonly maxFeePerGas!: null | bigint;

    /**
     *  The additional amout to pay per gas to encourage a validator
     *  to include the transaction.
     *
     *  The purpose of this is to compensate the validator for the
     *  adjusted risk for including a given transaction.
     *
     *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
     */
    readonly maxPriorityFeePerGas!: null | bigint;

    /**
     *  Creates a new FeeData for %%gasPrice%%, %%maxFeePerGas%% and
     *  %%maxPriorityFeePerGas%%.
     */
    constructor(gasPrice?: null | bigint, maxFeePerGas?: null | bigint, maxPriorityFeePerGas?: null | bigint) {
        defineProperties<FeeData>(this, {
            gasPrice: getValue(gasPrice),
            maxFeePerGas: getValue(maxFeePerGas),
            maxPriorityFeePerGas: getValue(maxPriorityFeePerGas)
        });
    }

    /**
     *  Returns a JSON-friendly value.
     */
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

    const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas,maxPriorityFeePerGas,value".split(/,/);
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

//////////////////////
// Block

/**
 *  An Interface to indicate a [[Block]] has been included in the
 *  blockchain. This asserts a Type Guard that necessary properties
 *  are non-null.
 *
 *  Before a block is included, it is a //pending// block.
 */
export interface MinedBlock extends Block {
    readonly number: number;
    readonly hash: string;
    readonly timestamp: number;
    readonly date: Date;
    readonly miner: string;
}

/**
 *  A **Block** represents the data associated with a full block on
 *  Ethereum.
 */
export class Block implements BlockParams, Iterable<string> {
    /**
     *  The provider connected to the block used to fetch additional details
     *  if necessary.
     */
    readonly provider!: Provider;

    /**
     *  The block number, sometimes called the block height. This is a
     *  sequential number that is one higher than the parent block.
     */
    readonly number!: number;

    /**
     *  The block hash.
     */
    readonly hash!: null | string;

    /**
     *  The timestamp for this block, which is the number of seconds since
     *  epoch that this block was included.
     */
    readonly timestamp!: number;

    /**
     *  The block hash of the parent block.
     */
    readonly parentHash!: string;

    /**
     *  The nonce.
     *
     *  On legacy networks, this is the random number inserted which
     *  permitted the difficulty target to be reached.
     */
    readonly nonce!: string;

    /**
     *  The difficulty target.
     *
     *  On legacy networks, this is the proof-of-work target required
     *  for a block to meet the protocol rules to be included.
     *
     *  On modern networks, this is a random number arrived at using
     *  randao.  @TODO: Find links?
     */
    readonly difficulty!: bigint;


    /**
     *  The total gas limit for this block.
     */
    readonly gasLimit!: bigint;

    /**
     *  The total gas used in this block.
     */
    readonly gasUsed!: bigint;

    /**
     *  The miner coinbase address, wihch receives any subsidies for
     *  including this block.
     */
    readonly miner!: string;

    /**
     *  Any extra data the validator wished to include.
     */
    readonly extraData!: string;

    /**
     *  The base fee per gas that all transactions in this block were
     *  charged.
     *
     *  This adjusts after each block, depending on how congested the network
     *  is.
     */
    readonly baseFeePerGas!: null | bigint;

    readonly #transactions: Array<string | TransactionResponse>;

    /**
     *  Create a new **Block** object.
     *
     *  This should generally not be necessary as the unless implementing a
     *  low-level library.
     */
    constructor(block: BlockParams, provider: Provider) {

        this.#transactions = block.transactions.map((tx) => {
            if (typeof(tx) !== "string") {
                return new TransactionResponse(tx, provider);
            }
            return tx;
        });

        defineProperties<Block>(this, {
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

    /**
     *  Returns the list of transaction hashes.
     */
    get transactions(): ReadonlyArray<string> {
        return this.#transactions.map((tx) => {
            if (typeof(tx) === "string") { return tx; }
            return tx.hash;
        });
    }

    /**
     *  Returns the complete transactions for blocks which
     *  prefetched them, by passing ``true`` to %%prefetchTxs%%
     *  into [[provider_getBlock]].
     */
    get prefetchedTransactions(): Array<TransactionResponse> {
        const txs = this.#transactions.slice();

        // Doesn't matter...
        if (txs.length === 0) { return [ ]; }

        // Make sure we prefetched the transactions
        assert(typeof(txs[0]) === "object", "transactions were not prefetched with block request", "UNSUPPORTED_OPERATION", {
            operation: "transactionResponses()"
        });

        return <Array<TransactionResponse>>txs;
    }

    /**
     *  Returns a JSON-friendly value.
     */
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

    [Symbol.iterator](): Iterator<string> {
        let index = 0;
        const txs = this.transactions;
        return {
            next: () => {
                if (index < this.length) {
                    return {
                        value: txs[index++], done: false
                    }
                }
                return { value: undefined, done: true };
            }
        };
    }

    /**
     *  The number of transactions in this block.
     */
    get length(): number { return this.#transactions.length; }

    /**
     *  The [[link-js-date]] this block was included at.
     */
    get date(): null | Date {
        if (this.timestamp == null) { return null; }
        return new Date(this.timestamp * 1000);
    }

    /**
     *  Get the transaction at %%indexe%% within this block.
     */
    async getTransaction(indexOrHash: number | string): Promise<TransactionResponse> {
        // Find the internal value by its index or hash
        let tx: string | TransactionResponse | undefined = undefined;
        if (typeof(indexOrHash) === "number") {
            tx = this.#transactions[indexOrHash];

        } else {
            const hash = indexOrHash.toLowerCase();
            for (const v of this.#transactions) {
                if (typeof(v) === "string") {
                    if (v !== hash) { continue; }
                    tx = v;
                    break;
                } else {
                    if (v.hash === hash) { continue; }
                    tx = v;
                    break;
                }
            }
        }
        if (tx == null) { throw new Error("no such tx"); }

        if (typeof(tx) === "string") {
            return <TransactionResponse>(await this.provider.getTransaction(tx));
        } else {
            return tx;
        }
    }

    getPrefetchedTransaction(indexOrHash: number | string): TransactionResponse {
        const txs = this.prefetchedTransactions;
        if (typeof(indexOrHash) === "number") {
            return txs[indexOrHash];
        }

        indexOrHash = indexOrHash.toLowerCase();
        for (const tx of txs) {
            if (tx.hash === indexOrHash) { return tx; }
        }

        assertArgument(false, "no matching transaction", "indexOrHash", indexOrHash);
    }

    /**
     *  Has this block been mined.
     *
     *  If true, the block has been typed-gaurded that all mined
     *  properties are non-null.
     */
    isMined(): this is MinedBlock { return !!this.hash; }

    /**
     *
     */
    isLondon(): this is (Block & { baseFeePerGas: bigint }) {
        return !!this.baseFeePerGas;
    }

    orphanedEvent(): OrphanFilter {
        if (!this.isMined()) { throw new Error(""); }
        return createOrphanedBlockFilter(this);
    }
}

//////////////////////
// Log

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

    async getBlock(): Promise<Block> {
        const block = await this.provider.getBlock(this.blockHash);
        assert(!!block, "failed to find transaction", "UNKNOWN_ERROR", { });
        return block;
    }

    async getTransaction(): Promise<TransactionResponse> {
        const tx = await this.provider.getTransaction(this.transactionHash);
        assert(!!tx, "failed to find transaction", "UNKNOWN_ERROR", { });
        return tx;
    }

    async getTransactionReceipt(): Promise<TransactionReceipt> {
        const receipt = await this.provider.getTransactionReceipt(this.transactionHash);
        assert(!!receipt, "failed to find transaction receipt", "UNKNOWN_ERROR", { });
        return receipt;
    }

    removedEvent(): OrphanFilter {
        return createRemovedLogFilter(this);
    }
}

//////////////////////
// Transaction Receipt

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

        let gasPrice = BN_0;
        if (tx.effectiveGasPrice != null) {
            gasPrice = tx.effectiveGasPrice;
        } else if (tx.gasPrice != null) {
            gasPrice = tx.gasPrice;
        }

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
            gasPrice,

            type: tx.type,
            //byzantium: tx.byzantium,
            status: tx.status,
            root: tx.root
        });
    }

    get logs(): ReadonlyArray<Log> { return this.#logs; }

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

    async getBlock(): Promise<Block> {
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
        assert(!other || other.isMined(), "unmined 'other' transction cannot be orphaned",
            "UNSUPPORTED_OPERATION", { operation: "reorderedEvent(other)" });
        return createReorderedTransactionFilter(this, other);
    }
}


//////////////////////
// Transaction Response

export interface MinedTransactionResponse extends TransactionResponse {
    blockNumber: number;
    blockHash: string;
    date: Date;
}

/*
export type ReplacementDetectionSetup = {
    to: string;
    from: string;
    value: bigint;
    data: string;
    nonce: number;
    block: number;
};
*/
export class TransactionResponse implements TransactionLike<string>, TransactionResponseParams {
    /**
     *  The provider this is connected to, which will influence how its
     *  methods will resolve its async inspection methods.
     */
    readonly provider: Provider;

    /**
     *  The block number of the block that this transaction was included in.
     *
     *  This is ``null`` for pending transactions.
     */
    readonly blockNumber: null | number;

    /**
     *  The blockHash of the block that this transaction was included in.
     *
     *  This is ``null`` for pending transactions.
     */
    readonly blockHash: null | string;

    /**
     *  The index within the block that this transaction resides at.
     */
    readonly index!: number;

    /**
     *  The transaction hash.
     */
    readonly hash!: string;

    /**
     *  The [[link-eip-2718]] transaction envelope type. This is
     *  ``0`` for legacy transactions types.
     */
    readonly type!: number;

    /**
     *  The receiver of this transaction.
     *
     *  If ``null``, then the transaction is an initcode transaction.
     *  This means the result of executing the [[data]] will be deployed
     *  as a new contract on chain (assuming it does not revert) and the
     *  address may be computed using [[getCreateAddress]].
     */
    readonly to!: null | string;

    /**
     *  The sender of this transaction. It is implicitly computed
     *  from the transaction pre-image hash (as the digest) and the
     *  [[signature]] using ecrecover.
     */
    readonly from!: string;

    /**
     *  The nonce, which is used to prevent replay attacks and offer
     *  a method to ensure transactions from a given sender are explicitly
     *  ordered.
     *
     *  When sending a transaction, this must be equal to the number of
     *  transactions ever sent by [[from]].
     */
    readonly nonce!: number;

    /**
     *  The maximum units of gas this transaction can consume. If execution
     *  exceeds this, the entries transaction is reverted and the sender
     *  is charged for the full amount, despite not state changes being made.
     */
    readonly gasLimit!: bigint;

    /**
     *  The gas price can have various values, depending on the network.
     *
     *  In modern networks, for transactions that are included this is
     *  the //effective gas price// (the fee per gas that was actually
     *  charged), while for transactions that have not been included yet
     *  is the [[maxFeePerGas]].
     *
     *  For legacy transactions, or transactions on legacy networks, this
     *  is the fee that will be charged per unit of gas the transaction
     *  consumes.
     */
    readonly gasPrice!: bigint;

    /**
     *  The maximum priority fee (per unit of gas) to allow a
     *  validator to charge the sender. This is inclusive of the
     *  [[maxFeeFeePerGas]].
     */
    readonly maxPriorityFeePerGas!: null | bigint;

    /**
     *  The maximum fee (per unit of gas) to allow this transaction
     *  to charge the sender.
     */
    readonly maxFeePerGas!: null | bigint;

    /**
     *  The data.
     */
    readonly data!: string;

    /**
     *  The value, in wei. Use [[formatEther]] to format this value
     *  as ether.
     */
    readonly value!: bigint;

    /**
     *  The chain ID.
     */
    readonly chainId!: bigint;

    /**
     *  The signature.
     */
    readonly signature!: Signature;

    /**
     *  The [[link-eip-2930]] access list for transaction types that
     *  support it, otherwise ``null``.
     */
    readonly accessList!: null | AccessList;

    #startBlock: number;

    /**
     *  Create a new TransactionResponse with %%tx%% parameters
     *  connected to %%provider%%.
     */
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

    /**
     *  Returns a JSON representation of this transaction.
     */
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

    /**
     *  Resolves to the Block that this transaction was included in.
     *
     *  This will return null if the transaction has not been included yet.
     */
    async getBlock(): Promise<null | Block> {
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

    /**
     *  Resolves to this transaction being re-requested from the
     *  provider. This can be used if you have an unmined transaction
     *  and wish to get an up-to-date populated instance.
     */
    async getTransaction(): Promise<null | TransactionResponse> {
        return this.provider.getTransaction(this.hash);
    }

    /**
     *  Resolves once this transaction has been mined and has
     *  %%confirms%% blocks including it (default: ``1``) with an
     *  optional %%timeout%%.
     *
     *  This can resolve to ``null`` only if %%confirms%% is ``0``
     *  and the transaction has not been mined, otherwise this will
     *  wait until enough confirmations have completed.
     */
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

            // No transaction or our nonce has not been mined yet; but we
            // can start scanning later when we do start
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
                const block = await this.provider.getBlock(nextScan, true);

                // This should not happen; but we'll try again shortly
                if (block == null) { return; }

                // We were mined; no replacement
                for (const hash of block) {
                    if (hash === this.hash) { return; }
                }

                // Search for the transaction that replaced us
                for (let i = 0; i < block.length; i++) {
                    const tx: TransactionResponse = await block.getTransaction(i);

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

                        assert(false, "transaction was replaced", "TRANSACTION_REPLACED", {
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
                    if (!stopScanning) {
                        this.provider.once("block", replaceListener);
                    }
                };
                cancellers.push(() => { this.provider.off("block", replaceListener); });
                this.provider.once("block", replaceListener);
            }
        });

        return await <Promise<TransactionReceipt>>waiter;
    }

    /**
     *  Returns ``true`` if this transaction has been included.
     *
     *  This is effective only as of the time the TransactionResponse
     *  was instantiated. To get up-to-date information, use
     *  [[getTransaction]].
     *
     *  This provides a Type Guard that this transaction will have
     *  non-null property values for properties that are null for
     *  unmined transactions.
     */
    isMined(): this is MinedTransactionResponse {
        return (this.blockHash != null);
    }

    /**
     *  Returns true if the transaction is a legacy (i.e. ``type == 0``)
     *  transaction.
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isLegacy(): this is (TransactionResponse & { accessList: null, maxFeePerGas: null, maxPriorityFeePerGas: null }) {
        return (this.type === 0)
    }

    /**
     *  Returns true if the transaction is a Berlin (i.e. ``type == 1``)
     *  transaction. See [[link-eip-2070]].
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isBerlin(): this is (TransactionResponse & { accessList: AccessList, maxFeePerGas: null, maxPriorityFeePerGas: null }) {
        return (this.type === 1);
    }

    /**
     *  Returns true if the transaction is a London (i.e. ``type == 2``)
     *  transaction. See [[link-eip-1559]].
     *
     *  This provides a Type Guard that this transaction will have
     *  the ``null``-ness for hardfork-specific properties set correctly.
     */
    isLondon(): this is (TransactionResponse & { accessList: AccessList, maxFeePerGas: bigint, maxPriorityFeePerGas: bigint }){
        return (this.type === 2);
    }

    /**
     *  Returns a filter which can be used to listen for orphan events
     *  that evict this transaction.
     */
    removedEvent(): OrphanFilter {
        assert(this.isMined(), "unmined transaction canot be orphaned",
            "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });
        return createRemovedTransactionFilter(this);
    }

    /**
     *  Returns a filter which can be used to listen for orphan events
     *  that re-order this event against %%other%%.
     */
    reorderedEvent(other?: TransactionResponse): OrphanFilter {
        assert(this.isMined(), "unmined transaction canot be orphaned",
            "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });

        assert(!other || other.isMined(), "unmined 'other' transaction canot be orphaned",
            "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });

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

/**
 *  An Orphan Filter allows detecting when an orphan block has
 *  resulted in dropping a block or transaction or has resulted
 *  in transactions changing order.
 *
 *  Not currently fully supported.
 */
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

/**
 *  A **TopicFilter** provides a struture to define bloom-filter
 *  queries.
 *
 *  Each field that is ``null`` matches **any** value, a field that is
 *  a ``string`` must match exactly that value and and ``array`` is
 *  effectively an ``OR``-ed set, where any one of those values must
 *  match.
 */
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

/**
 *  A **Provider** is the primary method to interact with the read-only
 *  content on Ethereum.
 *
 *  It allows access to details about accounts, blocks and transactions
 *  and the ability to query event logs and simulate contract execution.
 *
 *  Account data includes the [balance](getBalance),
 *  [transaction count](getTransactionCount), [code](getCode) and
 *  [state trie storage](getStorage).
 *
 *  Simulating execution can be used to [call](call),
 *  [estimate gas](estimateGas) and
 *  [get transaction results](getTransactionResult).
 *
 *  The [[broadcastTransaction]] is the only method which allows updating
 *  the blockchain, but it is usually accessed by a [[Signer]], since a
 *  private key must be used to sign the transaction before it can be
 *  broadcast.
 */
export interface Provider extends ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {

    /**
     *  The provider iteself.
     *
     *  This is part of the necessary API for executing a contract, as
     *  it provides a common property on any [[ContractRunner]] that
     *  can be used to access the read-only portion of the runner.
     */
    provider: this;

    /**
     *  Shutdown any resources this provider is using. No additional
     *  calls should be made to this provider after calling this.
     */
    destroy(): void;

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
     *  Get the account balance (in wei) of %%address%%. If %%blockTag%%
     *  is specified and the node supports archive access for that
     *  %%blockTag%%, the balance is as of that [[BlockTag]].
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getBalance(address: AddressLike, blockTag?: BlockTag): Promise<bigint>;

    /**
     *  Get the number of transactions ever sent for %%address%%, which
     *  is used as the ``nonce`` when sending a transaction. If
     *  %%blockTag%% is specified and the node supports archive access
     *  for that %%blockTag%%, the transaction count is as of that
     *  [[BlockTag]].
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getTransactionCount(address: AddressLike, blockTag?: BlockTag): Promise<number>;

    /**
     *  Get the bytecode for %%address%%.
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getCode(address: AddressLike, blockTag?: BlockTag): Promise<string>

    /**
     *  Get the storage slot value for %%address%% at slot %%position%%.
     *
     *  @note On nodes without archive access enabled, the %%blockTag%% may be
     *        **silently ignored** by the node, which may cause issues if relied on.
     */
    getStorage(address: AddressLike, position: BigNumberish, blockTag?: BlockTag): Promise<string>


    ////////////////////
    // Execution

    /**
     *  Estimates the amount of gas required to executre %%tx%%.
     */
    estimateGas(tx: TransactionRequest): Promise<bigint>;

    /**
     *  Simulate the execution of %%tx%%. If the call reverts, it will
     *  throw a [[CallExceptionError]] which includes the revert data.
     */
    call(tx: TransactionRequest): Promise<string>

    /**
     *  Broadcasts the %%signedTx%% to the network, adding it to the
     *  memory pool of any node for which the transaction meets the
     *  rebroadcast requirements.
     */
    broadcastTransaction(signedTx: string): Promise<TransactionResponse>;


    ////////////////////
    // Queries

    /**
     *  Resolves to the block for %%blockHashOrBlockTag%%.
     *
     *  If %%prefetchTxs%%, and the backend supports including transactions
     *  with block requests, all transactions will be included and the
     *  [[Block]] object will not need to make remote calls for getting
     *  transactions.
     */
    getBlock(blockHashOrBlockTag: BlockTag | string, prefetchTxs?: boolean): Promise<null | Block>;

    /**
     *  Resolves to the transaction for %%hash%%.
     *
     *  If the transaction is unknown or on pruning nodes which
     *  discard old transactions this resolves to ``null``.
     */
    getTransaction(hash: string): Promise<null | TransactionResponse>;

    /**
     *  Resolves to the transaction receipt for %%hash%%, if mined.
     *
     *  If the transaction has not been mined, is unknown or on
     *  pruning nodes which discard old transactions this resolves to
     *  ``null``.
     */
    getTransactionReceipt(hash: string): Promise<null | TransactionReceipt>;

    /**
     *  Resolves to the result returned by the executions of %%hash%%.
     *
     *  This is only supported on nodes with archive access and with
     *  the necessary debug APIs enabled.
     */
    getTransactionResult(hash: string): Promise<null | string>;


    ////////////////////
    // Bloom-filter Queries

    /**
     *  Resolves to the list of Logs that match %%filter%%
     */
    getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log>>;


    ////////////////////
    // ENS

    /**
     *  Resolves to the address configured for the %%ensName%% or
     *  ``null`` if unconfigured.
     */
    resolveName(ensName: string): Promise<null | string>;

    /**
     *  Resolves to the ENS name associated for the %%address%% or
     *  ``null`` if the //primary name// is not configured.
     *
     *  Users must perform additional steps to configure a //primary name//,
     *  which is not currently common.
     */
    lookupAddress(address: string): Promise<null | string>;

    /**
     *  Waits until the transaction %%hash%% is mined and has %%confirms%%
     *  confirmations.
     */
    waitForTransaction(hash: string, confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;

    /**
     *  Resolves to the block at %%blockTag%% once it has been mined.
     *
     *  This can be useful for waiting some number of blocks by using
     *  the ``currentBlockNumber + N``.
     */
    waitForBlock(blockTag?: BlockTag): Promise<Block>;
}
