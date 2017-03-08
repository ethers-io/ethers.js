'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

var utils = (function() {
    var convert = require('ethers-utils/convert.js');
    var utf8 = require('ethers-utils/utf8.js');

    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,

        arrayify: convert.arrayify,
        padZeros: convert.padZeros,

        bigNumberify: require('ethers-utils/bignumber.js').bigNumberify,

        getAddress: require('ethers-utils/address').getAddress,

        concat: convert.concat,

        toUtf8Bytes: utf8.toUtf8Bytes,
        toUtf8String: utf8.toUtf8String,

        hexlify: convert.hexlify,
        isHexString: convert.isHexString,

        keccak256: require('ethers-utils/keccak256.js'),
    };
})();

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

function coderNumber(size, signed) {
    return {
        encode: function(value) {
            value = utils.bigNumberify(value).toTwos(size * 8).maskn(size * 8);
            //value = value.toTwos(size * 8).maskn(size * 8);
            if (signed) {
                value = value.fromTwos(size * 8).toTwos(256);
            }
            return utils.padZeros(utils.arrayify(value), 32);
        },
        decode: function(data, offset) {
            var junkLength = 32 - size;
            var value = utils.bigNumberify(data.slice(offset + junkLength, offset + 32));
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
            value = utils.arrayify(value);
            if (length === 32) { return value; }

            var result = new Uint8Array(32);
            result.set(value);
            return result;
        },
        decode: function(data, offset) {
            if (data.length < offset + 32) { throw new Error('invalid bytes' + length); }

            return {
                consumed: 32,
                value: data.slice(offset, offset + length)
            }
        }
    };
}

var coderAddress = {
    encode: function(value) {
        if (!utils.isHexString(value) && value.length === 42) { throw new Error('invalid address'); }
        value = utils.arrayify(value);
        var result = new Uint8Array(32);
        result.set(value, 12);
        return result;
    },
    decode: function(data, offset) {
        if (data.length < offset + 32) { throw new Error('invalid address'); }
        return {
            consumed: 32,
            value: utils.getAddress(utils.hexlify(data.slice(offset + 12, offset + 32)))
        }
    }
}

function _encodeDynamicBytes(value) {
    var dataLength = parseInt(32 * Math.ceil(value.length / 32));
    var padding = new Uint8Array(dataLength - value.length);

    return utils.concat([
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
        return _encodeDynamicBytes(utils.arrayify(value));
    },
    decode: function(data, offset) {
        var result = _decodeDynamicBytes(data, offset);
        result.value = result.value;
        return result;
    },
    dynamic: true
};

var coderString = {
    encode: function(value) {
        return _encodeDynamicBytes(utils.toUtf8Bytes(value));
    },
    decode: function(data, offset) {
        var result = _decodeDynamicBytes(data, offset);
        result.value = utils.toUtf8String(result.value);
        return result;
    },
    dynamic: true
};

function coderArray(coder, length) {
    return {
        encode: function(value) {
            if (!Array.isArray(value)) { throw new Error('invalid array'); }

            var result = new Uint8Array(0);
            if (length === -1) {
                length = value.length;
                result = uint256Coder.encode(length);
            }

            if (length !== value.length) { throw new Error('size mismatch'); }

            value.forEach(function(value) {
                result = utils.concat([result, coder.encode(value)]);
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

function DeployDescription() { }
utils.defineProperty(DeployDescription.prototype, 'type', 'deploy');

function TransactionDescription() { }
utils.defineProperty(TransactionDescription.prototype, 'type', 'transaction');

function EventDescription() { }
utils.defineProperty(EventDescription.prototype, 'type', 'event');

function Interface(abi) {
    if (!(this instanceof Interface)) { throw new Error('missing new'); }

    if (typeof(abi) === 'string') {
        try {
            abi = JSON.parse(abi);
        } catch (error) {
            throw new Error('invalid abi');
        }
    }

    // Wrap this up as JSON so we can return a "copy" and avoid mutation
    defineFrozen(this, 'abi', abi);

    var methods = {}, events = {}, deploy = null;
    function addMethod(method) {

        switch (method.type) {
            case 'constructor':
                var func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var func = function(bytecode) {
                        if (!utils.isHexString(bytecode)) {
                            throw new Error('invalid bytecode');
                        }

                        var params = Array.prototype.slice.call(arguments, 1);
                        if (params.length < inputTypes.length) {
                            throw new Error('missing parameter');
                        } else if (params.length > inputTypes.length) {
                            throw new Error('too many parameters');
                        }

                        var result = {
                            bytecode: bytecode + Interface.encodeParams(inputTypes, params).substring(2),
                        }

                        return populateDescription(new DeployDescription(), result);
                    }

                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));

                    return func;
                })();

                if (!deploy) { deploy = func; }

                break;

            case 'function':
                var func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    if (method.constant) {
                        var outputTypes = getKeys(method.outputs, 'type');
                        var outputNames = getKeys(method.outputs, 'name', true);
                    }

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

                        signature = utils.keccak256(utils.toUtf8Bytes(signature)).substring(0, 10);

                        result.data = signature + Interface.encodeParams(inputTypes, params).substring(2);
                        if (method.constant) {
                            result.parse = function(data) {
                                return Interface.decodeParams(
                                    outputNames,
                                    outputTypes,
                                    utils.arrayify(data)
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

                if (method.name && methods[method.name] == null) {
                    utils.defineProperty(methods, method.name, func);
                //} else if (this.fallbackFunction == null) {
                //    utils.defineProperty(this, 'fallbackFunction', func);
                }

                break;

            case 'event':
                var func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var inputNames = getKeys(method.inputs, 'name', true);
                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            inputs: method.inputs,
                            name: method.name,
                            signature: signature,
                            topics: [utils.keccak256(utils.toUtf8Bytes(signature))],
                        };
                        result.parse = function(data) {
                            return Interface.decodeParams(
                                inputNames,
                                inputTypes,
                                utils.arrayify(data)
                            );
                        };
                        return populateDescription(new EventDescription(), result);
                    }
                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    return func;
                })();

                if (method.name && events[method.name] == null) {
                    utils.defineProperty(events, method.name, func);
                }

                break;

            default:
                console.log('WARNING: unsupported ABI type - ' + method.type);
                break;
        }
    };

    abi.forEach(addMethod, this);

    // If there wasn't a constructor, create the default constructor
    if (!deploy) {
        addMethod({type: 'constructor', inputs: []});
    }

    utils.defineProperty(this, 'functions', methods);
    utils.defineProperty(this, 'events', events);
    utils.defineProperty(this, 'deployFunction', deploy);
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
    var data = new Uint8Array(staticSize + dynamicSize);

    parts.forEach(function(part, index) {
        if (part.dynamic) {
            //uint256Coder.encode(dynamicOffset).copy(data, offset);
            data.set(uint256Coder.encode(dynamicOffset), offset);
            offset += 32;

            //part.value.copy(data, dynamicOffset);  @TODO
            data.set(part.value, dynamicOffset);
            dynamicOffset += alignSize(part.value.length);
        } else {
            //part.value.copy(data, offset);  @TODO
            data.set(part.value, offset);
            offset += alignSize(part.value.length);
        }
    });
    return utils.hexlify(data);
});


function Result() {}

utils.defineProperty(Interface, 'decodeParams', function(names, types, data) {

    // Names is optional, so shift over all the parameters if not provided
    if (arguments.length < 3) {
        data = types;
        types = names;
        names = [];
    }

    data = utils.arrayify(data);
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

        // Add indexed parameter
        values[index] = result.value;

        // Add named parameters
        if (names[index]) {
            var name = names[index];

            // We reserve length to make the Result object arrayish
            if (name === 'length') {
                console.log('WARNING: result length renamed to _length');
                name = '_length';
            }

            if (values[name] == null) {
                values[name] = result.value;
            } else {
                console.log('WARNING: duplicate value - ' + name);
            }
        }
    });

    values.length = types.length;

    return values;
});

utils.defineProperty(Interface, 'getDeployTransaction', function(bytecode) {
});

module.exports = Interface;
