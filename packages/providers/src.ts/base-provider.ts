"use strict";

import {
    Block, BlockTag, BlockWithTransactions, EventType, Filter, FilterByBlockHash, ForkEvent,
    Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse
} from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { arrayify, hexDataLength, hexlify, hexValue, isHexString } from "@ethersproject/bytes";
import * as errors from "@ethersproject/errors";
import { namehash } from "@ethersproject/hash";
import { getNetwork, Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly, resolveProperties } from "@ethersproject/properties";
import { Transaction } from "@ethersproject/transactions";
import { toUtf8String } from "@ethersproject/strings";
import { poll } from "@ethersproject/web";

import { Formatter } from "./formatter";


//////////////////////////////
// Event Serializeing

function checkTopic(topic: string): string {
     if (topic == null) { return "null"; }
     if (hexDataLength(topic) !== 32) {
         errors.throwArgumentError("invalid topic", "topic", topic);
     }
     return topic.toLowerCase();
}

function serializeTopics(topics: Array<string | Array<string>>): string {

    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics[topics.length - 1] == null) { topics.pop(); }

    return topics.map((topic) => {
        if (Array.isArray(topic)) {

            // Only track unique OR-topics
            let unique: { [ topic: string ]: boolean } = { }
            topic.forEach((topic) => {
                unique[checkTopic(topic)] = true;
            });

            // The order of OR-topics does not matter
            let sorted = Object.keys(unique);
            sorted.sort();

            return sorted.join("|");
        } else {
            return checkTopic(topic);
        }
    }).join("&");
}

function deserializeTopics(data: string): Array<string | Array<string>> {
    return data.split(/&/g).map((topic) => {
        return topic.split("|").map((topic) => {
            return ((topic === "null") ? null: topic);
        });
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
        errors.warn("not implemented");
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
 *   - "pending"
 *   - "error"
 *   - filter
 *   - topics array
 *   - transaction hash
 */

class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;

    constructor(tag: string, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }

    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || this.tag === "block" || this.tag === "pending");
    }
}


let defaultFormatter: Formatter = null;

let nextPollId = 1;

export class BaseProvider extends Provider {
    _network: Network;

    _events: Array<Event>;

    formatter: Formatter;

    // To help mitigate the eventually conssitent nature of the blockchain
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
    _poller: any; // @TODO: what does TypeScript think setInterval returns?

    _lastBlockNumber: number;

    _fastBlockNumber: number;
    _fastBlockNumberPromise: Promise<number>;
    _fastQueryDate: number;


    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    ready: Promise<Network>;

    constructor(network: Networkish | Promise<Network>) {
        errors.checkNew(new.target, Provider);

        super();

        this.formatter = new.target.getFormatter();

        if (network instanceof Promise) {
            defineReadOnly(this, "ready", network.then((network) => {
                defineReadOnly(this, "_network", network);
                return network;
            }));

            // Squash any "unhandled promise" errors; that do not need to be handled
            this.ready.catch((error) => { });

        } else {
            let knownNetwork = getNetwork((network == null) ? "homestead": network);
            if (knownNetwork) {
                defineReadOnly(this, "_network", knownNetwork);
                defineReadOnly(this, "ready", Promise.resolve(this._network));

            } else {
                errors.throwError("invalid network", errors.INVALID_ARGUMENT, { arg: "network", value: network });
            }
        }

        this._lastBlockNumber = -2;

        // Events being listened to
        this._events = [];

        this._pollingInterval = 4000;

        this._emitted = { block: -2 };

        this._fastQueryDate = 0;
    }

    static getFormatter(): Formatter {
        if (defaultFormatter == null) {
            defaultFormatter = new Formatter();
        }
        return defaultFormatter;
    }

    poll(): void {
        let pollId = nextPollId++;
        this.emit("willPoll", pollId);

        // Track all running promises, so we can trigger a post-poll once they are complete
        let runners: Array<Promise<void>> = [];

        this.getBlockNumber().then((blockNumber) => {
            this._setFastBlockNumber(blockNumber);

            // If the block has not changed, meh.
            if (blockNumber === this._lastBlockNumber) { return; }

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
                    let eventBlockNumber = this._emitted[key];

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
                let comps = event.tag.split(":");
                switch (comps[0]) {
                    case "tx": {
                        let hash = comps[1];
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
                        let topics = deserializeTopics(comps[2]);
                        let filter = {
                            address: comps[1],
                            fromBlock: this._lastBlockNumber + 1,
                            toBlock: blockNumber,
                            topics: topics
                        }
                        if (!filter.address) { delete filter.address; }
                        let runner = this.getLogs(filter).then((logs) => {
                            if (logs.length === 0) { return; }
                            logs.forEach((log: Log) => {
                                this._emitted["b:" + log.blockHash] = log.blockNumber;
                                this._emitted["t:" + log.transactionHash] = log.blockNumber;
                                this.emit(filter, log);
                            });
                            return null;
                        }).catch((error: Error) => { this.emit("error", error); });

                        runners.push(runner);

                        break;
                    }
                }
            });

            this._lastBlockNumber = blockNumber;

            return null;
        }).catch((error: Error) => { });

        Promise.all(runners).then(() => {
            this.emit("didPoll", pollId);
        });
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
        return this._fastBlockNumber;
    }

    get polling(): boolean {
        return (this._poller != null);
    }

    set polling(value: boolean) {
        setTimeout(() => {
            if (value && !this._poller) {
                this._poller = setInterval(this.poll.bind(this), this.pollingInterval);

            } else if (!value && this._poller) {
                clearInterval(this._poller);
                this._poller = null;
            }
        }, 0);
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
        let now = getTime();

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

    waitForTransaction(transactionHash: string, confirmations?: number): Promise<TransactionReceipt> {
        if (confirmations == null) { confirmations = 1; }

        if (confirmations === 0) {
            return this.getTransactionReceipt(transactionHash);
        }

        return new Promise((resolve) => {
            let handler = (receipt: TransactionReceipt) => {
                if (receipt.confirmations < confirmations) { return; }
                this.removeListener(transactionHash, handler);
                resolve(receipt);
            }
            this.on(transactionHash, handler);
        });
    }

    _runPerform(method: string, params: { [ key: string ]: () => any }): Promise<any> {
        return this.ready.then(() => {
            // Execute all the functions now that we are "ready"
            Object.keys(params).forEach((key) => {
                params[key] = params[key]();
            });
            return resolveProperties(params).then((params) => {
                return this.perform(method, params);
            });
        });
    }

    getBlockNumber(): Promise<number> {
        return this._runPerform("getBlockNumber", { }).then((result) => {
            let value = parseInt(result);
            if (value != result) { throw new Error("invalid response - getBlockNumber"); }
            this._setFastBlockNumber(value);
            return value;
        });
    }

    getGasPrice(): Promise<BigNumber> {
        return this._runPerform("getGasPrice", { }).then((result) => {
            return BigNumber.from(result);
        });
    }

    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> {
        return this._runPerform("getBalance", {
            address: () => this._getAddress(addressOrName),
            blockTag: () => this._getBlockTag(blockTag)
        }).then((result) => {
            return BigNumber.from(result);
        });
    }

    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> {
        return this._runPerform("getTransactionCount", {
            address: () => this._getAddress(addressOrName),
            blockTag: () => this._getBlockTag(blockTag)
        }).then((result) => {
            return BigNumber.from(result).toNumber();
        });
    }

    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return this._runPerform("getCode", {
            address: () => this._getAddress(addressOrName),
            blockTag: () => this._getBlockTag(blockTag)
        }).then((result) => {
            return hexlify(result);
        });
    }

    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return this._runPerform("getStorageAt", {
            address: () => this._getAddress(addressOrName),
            blockTag: () => this._getBlockTag(blockTag),
            position: () => Promise.resolve(position).then((p) => hexValue(p))
        }).then((result) => {
            return hexlify(result);
        });
    }

    // This should be called by any subclass wrapping a TransactionResponse
    _wrapTransaction(tx: Transaction, hash?: string): TransactionResponse {
        if (hash != null && hexDataLength(hash) !== 32) { throw new Error("invalid response - sendTransaction"); }

        let result = <TransactionResponse>tx;

        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            errors.throwError("Transaction hash mismatch from Provider.sendTransaction.", errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }

        // @TODO: (confirmations? number, timeout? number)
        result.wait = (confirmations?: number) => {

            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.hash] = "pending";
            }

            return this.waitForTransaction(tx.hash, confirmations).then((receipt) => {
                if (receipt == null && confirmations === 0) { return null; }

                // No longer pending, allow the polling loop to garbage collect this
                this._emitted["t:" + tx.hash] = receipt.blockNumber;

                if (receipt.status === 0) {
                    errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
                        transactionHash: tx.hash,
                        transaction: tx
                    });
                }
                return receipt;
            });
        };

        return result;
    }

    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        return this._runPerform("sendTransaction", {
            signedTransaction: () => Promise.resolve(signedTransaction).then(t => hexlify(t))
        }).then((result) => {
            return this._wrapTransaction(this.formatter.transaction(signedTransaction), result);
        }, (error) => {
            error.transaction = this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                (<any>error).transactionHash = error.transaction.hash;
            }
            throw error;
        });
    }

    _getTransactionRequest(transaction: TransactionRequest | Promise<TransactionRequest>): Promise<Transaction> {
        return Promise.resolve(transaction).then((t: any) => {
            let tx: any = { };
            ["from", "to"].forEach((key) => {
                if (t[key] == null) { return; }
                tx[key] = Promise.resolve(t[key]).then(a => (a ? this._getAddress(a): null))
            });
            ["data", "gasLimit", "gasPrice", "value"].forEach((key) => {
                if (t[key] == null) { return; }
                tx[key] = t[key];
            });
            return resolveProperties(tx).then((t) => this.formatter.transactionRequest(t));
        });
    }

    _getFilter(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Filter | FilterByBlockHash> {
        return Promise.resolve(filter).then((f: any) => {
            let filter: any = { };

            if (f.address != null) {
               filter.address = this._getAddress(f.address);
            }

            if (f.topics) {
               filter.topics = f.topics;
            }

            if (f.blockHash != null) {
                filter.blockHash = f.blockHash;
            }

            ["fromBlock", "toBlock"].forEach((key) => {
                if (f[key] == null) { return; }
                filter[key] = this._getBlockTag(f[key]);
            });

            return resolveProperties(filter).then((f) => this.formatter.filter(f));
        });
    }


    call(transaction: TransactionRequest | Promise<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return this._runPerform("call", {
            transaction: () => this._getTransactionRequest(transaction),
            blockTag: () => this._getBlockTag(blockTag)
        }).then((result) => {
            return hexlify(result);
        });
    }

    estimateGas(transaction: TransactionRequest | Promise<TransactionRequest>) {
        return this._runPerform("estimateGas", {
            transaction: () => this._getTransactionRequest(transaction)
        }).then((result) => {
            return BigNumber.from(result);
        });
    }

    _getAddress(addressOrName: string | Promise<string>): Promise<string> {
        return this.resolveName(addressOrName).then((address) => {
            if (address == null) {
                errors.throwError("ENS name not configured", errors.UNSUPPORTED_OPERATION, {
                    operation: `resolveName(${ JSON.stringify(addressOrName) })`
                });
            }
            return address;
        });
    }

    _getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>, includeTransactions?: boolean): Promise<Block | BlockWithTransactions> {
        return this.ready.then(() => {
            return this._getBlockTag(blockHashOrBlockTag).then((blockHashOrBlockTag) => {
                let params: { [key: string]: any } = {
                    includeTransactions: !!includeTransactions
                };

                // Exactly one of blockHash or blockTag will be set
                let blockHash: string = null;
                let blockTag: string = null;

                // If blockTag is a number (not "latest", etc), this is the block number
                let blockNumber = -128;

                if (isHexString(blockHashOrBlockTag, 32)) {
                    params.blockHash = blockHashOrBlockTag;
                } else {
                    try {
                        params.blockTag = this.formatter.blockTag(blockHashOrBlockTag);
                        if (isHexString(params.blockTag)) {
                            blockNumber = parseInt(params.blockTag.substring(2), 16);
                        }
                    } catch (error) {
                        errors.throwError("invalid block hash or block tag", "blockHashOrBlockTag", blockHashOrBlockTag);
                    }
                }

                return poll(() => {
                    return this.perform("getBlock", params).then((block) => {

                        // Block was not found
                        if (block == null) {

                            // For blockhashes, if we didn't say it existed, that blockhash may
                            // not exist. If we did see it though, perhaps from a log, we know
                            // it exists, and this node is just not caught up yet.
                            if (blockHash) {
                                if (this._emitted["b:" + blockHash] == null) { return null; }
                            }

                            // For block tags, if we are asking for a future block, we return null
                            if (blockTag) {
                                if (blockNumber > this._emitted.block) { return null; }
                            }

                            // Retry on the next block
                            return undefined;
                        }

                        // Add transactions
                        if (includeTransactions) {
                            return this.formatter.blockWithTransactions(block);
                        }

                        return this.formatter.block(block);
                    });
                }, { onceBlock: this });
            });
        });
    }

    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> {
        return <Promise<Block>>(this._getBlock(blockHashOrBlockTag, false));
    }

    getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions> {
        return <Promise<BlockWithTransactions>>(this._getBlock(blockHashOrBlockTag, true));
    }

    getTransaction(transactionHash: string): Promise<TransactionResponse> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    return this.perform("getTransaction", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }

                        let tx = this.formatter.transactionResponse(result);

                        if (tx.blockNumber == null) {
                            tx.confirmations = 0;

                        } else if (tx.confirmations == null) {
                            return this._getFastBlockNumber().then((blockNumber) => {

                                // Add the confirmations using the fast block number (pessimistic)
                                let confirmations = (blockNumber - tx.blockNumber) + 1;
                                if (confirmations <= 0) { confirmations = 1; }
                                tx.confirmations = confirmations;

                                return this._wrapTransaction(tx);
                            });
                        }

                        return this._wrapTransaction(tx);
                    });
                }, { onceBlock: this });
            });
        });
    }

    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    return this.perform("getTransactionReceipt", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }

                        // "geth-etc" returns receipts before they are ready
                        if (result.blockHash == null) { return undefined; }

                        let receipt = this.formatter.receipt(result);

                        if (receipt.blockNumber == null) {
                            receipt.confirmations = 0;

                        } else if (receipt.confirmations == null) {
                            return this._getFastBlockNumber().then((blockNumber) => {

                                // Add the confirmations using the fast block number (pessimistic)
                                let confirmations = (blockNumber - receipt.blockNumber) + 1;
                                if (confirmations <= 0) { confirmations = 1; }
                                receipt.confirmations = confirmations;

                                return receipt;
                            });
                        }

                        return receipt;
                    });
                }, { onceBlock: this });
            });
        });
    }


    getLogs(filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Array<Log>> {
        return this._runPerform("getLogs", {
            filter: () => this._getFilter(filter)
        }).then((result) => {
            return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(result);
        });
    }

    getEtherPrice(): Promise<number> {
        return this._runPerform("getEtherPrice", { }).then((result) => {
            return result;
        });
    }

    _getBlockTag(blockTag: BlockTag | Promise<BlockTag>): Promise<BlockTag> {
        if (blockTag instanceof Promise) {
            return blockTag.then((b) => this._getBlockTag(b));
        }

        if (typeof(blockTag) === "number" && blockTag < 0) {
            if (blockTag % 1) {
                errors.throwArgumentError("invalid BlockTag", "blockTag", blockTag);
            }

            return this._getFastBlockNumber().then((bn) => {
                bn += blockTag;
                if (bn < 0) { bn = 0; }
                return this.formatter.blockTag(bn)
            });
        }

        return Promise.resolve(this.formatter.blockTag(blockTag));
    }


    _getResolver(name: string): Promise<string> {
        // Get the resolver from the blockchain
        return this.getNetwork().then((network) => {

            // No ENS...
            if (!network.ensAddress) {
                errors.throwError(
                    "network does support ENS",
                    errors.UNSUPPORTED_OPERATION,
                    { operation: "ENS", network: network.name }
                );
            }

            // keccak256("resolver(bytes32)")
            let data = "0x0178b8bf" + namehash(name).substring(2);
            let transaction = { to: network.ensAddress, data: data };

            return this.call(transaction).then((data) => {
                return this.formatter.callAddress(data);
            });
        });
    }

    resolveName(name: string | Promise<string>): Promise<string> {

        // If it is a promise, resolve it then recurse
        if (name instanceof Promise) {
            return name.then((addressOrName) => this.resolveName(addressOrName));
        }

        // If it is already an address, nothing to resolve
        try {
            return Promise.resolve(this.formatter.address(name));
        } catch (error) { }

        // Get the addr from the resovler
        return this._getResolver(name).then((resolverAddress) => {
            if (!resolverAddress) { return null; }

            // keccak256("addr(bytes32)")
            let data = "0x3b3b57de" + namehash(name).substring(2);
            let transaction = { to: resolverAddress, data: data };
            return this.call(transaction).then((data) => {
                return this.formatter.callAddress(data);
            });
        });
    }

    lookupAddress(address: string | Promise<string>): Promise<string> {
        if (address instanceof Promise) {
            return address.then((address) => this.lookupAddress(address));
        }

        address = this.formatter.address(address);

        let name = address.substring(2) + ".addr.reverse"

        return this._getResolver(name).then((resolverAddress) => {
            if (!resolverAddress) { return null; }

            // keccak("name(bytes32)")
            let data = "0x691f3431" + namehash(name).substring(2);
            return this.call({ to: resolverAddress, data: data }).then((data) => {
                let bytes = arrayify(data);

                // Strip off the dynamic string pointer (0x20)
                if (bytes.length < 32 || !BigNumber.from(bytes.slice(0, 32)).eq(32)) { return null; }
                bytes = bytes.slice(32);

                if (bytes.length < 32) { return null; }
                let length = BigNumber.from(bytes.slice(0, 32)).toNumber();
                bytes = bytes.slice(32);

                if (length > bytes.length) { return null; }

                let name = toUtf8String(bytes.slice(0, length));

                // Make sure the reverse record matches the foward record
                return this.resolveName(name).then((addr) => {
                    if (addr != address) { return null; }
                    return name;
                });
            });
        });
    }

    perform(method: string, params: any): Promise<any> {
        return errors.throwError(method + " not implemented", errors.NOT_IMPLEMENTED, { operation: method });
    }

    _startPending(): void {
        console.log("WARNING: this provider does not support pending events");
    }

    _stopPending(): void {
    }

    // Returns true if there are events that still require polling
    _checkPolling(): void {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }

    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this {
        this._events.push(new Event(getEventTag(eventName), listener, once));

        if (eventName === "pending") { this._startPending(); }

        // Do we still now have any events that require polling?
        this._checkPolling();

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

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) { return true; }
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;
            return !(event.once);
        });

        // Do we still have any events that require polling? ("once" events remove themselves)
        this._checkPolling();

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

        let found = false;

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) { return true; }
            if (found) { return true; }
            found = true;
            return false;
        });

        if (eventName === "pending" && this.listenerCount("pending") === 0) { this._stopPending(); }

        // Do we still have any events that require polling?
        this._checkPolling();

        return this;
    }

    removeAllListeners(eventName?: EventType): this {
        if (eventName == null) {
            this._events = [ ];
            this._stopPending();
        } else {
            let eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                return (event.tag !== eventTag);
            });
            if (eventName === "pending") { this._stopPending(); }
        }

        // Do we still have any events that require polling?
        this._checkPolling();

        return this;
    }

}
