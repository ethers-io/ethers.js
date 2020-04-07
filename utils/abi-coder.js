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
// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
var constants_1 = require("../constants");
var errors = __importStar(require("../errors"));
var address_1 = require("./address");
var bignumber_1 = require("./bignumber");
var bytes_1 = require("./bytes");
var utf8_1 = require("./utf8");
var properties_1 = require("./properties");
///////////////////////////////
var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
exports.defaultCoerceFunc = function (type, value) {
    var match = type.match(paramTypeNumber);
    if (match && parseInt(match[2]) <= 48) {
        return value.toNumber();
    }
    return value;
};
///////////////////////////////////
// Parsing for Solidity Signatures
var regexParen = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
var regexIdentifier = new RegExp("^[A-Za-z_][A-Za-z0-9_]*$");
function verifyType(type) {
    // These need to be transformed to their full description
    if (type.match(/^uint($|[^1-9])/)) {
        type = 'uint256' + type.substring(4);
    }
    else if (type.match(/^int($|[^1-9])/)) {
        type = 'int256' + type.substring(3);
    }
    return type;
}
function parseParam(param, allowIndexed) {
    var originalParam = param;
    function throwError(i) {
        throw new Error('unexpected character "' + originalParam[i] + '" at position ' + i + ' in "' + originalParam + '"');
    }
    param = param.replace(/\s/g, ' ');
    var parent = { type: '', name: '', state: { allowType: true } };
    var node = parent;
    for (var i = 0; i < param.length; i++) {
        var c = param[i];
        switch (c) {
            case '(':
                if (!node.state.allowParams) {
                    throwError(i);
                }
                node.state.allowType = false;
                node.type = verifyType(node.type);
                node.components = [{ type: '', name: '', parent: node, state: { allowType: true } }];
                node = node.components[0];
                break;
            case ')':
                delete node.state;
                if (allowIndexed && node.name === 'indexed') {
                    node.indexed = true;
                    node.name = '';
                }
                node.type = verifyType(node.type);
                var child = node;
                node = node.parent;
                if (!node) {
                    throwError(i);
                }
                delete child.parent;
                node.state.allowParams = false;
                node.state.allowName = true;
                node.state.allowArray = true;
                break;
            case ',':
                delete node.state;
                if (allowIndexed && node.name === 'indexed') {
                    node.indexed = true;
                    node.name = '';
                }
                node.type = verifyType(node.type);
                var sibling = { type: '', name: '', parent: node.parent, state: { allowType: true } };
                node.parent.components.push(sibling);
                delete node.parent;
                node = sibling;
                break;
            // Hit a space...
            case ' ':
                // If reading type, the type is done and may read a param or name
                if (node.state.allowType) {
                    if (node.type !== '') {
                        node.type = verifyType(node.type);
                        delete node.state.allowType;
                        node.state.allowName = true;
                        node.state.allowParams = true;
                    }
                }
                // If reading name, the name is done
                if (node.state.allowName) {
                    if (node.name !== '') {
                        if (allowIndexed && node.name === 'indexed') {
                            node.indexed = true;
                            node.name = '';
                        }
                        else {
                            node.state.allowName = false;
                        }
                    }
                }
                break;
            case '[':
                if (!node.state.allowArray) {
                    throwError(i);
                }
                node.type += c;
                node.state.allowArray = false;
                node.state.allowName = false;
                node.state.readArray = true;
                break;
            case ']':
                if (!node.state.readArray) {
                    throwError(i);
                }
                node.type += c;
                node.state.readArray = false;
                node.state.allowArray = true;
                node.state.allowName = true;
                break;
            default:
                if (node.state.allowType) {
                    node.type += c;
                    node.state.allowParams = true;
                    node.state.allowArray = true;
                }
                else if (node.state.allowName) {
                    node.name += c;
                    delete node.state.allowArray;
                }
                else if (node.state.readArray) {
                    node.type += c;
                }
                else {
                    throwError(i);
                }
        }
    }
    if (node.parent) {
        throw new Error("unexpected eof");
    }
    delete parent.state;
    if (allowIndexed && node.name === 'indexed') {
        node.indexed = true;
        node.name = '';
    }
    parent.type = verifyType(parent.type);
    return parent;
}
// @TODO: Better return type
function parseSignatureEvent(fragment) {
    var abi = {
        anonymous: false,
        inputs: [],
        name: '',
        type: 'event'
    };
    var match = fragment.match(regexParen);
    if (!match) {
        throw new Error('invalid event: ' + fragment);
    }
    abi.name = match[1].trim();
    splitNesting(match[2]).forEach(function (param) {
        param = parseParam(param, true);
        param.indexed = !!param.indexed;
        abi.inputs.push(param);
    });
    match[3].split(' ').forEach(function (modifier) {
        switch (modifier) {
            case 'anonymous':
                abi.anonymous = true;
                break;
            case '':
                break;
            default:
                errors.info('unknown modifier: ' + modifier);
        }
    });
    if (abi.name && !abi.name.match(regexIdentifier)) {
        throw new Error('invalid identifier: "' + abi.name + '"');
    }
    return abi;
}
function parseSignatureFunction(fragment) {
    var abi = {
        constant: false,
        gas: null,
        inputs: [],
        name: '',
        outputs: [],
        payable: false,
        stateMutability: null,
        type: 'function'
    };
    var comps = fragment.split('@');
    if (comps.length !== 1) {
        if (comps.length > 2) {
            throw new Error('invalid signature');
        }
        if (!comps[1].match(/^[0-9]+$/)) {
            throw new Error('invalid signature gas');
        }
        abi.gas = bignumber_1.bigNumberify(comps[1]);
        fragment = comps[0];
    }
    comps = fragment.split(' returns ');
    var left = comps[0].match(regexParen);
    if (!left) {
        throw new Error('invalid signature');
    }
    abi.name = left[1].trim();
    if (!abi.name.match(regexIdentifier)) {
        throw new Error('invalid identifier: "' + left[1] + '"');
    }
    splitNesting(left[2]).forEach(function (param) {
        abi.inputs.push(parseParam(param));
    });
    left[3].split(' ').forEach(function (modifier) {
        switch (modifier) {
            case 'constant':
                abi.constant = true;
                break;
            case 'payable':
                abi.payable = true;
                abi.stateMutability = 'payable';
                break;
            case 'pure':
                abi.constant = true;
                abi.stateMutability = 'pure';
                break;
            case 'view':
                abi.constant = true;
                abi.stateMutability = 'view';
                break;
            case 'external':
            case 'public':
            case '':
                break;
            default:
                errors.info('unknown modifier: ' + modifier);
        }
    });
    // We have outputs
    if (comps.length > 1) {
        var right = comps[1].match(regexParen);
        if (right[1].trim() != '' || right[3].trim() != '') {
            throw new Error('unexpected tokens');
        }
        splitNesting(right[2]).forEach(function (param) {
            abi.outputs.push(parseParam(param));
        });
    }
    if (abi.name === 'constructor') {
        abi.type = "constructor";
        if (abi.outputs.length) {
            throw new Error('constructor may not have outputs');
        }
        delete abi.name;
        delete abi.outputs;
    }
    return abi;
}
function parseParamType(type) {
    return parseParam(type, true);
}
exports.parseParamType = parseParamType;
// @TODO: Allow a second boolean to expose names
function formatParamType(paramType) {
    return getParamCoder(exports.defaultCoerceFunc, paramType).type;
}
exports.formatParamType = formatParamType;
// @TODO: Allow a second boolean to expose names and modifiers
function formatSignature(fragment) {
    return fragment.name + '(' + fragment.inputs.map(function (i) { return formatParamType(i); }).join(',') + ')';
}
exports.formatSignature = formatSignature;
function parseSignature(fragment) {
    if (typeof (fragment) === 'string') {
        // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
        fragment = fragment.replace(/\s/g, ' ');
        fragment = fragment.replace(/\(/g, ' (').replace(/\)/g, ') ').replace(/\s+/g, ' ');
        fragment = fragment.trim();
        if (fragment.substring(0, 6) === 'event ') {
            return parseSignatureEvent(fragment.substring(6).trim());
        }
        else {
            if (fragment.substring(0, 9) === 'function ') {
                fragment = fragment.substring(9);
            }
            return parseSignatureFunction(fragment.trim());
        }
    }
    throw new Error('unknown signature');
}
exports.parseSignature = parseSignature;
var Coder = /** @class */ (function () {
    function Coder(coerceFunc, name, type, localName, dynamic) {
        this.coerceFunc = coerceFunc;
        this.name = name;
        this.type = type;
        this.localName = localName;
        this.dynamic = dynamic;
    }
    return Coder;
}());
// Clones the functionality of an existing Coder, but without a localName
var CoderAnonymous = /** @class */ (function (_super) {
    __extends(CoderAnonymous, _super);
    function CoderAnonymous(coder) {
        var _this = _super.call(this, coder.coerceFunc, coder.name, coder.type, undefined, coder.dynamic) || this;
        properties_1.defineReadOnly(_this, 'coder', coder);
        return _this;
    }
    CoderAnonymous.prototype.encode = function (value) { return this.coder.encode(value); };
    CoderAnonymous.prototype.decode = function (data, offset) { return this.coder.decode(data, offset); };
    return CoderAnonymous;
}(Coder));
var CoderNull = /** @class */ (function (_super) {
    __extends(CoderNull, _super);
    function CoderNull(coerceFunc, localName) {
        return _super.call(this, coerceFunc, 'null', '', localName, false) || this;
    }
    CoderNull.prototype.encode = function (value) {
        return bytes_1.arrayify([]);
    };
    CoderNull.prototype.decode = function (data, offset) {
        if (offset > data.length) {
            throw new Error('invalid null');
        }
        return {
            consumed: 0,
            value: this.coerceFunc('null', undefined)
        };
    };
    return CoderNull;
}(Coder));
var CoderNumber = /** @class */ (function (_super) {
    __extends(CoderNumber, _super);
    function CoderNumber(coerceFunc, size, signed, localName) {
        var _this = this;
        var name = ((signed ? 'int' : 'uint') + (size * 8));
        _this = _super.call(this, coerceFunc, name, name, localName, false) || this;
        _this.size = size;
        _this.signed = signed;
        return _this;
    }
    CoderNumber.prototype.encode = function (value) {
        try {
            var v = bignumber_1.bigNumberify(value);
            if (this.signed) {
                var bounds = constants_1.MaxUint256.maskn(this.size * 8 - 1);
                if (v.gt(bounds)) {
                    throw new Error('out-of-bounds');
                }
                bounds = bounds.add(constants_1.One).mul(constants_1.NegativeOne);
                if (v.lt(bounds)) {
                    throw new Error('out-of-bounds');
                }
            }
            else if (v.lt(constants_1.Zero) || v.gt(constants_1.MaxUint256.maskn(this.size * 8))) {
                throw new Error('out-of-bounds');
            }
            v = v.toTwos(this.size * 8).maskn(this.size * 8);
            if (this.signed) {
                v = v.fromTwos(this.size * 8).toTwos(256);
            }
            return bytes_1.padZeros(bytes_1.arrayify(v), 32);
        }
        catch (error) {
            errors.throwError('invalid number value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: value
            });
        }
        return null;
    };
    CoderNumber.prototype.decode = function (data, offset) {
        if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + this.name + ' type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
        }
        var junkLength = 32 - this.size;
        var value = bignumber_1.bigNumberify(data.slice(offset + junkLength, offset + 32));
        if (this.signed) {
            value = value.fromTwos(this.size * 8);
        }
        else {
            value = value.maskn(this.size * 8);
        }
        return {
            consumed: 32,
            value: this.coerceFunc(this.name, value),
        };
    };
    return CoderNumber;
}(Coder));
var uint256Coder = new CoderNumber(function (type, value) { return value; }, 32, false, 'none');
var CoderBoolean = /** @class */ (function (_super) {
    __extends(CoderBoolean, _super);
    function CoderBoolean(coerceFunc, localName) {
        return _super.call(this, coerceFunc, 'bool', 'bool', localName, false) || this;
    }
    CoderBoolean.prototype.encode = function (value) {
        return uint256Coder.encode(!!value ? 1 : 0);
    };
    CoderBoolean.prototype.decode = function (data, offset) {
        try {
            var result = uint256Coder.decode(data, offset);
        }
        catch (error) {
            if (error.reason === 'insufficient data for uint256 type') {
                errors.throwError('insufficient data for boolean type', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'boolean',
                    value: error.value
                });
            }
            throw error;
        }
        return {
            consumed: result.consumed,
            value: this.coerceFunc('bool', !result.value.isZero())
        };
    };
    return CoderBoolean;
}(Coder));
var CoderFixedBytes = /** @class */ (function (_super) {
    __extends(CoderFixedBytes, _super);
    function CoderFixedBytes(coerceFunc, length, localName) {
        var _this = this;
        var name = ('bytes' + length);
        _this = _super.call(this, coerceFunc, name, name, localName, false) || this;
        _this.length = length;
        return _this;
    }
    CoderFixedBytes.prototype.encode = function (value) {
        var result = new Uint8Array(32);
        try {
            var data = bytes_1.arrayify(value);
            if (data.length !== this.length) {
                throw new Error('incorrect data length');
            }
            result.set(data);
        }
        catch (error) {
            errors.throwError('invalid ' + this.name + ' value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: (error.value || value)
            });
        }
        return result;
    };
    CoderFixedBytes.prototype.decode = function (data, offset) {
        if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + this.name + ' type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
        }
        return {
            consumed: 32,
            value: this.coerceFunc(this.name, bytes_1.hexlify(data.slice(offset, offset + this.length)))
        };
    };
    return CoderFixedBytes;
}(Coder));
var CoderAddress = /** @class */ (function (_super) {
    __extends(CoderAddress, _super);
    function CoderAddress(coerceFunc, localName) {
        return _super.call(this, coerceFunc, 'address', 'address', localName, false) || this;
    }
    CoderAddress.prototype.encode = function (value) {
        var result = new Uint8Array(32);
        try {
            result.set(bytes_1.arrayify(address_1.getAddress(value)), 12);
        }
        catch (error) {
            errors.throwError('invalid address', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'address',
                value: value
            });
        }
        return result;
    };
    CoderAddress.prototype.decode = function (data, offset) {
        if (data.length < offset + 32) {
            errors.throwError('insufficient data for address type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'address',
                value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
        }
        return {
            consumed: 32,
            value: this.coerceFunc('address', address_1.getAddress(bytes_1.hexlify(data.slice(offset + 12, offset + 32))))
        };
    };
    return CoderAddress;
}(Coder));
function _encodeDynamicBytes(value) {
    var dataLength = 32 * Math.ceil(value.length / 32);
    var padding = new Uint8Array(dataLength - value.length);
    return bytes_1.concat([
        uint256Coder.encode(value.length),
        value,
        padding
    ]);
}
function _decodeDynamicBytes(data, offset, localName) {
    if (data.length < offset + 32) {
        errors.throwError('insufficient data for dynamicBytes length', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: bytes_1.hexlify(data.slice(offset, offset + 32))
        });
    }
    var length = uint256Coder.decode(data, offset).value;
    try {
        length = length.toNumber();
    }
    catch (error) {
        errors.throwError('dynamic bytes count too large', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: length.toString()
        });
    }
    if (data.length < offset + 32 + length) {
        errors.throwError('insufficient data for dynamicBytes type', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: bytes_1.hexlify(data.slice(offset, offset + 32 + length))
        });
    }
    return {
        consumed: 32 + 32 * Math.ceil(length / 32),
        value: data.slice(offset + 32, offset + 32 + length),
    };
}
var CoderDynamicBytes = /** @class */ (function (_super) {
    __extends(CoderDynamicBytes, _super);
    function CoderDynamicBytes(coerceFunc, localName) {
        return _super.call(this, coerceFunc, 'bytes', 'bytes', localName, true) || this;
    }
    CoderDynamicBytes.prototype.encode = function (value) {
        try {
            return _encodeDynamicBytes(bytes_1.arrayify(value));
        }
        catch (error) {
            errors.throwError('invalid bytes value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'bytes',
                value: error.value
            });
        }
        return null;
    };
    CoderDynamicBytes.prototype.decode = function (data, offset) {
        var result = _decodeDynamicBytes(data, offset, this.localName);
        result.value = this.coerceFunc('bytes', bytes_1.hexlify(result.value));
        return result;
    };
    return CoderDynamicBytes;
}(Coder));
var CoderString = /** @class */ (function (_super) {
    __extends(CoderString, _super);
    function CoderString(coerceFunc, localName) {
        return _super.call(this, coerceFunc, 'string', 'string', localName, true) || this;
    }
    CoderString.prototype.encode = function (value) {
        if (typeof (value) !== 'string') {
            errors.throwError('invalid string value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'string',
                value: value
            });
        }
        return _encodeDynamicBytes(utf8_1.toUtf8Bytes(value));
    };
    CoderString.prototype.decode = function (data, offset) {
        var result = _decodeDynamicBytes(data, offset, this.localName);
        result.value = this.coerceFunc('string', utf8_1.toUtf8String(result.value));
        return result;
    };
    return CoderString;
}(Coder));
function alignSize(size) {
    return 32 * Math.ceil(size / 32);
}
function pack(coders, values) {
    if (Array.isArray(values)) {
        // do nothing
    }
    else if (values && typeof (values) === 'object') {
        var arrayValues = [];
        coders.forEach(function (coder) {
            arrayValues.push(values[coder.localName]);
        });
        values = arrayValues;
    }
    else {
        errors.throwError('invalid tuple value', errors.INVALID_ARGUMENT, {
            coderType: 'tuple',
            value: values
        });
    }
    if (coders.length !== values.length) {
        errors.throwError('types/value length mismatch', errors.INVALID_ARGUMENT, {
            coderType: 'tuple',
            value: values
        });
    }
    var parts = [];
    coders.forEach(function (coder, index) {
        parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) });
    });
    var staticSize = 0, dynamicSize = 0;
    parts.forEach(function (part) {
        if (part.dynamic) {
            staticSize += 32;
            dynamicSize += alignSize(part.value.length);
        }
        else {
            staticSize += alignSize(part.value.length);
        }
    });
    var offset = 0, dynamicOffset = staticSize;
    var data = new Uint8Array(staticSize + dynamicSize);
    parts.forEach(function (part) {
        if (part.dynamic) {
            //uint256Coder.encode(dynamicOffset).copy(data, offset);
            data.set(uint256Coder.encode(dynamicOffset), offset);
            offset += 32;
            //part.value.copy(data, dynamicOffset);  @TODO
            data.set(part.value, dynamicOffset);
            dynamicOffset += alignSize(part.value.length);
        }
        else {
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
    coders.forEach(function (coder) {
        if (coder.dynamic) {
            var dynamicOffset = uint256Coder.decode(data, offset);
            var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber());
            // The dynamic part is leap-frogged somewhere else; doesn't count towards size
            result.consumed = dynamicOffset.consumed;
        }
        else {
            var result = coder.decode(data, offset);
        }
        if (result.value != undefined) {
            value.push(result.value);
        }
        offset += result.consumed;
        consumed += result.consumed;
    });
    coders.forEach(function (coder, index) {
        var name = coder.localName;
        if (!name) {
            return;
        }
        if (name === 'length') {
            name = '_length';
        }
        if (value[name] != null) {
            return;
        }
        value[name] = value[index];
    });
    return {
        value: value,
        consumed: consumed
    };
}
var CoderArray = /** @class */ (function (_super) {
    __extends(CoderArray, _super);
    function CoderArray(coerceFunc, coder, length, localName) {
        var _this = this;
        var type = (coder.type + '[' + (length >= 0 ? length : '') + ']');
        var dynamic = (length === -1 || coder.dynamic);
        _this = _super.call(this, coerceFunc, 'array', type, localName, dynamic) || this;
        _this.coder = coder;
        _this.length = length;
        return _this;
    }
    CoderArray.prototype.encode = function (value) {
        if (!Array.isArray(value)) {
            errors.throwError('expected array value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                value: value
            });
        }
        var count = this.length;
        var result = new Uint8Array(0);
        if (count === -1) {
            count = value.length;
            result = uint256Coder.encode(count);
        }
        errors.checkArgumentCount(count, value.length, ' in coder array' + (this.localName ? (" " + this.localName) : ""));
        var coders = [];
        for (var i = 0; i < value.length; i++) {
            coders.push(this.coder);
        }
        return bytes_1.concat([result, pack(coders, value)]);
    };
    CoderArray.prototype.decode = function (data, offset) {
        // @TODO:
        //if (data.length < offset + length * 32) { throw new Error('invalid array'); }
        var consumed = 0;
        var count = this.length;
        if (count === -1) {
            try {
                var decodedLength = uint256Coder.decode(data, offset);
            }
            catch (error) {
                errors.throwError('insufficient data for dynamic array length', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: error.value
                });
            }
            try {
                count = decodedLength.value.toNumber();
            }
            catch (error) {
                errors.throwError('array count too large', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: decodedLength.value.toString()
                });
            }
            consumed += decodedLength.consumed;
            offset += decodedLength.consumed;
        }
        var coders = [];
        for (var i = 0; i < count; i++) {
            coders.push(new CoderAnonymous(this.coder));
        }
        var result = unpack(coders, data, offset);
        result.consumed += consumed;
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    };
    return CoderArray;
}(Coder));
var CoderTuple = /** @class */ (function (_super) {
    __extends(CoderTuple, _super);
    function CoderTuple(coerceFunc, coders, localName) {
        var _this = this;
        var dynamic = false;
        var types = [];
        coders.forEach(function (coder) {
            if (coder.dynamic) {
                dynamic = true;
            }
            types.push(coder.type);
        });
        var type = ('tuple(' + types.join(',') + ')');
        _this = _super.call(this, coerceFunc, 'tuple', type, localName, dynamic) || this;
        _this.coders = coders;
        return _this;
    }
    CoderTuple.prototype.encode = function (value) {
        return pack(this.coders, value);
    };
    CoderTuple.prototype.decode = function (data, offset) {
        var result = unpack(this.coders, data, offset);
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    };
    return CoderTuple;
}(Coder));
/*
function getTypes(coders) {
    var type = coderTuple(coders).type;
    return type.substring(6, type.length - 1);
}
*/
function splitNesting(value) {
    value = value.trim();
    var result = [];
    var accum = '';
    var depth = 0;
    for (var offset = 0; offset < value.length; offset++) {
        var c = value[offset];
        if (c === ',' && depth === 0) {
            result.push(accum);
            accum = '';
        }
        else {
            accum += c;
            if (c === '(') {
                depth++;
            }
            else if (c === ')') {
                depth--;
                if (depth === -1) {
                    throw new Error('unbalanced parenthsis');
                }
            }
        }
    }
    if (accum) {
        result.push(accum);
    }
    return result;
}
// @TODO: Is there a way to return "class"?
var paramTypeSimple = {
    address: CoderAddress,
    bool: CoderBoolean,
    string: CoderString,
    bytes: CoderDynamicBytes,
};
function getTupleParamCoder(coerceFunc, components, localName) {
    if (!components) {
        components = [];
    }
    var coders = [];
    components.forEach(function (component) {
        coders.push(getParamCoder(coerceFunc, component));
    });
    return new CoderTuple(coerceFunc, coders, localName);
}
function getParamCoder(coerceFunc, param) {
    var coder = paramTypeSimple[param.type];
    if (coder) {
        return new coder(coerceFunc, param.name);
    }
    var match = param.type.match(paramTypeNumber);
    if (match) {
        var size = parseInt(match[2] || "256");
        if (size === 0 || size > 256 || (size % 8) !== 0) {
            errors.throwError('invalid ' + match[1] + ' bit length', errors.INVALID_ARGUMENT, {
                arg: 'param',
                value: param
            });
        }
        return new CoderNumber(coerceFunc, size / 8, (match[1] === 'int'), param.name);
    }
    var match = param.type.match(paramTypeBytes);
    if (match) {
        var size = parseInt(match[1]);
        if (size === 0 || size > 32) {
            errors.throwError('invalid bytes length', errors.INVALID_ARGUMENT, {
                arg: 'param',
                value: param
            });
        }
        return new CoderFixedBytes(coerceFunc, size, param.name);
    }
    var match = param.type.match(paramTypeArray);
    if (match) {
        var size = parseInt(match[2] || "-1");
        param = properties_1.shallowCopy(param);
        param.type = match[1];
        param = properties_1.deepCopy(param);
        return new CoderArray(coerceFunc, getParamCoder(coerceFunc, param), size, param.name);
    }
    if (param.type.substring(0, 5) === 'tuple') {
        return getTupleParamCoder(coerceFunc, param.components, param.name);
    }
    if (param.type === '') {
        return new CoderNull(coerceFunc, param.name);
    }
    errors.throwError('invalid type', errors.INVALID_ARGUMENT, {
        arg: 'type',
        value: param.type
    });
    return null;
}
var AbiCoder = /** @class */ (function () {
    function AbiCoder(coerceFunc) {
        errors.checkNew(this, AbiCoder);
        if (!coerceFunc) {
            coerceFunc = exports.defaultCoerceFunc;
        }
        properties_1.defineReadOnly(this, 'coerceFunc', coerceFunc);
    }
    AbiCoder.prototype.encode = function (types, values) {
        if (types.length !== values.length) {
            errors.throwError('types/values length mismatch', errors.INVALID_ARGUMENT, {
                count: { types: types.length, values: values.length },
                value: { types: types, values: values }
            });
        }
        var coders = [];
        types.forEach(function (type) {
            // Convert types to type objects
            //   - "uint foo" => { type: "uint", name: "foo" }
            //   - "tuple(uint, uint)" => { type: "tuple", components: [ { type: "uint" }, { type: "uint" }, ] }
            var typeObject = null;
            if (typeof (type) === 'string') {
                typeObject = parseParam(type);
            }
            else {
                typeObject = type;
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
        }, this);
        return bytes_1.hexlify(new CoderTuple(this.coerceFunc, coders, '_').encode(values));
    };
    AbiCoder.prototype.decode = function (types, data) {
        var coders = [];
        types.forEach(function (type) {
            // See encode for details
            var typeObject = null;
            if (typeof (type) === 'string') {
                typeObject = parseParam(type);
            }
            else {
                typeObject = properties_1.deepCopy(type);
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
        }, this);
        return new CoderTuple(this.coerceFunc, coders, '_').decode(bytes_1.arrayify(data), 0).value;
    };
    return AbiCoder;
}());
exports.AbiCoder = AbiCoder;
exports.defaultAbiCoder = new AbiCoder();
