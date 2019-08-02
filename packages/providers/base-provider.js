"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_provider_1 = require("@ethersproject/abstract-provider");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var hash_1 = require("@ethersproject/hash");
var networks_1 = require("@ethersproject/networks");
var properties_1 = require("@ethersproject/properties");
var strings_1 = require("@ethersproject/strings");
var web_1 = require("@ethersproject/web");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var formatter_1 = require("./formatter");
//////////////////////////////
// Event Serializeing
function checkTopic(topic) {
    if (topic == null) {
        return "null";
    }
    if (bytes_1.hexDataLength(topic) !== 32) {
        logger.throwArgumentError("invalid topic", "topic", topic);
    }
    return topic.toLowerCase();
}
function serializeTopics(topics) {
    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics[topics.length - 1] == null) {
        topics.pop();
    }
    return topics.map(function (topic) {
        if (Array.isArray(topic)) {
            // Only track unique OR-topics
            var unique_1 = {};
            topic.forEach(function (topic) {
                unique_1[checkTopic(topic)] = true;
            });
            // The order of OR-topics does not matter
            var sorted = Object.keys(unique_1);
            sorted.sort();
            return sorted.join("|");
        }
        else {
            return checkTopic(topic);
        }
    }).join("&");
}
function deserializeTopics(data) {
    return data.split(/&/g).map(function (topic) {
        return topic.split("|").map(function (topic) {
            return ((topic === "null") ? null : topic);
        });
    });
}
function getEventTag(eventName) {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if (bytes_1.hexDataLength(eventName) === 32) {
            return "tx:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    else if (Array.isArray(eventName)) {
        return "filter:*:" + serializeTopics(eventName);
    }
    else if (abstract_provider_1.ForkEvent.isForkEvent(eventName)) {
        logger.warn("not implemented");
        throw new Error("not implemented");
    }
    else if (eventName && typeof (eventName) === "object") {
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
var Event = /** @class */ (function () {
    function Event(tag, listener, once) {
        properties_1.defineReadOnly(this, "tag", tag);
        properties_1.defineReadOnly(this, "listener", listener);
        properties_1.defineReadOnly(this, "once", once);
    }
    Event.prototype.pollable = function () {
        return (this.tag.indexOf(":") >= 0 || this.tag === "block" || this.tag === "pending");
    };
    return Event;
}());
var defaultFormatter = null;
var nextPollId = 1;
var BaseProvider = /** @class */ (function (_super) {
    __extends(BaseProvider, _super);
    function BaseProvider(network) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, abstract_provider_1.Provider);
        _this = _super.call(this) || this;
        _this.formatter = _newTarget.getFormatter();
        if (network instanceof Promise) {
            properties_1.defineReadOnly(_this, "ready", network.then(function (network) {
                properties_1.defineReadOnly(_this, "_network", network);
                return network;
            }));
            // Squash any "unhandled promise" errors; that do not need to be handled
            _this.ready.catch(function (error) { });
        }
        else {
            var knownNetwork = properties_1.getStatic((_newTarget), "getNetwork")(network);
            if (knownNetwork) {
                properties_1.defineReadOnly(_this, "_network", knownNetwork);
                properties_1.defineReadOnly(_this, "ready", Promise.resolve(_this._network));
            }
            else {
                logger.throwArgumentError("invalid network", "network", network);
            }
        }
        _this._lastBlockNumber = -2;
        // Events being listened to
        _this._events = [];
        _this._pollingInterval = 4000;
        _this._emitted = { block: -2 };
        _this._fastQueryDate = 0;
        return _this;
    }
    BaseProvider.getFormatter = function () {
        if (defaultFormatter == null) {
            defaultFormatter = new formatter_1.Formatter();
        }
        return defaultFormatter;
    };
    BaseProvider.getNetwork = function (network) {
        return networks_1.getNetwork((network == null) ? "homestead" : network);
    };
    BaseProvider.prototype.poll = function () {
        var _this = this;
        var pollId = nextPollId++;
        this.emit("willPoll", pollId);
        // Track all running promises, so we can trigger a post-poll once they are complete
        var runners = [];
        this.getBlockNumber().then(function (blockNumber) {
            _this._setFastBlockNumber(blockNumber);
            // If the block has not changed, meh.
            if (blockNumber === _this._lastBlockNumber) {
                return;
            }
            // First polling cycle, trigger a "block" events
            if (_this._emitted.block === -2) {
                _this._emitted.block = blockNumber - 1;
            }
            // Notify all listener for each block that has passed
            for (var i = _this._emitted.block + 1; i <= blockNumber; i++) {
                _this.emit("block", i);
            }
            // The emitted block was updated, check for obsolete events
            if (_this._emitted.block !== blockNumber) {
                _this._emitted.block = blockNumber;
                Object.keys(_this._emitted).forEach(function (key) {
                    // The block event does not expire
                    if (key === "block") {
                        return;
                    }
                    // The block we were at when we emitted this event
                    var eventBlockNumber = _this._emitted[key];
                    // We cannot garbage collect pending transactions or blocks here
                    // They should be garbage collected by the Provider when setting
                    // "pending" events
                    if (eventBlockNumber === "pending") {
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
            // Find all transaction hashes we are waiting on
            _this._events.forEach(function (event) {
                var comps = event.tag.split(":");
                switch (comps[0]) {
                    case "tx": {
                        var hash_2 = comps[1];
                        var runner = _this.getTransactionReceipt(hash_2).then(function (receipt) {
                            if (!receipt || receipt.blockNumber == null) {
                                return null;
                            }
                            _this._emitted["t:" + hash_2] = receipt.blockNumber;
                            _this.emit(hash_2, receipt);
                            return null;
                        }).catch(function (error) { _this.emit("error", error); });
                        runners.push(runner);
                        break;
                    }
                    case "filter": {
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
                        var runner = _this.getLogs(filter_1).then(function (logs) {
                            if (logs.length === 0) {
                                return;
                            }
                            logs.forEach(function (log) {
                                _this._emitted["b:" + log.blockHash] = log.blockNumber;
                                _this._emitted["t:" + log.transactionHash] = log.blockNumber;
                                _this.emit(filter_1, log);
                            });
                            return null;
                        }).catch(function (error) { _this.emit("error", error); });
                        runners.push(runner);
                        break;
                    }
                }
            });
            _this._lastBlockNumber = blockNumber;
            return null;
        }).catch(function (error) { });
        Promise.all(runners).then(function () {
            _this.emit("didPoll", pollId);
        });
    };
    BaseProvider.prototype.resetEventsBlock = function (blockNumber) {
        this._lastBlockNumber = blockNumber - 1;
        if (this.polling) {
            this.poll();
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
                    _this._poller = setInterval(_this.poll.bind(_this), _this.pollingInterval);
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
            if (typeof (value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
                throw new Error("invalid polling interval");
            }
            this._pollingInterval = value;
            if (this._poller) {
                clearInterval(this._poller);
                this._poller = setInterval(function () { _this.poll(); }, this._pollingInterval);
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
        if (confirmations === 0) {
            return this.getTransactionReceipt(transactionHash);
        }
        return new Promise(function (resolve) {
            var handler = function (receipt) {
                if (receipt.confirmations < confirmations) {
                    return;
                }
                _this.removeListener(transactionHash, handler);
                resolve(receipt);
            };
            _this.on(transactionHash, handler);
        });
    };
    BaseProvider.prototype._runPerform = function (method, params) {
        var _this = this;
        return this.ready.then(function () {
            // Execute all the functions now that we are "ready"
            Object.keys(params).forEach(function (key) {
                params[key] = params[key]();
            });
            return properties_1.resolveProperties(params).then(function (params) {
                return _this.perform(method, params);
            });
        });
    };
    BaseProvider.prototype.getBlockNumber = function () {
        var _this = this;
        return this._runPerform("getBlockNumber", {}).then(function (result) {
            var value = parseInt(result);
            if (value != result) {
                throw new Error("invalid response - getBlockNumber");
            }
            _this._setFastBlockNumber(value);
            return value;
        });
    };
    BaseProvider.prototype.getGasPrice = function () {
        return this._runPerform("getGasPrice", {}).then(function (result) {
            return bignumber_1.BigNumber.from(result);
        });
    };
    BaseProvider.prototype.getBalance = function (addressOrName, blockTag) {
        var _this = this;
        return this._runPerform("getBalance", {
            address: function () { return _this._getAddress(addressOrName); },
            blockTag: function () { return _this._getBlockTag(blockTag); }
        }).then(function (result) {
            return bignumber_1.BigNumber.from(result);
        });
    };
    BaseProvider.prototype.getTransactionCount = function (addressOrName, blockTag) {
        var _this = this;
        return this._runPerform("getTransactionCount", {
            address: function () { return _this._getAddress(addressOrName); },
            blockTag: function () { return _this._getBlockTag(blockTag); }
        }).then(function (result) {
            return bignumber_1.BigNumber.from(result).toNumber();
        });
    };
    BaseProvider.prototype.getCode = function (addressOrName, blockTag) {
        var _this = this;
        return this._runPerform("getCode", {
            address: function () { return _this._getAddress(addressOrName); },
            blockTag: function () { return _this._getBlockTag(blockTag); }
        }).then(function (result) {
            return bytes_1.hexlify(result);
        });
    };
    BaseProvider.prototype.getStorageAt = function (addressOrName, position, blockTag) {
        var _this = this;
        return this._runPerform("getStorageAt", {
            address: function () { return _this._getAddress(addressOrName); },
            blockTag: function () { return _this._getBlockTag(blockTag); },
            position: function () { return Promise.resolve(position).then(function (p) { return bytes_1.hexValue(p); }); }
        }).then(function (result) {
            return bytes_1.hexlify(result);
        });
    };
    // This should be called by any subclass wrapping a TransactionResponse
    BaseProvider.prototype._wrapTransaction = function (tx, hash) {
        var _this = this;
        if (hash != null && bytes_1.hexDataLength(hash) !== 32) {
            throw new Error("invalid response - sendTransaction");
        }
        var result = tx;
        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            logger.throwError("Transaction hash mismatch from Provider.sendTransaction.", logger_1.Logger.errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }
        // @TODO: (confirmations? number, timeout? number)
        result.wait = function (confirmations) {
            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                _this._emitted["t:" + tx.hash] = "pending";
            }
            return _this.waitForTransaction(tx.hash, confirmations).then(function (receipt) {
                if (receipt == null && confirmations === 0) {
                    return null;
                }
                // No longer pending, allow the polling loop to garbage collect this
                _this._emitted["t:" + tx.hash] = receipt.blockNumber;
                if (receipt.status === 0) {
                    logger.throwError("transaction failed", logger_1.Logger.errors.CALL_EXCEPTION, {
                        transactionHash: tx.hash,
                        transaction: tx
                    });
                }
                return receipt;
            });
        };
        return result;
    };
    BaseProvider.prototype.sendTransaction = function (signedTransaction) {
        var _this = this;
        return this._runPerform("sendTransaction", {
            signedTransaction: function () { return Promise.resolve(signedTransaction).then(function (t) { return bytes_1.hexlify(t); }); }
        }).then(function (result) {
            return _this._wrapTransaction(_this.formatter.transaction(signedTransaction), result);
        }, function (error) {
            error.transaction = _this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                error.transactionHash = error.transaction.hash;
            }
            throw error;
        });
    };
    BaseProvider.prototype._getTransactionRequest = function (transaction) {
        var _this = this;
        return Promise.resolve(transaction).then(function (t) {
            var tx = {};
            ["from", "to"].forEach(function (key) {
                if (t[key] == null) {
                    return;
                }
                tx[key] = Promise.resolve(t[key]).then(function (a) { return (a ? _this._getAddress(a) : null); });
            });
            ["data", "gasLimit", "gasPrice", "value"].forEach(function (key) {
                if (t[key] == null) {
                    return;
                }
                tx[key] = t[key];
            });
            return properties_1.resolveProperties(tx).then(function (t) { return _this.formatter.transactionRequest(t); });
        });
    };
    BaseProvider.prototype._getFilter = function (filter) {
        var _this = this;
        return Promise.resolve(filter).then(function (f) {
            var filter = {};
            if (f.address != null) {
                filter.address = _this._getAddress(f.address);
            }
            if (f.topics) {
                filter.topics = f.topics;
            }
            if (f.blockHash != null) {
                filter.blockHash = f.blockHash;
            }
            ["fromBlock", "toBlock"].forEach(function (key) {
                if (f[key] == null) {
                    return;
                }
                filter[key] = _this._getBlockTag(f[key]);
            });
            return properties_1.resolveProperties(filter).then(function (f) { return _this.formatter.filter(f); });
        });
    };
    BaseProvider.prototype.call = function (transaction, blockTag) {
        var _this = this;
        return this._runPerform("call", {
            transaction: function () { return _this._getTransactionRequest(transaction); },
            blockTag: function () { return _this._getBlockTag(blockTag); }
        }).then(function (result) {
            return bytes_1.hexlify(result);
        });
    };
    BaseProvider.prototype.estimateGas = function (transaction) {
        var _this = this;
        return this._runPerform("estimateGas", {
            transaction: function () { return _this._getTransactionRequest(transaction); }
        }).then(function (result) {
            return bignumber_1.BigNumber.from(result);
        });
    };
    BaseProvider.prototype._getAddress = function (addressOrName) {
        return this.resolveName(addressOrName).then(function (address) {
            if (address == null) {
                logger.throwError("ENS name not configured", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "resolveName(" + JSON.stringify(addressOrName) + ")"
                });
            }
            return address;
        });
    };
    BaseProvider.prototype._getBlock = function (blockHashOrBlockTag, includeTransactions) {
        var _this = this;
        return this.ready.then(function () {
            return _this._getBlockTag(blockHashOrBlockTag).then(function (blockHashOrBlockTag) {
                var params = {
                    includeTransactions: !!includeTransactions
                };
                // Exactly one of blockHash or blockTag will be set
                var blockHash = null;
                var blockTag = null;
                // If blockTag is a number (not "latest", etc), this is the block number
                var blockNumber = -128;
                if (bytes_1.isHexString(blockHashOrBlockTag, 32)) {
                    params.blockHash = blockHashOrBlockTag;
                }
                else {
                    try {
                        params.blockTag = _this.formatter.blockTag(blockHashOrBlockTag);
                        if (bytes_1.isHexString(params.blockTag)) {
                            blockNumber = parseInt(params.blockTag.substring(2), 16);
                        }
                    }
                    catch (error) {
                        logger.throwArgumentError("invalid block hash or block tag", "blockHashOrBlockTag", blockHashOrBlockTag);
                    }
                }
                return web_1.poll(function () {
                    return _this.perform("getBlock", params).then(function (block) {
                        // Block was not found
                        if (block == null) {
                            // For blockhashes, if we didn't say it existed, that blockhash may
                            // not exist. If we did see it though, perhaps from a log, we know
                            // it exists, and this node is just not caught up yet.
                            if (blockHash) {
                                if (_this._emitted["b:" + blockHash] == null) {
                                    return null;
                                }
                            }
                            // For block tags, if we are asking for a future block, we return null
                            if (blockTag) {
                                if (blockNumber > _this._emitted.block) {
                                    return null;
                                }
                            }
                            // Retry on the next block
                            return undefined;
                        }
                        // Add transactions
                        if (includeTransactions) {
                            return _this.formatter.blockWithTransactions(block);
                        }
                        return _this.formatter.block(block);
                    });
                }, { onceBlock: _this });
            });
        });
    };
    BaseProvider.prototype.getBlock = function (blockHashOrBlockTag) {
        return (this._getBlock(blockHashOrBlockTag, false));
    };
    BaseProvider.prototype.getBlockWithTransactions = function (blockHashOrBlockTag) {
        return (this._getBlock(blockHashOrBlockTag, true));
    };
    BaseProvider.prototype.getTransaction = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: _this.formatter.hash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform("getTransaction", params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        var tx = _this.formatter.transactionResponse(result);
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
                var params = { transactionHash: _this.formatter.hash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform("getTransactionReceipt", params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        // "geth-etc" returns receipts before they are ready
                        if (result.blockHash == null) {
                            return undefined;
                        }
                        var receipt = _this.formatter.receipt(result);
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
        return this._runPerform("getLogs", {
            filter: function () { return _this._getFilter(filter); }
        }).then(function (result) {
            return formatter_1.Formatter.arrayOf(_this.formatter.filterLog.bind(_this.formatter))(result);
        });
    };
    BaseProvider.prototype.getEtherPrice = function () {
        return this._runPerform("getEtherPrice", {}).then(function (result) {
            return result;
        });
    };
    BaseProvider.prototype._getBlockTag = function (blockTag) {
        var _this = this;
        if (blockTag instanceof Promise) {
            return blockTag.then(function (b) { return _this._getBlockTag(b); });
        }
        if (typeof (blockTag) === "number" && blockTag < 0) {
            if (blockTag % 1) {
                logger.throwArgumentError("invalid BlockTag", "blockTag", blockTag);
            }
            return this._getFastBlockNumber().then(function (bn) {
                bn += blockTag;
                if (bn < 0) {
                    bn = 0;
                }
                return _this.formatter.blockTag(bn);
            });
        }
        return Promise.resolve(this.formatter.blockTag(blockTag));
    };
    BaseProvider.prototype._getResolver = function (name) {
        var _this = this;
        // Get the resolver from the blockchain
        return this.getNetwork().then(function (network) {
            // No ENS...
            if (!network.ensAddress) {
                logger.throwError("network does support ENS", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "ENS", network: network.name });
            }
            // keccak256("resolver(bytes32)")
            var data = "0x0178b8bf" + hash_1.namehash(name).substring(2);
            var transaction = { to: network.ensAddress, data: data };
            return _this.call(transaction).then(function (data) {
                return _this.formatter.callAddress(data);
            });
        });
    };
    BaseProvider.prototype.resolveName = function (name) {
        var _this = this;
        // If it is a promise, resolve it then recurse
        if (name instanceof Promise) {
            return name.then(function (addressOrName) { return _this.resolveName(addressOrName); });
        }
        // If it is already an address, nothing to resolve
        try {
            return Promise.resolve(this.formatter.address(name));
        }
        catch (error) { }
        // Get the addr from the resovler
        return this._getResolver(name).then(function (resolverAddress) {
            if (!resolverAddress) {
                return null;
            }
            // keccak256("addr(bytes32)")
            var data = "0x3b3b57de" + hash_1.namehash(name).substring(2);
            var transaction = { to: resolverAddress, data: data };
            return _this.call(transaction).then(function (data) {
                return _this.formatter.callAddress(data);
            });
        });
    };
    BaseProvider.prototype.lookupAddress = function (address) {
        var _this = this;
        if (address instanceof Promise) {
            return address.then(function (address) { return _this.lookupAddress(address); });
        }
        address = this.formatter.address(address);
        var name = address.substring(2) + ".addr.reverse";
        return this._getResolver(name).then(function (resolverAddress) {
            if (!resolverAddress) {
                return null;
            }
            // keccak("name(bytes32)")
            var data = "0x691f3431" + hash_1.namehash(name).substring(2);
            return _this.call({ to: resolverAddress, data: data }).then(function (data) {
                var bytes = bytes_1.arrayify(data);
                // Strip off the dynamic string pointer (0x20)
                if (bytes.length < 32 || !bignumber_1.BigNumber.from(bytes.slice(0, 32)).eq(32)) {
                    return null;
                }
                bytes = bytes.slice(32);
                if (bytes.length < 32) {
                    return null;
                }
                var length = bignumber_1.BigNumber.from(bytes.slice(0, 32)).toNumber();
                bytes = bytes.slice(32);
                if (length > bytes.length) {
                    return null;
                }
                var name = strings_1.toUtf8String(bytes.slice(0, length));
                // Make sure the reverse record matches the foward record
                return _this.resolveName(name).then(function (addr) {
                    if (addr != address) {
                        return null;
                    }
                    return name;
                });
            });
        });
    };
    BaseProvider.prototype.perform = function (method, params) {
        return logger.throwError(method + " not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, { operation: method });
    };
    BaseProvider.prototype._startPending = function () {
        console.log("WARNING: this provider does not support pending events");
    };
    BaseProvider.prototype._stopPending = function () {
    };
    // Returns true if there are events that still require polling
    BaseProvider.prototype._checkPolling = function () {
        this.polling = (this._events.filter(function (e) { return e.pollable(); }).length > 0);
    };
    BaseProvider.prototype._addEventListener = function (eventName, listener, once) {
        this._events.push(new Event(getEventTag(eventName), listener, once));
        if (eventName === "pending") {
            this._startPending();
        }
        // Do we still now have any events that require polling?
        this._checkPolling();
        return this;
    };
    BaseProvider.prototype.on = function (eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    };
    BaseProvider.prototype.once = function (eventName, listener) {
        return this._addEventListener(eventName, listener, true);
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
        // Do we still have any events that require polling? ("once" events remove themselves)
        this._checkPolling();
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
        if (eventName == null) {
            return this._events.map(function (event) { return event.listener; });
        }
        var eventTag = getEventTag(eventName);
        return this._events
            .filter(function (event) { return (event.tag === eventTag); })
            .map(function (event) { return event.listener; });
    };
    BaseProvider.prototype.off = function (eventName, listener) {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }
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
        if (eventName === "pending" && this.listenerCount("pending") === 0) {
            this._stopPending();
        }
        // Do we still have any events that require polling?
        this._checkPolling();
        return this;
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
            if (eventName === "pending") {
                this._stopPending();
            }
        }
        // Do we still have any events that require polling?
        this._checkPolling();
        return this;
    };
    return BaseProvider;
}(abstract_provider_1.Provider));
exports.BaseProvider = BaseProvider;
