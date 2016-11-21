'use strict';

var utils = require('./utils.js');

// Creates property that is immutable
function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function() { return JSON.parse(frozen); }
    });
}

// getKeys([{a: 1, b: 2}, {a: 3, b: 4}], 'a') => [1, 3]
function getKeys(params, key, allowEmpty) {
    if (!Array.isArray(params)) { throw new Error('invalid params'); }

    var result = [];

    for (var i = 0; i < params.length; i++) {
        var value = params[i][key];
        if (allowEmpty && !value) {
            value = '';
        } else if (typeof(value) !== 'string') {
            throw new Error('invalid abi');
        }
        result.push(value);
    }

    return result;
}

// Convert the value from a Number to a BN (if necessary)
function numberOrBN(value) {
    if (!value.eq) {
        if (typeof(value) !== 'number') {
            throw new Error('invalid number');
        }
        value = new utils.BN(value);
    }
    return value;
}

function zpad(buffer, length) {
    var zero = new Buffer([0]);
    while (buffer.length < length) {
        buffer = Buffer.concat([zero, buffer]);
    }
    return buffer;
}

function coderNumber(size, signed) {
    return {
        encode: function(value) {
            value = numberOrBN(value)
            value = value.toTwos(size * 8).maskn(size * 8);
            if (signed) {
                value = value.fromTwos(size * 8).toTwos(256);
            }
            return value.toArrayLike(Buffer, 'be', 32);
        },
        decode: function(data, offset) {
            var junkLength = 32 - size;
            var value = new utils.BN(data.slice(offset + junkLength, offset + 32));
            if (signed) {
                value = value.fromTwos(size * 8);
            } else {
                value = value.maskn(size * 8);
            }
            return {
                consumed: 32,
                value: value,
            }
        }
    };
}
var uint256Coder = coderNumber(32, false);

var coderBoolean = {
    encode: function(value) {
        return uint256Coder.encode(value ? 1: 0);
    },
    decode: function(data, offset) {
        var result = uint256Coder.decode(data, offset);
        return {
            consumed: result.consumed,
            value: !result.value.isZero()
        }
    }
}

function coderFixedBytes(length) {
    return {
        encode: function(value) {
            value = utils.hexOrBuffer(value);
            if (length === 32) { return value; }

            var result = new Buffer(32);
            result.fill(0);
            value.copy(result);
            return result;
        },
        decode: function(data, offset) {
            if (data.length < offset + 32) { throw new Error('invalid bytes' + length); }

            return {
                consumed: 32,
                value: '0x' + data.slice(offset, offset + length).toString('hex')
            }
        }
    };
}

var coderAddress = {
    encode: function(value) {
        if (!utils.isHexString(value, 20)) { throw new Error('invalid address'); }
        value = utils.hexOrBuffer(value);
        var result = new Buffer(32);
        result.fill(0);
        value.copy(result, 12);
        return result;
    },
    decode: function(data, offset) {
        if (data.length < offset + 32) { throw new Error('invalid address'); }
        return {
            consumed: 32,
            value: '0x' + data.slice(offset + 12, offset + 32).toString('hex')
        }
    }
}

function _encodeDynamicBytes(value) {
    var dataLength = parseInt(32 * Math.ceil(value.length / 32));
    var padding = new Buffer(dataLength - value.length);
    padding.fill(0);

    return Buffer.concat([
        uint256Coder.encode(value.length),
        value,
        padding
    ]);
}

function _decodeDynamicBytes(data, offset) {
    if (data.length < offset + 32) { throw new Error('invalid bytes'); }

    var length = uint256Coder.decode(data, offset).value;
    length = length.toNumber();
    if (data.length < offset + 32 + length) { throw new Error('invalid bytes'); }

    return {
        consumed: parseInt(32 + 32 * Math.ceil(length / 32)),
        value: data.slice(offset + 32, offset + 32 + length),
    }
}

var coderDynamicBytes = {
    encode: function(value) {
        return _encodeDynamicBytes(utils.hexOrBuffer(value));
    },
    decode: function(data, offset) {
        var result = _decodeDynamicBytes(data, offset);
        result.value = '0x' + result.value.toString('hex');
        return result;
    },
    dynamic: true
};

var coderString = {
    encode: function(value) {
        return _encodeDynamicBytes(new Buffer(value, 'utf8'));
    },
    decode: function(data, offset) {
        var result = _decodeDynamicBytes(data, offset);
        result.value = result.value.toString('utf8');
        return result;
    },
    dynamic: true
};

function coderArray(coder, length) {
    return {
        encode: function(value) {
            if (!Array.isArray(value)) { throw new Error('invalid array'); }

            var result = new Buffer(0);
            if (length === -1) {
                length = value.length;
                result = uint256Coder.encode(length);
            }

            if (length !== value.length) { throw new Error('size mismatch'); }

            value.forEach(function(value) {
                result = Buffer.concat([
                    result,
                    coder.encode(value)
                ]);
            });

            return result;
        },
        decode: function(data, offset) {
            // @TODO:
            //if (data.length < offset + length * 32) { throw new Error('invalid array'); }

            var consumed = 0;

            var result;
            if (length === -1) {
                 result = uint256Coder.decode(data, offset);
                 length = result.value.toNumber();
                 consumed += result.consumed;
                 offset += result.consumed;
            }

            var value = [];

            for (var i = 0; i < length; i++) {
                var result = coder.decode(data, offset);
                consumed += result.consumed;
                offset += result.consumed;
                value.push(result.value);
            }

            return {
                consumed: consumed,
                value: value,
            }
        },
        dynamic: (length === -1)
    }
}

// Break the type up into [staticType][staticArray]*[dynamicArray]? | [dynamicType] and
// build the coder up from its parts
var paramTypePart = new RegExp(/^((u?int|bytes)([0-9]*)|(address|bool|string)|(\[([0-9]*)\]))/);
function getParamCoder(type) {
    var coder = null;
    while (type) {
        var part = type.match(paramTypePart);
        if (!part) { throw new Error('invalid type: ' + type); }
        type = type.substring(part[0].length);

        var prefix = (part[2] || part[4] || part[5]);
        switch (prefix) {
            case 'int': case 'uint':
                if (coder) { throw new Error('invalid type ' + type); }
                var size = parseInt(part[3] || 256);
                if (size === 0 || size > 256 || (size % 8) !== 0) {
                    throw new Error('invalid type ' + type);
                }
                coder = coderNumber(size / 8, (prefix === 'int'));
                break;

            case 'bool':
                if (coder) { throw new Error('invalid type ' + type); }
                coder = coderBoolean;
                break;

            case 'string':
                if (coder) { throw new Error('invalid type ' + type); }
                coder = coderString;
                break;

            case 'bytes':
                if (coder) { throw new Error('invalid type ' + type); }
                if (part[3]) {
                    var size = parseInt(part[3]);
                    if (size === 0 || size > 32) {
                        throw new Error('invalid type ' + type);
                    }
                    coder = coderFixedBytes(size);
                } else {
                    coder = coderDynamicBytes;
                }
                break;

            case 'address':
                if (coder) { throw new Error('invalid type '  + type); }
                coder = coderAddress;
                break;

            case '[]':
                if (!coder || coder.dynamic) { throw new Error('invalid type ' + type); }
                coder = coderArray(coder, -1);
                break;

            // "[0-9+]"
            default:
                if (!coder || coder.dynamic) { throw new Error('invalid type ' + type); }
                var size = parseInt(part[6]);
                coder = coderArray(coder, size);
        }
    }

    if (!coder) { throw new Error('invalid type'); }
    return coder;
}

function populateDescription(object, items) {
    for (var key in items) {
        utils.defineProperty(object, key, items[key]);
    }
    return object;
}

function CallDescription() { }
utils.defineProperty(CallDescription.prototype, 'type', 'call');

function TransactionDescription() { }
utils.defineProperty(TransactionDescription.prototype, 'type', 'transaction');

function EventDescription() { }
utils.defineProperty(EventDescription.prototype, 'type', 'event');

function UnsupportedDescription() { }
utils.defineProperty(UnsupportedDescription.prototype, 'type', 'unknown');


function Interface(abi) {
    if (!(this instanceof Interface)) { throw new Error('missing new'); }

    //defineProperty(this, 'address', address);

    // Wrap this up as JSON so we can return a "copy" and avoid mutation
    defineFrozen(this, 'abi', abi);

    var methods = [], events = [];
    abi.forEach(function(method) {

        var func = null;

        switch (method.type) {
            case 'function':
                methods.push(method.name);
                func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var outputTypes = getKeys(method.outputs, 'type');
                    var outputNames = getKeys(method.outputs, 'name', true);

                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            name: method.name,
                            signature: signature,
                        };

                        var params = Array.prototype.slice.call(arguments, 0);

                        if (params.length < inputTypes.length) {
                            throw new Error('missing parameter');
                        } else if (params.length > inputTypes.length) {
                            throw new Error('too many parameters');
                        }

                        signature = '0x' + utils.sha3(signature).slice(0, 4).toString('hex');

                        result.data = signature + Interface.encodeParams(inputTypes, params).substring(2);
                        if (method.constant) {
                            result.parse = function(data) {
                                return Interface.decodeParams(
                                    outputNames,
                                    outputTypes,
                                    utils.hexOrBuffer(data)
                                );
                            };
                            return populateDescription(new CallDescription(), result);
                        }

                        return populateDescription(new TransactionDescription(), result);
                    }

                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    defineFrozen(func, 'outputs', getKeys(method.outputs, 'name'));

                    return func;
                })();
                break;

            case 'event':
                events.push(method.name);
                func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var inputNames = getKeys(method.inputs, 'name', true);
                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            inputs: method.inputs,
                            name: method.name,
                            signature: signature,
                            topics: ['0x' + utils.sha3(signature).toString('hex')],
                        };
                        result.parse = function(data) {
                            return Interface.decodeParams(
                                inputNames,
                                inputTypes,
                                utils.hexOrBuffer(data)
                            );
                        };
                        return populateDescription(new EventDescription(), result);
                    }
                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    return func;
                })();
                break;

            default:
                func = (function() {
                    return function() {
                        return populateDescription(new UnsupportedDescription(), {});
                    }
                })();
                break;
        }

        utils.defineProperty(this, method.name, func);
    }, this);

    defineFrozen(this, 'methods', methods);
    defineFrozen(this, 'events', events);
}




utils.defineProperty(Interface, 'encodeParams', function(types, values) {
    if (types.length !== values.length) { throw new Error('types/values mismatch'); }

    var parts = [];

    types.forEach(function(type, index) {
        var coder = getParamCoder(type);
        parts.push({dynamic: coder.dynamic, value: coder.encode(values[index])});
    })

    function alignSize(size) {
        return parseInt(32 * Math.ceil(size / 32));
    }

    var staticSize = 0, dynamicSize = 0;
    parts.forEach(function(part) {
        if (part.dynamic) {
            staticSize += 32;
            dynamicSize += alignSize(part.value.length);
        } else {
            staticSize += alignSize(part.value.length);
        }
    });

    var offset = 0, dynamicOffset = staticSize;
    var data = new Buffer(staticSize + dynamicSize);

    parts.forEach(function(part, index) {
        if (part.dynamic) {
            uint256Coder.encode(dynamicOffset).copy(data, offset);
            offset += 32;

            part.value.copy(data, dynamicOffset);
            dynamicOffset += alignSize(part.value.length);
        } else {
            part.value.copy(data, offset);
            offset += alignSize(part.value.length);
        }
    });

    return '0x' + data.toString('hex');
});

function Result() {}

utils.defineProperty(Interface, 'decodeParams', function(names, types, data) {

    // Names is optional, so shift over all the parameters if not provided
    if (arguments.length < 3) {
        data = types;
        types = names;
        names = [];
    }

    data = utils.hexOrBuffer(data);
    var values = new Result();

    var offset = 0;
    types.forEach(function(type, index) {
        var coder = getParamCoder(type);
        if (coder.dynamic) {
            var dynamicOffset = uint256Coder.decode(data, offset);
            var result = coder.decode(data, dynamicOffset.value.toNumber());
            offset += dynamicOffset.consumed;
        } else {
            var result = coder.decode(data, offset);
            offset += result.consumed;
        }
        values[index] = result.value;
        if (names[index]) { values[names[index]] = result.value; }
    });
    return values;
});


var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, to: true, value: true
}

function Contract(wallet, contractAddress, contractInterface) {
    utils.defineProperty(this, 'wallet', wallet);

    utils.defineProperty(this, 'contractAddress', contractAddress);
    utils.defineProperty(this, 'interface', contractInterface);

    var self = this;

    var filters = {};
    function setupFilter(call, callback) {
        var info = filters[call.name];

        // Stop and remove the filter
        if (!callback) {
            if (info) { info.filter.stopWatching(); }
            delete filters[call.name];
            return;
        }

        if (typeof(callback) !== 'function') {
            throw new Error('invalid callback');
        }

        // Already have a filter, just update the callback
        if (info) {
            info.callback = callback;
            return;
        }

        info = {callback: callback};
        filters[call.name] = info;

        // Start a new filter
/*
        info.filter = web3.eth.filter({
            address: contractAddress,
            topics: call.topics
        }, function(error, result) {
            // @TODO: Emit errors to .onerror? Maybe?
            if (error) {
                console.log(error);
                return;
            }

            try {
                info.callback.apply(self, call.parse(result.data));
            } catch(error) {
                console.log(error);
            }
        });
*/
    }
    function runMethod(method, estimateOnly) {
        return function() {
            var provider = wallet._provider;

            var transaction = {}

            var params = Array.prototype.slice.call(arguments);
            if (params.length == contractInterface[method].inputs.length + 1) {
                transaction = params.pop();
                if (typeof(transaction) !== 'object') {
                    throw new Error('invalid transaction overrides');
                }
                for (var key in transaction) {
                    if (!allowedTransactionKeys[key]) {
                        throw new Error('unknown transaction override ' + key);
                    }
                }
            }


            var call = contractInterface[method].apply(contractInterface, params);
            switch (call.type) {
                case 'call':
                    ['data', 'gasLimit', 'gasPrice', 'to', 'value'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('call cannot override ' + key) ;
                        }
                    });
                    transaction.data = call.data;
                    if (transaction.from == null) {
                        transaction.from = wallet.address;
                    }
                    transaction.to = contractAddress;

                    if (estimateOnly) {
                        return new Promise(function(resolve, reject) {
                            resolve(new utils.BN(0));
                        });
                    }

                    return new Promise(function(resolve, reject) {
                        provider.call(transaction).then(function(value) {
                            resolve(call.parse(value));
                        }, function(error) {
                            reject(error);
                        });
                    });

                case 'transaction':
                    ['data', 'from', 'to'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('transaction cannot override ' + key) ;
                        }
                    });
                    transaction.data = call.data;
                    transaction.to = contractAddress;
                    if (transaction.gasLimit == null) {
                        transaction.gasLimit = 3000000;
                    }

                    if (estimateOnly) {
                        return new Promise(function(resolve, reject) {
                            provider.estimateGas(transaction).then(function(gasEstimate) {
                                resolve(gasEstimate);
                            }, function(error) {
                                reject(error);
                            });
                        });
                    }

                    return new Promise(function(resolve, reject) {
                        Promise.all([
                            provider.getTransactionCount(wallet.address, 'pending'),
                            provider.getGasPrice(),
                        ]).then(function(results) {
                            if (transaction.nonce == null) {
                                transaction.nonce = results[0];
                            } else if (console.warn) {
                                console.warn('Overriding suggested nonce: ' + results[0]);
                            }
                            if (transaction.gasPrice == null) {
                                transaction.gasPrice = results[1];
                            } else if (console.warn) {
                                console.warn('Overriding suggested gasPrice: ' + utils.hexlify(results[1]));
                            }

                            var signedTransaction = wallet.sign(transaction);
                            provider.sendTransaction(signedTransaction).then(function(txid) {
                                resolve(txid);
                            }, function(error) {
                                reject(error);
                            });
                        }, function(error) {
                            reject(error);
                        });
                    });
            }
        };
    }

    var estimate = {};
    utils.defineProperty(this, 'estimate', estimate);

    contractInterface.methods.forEach(function(method) {
        utils.defineProperty(this, method, runMethod(method, false));
        utils.defineProperty(estimate, method, runMethod(method, true));
    }, this);

    contractInterface.events.forEach(function(method) {
        var call = contractInterface[method].apply(contractInterface, []);
        Object.defineProperty(self, 'on' + call.name.toLowerCase(), {
            enumerable: true,
            get: function() {
                //console.log('get');
                var info = filters[call.name];
                if (!info || !info[call.name]) { return null; }
                return info.callback;
            },
            set: function(value) {
                //console.log('set');
                setupFilter(call, value);
            }
        });
    }, this);
}
utils.defineProperty(Contract, 'Interface', Interface);

module.exports = Contract;
