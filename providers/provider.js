
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var utils = (function() {
    var convert = require('ethers-utils/convert.js');
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,

        getAddress: require('ethers-utils/address.js').getAddress,

        bigNumberify: require('ethers-utils/bignumber.js').bigNumberify,
        arrayify: convert.arrayify,

        hexlify: convert.hexlify,
        isHexString: convert.isHexString,
    }
})();

function check(format, object) {
    var result = {};
    for (var key in format) {
        try {
            value = format[key](object[key]);
            if (value !== undefined) { result[key] = value; }
        } catch (error) {
            console.log(error, key, object);
            error.checkKey = key;
            error.checkValue = object[key];
            throw error;
        }
    }
    return result;
}

function allowNull(check, nullValue) {
    return (function(value) {
        if (value == null) { return nullValue; }
        return check(value);
    });
}

function allowFalsish(check, replaceValue) {
    return (function(value) {
        if (!value) { return replaceValue; }
        return check(value);
    });
}

function arrayOf(check) {
    return (function(array) {
        if (!Array.isArray(array)) { throw new Error('not an array'); }

        var result = [];

        array.forEach(function(value) {
            result.push(check(value));
        });

        return result;
    });
}

function checkHash(hash) {
    if (!utils.isHexString(hash) || hash.length !== 66) {
        throw new Error('invalid hash');
    }
    return hash;
}

function checkNumber(number) {
    return utils.bigNumberify(number).toNumber();
}

function checkString(string) {
    if (typeof(string) !== 'string') { throw new Error('invalid string'); }
    return string;
}

function checkBlockTag(blockTag) {
    if (blockTag == null) { return 'latest'; }

    if (utils.isHexString(blockTag)) { return blockTag; }

    if (blockTag === 'earliest') { blockTag = 0; }
    if (typeof(blockTag) === 'number') {
        return utils.hexlify(blockTag);
    }

    if (blockTag === 'latest' || blockTag === 'pending') {
        return blockTag;
    }

    throw new Error('invalid blockTag');
}

var formatBlock = {
    hash: checkHash,
    parentHash: checkHash,
    number: checkNumber,

    timestamp: checkNumber,
    nonce: utils.hexlify,
    difficulty: checkNumber,

    gasLimit: utils.bigNumberify,
    gasUsed: utils.bigNumberify,

    author: utils.getAddress,
    extraData: utils.hexlify,

    //transactions: allowNull(arrayOf(checkTransaction)),
    transactions: allowNull(arrayOf(checkHash)),

    //transactionRoot: checkHash,
    //stateRoot: checkHash,
    //sha3Uncles: checkHash,

    //logsBloom: utils.hexlify,
};

function checkBlock(block) {
    return check(formatBlock, block);
}


var formatTransaction = {
   hash: checkHash,

   blockHash: allowNull(checkHash, null),
   blockNumber: allowNull(checkNumber, null),
   transactionIndex: allowNull(checkNumber, null),

   from: utils.getAddress,

   gasPrice: utils.bigNumberify,
   gasLimit: utils.bigNumberify,
   to: allowNull(utils.getAddress, null),
   value: utils.bigNumberify,
   nonce: checkNumber,
   data: utils.hexlify,

   r: checkHash,
   s: checkHash,
   v: checkNumber,

   creates: allowNull(utils.getAddress, null),
};

function checkTransaction(transaction) {
    if (transaction.gas != null && transaction.gasLimit == null) {
        transaction.gasLimit = transaction.gas;
    }
    if (transaction.input != null && transaction.data == null) {
        transaction.data = transaction.input;
    }
    return check(formatTransaction, transaction);
}

var formatTransactionReceiptLog = {
    transactionLogIndex: checkNumber,
    blockNumber: checkNumber,
    transactionHash: checkHash,
    address: utils.getAddress,
    type: checkString,
    topics: arrayOf(checkHash),
    transactionIndex: checkNumber,
    data: utils.hexlify,
    logIndex: checkNumber,
    blockHash: checkHash,
};

function checkTransactionReceiptLog(log) {
    return check(formatTransactionReceiptLog, log);
}

var formatTransactionReceipt = {
    contractAddress: allowNull(utils.getAddress, null),
    transactionIndex: checkNumber,
    root: checkHash,
    gasUsed: utils.bigNumberify,
    logsBloom: utils.hexlify,
    blockHash: checkHash,
    transactionHash: checkHash,
    logs: arrayOf(checkTransactionReceiptLog),
    blockNumber: checkNumber,
    cumulativeGasUsed: utils.bigNumberify,
};

function checkTransactionReceipt(transactionReceipt) {
    return check(formatTransactionReceipt, transactionReceipt);
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
    address: allowNull(utils.getAddress, undefined),
    topics: allowNull(checkTopics, undefined),
};

function checkFilter(filter) {
    return check(formatFilter, filter);
}

var formatLog = {
    blockNumber: checkNumber,
    transactionIndex: checkNumber,

    address: utils.getAddress,
    data: allowFalsish(utils.hexlify, '0x'),

    topics: arrayOf(checkHash),

    transactionHash: checkHash,
    logIndex: checkNumber,
}

function checkLog(log) {
    return check(formatLog, log);
}

function Provider(testnet, chainId) {
    if (!(this instanceof Provider)) { throw new Error('missing new'); }

    testnet = !!testnet;

    if (chainId == null) {
        chainId = (testnet ? Provider.chainId.ropsten: Provider.chainId.homestead);
    }

    if (typeof(chainId) !== 'number') { throw new Error('invalid chainId'); }

    utils.defineProperty(this, 'testnet', testnet);
    utils.defineProperty(this, 'chainId', chainId);

    var events = {};
    utils.defineProperty(this, '_events', events);

    var self = this;

    var lastBlockNumber = null;
    var poller = setInterval(function() {
        self.getBlockNumber().then(function(blockNumber) {

            // If the block hasn't changed, meh.
            if (blockNumber === lastBlockNumber) { return; }

            if (lastBlockNumber === null) { lastBlockNumber = blockNumber - 1; }

            // Notify all listener for each block that has passed
            for (var i = lastBlockNumber + 1; i <= blockNumber; i++) {
                self.emit('block', i);
            }
            lastBlockNumber = blockNumber;

            // Find all transaction hashes we are waiting on
            for (var eventName in events) {
                if (utils.isHexString(eventName) && eventName.length === 66) {
                    eventName = getString(eventName);
                    self.getTransaction(eventName).then(function(transaction) {
                        if (!transaction.blockNumber) { return; }
                        self.emit(eventName, transaction);
                    });
                }
            }
        });

        self.doPoll();
    }, 4000);

    if (poller.unref) { poller.unref(); }
}

utils.defineProperty(Provider, 'chainId', {
    homestead: 1,
    morden: 2,
    ropsten: 3,
});

utils.defineProperty(Provider, 'isProvider', function(object) {
    return (object instanceof Provider);
});

utils.defineProperty(Provider, 'fetchJSON', function(url, json, processFunc) {

    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();

        if (json) {
            request.open('POST', url, true);
            request.setRequestHeader('Content-Type','application/json');
        } else {
            request.open('GET', url, true);
        }

        request.onreadystatechange = function() {
            if (request.readyState !== 4) { return; }

            if (request.status != 200) {
                var error = new Error('invalid response');
                error.statusCode = request.statusCode;
                reject(error);
                return;
            }

            var result = request.responseText;

            try {
                result = JSON.parse(result);
            } catch (error) {
                var jsonError = new Error('invalid json response');
                jsonError.orginialError = error;
                jsonError.responseText = request.responseText;
                reject(jsonError);
                return;
            }

            if (processFunc) {
                try {
                    result = processFunc(result);
                } catch (error) {
                    error.responseText = request.responseText;
                    reject(error);
                    return;
                }
            }

            resolve(result);
        };

        request.onerror = function(error) {
            reject(error);
        }

        try {
            if (json) {
                request.send(json);
            } else {
                request.send();
            }

        } catch (error) {
            var connectionError = new Error('connection error');
            connectionError.error = error;
            reject(connectionError);
        }
    });
});


utils.defineProperty(Provider.prototype, 'waitForTransaction', function(transactionHash, timeout) {
    return new Promise(function() {
        var done = false;
        var timer = null;

        function complete(transaction) {
            if (done) { return; }
            done = true;

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            resolve(transaction);
        }

        function checkTransaction(transaction) {
        }

        if (typeof(timeout) === 'number' && timeout > 0) {
            timer = setTimeout(function() {
                done = true;
                timer = null;
                reject(new Error('timeout'));
            }, timeout);
        }

    });
});


utils.defineProperty(Provider.prototype, 'getBlockNumber', function() {
    try {
        return this.perform('getBlockNumber').then(function(result) {
            var value = parseInt(result);
            if (value != result) { throw new Error('invalid response'); }
            return value;
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getGasPrice', function() {
    try {
        return this.perform('getGasPrice').then(function(result) {
            return utils.bigNumberify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});


utils.defineProperty(Provider.prototype, 'getBalance', function(address, blockTag) {
    try {
        var params = {address: utils.getAddress(address), blockTag: checkBlockTag(blockTag)};
        return this.perform('getBalance', params).then(function(result) {
            return utils.bigNumberify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getTransactionCount', function(address, blockTag) {
    try {
        var params = {address: utils.getAddress(address), blockTag: checkBlockTag(blockTag)};
        return this.perform('getTransactionCount', params).then(function(result) {
            var value = parseInt(result);
            if (value != result) { throw new Error('invalid response'); }
            return value;
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getCode', function(address, blockTag) {
    try {
        var params = {address: utils.getAddress(address), blockTag: checkBlockTag(blockTag)};
        return this.perform('getCode', params).then(function(result) {
            return utils.hexlify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getStorageAt', function(address, position, blockTag) {
    try {
        var params = {
            address: utils.getAddress(address),
            position: utils.hexlify(position),
            blockTag: checkBlockTag(blockTag)
        };
        return this.perform('getStorageAt', params).then(function(result) {
            return utils.hexlify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'sendTransaction', function(signedTransaction) {
    try {
        var params = {signedTransaction: utils.hexlify(signedTransaction)};
        return this.perform('sendTransaction', params).then(function(result) {
            result = utils.hexlify(result);
            if (result.length !== 66) { throw new Error('invalid response'); }
            return result;
        });
    } catch (error) {
        return Promise.reject(error);
    }
});


utils.defineProperty(Provider.prototype, 'call', function(transaction) {
    try {
        var params = {transaction: checkTransaction(transaction)};
        return this.perform('call', params).then(function(result) {
            return utils.hexlify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'estimateGas', function(transaction) {
    try {
        var params = {transaction: checkTransaction(transaction)};
        return this.perform('call', params).then(function(result) {
             return utils.bigNumberify(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});


utils.defineProperty(Provider.prototype, 'getBlock', function(blockHashOrBlockTag) {
    try {
        var blockHash = utils.hexlify(blockHashOrBlockTag);
        if (blockHash.length === 66) {
            return this.perform('getBlock', {blockHash: blockHash}).then(function(block) {
                return checkBlock(block);
            });
        }
    } catch (error) {
        console.log('DEBUG', error);
    }

    try {
        var blockTag = checkBlockTag(blockHashOrBlockTag);
        return this.perform('getBlock', {blockTag: blockTag}).then(function(block) {
            return checkBlock(block);
        });
    } catch (error) {
        console.log('DEBUG', error);
    }

    return Promise.reject(new Error('invalid block hash or block tag'));
});

utils.defineProperty(Provider.prototype, 'getTransaction', function(transactionHash) {
    try {
        var params = {transactionHash: checkHash(transactionHash)};
        return this.perform('getTransaction', params).then(function(result) {
            return checkTransaction(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getTransactionReceipt', function(transactionHash) {
    try {
        var params = {transactionHash: checkHash(transactionHash)};
        return this.perform('getTransactionReceipt', params).then(function(result) {
            return checkTransactionReceipt(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getLogs', function(filter) {
    try {
        var params = {filter: checkFilter(filter)};
        return this.perform('getLogs', params).then(function(result) {
            return arrayOf(checkLog)(result);
        });
    } catch (error) {
        return Promise.reject(error);
    }
});

utils.defineProperty(Provider.prototype, 'getEtherPrice', function() {
    try {
        return this.perform('getEtherPrice', {}).then(function(result) {
            // @TODO: Check valid float
            return result;
        });
    } catch (error) {
        return Promise.reject(error);
    }
});


utils.defineProperty(Provider.prototype, 'doPoll', function() {
    
});

utils.defineProperty(Provider.prototype, 'perform', function(method, params) {
    return Promise.reject(new Error('not implemented - ' + method));
});

function getString(object) {
    if (Array.isArray(object)) {
        var  result = [];
        for (var i = 0; i < object.length; i++) {
            result.push(getString(object[i]));
        }
        return '[' + result.join(',') + ']';

    } else if (typeof(object) === 'string') {
        return object;

    } else if (object == null) {
        return 'null';
    }

    throw new Error('invalid topic');
}

utils.defineProperty(Provider.prototype, 'on', function(eventName, listener) {
    var key = getString(eventName);
    if (!this._events[key]) { this._events[eventName] = []; }
    this._events[key].push({eventName: eventName, listener: listener, type: 'on'});
});

utils.defineProperty(Provider.prototype, 'once', function(eventName, listener) {
    var key = getString(eventName);
    if (!this._events[key]) { this._events[eventName] = []; }
    this._events[key].push({listener: listener, type: 'once'});
});

utils.defineProperty(Provider.prototype, 'emit', function(eventName) {
    var key = getString(eventName);

    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = this._events[key];
    if (!listeners) { return; }

    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];

        if (listener.type === 'once') {
            delete listeners[i];
            i--;
        }

        try {
            listener.listener.apply(this, args);
        } catch (error) {
            console.log('Event Listener Error: ' + error.message);
        }
    }
console.log('LLL', listeners);
    if (listeners.length === 0) { delete this._events[key]; }
});

utils.defineProperty(Provider.prototype, 'listenerCount', function(eventName) {
    var listeners = this._events[getString(eventName)];
    if (!listeners) { return 0; }
    return listeners.length;
});

utils.defineProperty(Provider.prototype, 'listeners', function(eventName) {
    var listeners = this._events[getString(eventName)];
    if (!listeners) { return 0; }
    var result = [];
    for (var i = 0; i < listeners.length; i++) {
        result.push(lisrteners[i].listener);
    }
    return result;
});

utils.defineProperty(Provider.prototype, 'removeAllListeners', function(eventName) {
    delete this._events[getString(eventName)];
});

utils.defineProperty(Provider.prototype, 'removeListener', function(eventName, listener) {
    var listeners = this._events[getString(eventName)];
    if (!listeners) { return 0; }
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].listener === listener) {
            delete listeners[i];
            return;
        }
    }
});

module.exports = Provider;
