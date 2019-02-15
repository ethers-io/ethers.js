'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("../utils/address");
var bignumber_1 = require("../utils/bignumber");
var bytes_1 = require("../utils/bytes");
var hash_1 = require("../utils/hash");
var networks_1 = require("../utils/networks");
var properties_1 = require("../utils/properties");
var rlp_1 = require("../utils/rlp");
var transaction_1 = require("../utils/transaction");
var utf8_1 = require("../utils/utf8");
var web_1 = require("../utils/web");
var errors = __importStar(require("../errors"));
///////////////////////////////
// Imported Abstracts
var abstract_provider_1 = require("./abstract-provider");
//////////////////////////////
// Request and Response Checking
// @TODO: not any?
function check(format, object) {
    var result = {};
    for (var key in format) {
        try {
            var value = format[key](object[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
        catch (error) {
            error.checkKey = key;
            error.checkValue = object[key];
            throw error;
        }
    }
    return result;
}
function allowNull(check, nullValue) {
    return (function (value) {
        if (value == null) {
            return nullValue;
        }
        return check(value);
    });
}
function allowFalsish(check, replaceValue) {
    return (function (value) {
        if (!value) {
            return replaceValue;
        }
        return check(value);
    });
}
function arrayOf(check) {
    return (function (array) {
        if (!Array.isArray(array)) {
            throw new Error('not an array');
        }
        var result = [];
        array.forEach(function (value) {
            result.push(check(value));
        });
        return result;
    });
}
function checkHash(hash, requirePrefix) {
    if (typeof (hash) === 'string') {
        // geth-etc does add a "0x" prefix on receipt.root
        if (!requirePrefix && hash.substring(0, 2) !== '0x') {
            hash = '0x' + hash;
        }
        if (bytes_1.hexDataLength(hash) === 32) {
            return hash.toLowerCase();
        }
    }
    errors.throwError('invalid hash', errors.INVALID_ARGUMENT, { arg: 'hash', value: hash });
    return null;
}
function checkNumber(number) {
    return bignumber_1.bigNumberify(number).toNumber();
}
// Returns the difficulty as a number, or if too large (i.e. PoA network) null
function checkDifficulty(value) {
    var v = bignumber_1.bigNumberify(value);
    try {
        return v.toNumber();
    }
    catch (error) { }
    return null;
}
function checkBoolean(value) {
    if (typeof (value) === 'boolean') {
        return value;
    }
    if (typeof (value) === 'string') {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
    }
    throw new Error('invaid boolean - ' + value);
}
function checkUint256(uint256) {
    if (!bytes_1.isHexString(uint256)) {
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
function checkBlockTag(blockTag) {
    if (blockTag == null) {
        return 'latest';
    }
    if (blockTag === 'earliest') {
        return '0x0';
    }
    if (blockTag === 'latest' || blockTag === 'pending') {
        return blockTag;
    }
    if (typeof (blockTag) === 'number') {
        return bytes_1.hexStripZeros(bytes_1.hexlify(blockTag));
    }
    if (bytes_1.isHexString(blockTag)) {
        return bytes_1.hexStripZeros(blockTag);
    }
    throw new Error('invalid blockTag');
}
var formatTransaction = {
    hash: checkHash,
    blockHash: allowNull(checkHash, null),
    blockNumber: allowNull(checkNumber, null),
    transactionIndex: allowNull(checkNumber, null),
    confirmations: allowNull(checkNumber, null),
    from: address_1.getAddress,
    gasPrice: bignumber_1.bigNumberify,
    gasLimit: bignumber_1.bigNumberify,
    to: allowNull(address_1.getAddress, null),
    value: bignumber_1.bigNumberify,
    nonce: checkNumber,
    data: bytes_1.hexlify,
    r: allowNull(checkUint256),
    s: allowNull(checkUint256),
    v: allowNull(checkNumber),
    creates: allowNull(address_1.getAddress, null),
    raw: allowNull(bytes_1.hexlify),
};
function checkTransactionResponse(transaction) {
    // Rename gas to gasLimit
    if (transaction.gas != null && transaction.gasLimit == null) {
        transaction.gasLimit = transaction.gas;
    }
    // Some clients (TestRPC) do strange things like return 0x0 for the
    // 0 address; correct this to be a real address
    if (transaction.to && bignumber_1.bigNumberify(transaction.to).isZero()) {
        transaction.to = '0x0000000000000000000000000000000000000000';
    }
    // Rename input to data
    if (transaction.input != null && transaction.data == null) {
        transaction.data = transaction.input;
    }
    // If to and creates are empty, populate the creates from the transaction
    if (transaction.to == null && transaction.creates == null) {
        transaction.creates = address_1.getContractAddress(transaction);
    }
    // @TODO: use transaction.serialize? Have to add support for including v, r, and s...
    if (!transaction.raw) {
        // Very loose providers (e.g. TestRPC) don't provide a signature or raw
        if (transaction.v && transaction.r && transaction.s) {
            var raw = [
                bytes_1.stripZeros(bytes_1.hexlify(transaction.nonce)),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.gasPrice)),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.gasLimit)),
                (transaction.to || "0x"),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.value || '0x')),
                bytes_1.hexlify(transaction.data || '0x'),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.v || '0x')),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.r)),
                bytes_1.stripZeros(bytes_1.hexlify(transaction.s)),
            ];
            transaction.raw = rlp_1.encode(raw);
        }
    }
    var result = check(formatTransaction, transaction);
    var networkId = transaction.networkId;
    // geth-etc returns chainId
    if (transaction.chainId != null && networkId == null && result.v == null) {
        networkId = transaction.chainId;
    }
    if (bytes_1.isHexString(networkId)) {
        networkId = bignumber_1.bigNumberify(networkId).toNumber();
    }
    if (typeof (networkId) !== 'number' && result.v != null) {
        networkId = (result.v - 35) / 2;
        if (networkId < 0) {
            networkId = 0;
        }
        networkId = parseInt(networkId);
    }
    if (typeof (networkId) !== 'number') {
        networkId = 0;
    }
    result.networkId = networkId;
    // 0x0000... should actually be null
    if (result.blockHash && result.blockHash.replace(/0/g, '') === 'x') {
        result.blockHash = null;
    }
    return result;
}
var formatBlock = {
    hash: checkHash,
    parentHash: checkHash,
    number: checkNumber,
    timestamp: checkNumber,
    nonce: allowNull(bytes_1.hexlify),
    difficulty: checkDifficulty,
    gasLimit: bignumber_1.bigNumberify,
    gasUsed: bignumber_1.bigNumberify,
    miner: address_1.getAddress,
    extraData: bytes_1.hexlify,
    transactions: allowNull(arrayOf(checkHash)),
};
var formatBlockWithTransactions = properties_1.shallowCopy(formatBlock);
formatBlockWithTransactions.transactions = allowNull(arrayOf(checkTransactionResponse));
function checkBlock(block, includeTransactions) {
    if (block.author != null && block.miner == null) {
        block.miner = block.author;
    }
    return check(includeTransactions ? formatBlockWithTransactions : formatBlock, block);
}
var formatTransactionRequest = {
    from: allowNull(address_1.getAddress),
    nonce: allowNull(checkNumber),
    gasLimit: allowNull(bignumber_1.bigNumberify),
    gasPrice: allowNull(bignumber_1.bigNumberify),
    to: allowNull(address_1.getAddress),
    value: allowNull(bignumber_1.bigNumberify),
    data: allowNull(bytes_1.hexlify),
};
function checkTransactionRequest(transaction) {
    return check(formatTransactionRequest, transaction);
}
var formatTransactionReceiptLog = {
    transactionLogIndex: allowNull(checkNumber),
    transactionIndex: checkNumber,
    blockNumber: checkNumber,
    transactionHash: checkHash,
    address: address_1.getAddress,
    topics: arrayOf(checkHash),
    data: bytes_1.hexlify,
    logIndex: checkNumber,
    blockHash: checkHash,
};
function checkTransactionReceiptLog(log) {
    return check(formatTransactionReceiptLog, log);
}
var formatTransactionReceipt = {
    to: allowNull(address_1.getAddress, null),
    from: allowNull(address_1.getAddress, null),
    contractAddress: allowNull(address_1.getAddress, null),
    transactionIndex: checkNumber,
    root: allowNull(checkHash),
    gasUsed: bignumber_1.bigNumberify,
    logsBloom: allowNull(bytes_1.hexlify),
    blockHash: checkHash,
    transactionHash: checkHash,
    logs: arrayOf(checkTransactionReceiptLog),
    blockNumber: checkNumber,
    confirmations: allowNull(checkNumber, null),
    cumulativeGasUsed: bignumber_1.bigNumberify,
    status: allowNull(checkNumber)
};
function checkTransactionReceipt(transactionReceipt) {
    //var status = transactionReceipt.status;
    //var root = transactionReceipt.root;
    var result = check(formatTransactionReceipt, transactionReceipt);
    result.logs.forEach(function (entry, index) {
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
        topics.forEach(function (topic) {
            checkTopics(topic);
        });
    }
    else if (topics != null) {
        checkHash(topics);
    }
    return topics;
}
var formatFilter = {
    fromBlock: allowNull(checkBlockTag, undefined),
    toBlock: allowNull(checkBlockTag, undefined),
    address: allowNull(address_1.getAddress, undefined),
    topics: allowNull(checkTopics, undefined),
};
var formatFilterByBlock = {
    blockHash: allowNull(checkHash, undefined),
    address: allowNull(address_1.getAddress, undefined),
    topics: allowNull(checkTopics, undefined),
};
function checkFilter(filter) {
    if (filter && filter.blockHash) {
        return check(formatFilterByBlock, filter);
    }
    return check(formatFilter, filter);
}
var formatLog = {
    blockNumber: allowNull(checkNumber),
    blockHash: allowNull(checkHash),
    transactionIndex: checkNumber,
    removed: allowNull(checkBoolean),
    address: address_1.getAddress,
    data: allowFalsish(bytes_1.hexlify, '0x'),
    topics: arrayOf(checkHash),
    transactionHash: checkHash,
    logIndex: checkNumber,
};
function checkLog(log) {
    return check(formatLog, log);
}
//////////////////////////////
// Event Serializeing
function serializeTopics(topics) {
    return topics.map(function (topic) {
        if (typeof (topic) === 'string') {
            return topic;
        }
        else if (Array.isArray(topic)) {
            topic.forEach(function (topic) {
                if (topic !== null && bytes_1.hexDataLength(topic) !== 32) {
                    errors.throwError('invalid topic', errors.INVALID_ARGUMENT, { argument: 'topic', value: topic });
                }
            });
            return topic.join(',');
        }
        else if (topic === null) {
            return '';
        }
        return errors.throwError('invalid topic value', errors.INVALID_ARGUMENT, { argument: 'topic', value: topic });
    }).join('&');
}
function deserializeTopics(data) {
    return data.split(/&/g).map(function (topic) {
        var comps = topic.split(',');
        if (comps.length === 1) {
            if (comps[0] === '') {
                return null;
            }
            return topic;
        }
        return comps.map(function (topic) {
            if (topic === '') {
                return null;
            }
            return topic;
        });
    });
}
function getEventTag(eventName) {
    if (typeof (eventName) === 'string') {
        if (bytes_1.hexDataLength(eventName) === 20) {
            return 'address:' + address_1.getAddress(eventName);
        }
        eventName = eventName.toLowerCase();
        if (bytes_1.hexDataLength(eventName) === 32) {
            return 'tx:' + eventName;
        }
        if (eventName.indexOf(':') === -1) {
            return eventName;
        }
    }
    else if (Array.isArray(eventName)) {
        return 'filter::' + serializeTopics(eventName);
    }
    else if (eventName && typeof (eventName) === 'object') {
        return 'filter:' + (eventName.address || '') + ':' + serializeTopics(eventName.topics || []);
    }
    throw new Error('invalid event - ' + eventName);
}
//////////////////////////////
// Helper Object
function getTime() {
    return (new Date()).getTime();
}
var BaseProvider = /** @class */ (function (_super) {
    __extends(BaseProvider, _super);
    function BaseProvider(network) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, abstract_provider_1.Provider);
        if (network instanceof Promise) {
            properties_1.defineReadOnly(_this, 'ready', network.then(function (network) {
                properties_1.defineReadOnly(_this, '_network', network);
                return network;
            }));
            // Squash any "unhandled promise" errors; the don't need to be handled
            _this.ready.catch(function (error) { });
        }
        else {
            var knownNetwork = networks_1.getNetwork((network == null) ? 'homestead' : network);
            if (knownNetwork) {
                properties_1.defineReadOnly(_this, '_network', knownNetwork);
                properties_1.defineReadOnly(_this, 'ready', Promise.resolve(_this._network));
            }
            else {
                errors.throwError('invalid network', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
            }
        }
        _this._lastBlockNumber = -2;
        // Balances being watched for changes
        _this._balances = {};
        // Events being listened to
        _this._events = [];
        _this._pollingInterval = 4000;
        _this._emitted = { block: -2 };
        _this._fastQueryDate = 0;
        return _this;
    }
    BaseProvider.prototype._doPoll = function () {
        var _this = this;
        this.getBlockNumber().then(function (blockNumber) {
            _this._setFastBlockNumber(blockNumber);
            // If the block hasn't changed, meh.
            if (blockNumber === _this._lastBlockNumber) {
                return;
            }
            // First polling cycle, trigger a "block" events
            if (_this._emitted.block === -2) {
                _this._emitted.block = blockNumber - 1;
            }
            // Notify all listener for each block that has passed
            for (var i = _this._emitted.block + 1; i <= blockNumber; i++) {
                _this.emit('block', i);
            }
            // The emitted block was updated, check for obsolete events
            if (_this._emitted.block !== blockNumber) {
                _this._emitted.block = blockNumber;
                Object.keys(_this._emitted).forEach(function (key) {
                    // The block event does not expire
                    if (key === 'block') {
                        return;
                    }
                    // The block we were at when we emitted this event
                    var eventBlockNumber = _this._emitted[key];
                    // We cannot garbage collect pending transactions or blocks here
                    // They should be garbage collected by the Provider when setting
                    // "pending" events
                    if (eventBlockNumber === 'pending') {
                        return;
                    }
                    // Evict any transaction hashes or block hashes over 12 blocks
                    // old, since they should not return null anyways
                    if (blockNumber - eventBlockNumber > 12) {
                        delete _this._emitted[key];
                    }
                });
            }
            // First polling cycle
            if (_this._lastBlockNumber === -2) {
                _this._lastBlockNumber = blockNumber - 1;
            }
            // Sweep balances and remove addresses we no longer have events for
            var newBalances = {};
            // Find all transaction hashes we are waiting on
            var uniqueEventTags = {};
            _this._events.forEach(function (event) {
                uniqueEventTags[event.tag] = true;
            });
            Object.keys(uniqueEventTags).forEach(function (tag) {
                var comps = tag.split(':');
                switch (comps[0]) {
                    case 'tx': {
                        var hash_2 = comps[1];
                        _this.getTransactionReceipt(hash_2).then(function (receipt) {
                            if (!receipt || receipt.blockNumber == null) {
                                return null;
                            }
                            _this._emitted['t:' + hash_2] = receipt.blockNumber;
                            _this.emit(hash_2, receipt);
                            return null;
                        }).catch(function (error) { _this.emit('error', error); });
                        break;
                    }
                    case 'address': {
                        var address_2 = comps[1];
                        if (_this._balances[address_2]) {
                            newBalances[address_2] = _this._balances[address_2];
                        }
                        _this.getBalance(address_2, 'latest').then(function (balance) {
                            var lastBalance = _this._balances[address_2];
                            if (lastBalance && balance.eq(lastBalance)) {
                                return;
                            }
                            _this._balances[address_2] = balance;
                            _this.emit(address_2, balance);
                            return null;
                        }).catch(function (error) { _this.emit('error', error); });
                        break;
                    }
                    case 'filter': {
                        var topics = deserializeTopics(comps[2]);
                        var filter_1 = {
                            address: comps[1],
                            fromBlock: _this._lastBlockNumber + 1,
                            toBlock: blockNumber,
                            topics: topics
                        };
                        if (!filter_1.address) {
                            delete filter_1.address;
                        }
                        _this.getLogs(filter_1).then(function (logs) {
                            if (logs.length === 0) {
                                return;
                            }
                            logs.forEach(function (log) {
                                _this._emitted['b:' + log.blockHash] = log.blockNumber;
                                _this._emitted['t:' + log.transactionHash] = log.blockNumber;
                                _this.emit(filter_1, log);
                            });
                            return null;
                        }).catch(function (error) { _this.emit('error', error); });
                        break;
                    }
                }
            });
            _this._lastBlockNumber = blockNumber;
            _this._balances = newBalances;
            return null;
        }).catch(function (error) { });
        this.doPoll();
    };
    BaseProvider.prototype.resetEventsBlock = function (blockNumber) {
        this._lastBlockNumber = blockNumber - 1;
        if (this.polling) {
            this._doPoll();
        }
    };
    Object.defineProperty(BaseProvider.prototype, "network", {
        get: function () {
            return this._network;
        },
        enumerable: true,
        configurable: true
    });
    BaseProvider.prototype.getNetwork = function () {
        return this.ready;
    };
    Object.defineProperty(BaseProvider.prototype, "blockNumber", {
        get: function () {
            return this._fastBlockNumber;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseProvider.prototype, "polling", {
        get: function () {
            return (this._poller != null);
        },
        set: function (value) {
            var _this = this;
            setTimeout(function () {
                if (value && !_this._poller) {
                    _this._poller = setInterval(_this._doPoll.bind(_this), _this.pollingInterval);
                }
                else if (!value && _this._poller) {
                    clearInterval(_this._poller);
                    _this._poller = null;
                }
            }, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseProvider.prototype, "pollingInterval", {
        get: function () {
            return this._pollingInterval;
        },
        set: function (value) {
            var _this = this;
            if (typeof (value) !== 'number' || value <= 0 || parseInt(String(value)) != value) {
                throw new Error('invalid polling interval');
            }
            this._pollingInterval = value;
            if (this._poller) {
                clearInterval(this._poller);
                this._poller = setInterval(function () { _this._doPoll(); }, this._pollingInterval);
            }
        },
        enumerable: true,
        configurable: true
    });
    BaseProvider.prototype._getFastBlockNumber = function () {
        var _this = this;
        var now = getTime();
        // Stale block number, request a newer value
        if ((now - this._fastQueryDate) > 2 * this._pollingInterval) {
            this._fastQueryDate = now;
            this._fastBlockNumberPromise = this.getBlockNumber().then(function (blockNumber) {
                if (_this._fastBlockNumber == null || blockNumber > _this._fastBlockNumber) {
                    _this._fastBlockNumber = blockNumber;
                }
                return _this._fastBlockNumber;
            });
        }
        return this._fastBlockNumberPromise;
    };
    BaseProvider.prototype._setFastBlockNumber = function (blockNumber) {
        // Older block, maybe a stale request
        if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) {
            return;
        }
        // Update the time we updated the blocknumber
        this._fastQueryDate = getTime();
        // Newer block number, use  it
        if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
            this._fastBlockNumber = blockNumber;
            this._fastBlockNumberPromise = Promise.resolve(blockNumber);
        }
    };
    // @TODO: Add .poller which must be an event emitter with a 'start', 'stop' and 'block' event;
    //        this will be used once we move to the WebSocket or other alternatives to polling
    BaseProvider.prototype.waitForTransaction = function (transactionHash, confirmations) {
        var _this = this;
        if (confirmations == null) {
            confirmations = 1;
        }
        return this.getTransactionReceipt(transactionHash).then(function (receipt) {
            if (confirmations === 0 || (receipt && receipt.confirmations >= confirmations)) {
                return receipt;
            }
            return (new Promise(function (resolve) {
                var handler = function (receipt) {
                    if (receipt.confirmations < confirmations) {
                        return;
                    }
                    _this.removeListener(transactionHash, handler);
                    resolve(receipt);
                };
                _this.on(transactionHash, handler);
            }));
        });
    };
    BaseProvider.prototype.getBlockNumber = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getBlockNumber', {}).then(function (result) {
                var value = parseInt(result);
                if (value != result) {
                    throw new Error('invalid response - getBlockNumber');
                }
                _this._setFastBlockNumber(value);
                return value;
            });
        });
    };
    BaseProvider.prototype.getGasPrice = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getGasPrice', {}).then(function (result) {
                return bignumber_1.bigNumberify(result);
            });
        });
    };
    BaseProvider.prototype.getBalance = function (addressOrName, blockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(function (_a) {
                var addressOrName = _a.addressOrName, blockTag = _a.blockTag;
                return _this.resolveName(addressOrName).then(function (address) {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return _this.perform('getBalance', params).then(function (result) {
                        return bignumber_1.bigNumberify(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.getTransactionCount = function (addressOrName, blockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(function (_a) {
                var addressOrName = _a.addressOrName, blockTag = _a.blockTag;
                return _this.resolveName(addressOrName).then(function (address) {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return _this.perform('getTransactionCount', params).then(function (result) {
                        return bignumber_1.bigNumberify(result).toNumber();
                    });
                });
            });
        });
    };
    BaseProvider.prototype.getCode = function (addressOrName, blockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(function (_a) {
                var addressOrName = _a.addressOrName, blockTag = _a.blockTag;
                return _this.resolveName(addressOrName).then(function (address) {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return _this.perform('getCode', params).then(function (result) {
                        return bytes_1.hexlify(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.getStorageAt = function (addressOrName, position, blockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ addressOrName: addressOrName, position: position, blockTag: blockTag }).then(function (_a) {
                var addressOrName = _a.addressOrName, position = _a.position, blockTag = _a.blockTag;
                return _this.resolveName(addressOrName).then(function (address) {
                    var params = {
                        address: address,
                        blockTag: checkBlockTag(blockTag),
                        position: bytes_1.hexStripZeros(bytes_1.hexlify(position)),
                    };
                    return _this.perform('getStorageAt', params).then(function (result) {
                        return bytes_1.hexlify(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.sendTransaction = function (signedTransaction) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ signedTransaction: signedTransaction }).then(function (_a) {
                var signedTransaction = _a.signedTransaction;
                var params = { signedTransaction: bytes_1.hexlify(signedTransaction) };
                return _this.perform('sendTransaction', params).then(function (hash) {
                    return _this._wrapTransaction(transaction_1.parse(signedTransaction), hash);
                }, function (error) {
                    error.transaction = transaction_1.parse(signedTransaction);
                    if (error.transaction.hash) {
                        error.transactionHash = error.transaction.hash;
                    }
                    throw error;
                });
            });
        });
    };
    // This should be called by any subclass wrapping a TransactionResponse
    BaseProvider.prototype._wrapTransaction = function (tx, hash) {
        var _this = this;
        if (hash != null && bytes_1.hexDataLength(hash) !== 32) {
            throw new Error('invalid response - sendTransaction');
        }
        var result = tx;
        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            errors.throwError('Transaction hash mismatch from Provider.sendTransaction.', errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }
        // @TODO: (confirmations? number, timeout? number)
        result.wait = function (confirmations) {
            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                _this._emitted['t:' + tx.hash] = 'pending';
            }
            return _this.waitForTransaction(tx.hash, confirmations).then(function (receipt) {
                if (receipt == null && confirmations === 0) {
                    return null;
                }
                // No longer pending, allow the polling loop to garbage collect this
                _this._emitted['t:' + tx.hash] = receipt.blockNumber;
                if (receipt.status === 0) {
                    errors.throwError('transaction failed', errors.CALL_EXCEPTION, {
                        transactionHash: tx.hash,
                        transaction: tx
                    });
                }
                return receipt;
            });
        };
        return result;
    };
    BaseProvider.prototype.call = function (transaction, blockTag) {
        var _this = this;
        var tx = properties_1.shallowCopy(transaction);
        return this.ready.then(function () {
            return properties_1.resolveProperties({ blockTag: blockTag, tx: tx }).then(function (_a) {
                var blockTag = _a.blockTag, tx = _a.tx;
                return _this._resolveNames(tx, ['to', 'from']).then(function (tx) {
                    var params = { blockTag: checkBlockTag(blockTag), transaction: checkTransactionRequest(tx) };
                    return _this.perform('call', params).then(function (result) {
                        return bytes_1.hexlify(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.estimateGas = function (transaction) {
        var _this = this;
        var tx = {
            to: transaction.to,
            from: transaction.from,
            data: transaction.data,
            gasPrice: transaction.gasPrice,
            value: transaction.value
        };
        return this.ready.then(function () {
            return properties_1.resolveProperties(tx).then(function (tx) {
                return _this._resolveNames(tx, ['to', 'from']).then(function (tx) {
                    var params = { transaction: checkTransactionRequest(tx) };
                    return _this.perform('estimateGas', params).then(function (result) {
                        return bignumber_1.bigNumberify(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.getBlock = function (blockHashOrBlockTag, includeTransactions) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ blockHashOrBlockTag: blockHashOrBlockTag }).then(function (_a) {
                var blockHashOrBlockTag = _a.blockHashOrBlockTag;
                try {
                    var blockHash_1 = bytes_1.hexlify(blockHashOrBlockTag);
                    if (bytes_1.hexDataLength(blockHash_1) === 32) {
                        return web_1.poll(function () {
                            return _this.perform('getBlock', { blockHash: blockHash_1, includeTransactions: !!includeTransactions }).then(function (block) {
                                if (block == null) {
                                    if (_this._emitted['b:' + blockHash_1] == null) {
                                        return null;
                                    }
                                    return undefined;
                                }
                                return checkBlock(block, includeTransactions);
                            });
                        }, { onceBlock: _this });
                    }
                }
                catch (error) { }
                try {
                    var blockNumber_1 = -128;
                    var blockTag_1 = checkBlockTag(blockHashOrBlockTag);
                    if (bytes_1.isHexString(blockTag_1)) {
                        blockNumber_1 = parseInt(blockTag_1.substring(2), 16);
                    }
                    return web_1.poll(function () {
                        return _this.perform('getBlock', { blockTag: blockTag_1, includeTransactions: !!includeTransactions }).then(function (block) {
                            if (block == null) {
                                if (blockNumber_1 <= _this._emitted.block) {
                                    return undefined;
                                }
                                return null;
                            }
                            return checkBlock(block, includeTransactions);
                        });
                    }, { onceBlock: _this });
                }
                catch (error) { }
                throw new Error('invalid block hash or block tag');
            });
        });
    };
    BaseProvider.prototype.getTransaction = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: checkHash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform('getTransaction', params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted['t:' + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        var tx = BaseProvider.checkTransactionResponse(result);
                        if (tx.blockNumber == null) {
                            tx.confirmations = 0;
                        }
                        else if (tx.confirmations == null) {
                            return _this._getFastBlockNumber().then(function (blockNumber) {
                                // Add the confirmations using the fast block number (pessimistic)
                                var confirmations = (blockNumber - tx.blockNumber) + 1;
                                if (confirmations <= 0) {
                                    confirmations = 1;
                                }
                                tx.confirmations = confirmations;
                                return _this._wrapTransaction(tx);
                            });
                        }
                        return _this._wrapTransaction(tx);
                    });
                }, { onceBlock: _this });
            });
        });
    };
    BaseProvider.prototype.getTransactionReceipt = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: checkHash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform('getTransactionReceipt', params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted['t:' + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        // "geth-etc" returns receipts before they are ready
                        if (result.blockHash == null) {
                            return undefined;
                        }
                        var receipt = checkTransactionReceipt(result);
                        if (receipt.blockNumber == null) {
                            receipt.confirmations = 0;
                        }
                        else if (receipt.confirmations == null) {
                            return _this._getFastBlockNumber().then(function (blockNumber) {
                                // Add the confirmations using the fast block number (pessimistic)
                                var confirmations = (blockNumber - receipt.blockNumber) + 1;
                                if (confirmations <= 0) {
                                    confirmations = 1;
                                }
                                receipt.confirmations = confirmations;
                                return receipt;
                            });
                        }
                        return receipt;
                    });
                }, { onceBlock: _this });
            });
        });
    };
    BaseProvider.prototype.getLogs = function (filter) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties(filter).then(function (filter) {
                return _this._resolveNames(filter, ['address']).then(function (filter) {
                    var params = { filter: checkFilter(filter) };
                    return _this.perform('getLogs', params).then(function (result) {
                        return arrayOf(checkLog)(result);
                    });
                });
            });
        });
    };
    BaseProvider.prototype.getEtherPrice = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getEtherPrice', {}).then(function (result) {
                // @TODO: Check valid float
                return result;
            });
        });
    };
    // @TODO: Could probably use resolveProperties instead?
    BaseProvider.prototype._resolveNames = function (object, keys) {
        var promises = [];
        var result = properties_1.shallowCopy(object);
        keys.forEach(function (key) {
            if (result[key] == null) {
                return;
            }
            promises.push(this.resolveName(result[key]).then(function (address) {
                result[key] = address;
                return;
            }));
        }, this);
        return Promise.all(promises).then(function () { return result; });
    };
    BaseProvider.prototype._getResolver = function (name) {
        var _this = this;
        // Get the resolver from the blockchain
        return this.getNetwork().then(function (network) {
            // No ENS...
            if (!network.ensAddress) {
                errors.throwError('network does support ENS', errors.UNSUPPORTED_OPERATION, { operation: 'ENS', network: network.name });
            }
            // keccak256('resolver(bytes32)')
            var data = '0x0178b8bf' + hash_1.namehash(name).substring(2);
            var transaction = { to: network.ensAddress, data: data };
            return _this.call(transaction).then(function (data) {
                // extract the address from the data
                if (bytes_1.hexDataLength(data) !== 32) {
                    return null;
                }
                return address_1.getAddress(bytes_1.hexDataSlice(data, 12));
            });
        });
    };
    BaseProvider.prototype.resolveName = function (name) {
        var _this = this;
        // If it is a promise, resolve it then recurse
        if (name instanceof Promise) {
            return name.then(function (addressOrName) {
                return _this.resolveName(addressOrName);
            });
        }
        // If it is already an address, nothing to resolve
        try {
            return Promise.resolve(address_1.getAddress(name));
        }
        catch (error) { }
        var self = this;
        var nodeHash = hash_1.namehash(name);
        // Get the addr from the resovler
        return this._getResolver(name).then(function (resolverAddress) {
            // keccak256('addr(bytes32)')
            var data = '0x3b3b57de' + nodeHash.substring(2);
            var transaction = { to: resolverAddress, data: data };
            return self.call(transaction);
            // extract the address from the data
        }).then(function (data) {
            if (bytes_1.hexDataLength(data) !== 32) {
                return null;
            }
            var address = address_1.getAddress(bytes_1.hexDataSlice(data, 12));
            if (address === '0x0000000000000000000000000000000000000000') {
                return null;
            }
            return address;
        });
    };
    BaseProvider.prototype.lookupAddress = function (address) {
        var _this = this;
        if (address instanceof Promise) {
            return address.then(function (address) {
                return _this.lookupAddress(address);
            });
        }
        address = address_1.getAddress(address);
        var name = address.substring(2) + '.addr.reverse';
        var nodehash = hash_1.namehash(name);
        var self = this;
        return this._getResolver(name).then(function (resolverAddress) {
            if (!resolverAddress) {
                return null;
            }
            // keccak('name(bytes32)')
            var data = '0x691f3431' + nodehash.substring(2);
            var transaction = { to: resolverAddress, data: data };
            return self.call(transaction);
        }).then(function (data) {
            // Strip off the "0x"
            data = data.substring(2);
            // Strip off the dynamic string pointer (0x20)
            if (data.length < 64) {
                return null;
            }
            data = data.substring(64);
            if (data.length < 64) {
                return null;
            }
            var length = bignumber_1.bigNumberify('0x' + data.substring(0, 64)).toNumber();
            data = data.substring(64);
            if (2 * length > data.length) {
                return null;
            }
            var name = utf8_1.toUtf8String('0x' + data.substring(0, 2 * length));
            // Make sure the reverse record matches the foward record
            return self.resolveName(name).then(function (addr) {
                if (addr != address) {
                    return null;
                }
                return name;
            });
        });
    };
    BaseProvider.checkTransactionResponse = function (transaction) {
        return checkTransactionResponse(transaction);
    };
    BaseProvider.prototype.doPoll = function () {
    };
    BaseProvider.prototype.perform = function (method, params) {
        errors.throwError(method + ' not implemented', errors.NOT_IMPLEMENTED, { operation: method });
        return null;
    };
    BaseProvider.prototype._startPending = function () {
        errors.warn('WARNING: this provider does not support pending events');
    };
    BaseProvider.prototype._stopPending = function () {
    };
    BaseProvider.prototype._addEventListener = function (eventName, listener, once) {
        this._events.push({
            tag: getEventTag(eventName),
            listener: listener,
            once: once,
        });
        if (eventName === 'pending') {
            this._startPending();
        }
        this.polling = true;
    };
    BaseProvider.prototype.on = function (eventName, listener) {
        this._addEventListener(eventName, listener, false);
        return this;
    };
    BaseProvider.prototype.once = function (eventName, listener) {
        this._addEventListener(eventName, listener, true);
        return this;
    };
    BaseProvider.prototype.addEventListener = function (eventName, listener) {
        return this.on(eventName, listener);
    };
    BaseProvider.prototype.emit = function (eventName) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var result = false;
        var eventTag = getEventTag(eventName);
        this._events = this._events.filter(function (event) {
            if (event.tag !== eventTag) {
                return true;
            }
            setTimeout(function () {
                event.listener.apply(_this, args);
            }, 0);
            result = true;
            return !(event.once);
        });
        if (this.listenerCount() === 0) {
            this.polling = false;
        }
        return result;
    };
    BaseProvider.prototype.listenerCount = function (eventName) {
        if (!eventName) {
            return this._events.length;
        }
        var eventTag = getEventTag(eventName);
        return this._events.filter(function (event) {
            return (event.tag === eventTag);
        }).length;
    };
    BaseProvider.prototype.listeners = function (eventName) {
        var eventTag = getEventTag(eventName);
        return this._events.filter(function (event) {
            return (event.tag === eventTag);
        }).map(function (event) {
            return event.listener;
        });
    };
    BaseProvider.prototype.removeAllListeners = function (eventName) {
        if (eventName == null) {
            this._events = [];
            this._stopPending();
        }
        else {
            var eventTag_1 = getEventTag(eventName);
            this._events = this._events.filter(function (event) {
                return (event.tag !== eventTag_1);
            });
            if (eventName === 'pending') {
                this._stopPending();
            }
        }
        if (this._events.length === 0) {
            this.polling = false;
        }
        return this;
    };
    BaseProvider.prototype.removeListener = function (eventName, listener) {
        var found = false;
        var eventTag = getEventTag(eventName);
        this._events = this._events.filter(function (event) {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            return false;
        });
        if (eventName === 'pending' && this.listenerCount('pending') === 0) {
            this._stopPending();
        }
        if (this.listenerCount() === 0) {
            this.polling = false;
        }
        return this;
    };
    return BaseProvider;
}(abstract_provider_1.Provider));
exports.BaseProvider = BaseProvider;
properties_1.defineReadOnly(abstract_provider_1.Provider, 'inherits', properties_1.inheritable(abstract_provider_1.Provider));
