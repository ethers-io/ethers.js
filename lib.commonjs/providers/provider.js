"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionResponse = exports.TransactionReceipt = exports.Log = exports.Block = exports.copyRequest = exports.FeeData = void 0;
//import { resolveAddress } from "@ethersproject/address";
const index_js_1 = require("../utils/index.js");
const index_js_2 = require("../transaction/index.js");
const BN_0 = BigInt(0);
// -----------------------
function getValue(value) {
    if (value == null) {
        return null;
    }
    return value;
}
function toJson(value) {
    if (value == null) {
        return null;
    }
    return value.toString();
}
// @TODO? <T extends FeeData = { }> implements Required<T>
class FeeData {
    gasPrice;
    maxFeePerGas;
    maxPriorityFeePerGas;
    constructor(gasPrice, maxFeePerGas, maxPriorityFeePerGas) {
        (0, index_js_1.defineProperties)(this, {
            gasPrice: getValue(gasPrice),
            maxFeePerGas: getValue(maxFeePerGas),
            maxPriorityFeePerGas: getValue(maxPriorityFeePerGas)
        });
    }
    toJSON() {
        const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = this;
        return {
            _type: "FeeData",
            gasPrice: toJson(gasPrice),
            maxFeePerGas: toJson(maxFeePerGas),
            maxPriorityFeePerGas: toJson(maxPriorityFeePerGas),
        };
    }
}
exports.FeeData = FeeData;
;
function copyRequest(req) {
    const result = {};
    // These could be addresses, ENS names or Addressables
    if (req.to) {
        result.to = req.to;
    }
    if (req.from) {
        result.from = req.from;
    }
    if (req.data) {
        result.data = (0, index_js_1.hexlify)(req.data);
    }
    const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas, maxPriorityFeePerGas,value".split(/,/);
    for (const key in bigIntKeys) {
        if (!(key in req) || req[key] == null) {
            continue;
        }
        result[key] = (0, index_js_1.getBigInt)(req[key], `request.${key}`);
    }
    const numberKeys = "type,nonce".split(/,/);
    for (const key in numberKeys) {
        if (!(key in req) || req[key] == null) {
            continue;
        }
        result[key] = (0, index_js_1.getNumber)(req[key], `request.${key}`);
    }
    if (req.accessList) {
        result.accessList = (0, index_js_2.accessListify)(req.accessList);
    }
    if ("blockTag" in req) {
        result.blockTag = req.blockTag;
    }
    if ("enableCcipRead" in req) {
        result.enableCcipReadEnabled = !!req.enableCcipRead;
    }
    if ("customData" in req) {
        result.customData = req.customData;
    }
    return result;
}
exports.copyRequest = copyRequest;
;
class Block {
    provider;
    number;
    hash;
    timestamp;
    parentHash;
    nonce;
    difficulty;
    gasLimit;
    gasUsed;
    miner;
    extraData;
    baseFeePerGas;
    #transactions;
    constructor(block, provider) {
        this.#transactions = Object.freeze(block.transactions.map((tx) => {
            if (typeof (tx) !== "string" && tx.provider !== provider) {
                return (new TransactionResponse(tx, provider));
            }
            return tx;
        }));
        ;
        (0, index_js_1.defineProperties)(this, {
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
    get transactions() { return this.#transactions; }
    //connect(provider: Provider): Block<T> {
    //    return new Block(this, provider);
    //}
    toJSON() {
        const { baseFeePerGas, difficulty, extraData, gasLimit, gasUsed, hash, miner, nonce, number, parentHash, timestamp, transactions } = this;
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
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    return {
                        value: this.transactions[index++], done: false
                    };
                }
                return { value: undefined, done: true };
            }
        };
    }
    get length() { return this.transactions.length; }
    get date() {
        if (this.timestamp == null) {
            return null;
        }
        return new Date(this.timestamp * 1000);
    }
    async getTransaction(index) {
        const tx = this.transactions[index];
        if (tx == null) {
            throw new Error("no such tx");
        }
        if (typeof (tx) === "string") {
            return (await this.provider.getTransaction(tx));
        }
        else {
            return tx;
        }
    }
    isMined() { return !!this.hash; }
    isLondon() {
        return !!this.baseFeePerGas;
    }
    orphanedEvent() {
        if (!this.isMined()) {
            throw new Error("");
        }
        return createOrphanedBlockFilter(this);
    }
}
exports.Block = Block;
class Log {
    provider;
    transactionHash;
    blockHash;
    blockNumber;
    removed;
    address;
    data;
    topics;
    index;
    transactionIndex;
    constructor(log, provider) {
        this.provider = provider;
        const topics = Object.freeze(log.topics.slice());
        (0, index_js_1.defineProperties)(this, {
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
    toJSON() {
        const { address, blockHash, blockNumber, data, index, removed, topics, transactionHash, transactionIndex } = this;
        return {
            _type: "log",
            address, blockHash, blockNumber, data, index,
            removed, topics, transactionHash, transactionIndex
        };
    }
    async getBlock() {
        return (await this.provider.getBlock(this.blockHash));
    }
    async getTransaction() {
        return (await this.provider.getTransaction(this.transactionHash));
    }
    async getTransactionReceipt() {
        return (await this.provider.getTransactionReceipt(this.transactionHash));
    }
    removedEvent() {
        return createRemovedLogFilter(this);
    }
}
exports.Log = Log;
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
class TransactionReceipt {
    provider;
    to;
    from;
    contractAddress;
    hash;
    index;
    blockHash;
    blockNumber;
    logsBloom;
    gasUsed;
    cumulativeGasUsed;
    gasPrice;
    type;
    //readonly byzantium!: boolean;
    status;
    root;
    #logs;
    constructor(tx, provider) {
        this.#logs = Object.freeze(tx.logs.map((log) => {
            return new Log(log, provider);
        }));
        (0, index_js_1.defineProperties)(this, {
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
            gasPrice: (tx.effectiveGasPrice || tx.gasPrice),
            type: tx.type,
            //byzantium: tx.byzantium,
            status: tx.status,
            root: tx.root
        });
    }
    get logs() { return this.#logs; }
    //connect(provider: Provider): TransactionReceipt {
    //    return new TransactionReceipt(this, provider);
    //}
    toJSON() {
        const { to, from, contractAddress, hash, index, blockHash, blockNumber, logsBloom, logs, //byzantium, 
        status, root } = this;
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
    get length() { return this.logs.length; }
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    return { value: this.logs[index++], done: false };
                }
                return { value: undefined, done: true };
            }
        };
    }
    get fee() {
        return this.gasUsed * this.gasPrice;
    }
    async getBlock() {
        const block = await this.provider.getBlock(this.blockHash);
        if (block == null) {
            throw new Error("TODO");
        }
        return block;
    }
    async getTransaction() {
        const tx = await this.provider.getTransaction(this.hash);
        if (tx == null) {
            throw new Error("TODO");
        }
        return tx;
    }
    async getResult() {
        return (await this.provider.getTransactionResult(this.hash));
    }
    async confirmations() {
        return (await this.provider.getBlockNumber()) - this.blockNumber + 1;
    }
    removedEvent() {
        return createRemovedTransactionFilter(this);
    }
    reorderedEvent(other) {
        if (other && !other.isMined()) {
            return (0, index_js_1.throwError)("unmined 'other' transction cannot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "reorderedEvent(other)"
            });
        }
        return createReorderedTransactionFilter(this, other);
    }
}
exports.TransactionReceipt = TransactionReceipt;
;
class TransactionResponse {
    provider;
    blockNumber;
    blockHash;
    index;
    hash;
    type;
    to;
    from;
    nonce;
    gasLimit;
    gasPrice;
    maxPriorityFeePerGas;
    maxFeePerGas;
    data;
    value;
    chainId;
    signature;
    accessList;
    #startBlock;
    constructor(tx, provider) {
        this.provider = provider;
        this.blockNumber = (tx.blockNumber != null) ? tx.blockNumber : null;
        this.blockHash = (tx.blockHash != null) ? tx.blockHash : null;
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
        this.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas != null) ? tx.maxPriorityFeePerGas : null;
        this.maxFeePerGas = (tx.maxFeePerGas != null) ? tx.maxFeePerGas : null;
        this.chainId = tx.chainId;
        this.signature = tx.signature;
        this.accessList = (tx.accessList != null) ? tx.accessList : null;
        this.#startBlock = -1;
    }
    toJSON() {
        const { blockNumber, blockHash, index, hash, type, to, from, nonce, data, signature, accessList } = this;
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
    async getBlock() {
        let blockNumber = this.blockNumber;
        if (blockNumber == null) {
            const tx = await this.getTransaction();
            if (tx) {
                blockNumber = tx.blockNumber;
            }
        }
        if (blockNumber == null) {
            return null;
        }
        const block = this.provider.getBlock(blockNumber);
        if (block == null) {
            throw new Error("TODO");
        }
        return block;
    }
    async getTransaction() {
        return this.provider.getTransaction(this.hash);
    }
    async wait(_confirms, _timeout) {
        const confirms = (_confirms == null) ? 1 : _confirms;
        const timeout = (_timeout == null) ? 0 : _timeout;
        let startBlock = this.#startBlock;
        let nextScan = -1;
        let stopScanning = (startBlock === -1) ? true : false;
        const checkReplacement = async () => {
            // Get the current transaction count for this sender
            if (stopScanning) {
                return null;
            }
            const { blockNumber, nonce } = await (0, index_js_1.resolveProperties)({
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
            if (stopScanning) {
                return null;
            }
            const mined = await this.getTransaction();
            if (mined && mined.blockNumber != null) {
                return;
            }
            // We were replaced; start scanning for that transaction
            // Starting to scan; look back a few extra blocks for safety
            if (nextScan === -1) {
                nextScan = startBlock - 3;
                if (nextScan < this.#startBlock) {
                    nextScan = this.#startBlock;
                }
            }
            while (nextScan <= blockNumber) {
                // Get the next block to scan
                if (stopScanning) {
                    return null;
                }
                const block = await this.provider.getBlockWithTransactions(nextScan);
                // This should not happen; but we'll try again shortly
                if (block == null) {
                    return;
                }
                for (const tx of block.transactions) {
                    // We were mined; no replacement
                    if (tx.hash === this.hash) {
                        return;
                    }
                    if (tx.from === this.from && tx.nonce === this.nonce) {
                        // Get the receipt
                        if (stopScanning) {
                            return null;
                        }
                        const receipt = await this.provider.getTransactionReceipt(tx.hash);
                        // This should not happen; but we'll try again shortly
                        if (receipt == null) {
                            return;
                        }
                        // We will retry this on the next block (this case could be optimized)
                        if ((blockNumber - receipt.blockNumber + 1) < confirms) {
                            return;
                        }
                        // The reason we were replaced
                        let reason = "replaced";
                        if (tx.data === this.data && tx.to === this.to && tx.value === this.value) {
                            reason = "repriced";
                        }
                        else if (tx.data === "0x" && tx.from === tx.to && tx.value === BN_0) {
                            reason = "cancelled";
                        }
                        (0, index_js_1.throwError)("transaction was replaced", "TRANSACTION_REPLACED", {
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
            if ((await receipt.confirmations()) >= confirms) {
                return receipt;
            }
        }
        else {
            // Check for a replacement; throws if a replacement was found
            await checkReplacement();
            // Allow null only when the confirms is 0
            if (confirms === 0) {
                return null;
            }
        }
        const waiter = new Promise((resolve, reject) => {
            // List of things to cancel when we have a result (one way or the other)
            const cancellers = [];
            const cancel = () => { cancellers.forEach((c) => c()); };
            // On cancel, stop scanning for replacements
            cancellers.push(() => { stopScanning = true; });
            // Set up any timeout requested
            if (timeout > 0) {
                const timer = setTimeout(() => {
                    cancel();
                    reject((0, index_js_1.makeError)("wait for transaction timeout", "TIMEOUT"));
                }, timeout);
                cancellers.push(() => { clearTimeout(timer); });
            }
            const txListener = async (receipt) => {
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
                    }
                    catch (error) {
                        // We were replaced (with enough confirms); re-throw the error
                        if ((0, index_js_1.isError)(error, "TRANSACTION_REPLACED")) {
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
        return await waiter;
    }
    isMined() {
        return (this.blockHash != null);
    }
    isLegacy() {
        return (this.type === 0);
    }
    isBerlin() {
        return (this.type === 1);
    }
    isLondon() {
        return (this.type === 2);
    }
    removedEvent() {
        if (!this.isMined()) {
            return (0, index_js_1.throwError)("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
        }
        return createRemovedTransactionFilter(this);
    }
    reorderedEvent(other) {
        if (!this.isMined()) {
            return (0, index_js_1.throwError)("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
        }
        if (other && !other.isMined()) {
            return (0, index_js_1.throwError)("unmined 'other' transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
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
    replaceableTransaction(startBlock) {
        (0, index_js_1.assertArgument)(Number.isInteger(startBlock) && startBlock >= 0, "invalid startBlock", "startBlock", startBlock);
        const tx = new TransactionResponse(this, this.provider);
        tx.#startBlock = startBlock;
        return tx;
    }
}
exports.TransactionResponse = TransactionResponse;
function createOrphanedBlockFilter(block) {
    return { orphan: "drop-block", hash: block.hash, number: block.number };
}
function createReorderedTransactionFilter(tx, other) {
    return { orphan: "reorder-transaction", tx, other };
}
function createRemovedTransactionFilter(tx) {
    return { orphan: "drop-transaction", tx };
}
function createRemovedLogFilter(log) {
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
//# sourceMappingURL=provider.js.map