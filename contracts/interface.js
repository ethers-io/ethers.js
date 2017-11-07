'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

var throwError = require('ethers-utils/throw-error');

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
    if (!Array.isArray(params)) { throwError('invalid params', {params: params}); }

    var result = [];

    for (var i = 0; i < params.length; i++) {
        var value = params[i][key];
        if (allowEmpty && !value) {
            value = '';
        } else if (typeof(value) !== 'string') {
            throwError('invalid abi', {params: params, key: key, value: value});
        }
        result.push(value);
    }

    return result;
}

var coderNull = {
    name: 'null',
    type: '',
    encode: function(value) {
        return utils.arrayify([]);
    },
    decode: function(data, offset) {
        if (offset > data.length) { throw new Error('invalid null'); }
        return {
            consumed: 0,
            value: undefined
        }
    },
    dynamic: false
};

function coderNumber(size, signed) {
    var name = ((signed ? 'int': 'uint') + size);
    return {
        name: name,
        type: name,
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

            if (size <= 6) { value = value.toNumber(); }

            return {
                consumed: 32,
                value: value,
            }
        }
    };
}
var uint256Coder = coderNumber(32, false);

var coderBoolean = {
    name: 'boolean',
    type: 'boolean',
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
    var name = ('bytes' + length);
    return {
        name: name,
        type: name,
        encode: function(value) {
            value = utils.arrayify(value);
            if (length === 32) { return value; }

            var result = new Uint8Array(32);
            result.set(value);
            return result;
        },
        decode: function(data, offset) {
            if (data.length < offset + 32) { throwError('invalid bytes' + length); }

            return {
                consumed: 32,
                value: utils.hexlify(data.slice(offset, offset + length))
            }
        }
    };
}

var coderAddress = {
    name: 'address',
    type: 'address',
    encode: function(value) {
        value = utils.arrayify(utils.getAddress(value));
        var result = new Uint8Array(32);
        result.set(value, 12);
        return result;
    },
    decode: function(data, offset) {
        if (data.length < offset + 32) { throwError('invalid address'); }
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
    if (data.length < offset + 32) { throwError('invalid bytes'); }

    var length = uint256Coder.decode(data, offset).value;
    length = length.toNumber();
    if (data.length < offset + 32 + length) { throwError('invalid bytes'); }

    return {
        consumed: parseInt(32 + 32 * Math.ceil(length / 32)),
        value: data.slice(offset + 32, offset + 32 + length),
    }
}

var coderDynamicBytes = {
    name: 'bytes',
    type: 'bytes',
    encode: function(value) {
        return _encodeDynamicBytes(utils.arrayify(value));
    },
    decode: function(data, offset) {
        var result = _decodeDynamicBytes(data, offset);
        result.value = utils.hexlify(result.value);
        return result;
    },
    dynamic: true
};

var coderString = {
    name: 'string',
    type: 'string',
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

function alignSize(size) {
    return parseInt(32 * Math.ceil(size / 32));
}

function pack(coders, values) {
    var parts = [];

    coders.forEach(function(coder, index) {
        parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) });
    })

    var staticSize = 0, dynamicSize = 0;
    parts.forEach(function(part, index) {
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

    return data;
}


function unpack(coders, data, offset) {
    var baseOffset = offset;
    var consumed = 0;
    var value = [];

    coders.forEach(function(coder) {
        if (coder.dynamic) {
            var dynamicOffset = uint256Coder.decode(data, offset);
            var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber());
            // The dynamic part is leap-frogged somewhere else; doesn't count towards size
            result.consumed = dynamicOffset.consumed;
        } else {
            var result = coder.decode(data, offset);
        }

        if (result.value != undefined) {
            value.push(result.value);
        }

        offset += result.consumed;
        consumed += result.consumed;
    });

    return {
        value: value,
        consumed: consumed
    }

    return result;
}

function coderArray(coder, length) {
    var type = (coder.type + '[' + (length >= 0 ? length: '') + ']');

    return {
        coder: coder,
        length: length,
        name: 'array',
        type: type,
        encode: function(value) {
            if (!Array.isArray(value)) { throwError('invalid array'); }

            var count = length;

            var result = new Uint8Array(0);
            if (count === -1) {
                count = value.length;
                result = uint256Coder.encode(count);
            }

            if (count !== value.length) { throwError('size mismatch'); }

            var coders = [];
            value.forEach(function(value) { coders.push(coder); });

            return utils.concat([result, pack(coders, value)]);
        },
        decode: function(data, offset) {
            // @TODO:
            //if (data.length < offset + length * 32) { throw new Error('invalid array'); }

            var consumed = 0;

            var count = length;

            if (count === -1) {
                 var decodedLength = uint256Coder.decode(data, offset);
                 count = decodedLength.value.toNumber();
                 consumed += decodedLength.consumed;
                 offset += decodedLength.consumed;
            }

            var coders = [];
            for (var i = 0; i < count; i++) { coders.push(coder); }

            var result = unpack(coders, data, offset);
            result.consumed += consumed;
            return result;
        },
        dynamic: (length === -1 || coder.dynamic)
    }
}


function coderTuple(coders) {
    var dynamic = false;
    var types = [];
    coders.forEach(function(coder) {
        if (coder.dynamic) { dynamic = true; }
        types.push(coder.type);
    });

    var type = ('tuple(' + types.join(',') + ')');

    return {
        coders: coders,
        name: 'tuple',
        type: type,
        encode: function(value) {

            if (coders.length !== coders.length) {
                throwError('types/values mismatch', { type: type, values: values });
            }

            return pack(coders, value);
        },
        decode: function(data, offset) {
            return unpack(coders, data, offset);
        },
        dynamic: dynamic
    };
}

function getTypes(coders) {
    var type = coderTuple(coders).type;
    return type.substring(6, type.length - 1);
}

function splitNesting(value) {
    var result = [];
    var accum = '';
    var depth = 0;
    for (var offset = 0; offset < value.length; offset++) {
        var c = value[offset];
        if (c === ',' && depth === 0) {
            result.push(accum);
            accum = '';
        } else {
            accum += c;
            if (c === '(') {
                depth++;
            } else if (c === ')') {
                depth--;
                if (depth === -1) {
                    throw new Error('unbalanced parenthsis');
                }
            }
        }
    }
    result.push(accum);

    return result;
}

var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
var paramTypeSimple = {
    address: coderAddress,
    bool: coderBoolean,
    string: coderString,
    bytes: coderDynamicBytes,
};

function getParamCoder(type) {

    var coder = paramTypeSimple[type];
    if (coder) { return coder; }

    var match = type.match(paramTypeNumber);
    if (match) {
        var size = parseInt(match[2] || 256);
        if (size === 0 || size > 256 || (size % 8) !== 0) {
            throwError('invalid type', { type: type });
        }
        return coderNumber(size / 8, (match[1] === 'int'));
    }

    var match = type.match(paramTypeBytes);
    if (match) {
        var size = parseInt(match[1]);
        if (size === 0 || size > 32) {
            throwError('invalid type ' + type);
        }
        return coderFixedBytes(size);
    }

    var match = type.match(paramTypeArray);
    if (match) {
        var size = parseInt(match[2] || -1);
        return coderArray(getParamCoder(match[1]), size);
    }

    if (type.substring(0, 6) === 'tuple(' && type.substring(type.length - 1) === ')') {
        var coders = [];
        splitNesting(type.substring(6, type.length - 1)).forEach(function(type) {
            coders.push(getParamCoder(type));
        });
        return coderTuple(coders);
    }

    if (type === '') {
        return coderNull;
    }

    throwError('invalid type', { type: type });
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
            throwError('invalid abi', { input: abi });
        }
    }

    // Wrap this up as JSON so we can return a "copy" and avoid mutation
    defineFrozen(this, 'abi', abi);

    var methods = {}, events = {}, deploy = null;

    utils.defineProperty(this, 'functions', methods);
    utils.defineProperty(this, 'events', events);

    function addMethod(method) {

        switch (method.type) {
            case 'constructor':
                var func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var func = function(bytecode) {
                        if (!utils.isHexString(bytecode)) {
                            throwError('invalid bytecode', {input: bytecode});
                        }

                        var params = Array.prototype.slice.call(arguments, 1);
                        if (params.length < inputTypes.length) {
                            throwError('missing parameter');
                        } else if (params.length > inputTypes.length) {
                            throwError('too many parameters');
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

                    var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                    var sighash = utils.keccak256(utils.toUtf8Bytes(signature)).substring(0, 10);
                    var func = function() {
                        var result = {
                            name: method.name,
                            signature: signature,
                            sighash: sighash
                        };

                        var params = Array.prototype.slice.call(arguments, 0);

                        if (params.length < inputTypes.length) {
                            throwError('missing parameter');
                        } else if (params.length > inputTypes.length) {
                            throwError('too many parameters');
                        }

                        result.data = sighash + Interface.encodeParams(inputTypes, params).substring(2);
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
                    utils.defineProperty(func, 'signature', signature);
                    utils.defineProperty(func, 'sighash', sighash);

                    return func;
                })();

                if (method.name && method.name !== 'deployFunction' && methods[method.name] == null) {
                    utils.defineProperty(methods, method.name, func);
                //} else if (this.fallbackFunction == null) {
                //    utils.defineProperty(this, 'fallbackFunction', func);
                }

                break;

            case 'event':
                var func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            inputs: method.inputs,
                            name: method.name,
                            signature: signature,
                            topics: [utils.keccak256(utils.toUtf8Bytes(signature))],
                        };

                        result.parse = function(topics, data) {

                            // Strip the signature off of non-anonymous topics
                            if (!method.anonymous) { topics = topics.slice(1); }

                            var inputNamesIndexed = [], inputNamesNonIndexed = [];
                            var inputTypesIndexed = [], inputTypesNonIndexed = [];
                            method.inputs.forEach(function(input) {
                                if (input.indexed) {
                                    inputNamesIndexed.push(input.name);
                                    inputTypesIndexed.push(input.type);
                                } else {
                                    inputNamesNonIndexed.push(input.name);
                                    inputTypesNonIndexed.push(input.type);
                                }
                            });

                            var resultIndexed = Interface.decodeParams(
                                inputNamesIndexed,
                                inputTypesIndexed,
                                utils.concat(topics)
                            );

                            var resultNonIndexed = Interface.decodeParams(
                                inputNamesNonIndexed,
                                inputTypesNonIndexed,
                                utils.arrayify(data)
                            );

                            var result = new Result();
                            var nonIndexedIndex = 0, indexedIndex = 0;
                            method.inputs.forEach(function(input, i) {
                                if (input.indexed) {
                                    result[i] = resultIndexed[indexedIndex++];
                                } else {
                                    result[i] = resultNonIndexed[nonIndexedIndex++];
                                }
                                if (input.name) { result[input.name] = result[i]; }
                            });

                            result.length = method.inputs.length;

                            return result;
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

            case 'fallback':
                // Nothing to do for fallback
                break;

            default:
                console.log('WARNING: unsupported ABI type - ' + method.type);
                break;
        }
    };

    this.abi.forEach(addMethod, this);

    // If there wasn't a constructor, create the default constructor
    if (!deploy) {
        addMethod({type: 'constructor', inputs: []});
    }

    utils.defineProperty(this, 'deployFunction', deploy);
}


utils.defineProperty(Interface, 'encodeParams', function(types, values) {
    if (types.length !== values.length) { throwError('types/values mismatch', {types: types, values: values}); }

    var coders = [];
    types.forEach(function(type) {
        coders.push(getParamCoder(type));
    });

    return utils.hexlify(coderTuple(coders).encode(values));
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

    var coders = [];
    types.forEach(function(type) {
        coders.push(getParamCoder(type));
    });

    var result = coderTuple(coders).decode(data, 0);

    // @TODO: Move this into coderTuple
    var values = new Result();
    coders.forEach(function(coder, index) {
        values[index] = result.value[index];
        if (names && names[index]) {
            var name = names[index];
            if (name === 'length') {
                console.log('WARNING: result length renamed to _length');
                name = '_length';
            }
            if (values[name] == null) {
                values[name] = values[index];
            } else {
                console.log('WARNING: duplicate value - ' + name);
            }
        }
    })

    values.length = types.length;

    return values;
});

module.exports = Interface;
