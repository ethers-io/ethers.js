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
//import inherits = require('inherits');
var wallet_1 = require("../wallet/wallet");
var address_1 = require("../utils/address");
var bignumber_1 = require("../utils/bignumber");
var bytes_1 = require("../utils/bytes");
var utf8_1 = require("../utils/utf8");
var rlp_1 = require("../utils/rlp");
var hash_1 = require("../utils/hash");
var networks_1 = require("./networks");
var properties_1 = require("../utils/properties");
var transaction_1 = require("../utils/transaction");
var errors = __importStar(require("../utils/errors"));
function copyObject(obj) {
    var result = {};
    for (var key in obj) {
        result[key] = obj[key];
    }
    return result;
}
;
;
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
function checkHash(hash) {
    if (typeof (hash) === 'string' && bytes_1.hexDataLength(hash) === 32) {
        return hash;
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
    //transactions: allowNull(arrayOf(checkTransaction)),
    transactions: allowNull(arrayOf(checkHash)),
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
exports.checkTransactionResponse = checkTransactionResponse;
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
    contractAddress: allowNull(address_1.getAddress, null),
    transactionIndex: checkNumber,
    root: allowNull(checkHash),
    gasUsed: bignumber_1.bigNumberify,
    logsBloom: allowNull(bytes_1.hexlify),
    blockHash: checkHash,
    transactionHash: checkHash,
    logs: arrayOf(checkTransactionReceiptLog),
    blockNumber: checkNumber,
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
function checkFilter(filter) {
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
function stallPromise(allowNullFunc, executeFunc) {
    return new Promise(function (resolve, reject) {
        var attempt = 0;
        function check() {
            executeFunc().then(function (result) {
                // If we have a result, or are allowed null then we're done
                if (result || allowNullFunc()) {
                    resolve(result);
                    // Otherwise, exponential back-off (up to 10s) our next request
                }
                else {
                    attempt++;
                    var timeout = 500 + 250 * Math.trunc(Math.random() * (1 << attempt));
                    if (timeout > 10000) {
                        timeout = 10000;
                    }
                    setTimeout(check, timeout);
                }
            }, function (error) {
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
        object.forEach(function (object) {
            result.push(recurse(object, convertFunc));
        });
        return result;
    }
    return convertFunc(object);
}
function getEventString(object) {
    try {
        return 'address:' + address_1.getAddress(object);
    }
    catch (error) { }
    if (object === 'block') {
        return 'block';
    }
    else if (object === 'pending') {
        return 'pending';
    }
    else if (bytes_1.hexDataLength(object) === 32) {
        return 'tx:' + object;
    }
    else if (Array.isArray(object)) {
        object = recurse(object, function (object) {
            if (object == null) {
                object = '0x';
            }
            return object;
        });
        try {
            return 'topic:' + rlp_1.encode(object);
        }
        catch (error) {
            console.log(error);
        }
    }
    try {
        throw new Error();
    }
    catch (e) {
        console.log(e.stack);
    }
    throw new Error('invalid event - ' + object);
}
function parseEventString(string) {
    if (string.substring(0, 3) === 'tx:') {
        return { type: 'transaction', hash: string.substring(3) };
    }
    else if (string === 'block') {
        return { type: 'block' };
    }
    else if (string === 'pending') {
        return { type: 'pending' };
    }
    else if (string.substring(0, 8) === 'address:') {
        return { type: 'address', address: string.substring(8) };
    }
    else if (string.substring(0, 6) === 'topic:') {
        try {
            var object = rlp_1.decode(string.substring(6));
            object = recurse(object, function (object) {
                if (object === '0x') {
                    object = null;
                }
                return object;
            });
            return { type: 'topic', topic: object };
        }
        catch (error) {
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
// @TODO: Perhaps allow a SignDigestAsyncFunc?
// Enable a simple signing function and provider to provide a full Signer
var ProviderSigner = /** @class */ (function (_super) {
    __extends(ProviderSigner, _super);
    function ProviderSigner(address, signDigest, provider) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, ProviderSigner);
        properties_1.defineReadOnly(_this, '_addressPromise', Promise.resolve(address));
        properties_1.defineReadOnly(_this, 'signDigest', signDigest);
        properties_1.defineReadOnly(_this, 'provider', provider);
        return _this;
    }
    ProviderSigner.prototype.getAddress = function () {
        return this._addressPromise;
    };
    ProviderSigner.prototype.signMessage = function (message) {
        return Promise.resolve(bytes_1.joinSignature(this.signDigest(hash_1.hashMessage(message))));
    };
    ProviderSigner.prototype.sendTransaction = function (transaction) {
        var _this = this;
        transaction = properties_1.shallowCopy(transaction);
        if (transaction.chainId == null) {
            transaction.chainId = this.provider.getNetwork().then(function (network) {
                return network.chainId;
            });
        }
        if (transaction.from == null) {
            transaction.from = this.getAddress();
        }
        if (transaction.gasLimit == null) {
            transaction.gasLimit = this.provider.estimateGas(transaction);
        }
        if (transaction.gasPrice == null) {
            transaction.gasPrice = this.provider.getGasPrice();
        }
        return properties_1.resolveProperties(transaction).then(function (tx) {
            var signedTx = transaction_1.sign(tx, _this.signDigest);
            return _this._addressPromise.then(function (address) {
                if (transaction_1.parse(signedTx).from !== address) {
                    errors.throwError('signing address does not match expected address', errors.UNKNOWN_ERROR, { address: transaction_1.parse(signedTx).from, expectedAddress: address, signedTransaction: signedTx });
                }
                return _this.provider.sendTransaction(signedTx);
            });
        });
    };
    return ProviderSigner;
}(wallet_1.Signer));
exports.ProviderSigner = ProviderSigner;
var Provider = /** @class */ (function () {
    function Provider(network) {
        var _this = this;
        errors.checkNew(this, Provider);
        if (network instanceof Promise) {
            properties_1.defineReadOnly(this, 'ready', network.then(function (network) {
                properties_1.defineReadOnly(_this, '_network', network);
                return network;
            }));
        }
        else {
            var knownNetwork = networks_1.getNetwork((network == null) ? 'homestead' : network);
            if (knownNetwork) {
                properties_1.defineReadOnly(this, '_network', knownNetwork);
                properties_1.defineReadOnly(this, 'ready', Promise.resolve(this._network));
            }
            else {
                errors.throwError('invalid network', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
            }
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
    Provider.prototype._doPoll = function () {
        var _this = this;
        this.getBlockNumber().then(function (blockNumber) {
            // If the block hasn't changed, meh.
            if (blockNumber === _this._lastBlockNumber) {
                return;
            }
            if (_this._lastBlockNumber === -2) {
                _this._lastBlockNumber = blockNumber - 1;
            }
            // Notify all listener for each block that has passed
            for (var i = _this._lastBlockNumber + 1; i <= blockNumber; i++) {
                if (_this._emitted.block < i) {
                    _this._emitted.block = i;
                    // Evict any transaction hashes or block hashes over 12 blocks
                    // old, since they should not return null anyways
                    Object.keys(_this._emitted).forEach(function (key) {
                        if (key === 'block') {
                            return;
                        }
                        if (_this._emitted[key] > i + 12) {
                            delete _this._emitted[key];
                        }
                    });
                }
                _this.emit('block', i);
            }
            // Sweep balances and remove addresses we no longer have events for
            var newBalances = {};
            // Find all transaction hashes we are waiting on
            Object.keys(_this._events).forEach(function (eventName) {
                var event = parseEventString(eventName);
                if (event.type === 'transaction') {
                    _this.getTransaction(event.hash).then(function (transaction) {
                        if (!transaction || transaction.blockNumber == null) {
                            return;
                        }
                        _this._emitted['t:' + transaction.hash.toLowerCase()] = transaction.blockNumber;
                        _this.emit(event.hash, transaction);
                    });
                }
                else if (event.type === 'address') {
                    if (_this._balances[event.address]) {
                        newBalances[event.address] = _this._balances[event.address];
                    }
                    _this.getBalance(event.address, 'latest').then(function (balance) {
                        var lastBalance = this._balances[event.address];
                        if (lastBalance && balance.eq(lastBalance)) {
                            return;
                        }
                        this._balances[event.address] = balance;
                        this.emit(event.address, balance);
                    });
                }
                else if (event.type === 'topic') {
                    _this.getLogs({
                        fromBlock: _this._lastBlockNumber + 1,
                        toBlock: blockNumber,
                        topics: event.topic
                    }).then(function (logs) {
                        if (logs.length === 0) {
                            return;
                        }
                        logs.forEach(function (log) {
                            _this._emitted['b:' + log.blockHash.toLowerCase()] = log.blockNumber;
                            _this._emitted['t:' + log.transactionHash.toLowerCase()] = log.blockNumber;
                            _this.emit(event.topic, log);
                        });
                    });
                }
            });
            _this._lastBlockNumber = blockNumber;
            _this._balances = newBalances;
        });
        this.doPoll();
    };
    Provider.prototype.resetEventsBlock = function (blockNumber) {
        this._lastBlockNumber = this.blockNumber;
        this._doPoll();
    };
    Object.defineProperty(Provider.prototype, "network", {
        get: function () {
            return this._network;
        },
        enumerable: true,
        configurable: true
    });
    Provider.prototype.getNetwork = function () {
        return this.ready;
    };
    Object.defineProperty(Provider.prototype, "blockNumber", {
        get: function () {
            if (this._lastBlockNumber < 0) {
                return null;
            }
            return this._lastBlockNumber;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "polling", {
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
    Object.defineProperty(Provider.prototype, "pollingInterval", {
        get: function () {
            return this._pollingInterval;
        },
        set: function (value) {
            var _this = this;
            if (typeof (value) !== 'number' || value <= 0 || Math.trunc(value) != value) {
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
    // @TODO: Add .poller which must be an event emitter with a 'start', 'stop' and 'block' event;
    //        this will be used once we move to the WebSocket or other alternatives to polling
    Provider.prototype.waitForTransaction = function (transactionHash, timeout) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var timer = null;
            function complete(transaction) {
                if (timer) {
                    clearTimeout(timer);
                }
                resolve(transaction);
            }
            self.once(transactionHash, complete);
            if (typeof (timeout) === 'number' && timeout > 0) {
                timer = setTimeout(function () {
                    self.removeListener(transactionHash, complete);
                    reject(new Error('timeout'));
                }, timeout);
            }
        });
    };
    Provider.prototype.getBlockNumber = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getBlockNumber', {}).then(function (result) {
                var value = Math.trunc(result);
                if (value != result) {
                    throw new Error('invalid response - getBlockNumber');
                }
                return value;
            });
        });
    };
    Provider.prototype.getGasPrice = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getGasPrice', {}).then(function (result) {
                return bignumber_1.bigNumberify(result);
            });
        });
    };
    Provider.prototype.getBalance = function (addressOrName, blockTag) {
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
    Provider.prototype.getTransactionCount = function (addressOrName, blockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ addressOrName: addressOrName, blockTag: blockTag }).then(function (_a) {
                var addressOrName = _a.addressOrName, blockTag = _a.blockTag;
                return _this.resolveName(addressOrName).then(function (address) {
                    var params = { address: address, blockTag: checkBlockTag(blockTag) };
                    return _this.perform('getTransactionCount', params).then(function (result) {
                        var value = parseInt(result);
                        if (value != result) {
                            throw new Error('invalid response - getTransactionCount');
                        }
                        return value;
                    });
                });
            });
        });
    };
    Provider.prototype.getCode = function (addressOrName, blockTag) {
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
    Provider.prototype.getStorageAt = function (addressOrName, position, blockTag) {
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
    Provider.prototype.sendTransaction = function (signedTransaction) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ signedTransaction: signedTransaction }).then(function (_a) {
                var signedTransaction = _a.signedTransaction;
                var params = { signedTransaction: bytes_1.hexlify(signedTransaction) };
                return _this.perform('sendTransaction', params).then(function (hash) {
                    if (bytes_1.hexDataLength(hash) !== 32) {
                        throw new Error('invalid response - sendTransaction');
                    }
                    // A signed transaction always has a from (and we add wait below)
                    var tx = transaction_1.parse(signedTransaction);
                    // Check the hash we expect is the same as the hash the server reported
                    if (tx.hash !== hash) {
                        errors.throwError('Transaction hash mismatch from Proivder.sendTransaction.', errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
                    }
                    _this._emitted['t:' + tx.hash.toLowerCase()] = 'pending';
                    tx.wait = function (timeout) {
                        return _this.waitForTransaction(hash, timeout);
                    };
                    return tx;
                });
            });
        });
    };
    Provider.prototype.call = function (transaction) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties(transaction).then(function (transaction) {
                return _this._resolveNames(transaction, ['to', 'from']).then(function (transaction) {
                    var params = { transaction: checkTransactionRequest(transaction) };
                    return _this.perform('call', params).then(function (result) {
                        return bytes_1.hexlify(result);
                    });
                });
            });
        });
    };
    Provider.prototype.estimateGas = function (transaction) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties(transaction).then(function (transaction) {
                return _this._resolveNames(transaction, ['to', 'from']).then(function (transaction) {
                    var params = { transaction: checkTransactionRequest(transaction) };
                    return _this.perform('estimateGas', params).then(function (result) {
                        return bignumber_1.bigNumberify(result);
                    });
                });
            });
        });
    };
    Provider.prototype.getBlock = function (blockHashOrBlockTag) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ blockHashOrBlockTag: blockHashOrBlockTag }).then(function (_a) {
                var blockHashOrBlockTag = _a.blockHashOrBlockTag;
                try {
                    var blockHash = bytes_1.hexlify(blockHashOrBlockTag);
                    if (bytes_1.hexDataLength(blockHash) === 32) {
                        return stallPromise(function () {
                            return (_this._emitted['b:' + blockHash.toLowerCase()] == null);
                        }, function () {
                            return _this.perform('getBlock', { blockHash: blockHash }).then(function (block) {
                                if (block == null) {
                                    return null;
                                }
                                return checkBlock(block);
                            });
                        });
                    }
                }
                catch (error) { }
                try {
                    var blockTag = checkBlockTag(blockHashOrBlockTag);
                    return stallPromise(function () {
                        if (bytes_1.isHexString(blockTag)) {
                            var blockNumber = parseInt(blockTag.substring(2), 16);
                            return blockNumber > _this._emitted.block;
                        }
                        return true;
                    }, function () {
                        return _this.perform('getBlock', { blockTag: blockTag }).then(function (block) {
                            if (block == null) {
                                return null;
                            }
                            return checkBlock(block);
                        });
                    });
                }
                catch (error) { }
                throw new Error('invalid block hash or block tag');
            });
        });
    };
    Provider.prototype.getTransaction = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: checkHash(transactionHash) };
                return stallPromise(function () {
                    return (_this._emitted['t:' + transactionHash.toLowerCase()] == null);
                }, function () {
                    return _this.perform('getTransaction', params).then(function (result) {
                        if (result != null) {
                            result = checkTransactionResponse(result);
                        }
                        return result;
                    });
                });
            });
        });
    };
    Provider.prototype.getTransactionReceipt = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: checkHash(transactionHash) };
                return stallPromise(function () {
                    return (_this._emitted['t:' + transactionHash.toLowerCase()] == null);
                }, function () {
                    return _this.perform('getTransactionReceipt', params).then(function (result) {
                        if (result != null) {
                            result = checkTransactionReceipt(result);
                        }
                        return result;
                    });
                });
            });
        });
    };
    Provider.prototype.getLogs = function (filter) {
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
    Provider.prototype.getEtherPrice = function () {
        var _this = this;
        return this.ready.then(function () {
            return _this.perform('getEtherPrice', {}).then(function (result) {
                // @TODO: Check valid float
                return result;
            });
        });
    };
    Provider.prototype._resolveNames = function (object, keys) {
        var promises = [];
        var result = copyObject(object);
        keys.forEach(function (key) {
            if (result[key] === undefined) {
                return;
            }
            promises.push(this.resolveName(result[key]).then(function (address) {
                result[key] = address;
            }));
        }, this);
        return Promise.all(promises).then(function () { return result; });
    };
    Provider.prototype._getResolver = function (name) {
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
    Provider.prototype.resolveName = function (name) {
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
    Provider.prototype.lookupAddress = function (address) {
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
    Provider.prototype.doPoll = function () {
    };
    Provider.prototype.perform = function (method, params) {
        errors.throwError(method + ' not implemented', errors.NOT_IMPLEMENTED, { operation: method });
        return null;
    };
    Provider.prototype._startPending = function () {
        console.log('WARNING: this provider does not support pending events');
    };
    Provider.prototype._stopPending = function () {
    };
    Provider.prototype.on = function (eventName, listener) {
        var key = getEventString(eventName);
        if (!this._events[key]) {
            this._events[key] = [];
        }
        this._events[key].push({ eventName: eventName, listener: listener, type: 'on' });
        if (key === 'pending') {
            this._startPending();
        }
        this.polling = true;
        return this;
    };
    Provider.prototype.once = function (eventName, listener) {
        var key = getEventString(eventName);
        if (!this._events[key]) {
            this._events[key] = [];
        }
        this._events[key].push({ eventName: eventName, listener: listener, type: 'once' });
        if (key === 'pending') {
            this._startPending();
        }
        this.polling = true;
        return this;
    };
    Provider.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var result = false;
        var key = getEventString(eventName);
        //var args = Array.prototype.slice.call(arguments, 1);
        var listeners = this._events[key];
        if (!listeners) {
            return result;
        }
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener.type === 'once') {
                listeners.splice(i, 1);
                i--;
            }
            try {
                listener.listener.apply(this, args);
                result = true;
            }
            catch (error) {
                console.log('Event Listener Error: ' + error.message);
            }
        }
        if (listeners.length === 0) {
            delete this._events[key];
            if (key === 'pending') {
                this._stopPending();
            }
        }
        if (this.listenerCount() === 0) {
            this.polling = false;
        }
        return result;
    };
    // @TODO: type EventName
    Provider.prototype.listenerCount = function (eventName) {
        if (!eventName) {
            var result = 0;
            for (var key in this._events) {
                result += this._events[key].length;
            }
            return result;
        }
        var listeners = this._events[getEventString(eventName)];
        if (!listeners) {
            return 0;
        }
        return listeners.length;
    };
    // @TODO: func
    Provider.prototype.listeners = function (eventName) {
        var listeners = this._events[getEventString(eventName)];
        if (!listeners) {
            return [];
        }
        var result = [];
        for (var i = 0; i < listeners.length; i++) {
            result.push(listeners[i].listener);
        }
        return result;
    };
    Provider.prototype.removeAllListeners = function (eventName) {
        delete this._events[getEventString(eventName)];
        if (this.listenerCount() === 0) {
            this.polling = false;
        }
        return this;
    };
    Provider.prototype.removeListener = function (eventName, listener) {
        var eventNameString = getEventString(eventName);
        var listeners = this._events[eventNameString];
        if (!listeners) {
            return this;
        }
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
    };
    return Provider;
}());
exports.Provider = Provider;
