//import { resolveAddress } from "@ethersproject/address";
import { hexlify } from "../utils/data.js";
import { logger } from "../utils/logger.js";
import { defineProperties } from "../utils/properties.js";
import { accessListify } from "../transaction/index.js";
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
export class FeeData {
    gasPrice;
    maxFeePerGas;
    maxPriorityFeePerGas;
    constructor(gasPrice, maxFeePerGas, maxPriorityFeePerGas) {
        defineProperties(this, {
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
;
export function copyRequest(req) {
    const result = {};
    // These could be addresses, ENS names or Addressables
    if (req.to) {
        result.to = req.to;
    }
    if (req.from) {
        result.from = req.from;
    }
    if (req.data) {
        result.data = hexlify(req.data);
    }
    const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas, maxPriorityFeePerGas,value".split(/,/);
    for (const key in bigIntKeys) {
        if (!(key in req) || req[key] == null) {
            continue;
        }
        result[key] = logger.getBigInt(req[key], `request.${key}`);
    }
    const numberKeys = "type,nonce".split(/,/);
    for (const key in numberKeys) {
        if (!(key in req) || req[key] == null) {
            continue;
        }
        result[key] = logger.getNumber(req[key], `request.${key}`);
    }
    if (req.accessList) {
        result.accessList = accessListify(req.accessList);
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
;
export class Block {
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
        if (provider == null) {
            provider = dummyProvider;
        }
        this.#transactions = Object.freeze(block.transactions.map((tx) => {
            if (typeof (tx) !== "string" && tx.provider !== provider) {
                throw new Error("provider mismatch");
            }
            return tx;
        }));
        ;
        defineProperties(this, {
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
    isLondon() { return !!this.baseFeePerGas; }
    orphanedEvent() {
        if (!this.isMined()) {
            throw new Error("");
        }
        return createOrphanedBlockFilter(this);
    }
}
export class Log {
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
        if (provider == null) {
            provider = dummyProvider;
        }
        this.provider = provider;
        const topics = Object.freeze(log.topics.slice());
        defineProperties(this, {
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
export class TransactionReceipt {
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
    byzantium;
    status;
    root;
    #logs;
    constructor(tx, provider) {
        if (provider == null) {
            provider = dummyProvider;
        }
        this.#logs = Object.freeze(tx.logs.map((log) => {
            if (provider !== log.provider) {
                //return log.connect(provider);
                throw new Error("provider mismatch");
            }
            return log;
        }));
        defineProperties(this, {
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
            byzantium: tx.byzantium,
            status: tx.status,
            root: tx.root
        });
    }
    get logs() { return this.#logs; }
    //connect(provider: Provider): TransactionReceipt {
    //    return new TransactionReceipt(this, provider);
    //}
    toJSON() {
        const { to, from, contractAddress, hash, index, blockHash, blockNumber, logsBloom, logs, byzantium, status, root } = this;
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
    async confirmations() {
        return (await this.provider.getBlockNumber()) - this.blockNumber + 1;
    }
    removedEvent() {
        return createRemovedTransactionFilter(this);
    }
    reorderedEvent(other) {
        if (other && !other.isMined()) {
            return logger.throwError("unmined 'other' transction cannot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "reorderedEvent(other)"
            });
        }
        return createReorderedTransactionFilter(this, other);
    }
}
;
export class TransactionResponse {
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
    constructor(tx, provider) {
        if (provider == null) {
            provider = dummyProvider;
        }
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
    }
    //connect(provider: Provider): TransactionResponse {
    //    return new TransactionResponse(this, provider);
    //}
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
    async wait(confirms) {
        return this.provider.waitForTransaction(this.hash, confirms);
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
            return logger.throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
        }
        return createRemovedTransactionFilter(this);
    }
    reorderedEvent(other) {
        if (!this.isMined()) {
            return logger.throwError("unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
        }
        if (other && !other.isMined()) {
            return logger.throwError("unmined 'other' transaction canot be orphaned", "UNSUPPORTED_OPERATION", {
                operation: "removeEvent()"
            });
        }
        return createReorderedTransactionFilter(this, other);
    }
}
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
function fail() {
    throw new Error("this provider should not be used");
}
class DummyProvider {
    get provider() { return this; }
    async getNetwork() { return fail(); }
    async getFeeData() { return fail(); }
    async estimateGas(tx) { return fail(); }
    async call(tx) { return fail(); }
    async resolveName(name) { return fail(); }
    // State
    async getBlockNumber() { return fail(); }
    // Account
    async getBalance(address, blockTag) {
        return fail();
    }
    async getTransactionCount(address, blockTag) {
        return fail();
    }
    async getCode(address, blockTag) {
        return fail();
    }
    async getStorageAt(address, position, blockTag) {
        return fail();
    }
    // Write
    async broadcastTransaction(signedTx) { return fail(); }
    // Queries
    async getBlock(blockHashOrBlockTag) {
        return fail();
    }
    async getBlockWithTransactions(blockHashOrBlockTag) {
        return fail();
    }
    async getTransaction(hash) {
        return fail();
    }
    async getTransactionReceipt(hash) {
        return fail();
    }
    // Bloom-filter Queries
    async getLogs(filter) {
        return fail();
    }
    // ENS
    async lookupAddress(address) {
        return fail();
    }
    async waitForTransaction(hash, confirms, timeout) {
        return fail();
    }
    async waitForBlock(blockTag) {
        return fail();
    }
    // EventEmitterable
    async on(event, listener) { return fail(); }
    async once(event, listener) { return fail(); }
    async emit(event, ...args) { return fail(); }
    async listenerCount(event) { return fail(); }
    async listeners(event) { return fail(); }
    async off(event, listener) { return fail(); }
    async removeAllListeners(event) { return fail(); }
    async addListener(event, listener) { return fail(); }
    async removeListener(event, listener) { return fail(); }
}
/**
 *  A singleton [[Provider]] instance that can be used as a placeholder. This
 *  allows API that have a Provider added later to not require a null check.
 *
 *  All operations performed on this [[Provider]] will throw.
 */
export const dummyProvider = new DummyProvider();
//# sourceMappingURL=provider.js.map