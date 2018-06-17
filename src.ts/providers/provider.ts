'use strict';

//import inherits = require('inherits');

import { getAddress, getContractAddress } from '../utils/address';
import { BigNumber, bigNumberify, BigNumberish } from '../utils/bignumber';
import { Arrayish, hexDataLength, hexDataSlice, hexlify, hexStripZeros, isHexString, stripZeros } from '../utils/convert';
import { toUtf8String } from '../utils/utf8';
import { decode as rlpDecode, encode as rlpEncode } from '../utils/rlp';
import { namehash } from '../utils/namehash';
import { getNetwork, Network } from './networks';
import { resolveProperties } from '../utils/properties';
import { parse as parseTransaction, Transaction } from '../utils/transaction';

import * as errors from '../utils/errors';

function copyObject(obj) {
    var result = {};
    for (var key in obj) { result[key] = obj[key]; }
    return result;
}

//////////////////////////////
// Exported Types

export type BlockTag = string | number;

export interface Block {
    hash: string;
    parentHash: string;
    number: number;

    timestamp: number;
    nonce: string;
    difficulty: string;

    gasLimit: BigNumber;
    gasUsed: BigNumber;

    miner: string;
    extraData: string;

    transactions: Array<string>;
}

export type TransactionRequest = {
    to?: string | Promise<string>,
    from?: string | Promise<string>,
    nonce?: number | string | Promise<number | string>,

    gasLimit?: BigNumberish | Promise<BigNumberish>,
    gasPrice?: BigNumberish | Promise<BigNumberish>,

    data?: Arrayish | Promise<Arrayish>,
    value?: BigNumberish | Promise<BigNumberish>,
    chainId?: number | Promise<number>,
}

export interface TransactionResponse extends Transaction {
    // Only if a transaction has been mined
    blockNumber?: number,
    blockHash?: string,
    timestamp?: number,

    // Not optional (as it is in Transaction)
    from: string;

    // This function waits until the transaction has been mined
    wait: (timeout?: number) => Promise<TransactionResponse>
};

export interface TransactionReceipt {
    contractAddress?: string,
    transactionIndex?: number,
    root?: string,
    gasUsed?: BigNumber,
    logsBloom?: string,
    blockHash?: string,
    transactionHash?: string,
    logs?: Array<Log>,
    blockNumber?: number,
    cumulativeGasUsed?: BigNumber,
    status?: number  // @TOOD: Check 0 or 1?
};

export type Filter = {
    fromBlock?: BlockTag,
    toBlock?: BlockTag,
    address?: string,
    topics?: Array<any>
}

// @TODO: Some of these are not options; force them?
export interface Log {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;

    removed?: boolean;

    address: string;
    data?: string;

    topics?: Array<string>;

    transactionHash?: string;
    logIndex?: number;
}

//////////////////////////////
// Request and Response Checking

// @TODO: not any?
function check(format: any, object: any): any {
    var result = {};
    for (var key in format) {
        try {
            var value = format[key](object[key]);
            if (value !== undefined) { result[key] = value; }
        } catch (error) {
            error.checkKey = key;
            error.checkValue = object[key];
            throw error;
        }
    }
    return result;
}

type CheckFunc = (value: any) => any;

function allowNull(check: CheckFunc, nullValue?: any): CheckFunc {
    return (function(value: any) {
        if (value == null) { return nullValue; }
        return check(value);
    });
}

function allowFalsish(check: CheckFunc, replaceValue): CheckFunc {
    return (function(value) {
        if (!value) { return replaceValue; }
        return check(value);
    });
}

function arrayOf(check: CheckFunc): CheckFunc {
    return (function(array: any): Array<any> {
        if (!Array.isArray(array)) { throw new Error('not an array'); }

        var result = [];

        array.forEach(function(value) {
            result.push(check(value));
        });

        return result;
    });
}

function checkHash(hash: any): string {
    if (typeof(hash) === 'string' && hexDataLength(hash) === 32) {
       return hash;
    }
    errors.throwError('invalid hash', errors.INVALID_ARGUMENT, { arg: 'hash', value: hash });
    return null;
}

function checkNumber(number): number {
    return bigNumberify(number).toNumber();
}

// Returns the difficulty as a number, or if too large (i.e. PoA network) null
function checkDifficulty(value: BigNumberish): number {
    let v = bigNumberify(value);

    try {
        return v.toNumber();
    } catch (error) { }

    return null;
}

function checkBoolean(value): boolean {
    if (typeof(value) === 'boolean') { return value; }
    if (typeof(value) === 'string') {
        if (value === 'true') { return true; }
        if (value === 'false') { return false; }
    }
    throw new Error('invaid boolean - ' + value);
}

function checkUint256(uint256: string): string {
    if (!isHexString(uint256)) {
        throw new Error('invalid uint256');
    }
    while (uint256.length < 66) {
        uint256 = '0x0' + uint256.substring(2);
    }
    return uint256;
}

/*
function checkString(string) {
    if (typeof(string) !== 'string') { throw new Error('invalid string'); }
    return string;
}
*/

function checkBlockTag(blockTag: BlockTag): string {
    if (blockTag == null) { return 'latest'; }

    if (blockTag === 'earliest') { return '0x0'; }

    if (blockTag === 'latest' || blockTag === 'pending') {
        return blockTag;
    }

    if (typeof(blockTag) === 'number') {
        return hexStripZeros(hexlify(blockTag));
    }

    if (isHexString(blockTag)) { return hexStripZeros(blockTag); }

    throw new Error('invalid blockTag');
}

var formatBlock = {
    hash: checkHash,
    parentHash: checkHash,
    number: checkNumber,

    timestamp: checkNumber,
    nonce: allowNull(hexlify),
    difficulty: checkDifficulty,

    gasLimit: bigNumberify,
    gasUsed: bigNumberify,

    miner: getAddress,
    extraData: hexlify,

    //transactions: allowNull(arrayOf(checkTransaction)),
    transactions: allowNull(arrayOf(checkHash)),

    //transactionRoot: checkHash,
    //stateRoot: checkHash,
    //sha3Uncles: checkHash,

    //logsBloom: hexlify,
};

function checkBlock(block) {
    if (block.author != null && block.miner == null) {
        block.miner = block.author;
    }
    return check(formatBlock, block);
}


var formatTransaction = {
   hash: checkHash,

   blockHash: allowNull(checkHash, null),
   blockNumber: allowNull(checkNumber, null),
   transactionIndex: allowNull(checkNumber, null),

   from: getAddress,

   gasPrice: bigNumberify,
   gasLimit: bigNumberify,
   to: allowNull(getAddress, null),
   value: bigNumberify,
   nonce: checkNumber,
   data: hexlify,

   r: allowNull(checkUint256),
   s: allowNull(checkUint256),
   v: allowNull(checkNumber),

   creates: allowNull(getAddress, null),

   raw: allowNull(hexlify),
};

export function checkTransactionResponse(transaction: any): TransactionResponse {

    // Rename gas to gasLimit
    if (transaction.gas != null && transaction.gasLimit == null) {
        transaction.gasLimit = transaction.gas;
    }

    // Some clients (TestRPC) do strange things like return 0x0 for the
    // 0 address; correct this to be a real address
    if (transaction.to && bigNumberify(transaction.to).isZero()) {
        transaction.to = '0x0000000000000000000000000000000000000000';
    }

    // Rename input to data
    if (transaction.input != null && transaction.data == null) {
        transaction.data = transaction.input;
    }

    // If to and creates are empty, populate the creates from the transaction
    if (transaction.to == null && transaction.creates == null) {
        transaction.creates = getContractAddress(transaction);
    }

    if (!transaction.raw) {
        // Very loose providers (e.g. TestRPC) don't provide a signature or raw
        if (transaction.v && transaction.r && transaction.s) {
            var raw = [
                stripZeros(hexlify(transaction.nonce)),
                stripZeros(hexlify(transaction.gasPrice)),
                stripZeros(hexlify(transaction.gasLimit)),
                (transaction.to || "0x"),
                stripZeros(hexlify(transaction.value || '0x')),
                hexlify(transaction.data || '0x'),
                stripZeros(hexlify(transaction.v || '0x')),
                stripZeros(hexlify(transaction.r)),
                stripZeros(hexlify(transaction.s)),
            ];

            transaction.raw = rlpEncode(raw);
        }
    }


    var result = check(formatTransaction, transaction);

    var networkId = transaction.networkId;

    if (isHexString(networkId)) {
        networkId = bigNumberify(networkId).toNumber();
    }

    if (typeof(networkId) !== 'number' && result.v != null) {
        networkId = (result.v - 35) / 2;
        if (networkId < 0) { networkId = 0; }
        networkId = parseInt(networkId);
    }

    if (typeof(networkId) !== 'number') { networkId = 0; }

    result.networkId = networkId;
    
    // 0x0000... should actually be null
    if (result.blockHash && result.blockHash.replace(/0/g, '') === 'x') {
        result.blockHash = null;
    }

    return result;
}

var formatTransactionRequest = {
    from: allowNull(getAddress),
    nonce: allowNull(checkNumber),
    gasLimit: allowNull(bigNumberify),
    gasPrice: allowNull(bigNumberify),
    to: allowNull(getAddress),
    value: allowNull(bigNumberify),
    data: allowNull(hexlify),
};

function checkTransactionRequest(transaction) {
    return check(formatTransactionRequest, transaction);
}

var formatTransactionReceiptLog = {
    transactionLogIndex: allowNull(checkNumber),
    transactionIndex: checkNumber,
    blockNumber: checkNumber,
    transactionHash: checkHash,
    address: getAddress,
    topics: arrayOf(checkHash),
    data: hexlify,
    logIndex: checkNumber,
    blockHash: checkHash,
};

function checkTransactionReceiptLog(log) {
    return check(formatTransactionReceiptLog, log);
}

var formatTransactionReceipt = {
    contractAddress: allowNull(getAddress, null),
    transactionIndex: checkNumber,
    root: allowNull(checkHash),
    gasUsed: bigNumberify,
    logsBloom: allowNull(hexlify),
    blockHash: checkHash,
    transactionHash: checkHash,
    logs: arrayOf(checkTransactionReceiptLog),
    blockNumber: checkNumber,
    cumulativeGasUsed: bigNumberify,
    status: allowNull(checkNumber)
};

function checkTransactionReceipt(transactionReceipt) {
    //var status = transactionReceipt.status;
    //var root = transactionReceipt.root;

    var result = check(formatTransactionReceipt, transactionReceipt);
    result.logs.forEach(function(entry, index) {
        if (entry.transactionLogIndex == null) {
            entry.transactionLogIndex = index;
        }
    });
    if (transactionReceipt.status != null) {
        result.byzantium = true;
    }
    return result;
}

function checkTopics(topics) {
    if (Array.isArray(topics)) {
        topics.forEach(function(topic) {
            checkTopics(topic);
        });

    } else if (topics != null) {
        checkHash(topics);
    }

    return topics;
}

var formatFilter = {
    fromBlock: allowNull(checkBlockTag, undefined),
    toBlock: allowNull(checkBlockTag, undefined),
    address: allowNull(getAddress, undefined),
    topics: allowNull(checkTopics, undefined),
};

function checkFilter(filter) {
    return check(formatFilter, filter);
}

var formatLog = {
    blockNumber: allowNull(checkNumber),
    blockHash: allowNull(checkHash),
    transactionIndex: checkNumber,

    removed: allowNull(checkBoolean),

    address: getAddress,
    data: allowFalsish(hexlify, '0x'),

    topics: arrayOf(checkHash),

    transactionHash: checkHash,
    logIndex: checkNumber,
}

function checkLog(log) {
    return check(formatLog, log);
}

//////////////////////////////
// Defer Promises

type AllowNullFunc = () => boolean;
type ExecuteFunc = () => Promise<any>
function stallPromise(allowNullFunc: AllowNullFunc, executeFunc: ExecuteFunc): Promise<any> {
    return new Promise(function(resolve, reject) {
        var attempt = 0;
        function check() {
            executeFunc().then(function(result) {
                // If we have a result, or are allowed null then we're done
                if (result || allowNullFunc()) {
                    resolve(result);

                // Otherwise, exponential back-off (up to 10s) our next request
                } else {
                    attempt++;
                    var timeout = 500 + 250 * Math.trunc(Math.random() * (1 << attempt));
                    if (timeout > 10000) { timeout = 10000; }
                    setTimeout(check, timeout);
                }
            }, function(error) {
                reject(error);
            });
        }
        check();
    });
}

//////////////////////////////
// Event Serializeing

function recurse(object, convertFunc) {
    if (Array.isArray(object)) {
        var result = [];
        object.forEach(function(object) {
            result.push(recurse(object, convertFunc));
        });
        return result;
    }
    return convertFunc(object);
}

function getEventString(object) {
    try {
        return 'address:' + getAddress(object);
    } catch (error) { }

    if (object === 'block') {
        return 'block';

    } else if (object === 'pending') {
        return 'pending';

    } else if (hexDataLength(object) === 32) {
        return 'tx:' + object;

    } else if (Array.isArray(object)) {
        object = recurse(object, function(object) {
            if (object == null) { object = '0x'; }
            return object;
        });

        try {
            return 'topic:' + rlpEncode(object);
        } catch (error) {
            console.log(error);
        }
    }

    throw new Error('invalid event - ' + object);
}

function parseEventString(string) {
    if (string.substring(0, 3) === 'tx:') {
        return {type: 'transaction', hash: string.substring(3)};

    } else if (string === 'block') {
        return {type: 'block'};

    } else if (string === 'pending') {
        return {type: 'pending'};

    } else if (string.substring(0, 8) === 'address:') {
        return {type: 'address', address: string.substring(8)};

    } else if (string.substring(0, 6) === 'topic:') {
        try {
            var object = rlpDecode(string.substring(6));
            object = recurse(object, function(object) {
                if (object === '0x') { object = null; }
                return object;
            });
            return {type: 'topic', topic: object};
        } catch (error) {
            console.log(error);
        }
    }

    throw new Error('invalid event string');
}
//////////////////////////////
// Provider Object


/* @TODO:
type Event = {
   eventName: string,
   listener: any, // @TODO: Function any: any
   type: string,
}
*/

export class Provider {
    private _network: Network;

    // string => Event
    private _events: any;
    protected _emitted: any;

    private _pollingInterval: number;
    private _poller: any; // @TODO: what does TypeScript thing setInterval returns?

    private _lastBlockNumber: number;

    // string => BigNumber
    private _balances: any;


    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    protected ready: Promise<Network>;

    constructor(network: string | Network) {
        errors.checkNew(this, Provider);

        network = getNetwork(network);

        if (network) {
            this._network = network;
            // Sub-classes MAY re-assign a Promise if a standard network name is provided
            this.ready = Promise.resolve(this._network);

        } else {
            // Sub-classes MUST re-assign a Promise to "ready" that returns a Network
            this.ready = new Promise((resolve, reject) => { });
        }

        this._lastBlockNumber = -2;

        // Balances being watched for changes
        this._balances = {};

        // Events being listened to
        this._events = {};

        this._pollingInterval = 4000;

        // We use this to track recent emitted events; for example, if we emit a "block" of 100
        // and we get a `getBlock(100)` request which would result in null, we should retry
        // until we get a response. This provides devs with a consistent view. Similarly for
        // transaction hashes.
        this._emitted = { block: this._lastBlockNumber };
    }

    private _doPoll(): void {
        this.getBlockNumber().then((blockNumber) => {

            // If the block hasn't changed, meh.
            if (blockNumber === this._lastBlockNumber) { return; }

            if (this._lastBlockNumber === -2) { this._lastBlockNumber = blockNumber - 1; }

            // Notify all listener for each block that has passed
            for (var i = this._lastBlockNumber + 1; i <= blockNumber; i++) {
                if (this._emitted.block < i) {
                    this._emitted.block = i;

                    // Evict any transaction hashes or block hashes over 12 blocks
                    // old, since they should not return null anyways
                    Object.keys(this._emitted).forEach((key) => {
                        if (key === 'block') { return; }

                        if (this._emitted[key] > i + 12) {
                            delete this._emitted[key];
                        }
                    });
                }
                this.emit('block', i);
            }

            // Sweep balances and remove addresses we no longer have events for
            var newBalances: any = {};

            // Find all transaction hashes we are waiting on
            Object.keys(this._events).forEach((eventName) => {
                var event = parseEventString(eventName);

                if (event.type === 'transaction') {
                    this.getTransaction(event.hash).then((transaction) => {
                        if (!transaction || transaction.blockNumber == null) { return; }
                        this._emitted['t:' + transaction.hash.toLowerCase()] = transaction.blockNumber;
                        this.emit(event.hash, transaction);
                    });

                } else if (event.type === 'address') {
                    if (this._balances[event.address]) {
                        newBalances[event.address] = this._balances[event.address];
                    }
                    this.getBalance(event.address, 'latest').then(function(balance) {
                        var lastBalance = this._balances[event.address];
                        if (lastBalance && balance.eq(lastBalance)) { return; }
                        this._balances[event.address] = balance;
                        this.emit(event.address, balance);
                    });

                } else if (event.type === 'topic') {
                    this.getLogs({
                        fromBlock: this._lastBlockNumber + 1,
                        toBlock: blockNumber,
                        topics: event.topic
                    }).then((logs) => {
                        if (logs.length === 0) { return; }
                        logs.forEach((log) => {
                            this._emitted['b:' + log.blockHash.toLowerCase()] = log.blockNumber;
                            this._emitted['t:' + log.transactionHash.toLowerCase()] = log.blockNumber;
                            this.emit(event.topic, log);
                        });
                    });
                }
            });

            this._lastBlockNumber = blockNumber;

            this._balances = newBalances;
        });
        this.doPoll();
    }

    resetEventsBlock(blockNumber: number): void {
        this._lastBlockNumber = this.blockNumber;
        this._doPoll();
    }

    get network(): Network {
        return this._network;
    }

    getNetwork(): Promise<Network> {
        return this.ready;
    }

    get blockNumber(): number {
        if (this._lastBlockNumber < 0) { return null; }
        return this._lastBlockNumber;
    }

    get polling(): boolean {
        return (this._poller != null);
    }

    set polling(value: boolean) {
        setTimeout(() => {
            if (value && !this._poller) {
                this._poller = setInterval(this._doPoll.bind(this), this.pollingInterval);

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
        if (typeof(value) !== 'number' || value <= 0 || Math.trunc(value) != value) {
            throw new Error('invalid polling interval');
        }

        this._pollingInterval = value;

        if (this._poller) {
            clearInterval(this._poller);
            this._poller = setInterval(() => { this._doPoll() }, this._pollingInterval);
        }
    }

    // @TODO: Add .poller which must be an event emitter with a 'start', 'stop' and 'block' event;
    //        this will be used once we move to the WebSocket or other alternatives to polling

    waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionResponse> {
        var self = this;
        return new Promise(function(resolve, reject) {
            var timer = null;

            function complete(transaction) {
                if (timer) { clearTimeout(timer); }
                resolve(transaction);
            }

            self.once(transactionHash, complete);

            if (typeof(timeout) === 'number' && timeout > 0) {
                timer = setTimeout(function() {
                    self.removeListener(transactionHash, complete);
                    reject(new Error('timeout'));
                }, timeout);
            }
        });
    }

    getBlockNumber(): Promise<number> {
        return this.ready.then(() => {
            return this.perform('getBlockNumber', { }).then((result) => {
                var value = Math.trunc(result);
                if (value != result) { throw new Error('invalid response - getBlockNumber'); }
                return value;
            });
        });
    }

    getGasPrice(): Promise<BigNumber> {
        return this.ready.then(() => {
            return this.perform('getGasPrice', { }).then((result) => {
                return bigNumberify(result);
            });
        });
    }


    getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> {
        return this.ready.then(() => {
            return resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(({ addressOrName, blockTag }) => {
                return this.resolveName(addressOrName).then((address) => {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return this.perform('getBalance', params).then((result) => {
                        return bigNumberify(result);
                    });
                });
            });
        });
    }

    getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> {
        return this.ready.then(() => {
            return resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(({ addressOrName, blockTag }) => {
                return this.resolveName(addressOrName).then((address) => {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return this.perform('getTransactionCount', params).then((result) => {
                        var value = parseInt(result);
                        if (value != result) { throw new Error('invalid response - getTransactionCount'); }
                        return value;
                    });
                });
            });
        });
    }

    getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return this.ready.then(() => {
            return resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(({ addressOrName, blockTag }) => {
                return this.resolveName(addressOrName).then((address) => {
                    var params = {address: address, blockTag: checkBlockTag(blockTag)};
                    return this.perform('getCode', params).then((result) => {
                        return hexlify(result);
                    });
                });
            });
        });
    }

    getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
        return this.ready.then(() => {
            return resolveProperties({ addressOrName: addressOrName, position: position, blockTag: blockTag }).then(({ addressOrName, position, blockTag }) => {
                return this.resolveName(addressOrName).then((address) => {
                    var params = {
                        address: address,
                        blockTag: checkBlockTag(blockTag),
                        position: hexStripZeros(hexlify(position)),
                    };
                    return this.perform('getStorageAt', params).then((result) => {
                        return hexlify(result);
                    });
                });
            });
        });
    }

    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        return this.ready.then(() => {
            return resolveProperties({ signedTransaction: signedTransaction }).then(({ signedTransaction }) => {
                var params = { signedTransaction: hexlify(signedTransaction) };
                return this.perform('sendTransaction', params).then((hash) => {
                    if (hexDataLength(hash) !== 32) { throw new Error('invalid response - sendTransaction'); }

                    // A signed transaction always has a from (and we add wait below)
                    var tx = <TransactionResponse>parseTransaction(signedTransaction);

                    // Check the hash we expect is the same as the hash the server reported
                    if (tx.hash !== hash) {
                        errors.throwError('Transaction hash mismatch from Proivder.sendTransaction.', errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
                    }
                    this._emitted['t:' + tx.hash.toLowerCase()] = 'pending';
                    tx.wait = (timeout?: number) => {
                        return this.waitForTransaction(hash, timeout);
                    };

                    return tx;
                });
            });
        });
    }


    call(transaction: TransactionRequest): Promise<string> {
        return this.ready.then(() => {
            return resolveProperties(transaction).then((transaction) => {
                return this._resolveNames(transaction, [ 'to', 'from' ]).then((transaction) => {
                    var params = { transaction: checkTransactionRequest(transaction) };
                    return this.perform('call', params).then((result) => {
                        return hexlify(result);
                    });
                });
            });
        });
    }

    estimateGas(transaction: TransactionRequest) {
        return this.ready.then(() => {
            return resolveProperties(transaction).then((transaction) => {
                return this._resolveNames(transaction, [ 'to', 'from' ]).then((transaction) => {
                    var params = {transaction: checkTransactionRequest(transaction)};
                    return this.perform('estimateGas', params).then((result) => {
                        return bigNumberify(result);
                    });
                });
            });
        });
   }

    getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> {
        return this.ready.then(() => {
            return resolveProperties({ blockHashOrBlockTag: blockHashOrBlockTag }).then(({ blockHashOrBlockTag }) => {
                try {
                    var blockHash = hexlify(blockHashOrBlockTag);
                    if (hexDataLength(blockHash) === 32) {
                        return stallPromise(() => {
                            return (this._emitted['b:' + blockHash.toLowerCase()] == null);
                        }, () => {
                            return this.perform('getBlock', {blockHash: blockHash}).then((block) => {
                                if (block == null) { return null; }
                                return checkBlock(block);
                            });
                        });
                    }
                } catch (error) { }

                try {
                    var blockTag = checkBlockTag(blockHashOrBlockTag);
                    return stallPromise(() => {
                        if (isHexString(blockTag)) {
                            var blockNumber = parseInt(blockTag.substring(2), 16);
                            return blockNumber > this._emitted.block;
                        }
                        return true;
                    }, () => {
                        return this.perform('getBlock', { blockTag: blockTag }).then((block) => {
                            if (block == null) { return null; }
                            return checkBlock(block);
                        });
                    });
                } catch (error) { }

                throw new Error('invalid block hash or block tag');
            });
        });
    }

    getTransaction(transactionHash: string): Promise<TransactionResponse> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                var params = { transactionHash: checkHash(transactionHash) };
                return stallPromise(() => {
                    return (this._emitted['t:' + transactionHash.toLowerCase()] == null);
                }, () => {
                    return this.perform('getTransaction', params).then((result) => {
                        if (result != null) { result = checkTransactionResponse(result); }
                        return result;
                    });
                });
            });
        });
    }

    getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                var params = { transactionHash: checkHash(transactionHash) };
                return stallPromise(() => {
                    return (this._emitted['t:' + transactionHash.toLowerCase()] == null);
                }, () => {
                    return this.perform('getTransactionReceipt', params).then((result) => {
                        if (result != null) { result = checkTransactionReceipt(result); }
                        return result;
                    });
                });
            });
        });
    }

    getLogs(filter: Filter): Promise<Array<Log>>{
        return this.ready.then(() => {
            return resolveProperties(filter).then((filter) => {
                return this._resolveNames(filter, ['address']).then((filter) => {
                    var params = { filter: checkFilter(filter) };
                    return this.perform('getLogs', params).then((result) => {
                        return arrayOf(checkLog)(result);
                    });
                });
            });
        });
    }

    getEtherPrice(): Promise<number> {
        return this.ready.then(() => {
            return this.perform('getEtherPrice', {}).then((result) => {
                // @TODO: Check valid float
                return result;
            });
        });
    }

    _resolveNames(object: any, keys: Array<string>): Promise<any> {
        var promises = [];

        var result = copyObject(object);

        keys.forEach(function(key) {
            if (result[key] === undefined) { return; }
            promises.push(this.resolveName(result[key]).then(function(address) {
                result[key] = address;
            }));
        }, this);

        return Promise.all(promises).then(function() { return result; });
    }

    _getResolver(name: string): Promise<string> {
        // Get the resolver from the blockchain
        return this.getNetwork().then((network) => {

            // No ENS...
            if (!network.ensAddress) {
                errors.throwError(
                    'network does support ENS',
                    errors.UNSUPPORTED_OPERATION,
                    { operation: 'ENS', network: network.name }
                );
            }

            // keccak256('resolver(bytes32)')
            var data = '0x0178b8bf' + namehash(name).substring(2);
            var transaction = { to: network.ensAddress, data: data };

            return this.call(transaction).then((data) => {

                // extract the address from the data
                if (hexDataLength(data) !== 32) { return null; }
                return getAddress(hexDataSlice(data, 12));
            });
        });
    }

    resolveName(name: string | Promise<string>): Promise<string> {

        // If it is a promise, resolve it then recurse
        if (name instanceof Promise) {
            return name.then((addressOrName) => {
                return this.resolveName(addressOrName);
            });
        }

        // If it is already an address, nothing to resolve
        try {
            return Promise.resolve(getAddress(name));
        } catch (error) { }

        var self = this;

        var nodeHash = namehash(name);

        // Get the addr from the resovler
        return this._getResolver(name).then(function(resolverAddress) {

            // keccak256('addr(bytes32)')
            var data = '0x3b3b57de' + nodeHash.substring(2);
            var transaction = { to: resolverAddress, data: data };
            return self.call(transaction);

        // extract the address from the data
        }).then(function(data) {
            if (hexDataLength(data) !== 32) { return null; }
            var address = getAddress(hexDataSlice(data, 12));
            if (address === '0x0000000000000000000000000000000000000000') { return null; }
            return address;
        });
    }

    lookupAddress(address: string | Promise<string>): Promise<string> {
        if (address instanceof Promise) {
            return address.then((address) => {
                return this.lookupAddress(address);
            });
        }

        address = getAddress(address);

        var name = address.substring(2) + '.addr.reverse'
        var nodehash = namehash(name);

        var self = this;

        return this._getResolver(name).then(function(resolverAddress) {
            if (!resolverAddress) { return null; }

            // keccak('name(bytes32)')
            var data = '0x691f3431' + nodehash.substring(2);
            var transaction = { to: resolverAddress, data: data };
            return self.call(transaction);

        }).then(function(data) {
            // Strip off the "0x"
            data = data.substring(2);

            // Strip off the dynamic string pointer (0x20)
            if (data.length < 64) { return null; }
            data = data.substring(64);

            if (data.length < 64) { return null; }
            var length = bigNumberify('0x' + data.substring(0, 64)).toNumber();
            data = data.substring(64);

            if (2 * length > data.length) { return null; }

            var name = toUtf8String('0x' + data.substring(0, 2 * length));

            // Make sure the reverse record matches the foward record
            return self.resolveName(name).then(function(addr) {
                if (addr != address) { return null; }
                return name;
            });

        });
    }

    doPoll(): void {
    }

    perform(method: string, params: any): Promise<any> {
        errors.throwError(method + ' not implemented', errors.NOT_IMPLEMENTED, { operation: method });
        return null;
    }

    _startPending(): void {
        console.log('WARNING: this provider does not support pending events');
    }

    _stopPending(): void {
    }

    on(eventName, listener): Provider {
        var key = getEventString(eventName);
        if (!this._events[key]) { this._events[key] = []; }
        this._events[key].push({eventName: eventName, listener: listener, type: 'on'});
        if (key === 'pending') { this._startPending(); }
        this.polling = true;

        return this;
    }

    once(eventName, listener): Provider {
        var key = getEventString(eventName);
        if (!this._events[key]) { this._events[key] = []; }
        this._events[key].push({eventName: eventName, listener: listener, type: 'once'});
        if (key === 'pending') { this._startPending(); }
        this.polling = true;

        return this;
    }

    emit(eventName, ...args): boolean {
        let result = false;

        var key = getEventString(eventName);

        //var args = Array.prototype.slice.call(arguments, 1);
        var listeners = this._events[key];
        if (!listeners) { return result; }

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener.type === 'once') {
                listeners.splice(i, 1);
                i--;
            }

            try {
                listener.listener.apply(this, args);
                result = true;
            } catch (error) {
                console.log('Event Listener Error: ' + error.message);
            }
        }

        if (listeners.length === 0) {
            delete this._events[key];
            if (key === 'pending') { this._stopPending(); }
        }

        if (this.listenerCount() === 0) { this.polling = false; }

        return result;
    }

    // @TODO: type EventName
    listenerCount(eventName?: any): number {
        if (!eventName) {
            var result = 0;
            for (var key in this._events) {
                result += this._events[key].length;
            }
            return result;
        }

        var listeners = this._events[getEventString(eventName)];
        if (!listeners) { return 0; }
        return listeners.length;
    }

    // @TODO: func
    listeners(eventName): Array<any> {
        var listeners = this._events[getEventString(eventName)];
        if (!listeners) { return []; }
        var result = [];
        for (var i = 0; i < listeners.length; i++) {
            result.push(listeners[i].listener);
        }
        return result;
    }

    removeAllListeners(eventName): Provider {
        delete this._events[getEventString(eventName)];
        if (this.listenerCount() === 0) { this.polling = false; }

        return this;
    }

    removeListener(eventName, listener): Provider {
        var eventNameString = getEventString(eventName);
        var listeners = this._events[eventNameString];
        if (!listeners) { return this; }

        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }

        if (listeners.length === 0) {
            this.removeAllListeners(eventName);
        }

        return this;
    }
}

/*
function inheritable(parent) {
    return function(child) {
        inherits(child, parent);
        defineProperty(child, 'inherits', inheritable(child));
    }
}

defineProperty(Provider, 'inherits', inheritable(Provider));
*/
/*
function(child) {
    inherits(child, Provider);
    child.inherits = function(grandchild) {
        inherits(grandchild, child)
    }
});
*/

//defineProperty(Provider, 'networks', networks);

/*
defineProperty(Provider, '_formatters', {
    checkTransactionResponse: checkTransaction
});

module.exports = Provider;
*/
