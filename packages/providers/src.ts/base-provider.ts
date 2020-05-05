"use strict";

import {
    Block, BlockTag, BlockWithTransactions, EventType, Filter, FilterByBlockHash, ForkEvent,
    Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse
} from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { arrayify, hexDataLength, hexlify, hexValue, isHexString } from "@ethersproject/bytes";
import { namehash } from "@ethersproject/hash";
import { getNetwork, Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly, getStatic, resolveProperties } from "@ethersproject/properties";
import { Transaction } from "@ethersproject/transactions";
import { toUtf8String } from "@ethersproject/strings";
import { poll } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { Formatter } from "./formatter";


//////////////////////////////
// Event Serializeing

function checkTopic(topic: string): string {
     if (topic == null) { return "null"; }
     if (hexDataLength(topic) !== 32) {
         logger.throwArgumentError("invalid topic", "topic", topic);
     }
     return topic.toLowerCase();
}

function serializeTopics(topics: Array<string | Array<string>>): string {
    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics.length > 0 && topics[topics.length - 1] == null) { topics.pop(); }

    return topics.map((topic) => {
        if (Array.isArray(topic)) {

            // Only track unique OR-topics
            const unique: { [ topic: string ]: boolean } = { }
            topic.forEach((topic) => {
                unique[checkTopic(topic)] = true;
            });

            // The order of OR-topics does not matter
            const sorted = Object.keys(unique);
            sorted.sort();

            return sorted.join("|");

        } else {
            return checkTopic(topic);
        }
    }).join("&");
}

function deserializeTopics(data: string): Array<string | Array<string>> {
    if (data === "") { return [ ]; }

    return data.split(/&/g).map((topic) => {
        if (topic === "") { return [ ]; }

        const comps = topic.split("|").map((topic) => {
            return ((topic === "null") ? null: topic);
        });

        return ((comps.length === 1) ? comps[0]: comps);
    });
}

function getEventTag(eventName: EventType): string {
    if (typeof(eventName) === "string") {
        eventName = eventName.toLowerCase();

        if (hexDataLength(eventName) === 32) {
            return "tx:" + eventName;
        }

        if (eventName.indexOf(":") === -1) {
            return eventName;
        }

    } else if (Array.isArray(eventName)) {
        return "filter:*:" + serializeTopics(eventName);

    } else if (ForkEvent.isForkEvent(eventName)) {
        logger.warn("not implemented");
        throw new Error("not implemented");

    } else if (eventName && typeof(eventName) === "object") {
        return "filter:" + (eventName.address || "*") + ":" + serializeTopics(eventName.topics || []);
    }

    throw new Error("invalid event - " + eventName);
}

//////////////////////////////
// Helper Object

function getTime() {
    return (new Date()).getTime();
}

//////////////////////////////
// Provider Object


/**
 *  EventType
 *   - "block"
 *   - "poll"
 *   - "pending"
 *   - "error"
 *   - filter
 *   - topics array
 *   - transaction hash
 */

export class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;

    constructor(tag: string, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }

    get event(): EventType {
        switch (this.type) {
            case "tx":
               return this.hash;
            case "filter":
               return this.filter;
        }
        return this.tag;
    }

    get type(): string {
        return this.tag.split(":")[0]
    }

    get hash(): string {
        const comps = this.tag.split(":");
        if (comps[0] !== "tx") { return null; }
        return comps[1];
    }

    get filter(): Filter {
        const comps = this.tag.split(":");
        if (comps[0] !== "filter") { return null; }
        const address = comps[1];

        const topics = deserializeTopics(comps[2]);
        const filter: Filter = { };

        if (topics.length > 0) { filter.topics = topics; }
        if (address && address !== "*") { filter.address = address; }

        return filter;
    }

    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || this.tag === "block" || this.tag === "pending" || this.tag === "poll");
    }
}


let defaultFormatter: Formatter = null;

let nextPollId = 1;


export class BaseProvider extends Provider {
    _networkPromise: Promise<Network>;
    _network: Network;

    _events: Array<Event>;

    formatter: Formatter;

    // To help mitigate the eventually consistent nature of the blockchain
    // we keep a mapping of events we emit. If we emit an event X, we expect
    // that a user should be able to query for that event in the callback,
    // if the node returns null, we stall the response until we get back a
    // meaningful value, since we may be hitting a re-org, or a node that
    // has not indexed the event yet.
    // Events:
    //   - t:{hash}    - Transaction hash
    //   - b:{hash}    - BlockHash
    //   - block       - The most recent emitted block
    _emitted: { [ eventName: string ]: number | "pending" };

    _pollingInterval: number;
    _poller: NodeJS.Timer;
    _bootstrapPoll: NodeJS.Timer;

    _lastBlockNumber: number;

    _fastBlockNumber: number;
    _fastBlockNumberPromise: Promise<number>;
    _fastQueryDate: number;

    _maxInternalBlockNumber: number;
    _internalBlockNumber: Promise<{ blockNumber: number, reqTime: number, respTime: number }>;


    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */

    constructor(network: Networkish | Promise<Network>) {
        logger.checkNew(new.target, Provider);

        super();

        this.formatter = new.target.getFormatter();

        if (network instanceof Promise) {
            this._networkPromise = network;

            // Squash any "unhandled promise" errors; that do not need to be handled
            network.catch((error) => { });

        } else {
            const knownNetwork = getStatic<(network: Networkish) => Network>(new.target, "getNetwork")(network);
            if (knownNetwork) {
                defineReadOnly(this, "_network", knownNetwork);

            } else {
                logger.throwArgumentError("invalid network", "network", network);
            }
        }

        this._maxInternalBlockNumber = -1024;

        this._lastBlockNumber = -2;

        // Events being listened to
        this._events = [];

        this._pollingInterval = 4000;

        this._emitted = { block: -2 };

        this._fastQueryDate = 0;
    }

    async _ready(): Promise<Network> {
        if (this._network == null) {
            let network: Network = null;
            if (this._networkPromise) {
                try {
                    network = await this._networkPromise;
                } catch (error) { }
            }

            // Try the Provider's network detection (this MUST throw if it cannot)
            if (network == null) {
                network = await this.detectNetwork();
            }

            // This should never happen; every Provider sub-class should have
            // suggested a network by here (or thrown).
            if (!network) {
                logger.throwError("no network detected", Logger.errors.UNKNOWN_ERROR, { });
            }

            defineReadOnly(this, "_network", network);
        }

        return this._network;
    }

    get ready(): Promise<Network> {
        return this._ready();
    }

    async detectNetwork(): Promise<Network> {
        return logger.throwError("provider does not support network detection", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "provider.detectNetwork"
        });
    }

    static getFormatter(): Formatter {
        if (defaultFormatter == null) {
            defaultFormatter = new Formatter();
        }
        return defaultFormatter;
    }

    static getNetwork(network: Networkish): Network {
        return getNetwork((network == null) ? "homestead": network);
    }

    async _getInternalBlockNumber(maxAge: number): Promise<number> {
        await this.ready;

        const internalBlockNumber = this._internalBlockNumber;

        if (maxAge > 0 && this._internalBlockNumber) {
            const result = await internalBlockNumber;
            if ((getTime() - result.respTime) <= maxAge) {
                return result.blockNumber;
            }
        }

        const reqTime = getTime();
        this._internalBlockNumber = this.perform("getBlockNumber", { }).then((blockNumber) => {
            const respTime = getTime();
            blockNumber = BigNumber.from(blockNumber).toNumber();
            if (blockNumber < this._maxInternalBlockNumber) { blockNumber = this._maxInternalBlockNumber; }
            this._maxInternalBlockNumber = blockNumber;
            this._setFastBlockNumber(blockNumber); // @TODO: Still need this?
            return { blockNumber, reqTime, respTime };
        });

        return (await this._internalBlockNumber).blockNumber;
    }

    async poll(): Promise<void> {
        const pollId = nextPollId++;

        this.emit("willPoll", pollId);

        // Track all running promises, so we can trigger a post-poll once they are complete
        const runners: Array<Promise<void>> = [];

        const blockNumber = await this._getInternalBlockNumber(100 + this.pollingInterval / 2);
        this._setFastBlockNumber(blockNumber);

        // Emit a poll event after we have the latest (fast) block number
        this.emit("poll", pollId, blockNumber);

        // If the block has not changed, meh.
        if (blockNumber === this._lastBlockNumber) {
            this.emit("didPoll", pollId);
            return;
        }

        // First polling cycle, trigger a "block" events
        if (this._emitted.block === -2) {
            this._emitted.block = blockNumber - 1;
        }

        // Notify all listener for each block that has passed
        for (let i = (<number>this._emitted.block) + 1; i <= blockNumber; i++) {
            this.emit("block", i);
        }

        // The emitted block was updated, check for obsolete events
        if ((<number>this._emitted.block) !== blockNumber) {
            this._emitted.block = blockNumber;

            Object.keys(this._emitted).forEach((key) => {
                // The block event does not expire
                if (key === "block") { return; }

                // The block we were at when we emitted this event
                const eventBlockNumber = this._emitted[key];

                // We cannot garbage collect pending transactions or blocks here
                // They should be garbage collected by the Provider when setting
                // "pending" events
                if (eventBlockNumber === "pending") { return; }

                // Evict any transaction hashes or block hashes over 12 blocks
                // old, since they should not return null anyways
                if (blockNumber - eventBlockNumber > 12) {
                    delete this._emitted[key];
                }
            });
        }

        // First polling cycle
        if (this._lastBlockNumber === -2) {
            this._lastBlockNumber = blockNumber - 1;
        }

        // Find all transaction hashes we are waiting on
        this._events.forEach((event) => {
            switch (event.type) {
                case "tx": {
                    const hash = event.hash;
                    let runner = this.getTransactionReceipt(hash).then((receipt) => {
                        if (!receipt || receipt.blockNumber == null) { return null; }
                        this._emitted["t:" + hash] = receipt.blockNumber;
                        this.emit(hash, receipt);
                        return null;
                    }).catch((error: Error) => { this.emit("error", error); });

                    runners.push(runner);

                    break;
                }

                case "filter": {
                    const filter = event.filter;
                    filter.fromBlock = this._lastBlockNumber + 1;
                    filter.toBlock = blockNumber;

                    const runner = this.getLogs(filter).then((logs) => {
                        if (logs.length === 0) { return; }
                        logs.forEach((log: Log) => {
                            this._emitted["b:" + log.blockHash] = log.blockNumber;
                            this._emitted["t:" + log.transactionHash] = log.blockNumber;
                            this.emit(filter, log);
                        });
                    }).catch((error: Error) => { this.emit("error", error); });
                    runners.push(runner);

                    break;
                }
            }
        });

        this._lastBlockNumber = blockNumber;

        Promise.all(runners).then(() => {
            this.emit("didPoll", pollId);
        });

        return null;
    }

    resetEventsBlock(blockNumber: number): void {
        this._lastBlockNumber = blockNumber - 1;
        if (this.polling) { this.poll(); }
    }

    get network(): Network {
        return this._network;
    }

    getNetwork(): Promise<Network> {
        return this.ready;
    }

    get blockNumber(): number {
        this._getInternalBlockNumber(100 + this.pollingInterval / 2).then((blockNumber) => {
            this._setFastBlockNumber(blockNumber);
        });

        return (this._fastBlockNumber != null) ? this._fastBlockNumber: -1;
    }

    get polling(): boolean {
        return (this._poller != null);
    }

    set polling(value: boolean) {
        if (value && !this._poller) {
            this._poller = setInterval(this.poll.bind(this), this.pollingInterval);

            if (!this._bootstrapPoll) {
                this._bootstrapPoll = setTimeout(() => {
                    this.poll();

                    // We block additional polls until the polling interval
                    // is done, to prevent overwhelming the poll function
                    this._bootstrapPoll = setTimeout(() => {
                        // If polling was disabled, something may require a poke
                        // since starting the bootstrap poll and it was disabled
                        if (!this._poller) { this.poll(); }

                        // Clear out the bootstrap so we can do another
                        this._bootstrapPoll = null;
                    }, this.pollingInterval);
                }, 0);
            }

        } else if (!value && this._poller) {
            clearInterval(this._poller);
            this._poller = null;
        }
    }

    get pollingInterval(): number {
        return this._pollingInterval;
    }

    set pollingInterval(value: number) {
        if (typeof(value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
            throw new Error("invalid polling interval");
        }

        this._pollingInterval = value;

        if (this._poller) {
            clearInterval(this._poller);
            this._poller = setInterval(() => { this.poll() }, this._pollingInterval);
        }
    }

    _getFastBlockNumber(): Promise<number> {
        const now = getTime();

        // Stale block number, request a newer value
        if ((now - this._fastQueryDate) > 2 * this._pollingInterval) {
            this._fastQueryDate = now;
            this._fastBlockNumberPromise = this.getBlockNumber().then((blockNumber) => {
                if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
                    this._fastBlockNumber = blockNumber;
                }
                return this._fastBlockNumber;
            });
        }

        return this._fastBlockNumberPromise;
    }

    _setFastBlockNumber(blockNumber: number): void {
        // Older block, maybe a stale request
        if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) { return; }

        // Update the time we updated the blocknumber
        this._fastQueryDate = getTime();

        // Newer block number, use  it
        if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
            this._fastBlockNumber = blockNumber;
            this._fastBlockNumberPromise = Promise.resolve(blockNumber);
        }
    }

    // @TODO: Add .poller which must be an event emitter with a 'start', 'stop' and 'block' event;
    //        this will be used once we move to the WebSocket or other alternatives to polling

    async waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt> {
        if (confirmations == null) { confirmations = 1; }

        const receipt = await this.getTransactionReceipt(transactionHash);

        // Receipt is already good
        if ((receipt ? receipt.confirmations: 0) >= confirmations) { return receipt; }

        // Poll until the receipt is good...
        return new Promise((resolve, reject) => {
            let timer: NodeJS.Timer = null;
            let done = false;

            const handler = (receipt: TransactionReceipt) => {
                if (receipt.confirmations < confirmations) { return; }

                if (timer) { clearTimeout(timer); }
                if (done) { return; }
                done = true;

                this.removeListener(transactionHash, handler);
                resolve(receipt);
            }
            this.on(transactionHash, handler);

            if (typeof(timeout) === "number" && timeout > 0) {
                timer = setTimeout(() => {
                    if (done) { return; }
                    timer = null;
                    done = true;

                    this.removeListener(transactionHash, handler);
                    reject(logger.makeError("timeout exceeded", Logger.errors.TIMEOUT, { timeout: timeout }));
                }, timeout);
                if (timer.unref) { timer.unref(); }
            }
        });
    }

    getBlockNumber(): Promise<number> {
        return this._getInternalBlockNumber(0);
    }

    async getGasPrice(): Promise<BigNumber> {
        await this.ready;
        return BigNumber.from(await this.perform("getGasPrice", { }));
    }

    async getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> {
        await this.ready;
        const params = await resolveProperties({
            address: this._getAddress(addressOrName),
            blockTag: this._getBlockTag(blockTag)
        });
        return BigNumber.from(await this.perform("getBalance", params));
    }

    async getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> {
        await this.ready;
        const params = await resolveProperties({
            address: this._getAddress(addressOrName),
            blockTag: this._getBlockTag(blockTag)
        });
        return BigNumber.from(await this.perform("getTransactionCount", params)).toNumber();
    }

    async getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        await this.ready;
        const params = await resolveProperties({
            address: this._getAddress(addressOrName),
            blockTag: this._getBlockTag(blockTag)
        });
        return hexlify(await this.perform("getCode", params));
    }

    async getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        await this.ready;
        const params = await resolveProperties({
            address: this._getAddress(addressOrName),
            blockTag: this._getBlockTag(blockTag),
            position: Promise.resolve(position).then((p) => hexValue(p))
        });
        return hexlify(await this.perform("getStorageAt", params));
    }

    // This should be called by any subclass wrapping a TransactionResponse
    _wrapTransaction(tx: Transaction, hash?: string): TransactionResponse {
        if (hash != null && hexDataLength(hash) !== 32) { throw new Error("invalid response - sendTransaction"); }

        const result = <TransactionResponse>tx;

        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            logger.throwError("Transaction hash mismatch from Provider.sendTransaction.", Logger.errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }

        // @TODO: (confirmations? number, timeout? number)
        result.wait = async (confirmations?: number) => {

            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.hash] = "pending";
            }

            const receipt = await this.waitForTransaction(tx.hash, confirmations)
            if (receipt == null && confirmations === 0) { return null; }

            // No longer pending, allow the polling loop to garbage collect this
            this._emitted["t:" + tx.hash] = receipt.blockNumber;

            if (receipt.status === 0) {
                logger.throwError("transaction failed", Logger.errors.CALL_EXCEPTION, {
                    transactionHash: tx.hash,
                    transaction: tx,
                    receipt: receipt
                });
            }
            return receipt;
        };

        return result;
    }

    async sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        await this.ready;
        const hexTx = await Promise.resolve(signedTransaction).then(t => hexlify(t));
        const tx = this.formatter.transaction(signedTransaction);
        try {
            const hash = await this.perform("sendTransaction", { signedTransaction: hexTx });
            return this._wrapTransaction(tx, hash);
        } catch (error) {
            (<any>error).transaction = tx;
            (<any>error).transactionHash = tx.hash;
            throw error;
        }
    }

    async _getTransactionRequest(transaction: TransactionRequest | Promise<TransactionRequest>): Promise<Transaction> {
        const values: any = await transaction;

        const tx: any = { };

        ["from", "to"].forEach((key) => {
            if (values[key] == null) { return; }
            tx[key] = Promise.resolve(values[key]).then((v) => (v ? this._getAddress(v): null))
        });

        ["gasLimit", "gasPrice", "value"].forEach((key) => {
            if (values[key] == null) { return; }
            tx[key] = Promise.resolve(values[key]).then((v) => (v ? BigNumber.from(v): null));
        });

        ["data"].forEach((key) => {
            if (values[key] == null) { return; }
            tx[key] = Promise.resolve(values[key]).then((v) => (v ? hexlify(v): null));
        });

        return this.formatter.transactionRequest(await resolveProperties(tx));
    }

    async _getFilter(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Filter | FilterByBlockHash> {
        if (filter instanceof Promise) { filter = await filter; }

        const result: any = { };

        if (filter.address != null) {
            result.address = this._getAddress(filter.address);
        }

        ["blockHash", "topics"].forEach((key) => {
            if ((<any>filter)[key] == null) { return; }
            result[key] = (<any>filter)[key];
        });

        ["fromBlock", "toBlock"].forEach((key) => {
            if ((<any>filter)[key] == null) { return; }
            result[key] = this._getBlockTag((<any>filter)[key]);
        });

        return this.formatter.filter(await resolveProperties(result));
    }


    async call(transaction: TransactionRequest | Promise<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        await this.ready;
        const params = await resolveProperties({
            transaction: this._getTransactionRequest(transaction),
            blockTag: this._getBlockTag(blockTag)
        });
        return hexlify(await this.perform("call", params));
    }

    async estimateGas(transaction: TransactionRequest | Promise<TransactionRequest>): Promise<BigNumber> {
        await this.ready;
        const params = await resolveProperties({
            transaction: this._getTransactionRequest(transaction)
        });
        return BigNumber.from(await this.perform("estimateGas", params));
    }

    async _getAddress(addressOrName: string | Promise<string>): Promise<string> {
        const address = await this.resolveName(addressOrName);
        if (address == null) {
            logger.throwError("ENS name not configured", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: `resolveName(${ JSON.stringify(addressOrName) })`
            });
        }
        return address;
    }

    async _getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block | BlockWithTransactions> {
        await this.ready;

        if (blockHashOrBlockTag instanceof Promise) {
            blockHashOrBlockTag = await blockHashOrBlockTag;
        }

        // If blockTag is a number (not "latest", etc), this is the block number
        let blockNumber = -128;

        const params: { [key: string]: any } = {
            includeTransactions: !!includeTransactions
        };

        if (isHexString(blockHashOrBlockTag, 32)) {
            params.blockHash = blockHashOrBlockTag;
        } else {
            try {
                params.blockTag = this.formatter.blockTag(await this._getBlockTag(blockHashOrBlockTag));
                if (isHexString(params.blockTag)) {
                    blockNumber = parseInt(params.blockTag.substring(2), 16);
                }
            } catch (error) {
                logger.throwArgumentError("invalid block hash or block tag", "blockHashOrBlockTag", blockHashOrBlockTag);
            }
        }

        return poll(async () => {
            const block = await this.perform("getBlock", params);

            // Block was not found
            if (block == null) {

                // For blockhashes, if we didn't say it existed, that blockhash may
                // not exist. If we did see it though, perhaps from a log, we know
                // it exists, and this node is just not caught up yet.
                if (params.blockHash != null) {
                    if (this._emitted["b:" + params.blockHash] == null) { return null; }
                }

                // For block tags, if we are asking for a future block, we return null
                if (params.blockTag != null) {
                    if (blockNumber > this._emitted.block) { return null; }
                }

                // Retry on the next block
                return undefined;
            }

            // Add transactions
            if (includeTransactions) {
                let blockNumber: number = null;
                for (let i = 0; i < block.transactions.length; i++) {
                    const tx = block.transactions[i];
                    if (tx.blockNumber == null) {
                        tx.confirmations = 0;

                    } else if (tx.confirmations == null) {
                        if (blockNumber == null) {
                            blockNumber = await this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                        }

                        // Add the confirmations using the fast block number (pessimistic)
                        let confirmations = (blockNumber - tx.blockNumber) + 1;
                        if (confirmations <= 0) { confirmations = 1; }
                        tx.confirmations = confirmations;
                    }
                }
                return this.formatter.blockWithTransactions(block);
            }

            return this.formatter.block(block);
        }, { onceBlock: this });
    }

    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> {
        return <Promise<Block>>(this._getBlock(blockHashOrBlockTag, false));
    }

    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions> {
        return <Promise<BlockWithTransactions>>(this._getBlock(blockHashOrBlockTag, true));
    }

    async getTransaction(transactionHash: string | Promise<string>): Promise<TransactionResponse> {
        await this.ready;
        if (transactionHash instanceof Promise) { transactionHash = await transactionHash; }

        const params = { transactionHash: this.formatter.hash(transactionHash, true) };

        return poll(async () => {
            const result = await this.perform("getTransaction", params);

            if (result == null) {
                if (this._emitted["t:" + transactionHash] == null) {
                    return null;
                }
                return undefined;
            }

            const tx = this.formatter.transactionResponse(result);

            if (tx.blockNumber == null) {
                tx.confirmations = 0;

            } else if (tx.confirmations == null) {
                const blockNumber = await this._getInternalBlockNumber(100 + 2 * this.pollingInterval);

                // Add the confirmations using the fast block number (pessimistic)
                let confirmations = (blockNumber - tx.blockNumber) + 1;
                if (confirmations <= 0) { confirmations = 1; }
                tx.confirmations = confirmations;
            }

            return this._wrapTransaction(tx);
        }, { onceBlock: this });
    }

    async getTransactionReceipt(transactionHash: string | Promise<string>): Promise<TransactionReceipt> {
        await this.ready;

        if (transactionHash instanceof Promise) { transactionHash = await transactionHash; }

        const params = { transactionHash: this.formatter.hash(transactionHash, true) };

        return poll(async () => {
            const result = await this.perform("getTransactionReceipt", params);

            if (result == null) {
                if (this._emitted["t:" + transactionHash] == null) {
                    return null;
                }
                return undefined;
            }

            // "geth-etc" returns receipts before they are ready
            if (result.blockHash == null) { return undefined; }

            const receipt = this.formatter.receipt(result);

            if (receipt.blockNumber == null) {
                receipt.confirmations = 0;

            } else if (receipt.confirmations == null) {
                const blockNumber = await this._getInternalBlockNumber(100 + 2 * this.pollingInterval);

                // Add the confirmations using the fast block number (pessimistic)
                let confirmations = (blockNumber - receipt.blockNumber) + 1;
                if (confirmations <= 0) { confirmations = 1; }
                receipt.confirmations = confirmations;
            }

            return receipt;
        }, { onceBlock: this });
    }

    async getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Array<Log>> {
        await this.ready;
        const params = await resolveProperties({ filter: this._getFilter(filter) });
        const logs: Array<Log> = await this.perform("getLogs", params);
        logs.forEach((log) => {
            if (log.removed == null) { log.removed = false; }
        });
        return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(logs);
    }

    async getEtherPrice(): Promise<number> {
        await this.ready;
        return this.perform("getEtherPrice", { });
    }

    async _getBlockTag(blockTag: BlockTag | Promise<BlockTag>): Promise<BlockTag> {
        if (blockTag instanceof Promise) {
            blockTag = await blockTag;
        }

        if (typeof(blockTag) === "number" && blockTag < 0) {
            if (blockTag % 1) {
                logger.throwArgumentError("invalid BlockTag", "blockTag", blockTag);
            }

            let blockNumber = await this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
            blockNumber += blockTag;
            if (blockNumber < 0) { blockNumber = 0; }
            return this.formatter.blockTag(blockNumber)
        }

        return this.formatter.blockTag(blockTag);
    }


    async _getResolver(name: string): Promise<string> {
        // Get the resolver from the blockchain
        const network = await this.getNetwork();

        // No ENS...
        if (!network.ensAddress) {
            logger.throwError(
                "network does not support ENS",
                Logger.errors.UNSUPPORTED_OPERATION,
                { operation: "ENS", network: network.name }
            );
        }

        // keccak256("resolver(bytes32)")
        const transaction = {
            to: network.ensAddress,
            data: ("0x0178b8bf" + namehash(name).substring(2))
        };

        return this.formatter.callAddress(await this.call(transaction));
    }

    async resolveName(name: string | Promise<string>): Promise<string> {

        if (name instanceof Promise) { name = await name; }

        // If it is already an address, nothing to resolve
        try {
            return Promise.resolve(this.formatter.address(name));
        } catch (error) {
            // If is is a hexstring, the address is bad (See #694)
            if (isHexString(name)) { throw error; }
        }

        if (typeof(name) !== "string") {
            logger.throwArgumentError("invalid ENS name", "name", name);
        }

        // Get the addr from the resovler
        const resolverAddress = await this._getResolver(name);
        if (!resolverAddress) { return null; }

        // keccak256("addr(bytes32)")
        const transaction = {
            to: resolverAddress,
            data: ("0x3b3b57de" + namehash(name).substring(2))
        };

        return this.formatter.callAddress(await this.call(transaction));
    }

    async lookupAddress(address: string | Promise<string>): Promise<string> {
        if (address instanceof Promise) { address = await address; }

        address = this.formatter.address(address);

        const reverseName = address.substring(2).toLowerCase() + ".addr.reverse";

        const resolverAddress = await this._getResolver(reverseName);
        if (!resolverAddress) { return null; }

        // keccak("name(bytes32)")
        let bytes = arrayify(await this.call({
            to: resolverAddress,
            data: ("0x691f3431" + namehash(reverseName).substring(2))
        }));

        // Strip off the dynamic string pointer (0x20)
        if (bytes.length < 32 || !BigNumber.from(bytes.slice(0, 32)).eq(32)) { return null; }
        bytes = bytes.slice(32);

        // Not a length-prefixed string
        if (bytes.length < 32) { return null; }

        // Get the length of the string (from the length-prefix)
        const length = BigNumber.from(bytes.slice(0, 32)).toNumber();
        bytes = bytes.slice(32);

        // Length longer than available data
        if (length > bytes.length) { return null; }

        const name = toUtf8String(bytes.slice(0, length));

        // Make sure the reverse record matches the foward record
        const addr = await this.resolveName(name);
        if (addr != address) { return null; }

        return name;
    }

    perform(method: string, params: any): Promise<any> {
        return logger.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, { operation: method });
    }

    _startEvent(event: Event): void {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }

    _stopEvent(event: Event): void {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }

    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this {
        const event = new Event(getEventTag(eventName), listener, once)
        this._events.push(event);
        this._startEvent(event);

        return this;
    }

    on(eventName: EventType, listener: Listener): this {
        return this._addEventListener(eventName, listener, false);
    }

    once(eventName: EventType, listener: Listener): this {
        return this._addEventListener(eventName, listener, true);
    }


    emit(eventName: EventType, ...args: Array<any>): boolean {
        let result = false;

        let stopped: Array<Event> = [ ];

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) { return true; }

            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);

            result = true;

            if (event.once) {
                stopped.push(event);
                return false;
            }

            return true;
        });

        stopped.forEach((event) => { this._stopEvent(event); });

        return result;
    }

    listenerCount(eventName?: EventType): number {
        if (!eventName) { return this._events.length; }

        let eventTag = getEventTag(eventName);
        return this._events.filter((event) => {
            return (event.tag === eventTag);
        }).length;
    }

    listeners(eventName?: EventType): Array<Listener> {
        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }

        let eventTag = getEventTag(eventName);
        return this._events
            .filter((event) => (event.tag === eventTag))
            .map((event) => event.listener);
    }

    off(eventName: EventType, listener?: Listener): this {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }

        const stopped: Array<Event> = [ ];

        let found = false;

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) { return true; }
            if (found) { return true; }
            found = true;
            stopped.push(event);
            return false;
        });

        stopped.forEach((event) => { this._stopEvent(event); });

        return this;
    }

    removeAllListeners(eventName?: EventType): this {
        let stopped: Array<Event> = [ ];
        if (eventName == null) {
            stopped = this._events;

            this._events = [ ];
        } else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) { return true; }
                stopped.push(event);
                return false;
            });
        }

        stopped.forEach((event) => { this._stopEvent(event); });

        return this;
    }
}
