var utils = require('./utils.js');

function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function() { return JSON.parse(frozen); }
    });
}

function getKeys(params, key) {
    if (!Array.isArray(params)) { throw new Error('invalid params'); }

    var result = [];

    for (var i = 0; i < params.length; i++) {
        if (typeof(params[i][key]) !== 'string') { throw new Error('invalid abi'); }
        // @TODO: Check type are valid?
        result.push(params[i][key]);
    }

    return result;
}

function Contract(abi) {
    if (!(this instanceof Contract)) { throw new Error('missing new'); }

    //defineProperty(this, 'address', address);

    // Wrap this up as JSON so we can return a "copy" and avoid mutation
    defineFrozen(this, 'abi', abi);

    var methods = [], events = [];
    abi.forEach(function(method) {

        switch (method.type) {
            case 'function':
                methods.push(method.name);
                func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var outputTypes = getKeys(method.outputs, 'type');

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

                        result.data = signature + Contract.encodeParams(inputTypes, params);
                        if (method.constant) {
                            result.type = 'call';
                            result.parse = function(data) {
                                return Contract.decodeParams(
                                    outputTypes,
                                    utils.hexOrBuffer(data).toString('hex')
                                )
                            };
                        } else {
                            result.type = 'transaction';
                        }

                        return result;
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
                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            inputs: method.inputs,
                            name: method.name,
                            type: 'filter',
                            signature: signature,
                            topics: ['0x' + utils.sha3(signature).toString('hex')],
                        };
                        result.parse = function(data) {
                            return Contract.decodeParams(
                                inputTypes,
                                utils.hexOrBuffer(data).toString('hex')
                            );
                        };
                        return result;
                    }
                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    return func;
                })();
                break;

            default:
                func = (function() {
                    return function() {
                        return {type: 'unknown'}
                    }
                })();
                break;
        }
        utils.defineProperty(this, method.name, func);
    }, this);

    defineFrozen(this, 'methods', methods);
    defineFrozen(this, 'events', events);
}

function numberOrBN(value) {
    if (!value.eq) {
        if (typeof(value) !== 'number') {
            throw new Error('invalid number');
        }
        value = new utils.BN(value);
    }
    return value;
}

/*
    var valueTrue = new Buffer(32);
    valueTrue.fill(0);
    valueTrue[31] = 1;

    varvalueFalse = new Buffer(32);
    valueFalse.fill(0);
*/

// Break the type up into [staticType][staticArray]*[dynamicArray]? | [dynamicType] and
// build the coder up from its parts
var paramTypePart = new RegExp(/^((u?int|bytes)([0-9]*)|(address|string)|(\[([0-9]*)\]))/);
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

function coderNumber (size, signed) {
    return {
        encode: function(value) {
            value = numberOrBN(value)
//            if (signed) {
                return value.toTwos(32 * 8).toArrayLike(Buffer, 'be', 32);
//            } else {
//                return value.toArrayLike(Buffer, 'be', 32);
//            }
        },
        decode: function(data, offset) {
            var value = new utils.BN(data.slice(offset, offset + 32));
//            if (signed) {
            value = value.fromTwos(32 * 8);
//            }
            return {
                consumed: 32,
                value: value,
            }
        }
    };
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
        coderNumber(value.length, false).encode(value.length),
        value,
        padding
    ]);
}

function _decodeDynamicBytes(data, offset) {
    if (data.length < offset + 32) { throw new Error('invalid bytes'); }

    var length = coderNumber(32, false).decode(data, offset).value;
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
                result = coderNumber(32, false).encode(length);
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
                 result = coderNumber(32, false).decode(data, offset);
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

utils.defineProperty(Contract, 'encodeParams', function(types, values) {
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
            coderNumber(32, false).encode(dynamicOffset).copy(data, offset);
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

utils.defineProperty(Contract, 'decodeParams', function(types, data) {
    data = utils.hexOrBuffer(data);

    var values = [];

    var offset = 0;
    types.forEach(function(type) {
        var coder = getParamCoder(type);
        if (coder.dynamic) {
            var dynamicOffset = coderNumber(32, false).decode(data, offset);
            var result = coder.decode(data, dynamicOffset.value.toNumber());
            offset += dynamicOffset.consumed;
        } else {
            var result = coder.decode(data, offset);
            offset += result.consumed;
        }
        values.push(result.value);
    });

    return values;
});

module.exports = Contract;
