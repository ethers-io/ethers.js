'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import { getAddress } from  './address';
import { bigNumberify, BigNumberish } from './bignumber';
import { arrayify, Arrayish, concat, hexlify, padZeros } from './convert';
import { toUtf8Bytes, toUtf8String } from './utf8';

import * as errors from './errors';

const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
const paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);

// @TODO: Add enum for param types
export type CoerceFunc = (type: string, value: any) => any;
export type ParamType = { name?: string, type: string, indexed?: boolean, components?: Array<any> };

export function defaultCoerceFunc(type: string, value: any): any {
    var match = type.match(paramTypeNumber)
    if (match && parseInt(match[2]) <= 48) { return value.toNumber(); }
    return value;
}


///////////////////////////////////
// Parsing for Solidity Signatures

const regexParen = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
const regexIdentifier = new RegExp("^[A-Za-z_][A-Za-z0-9_]*$");

function verifyType(type: string): string {

    // These need to be transformed to their full description
    if (type.match(/^uint($|[^1-9])/)) {
        type = 'uint256' + type.substring(4);
    } else if (type.match(/^int($|[^1-9])/)) {
        type = 'int256' + type.substring(3);
    }

    return type;
}

type ParseState = {
    allowArray?: boolean,
    allowName?: boolean,
    allowParams?: boolean,
    allowType?: boolean,
    readArray?: boolean,
};

type ParseNode = {
    parent?: any,
    type?: string,
    name?: string,
    state?: ParseState,
    indexed?: boolean,
    components?: Array<any>
};


function parseParam(param: string, allowIndexed?: boolean): ParamType {
    function throwError(i) {
        throw new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"');
    }

    var parent: ParseNode = { type: '', name: '', state: { allowType: true } };
    var node = parent;

    for (var i = 0; i < param.length; i++) {
        var c = param[i];
        switch (c) {
            case '(':
                if (!node.state.allowParams) { throwError(i); }
                node.state.allowType = false;
                node.type = verifyType(node.type);
                node.components = [ { type: '', name: '', parent: node, state: { allowType: true } } ];
                node = node.components[0];
                break;

            case ')':
                delete node.state;
                node.type = verifyType(node.type);

                var child = node;
                node = node.parent;
                if (!node) { throwError(i); }
                delete child.parent;
                node.state.allowParams = false;
                node.state.allowName = true;
                node.state.allowArray = true;
                break;

            case ',':
                delete node.state;
                node.type = verifyType(node.type);

                var sibling: ParseNode = { type: '', name: '', parent: node.parent, state: { allowType: true } };
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
                        } else {
                            node.state.allowName = false;
                        }
                    }
                }

                break;

            case '[':
                if (!node.state.allowArray) { throwError(i); }

                node.type += c;

                node.state.allowArray = false;
                node.state.allowName = false;
                node.state.readArray = true;
                break;

            case ']':
                if (!node.state.readArray) { throwError(i); }

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
                } else if (node.state.allowName) {
                    node.name += c;
                    delete node.state.allowArray;
                } else if (node.state.readArray) {
                    node.type += c;
                } else {
                    throwError(i);
                }
        }
    }

    if (node.parent) { throw new Error("unexpected eof"); }

    delete parent.state;
    parent.type = verifyType(parent.type);

    return (<ParamType>parent);
}

// @TODO: Better return type
function parseSignatureEvent(fragment: string): any {

    var abi = {
        anonymous: false,
        inputs: [],
        name: '',
        type: 'event'
    }

    var match = fragment.match(regexParen);
    if (!match) { throw new Error('invalid event: ' + fragment); }

    abi.name = match[1].trim();

    splitNesting(match[2]).forEach(function(param) {
        param = parseParam(param, true);
        param.indexed = !!param.indexed;
        abi.inputs.push(param);
    });

    match[3].split(' ').forEach(function(modifier) {
        switch(modifier) {
            case 'anonymous':
                abi.anonymous = true;
                break;
            case '':
                break;
            default:
                console.log('unknown modifier: ' + modifier);
        }
    });

    if (abi.name && !abi.name.match(regexIdentifier)) {
        throw new Error('invalid identifier: "' + abi.name + '"');
    }

    return abi;
}

function parseSignatureFunction(fragment: string): any {
    var abi = {
        constant: false,
        inputs: [],
        name: '',
        outputs: [],
        payable: false,
        stateMutability: null,
        type: 'function'
    };

    var comps = fragment.split(' returns ');
    var left = comps[0].match(regexParen);
    if (!left) { throw new Error('invalid signature'); }

    abi.name = left[1].trim();
    if (!abi.name.match(regexIdentifier)) {
        throw new Error('invalid identifier: "' + left[1] + '"');
    }

    splitNesting(left[2]).forEach(function(param) {
        abi.inputs.push(parseParam(param));
    });

    left[3].split(' ').forEach(function(modifier) {
        switch (modifier) {
            case 'constant':
                abi.constant = true;
                break;
            case 'payable':
                abi.payable = true;
                break;
            case 'pure':
                abi.constant = true;
                abi.stateMutability = 'pure';
                break;
            case 'view':
                abi.constant = true;
                abi.stateMutability = 'view';
                break;
            case '':
                break;
            default:
                console.log('unknown modifier: ' + modifier);
        }
    });

    // We have outputs
    if (comps.length > 1) {
        var right = comps[1].match(regexParen);
        if (right[1].trim() != '' || right[3].trim() != '') {
            throw new Error('unexpected tokens');
        }

        splitNesting(right[2]).forEach(function(param) {
            abi.outputs.push(parseParam(param));
        });
    }

    return abi;
}


export function parseSignature(fragment: string): any {
    if(typeof(fragment) === 'string') {
        // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
        fragment = fragment.replace(/\(/g, ' (').replace(/\)/g, ') ').replace(/\s+/g, ' ');
        fragment = fragment.trim();

        if (fragment.substring(0, 6) === 'event ') {
           return parseSignatureEvent(fragment.substring(6).trim());

        } else {
            if (fragment.substring(0, 9) === 'function ') {
                fragment = fragment.substring(9);
            }
            return parseSignatureFunction(fragment.trim());
        }
    }

    throw new Error('unknown fragment');
}


///////////////////////////////////
// Coders

type DecodedResult = { consumed: number, value: any };
abstract class Coder {
    readonly coerceFunc: CoerceFunc;
    readonly name: string;
    readonly type: string;
    readonly localName: string;
    readonly dynamic: boolean;
    constructor(coerceFunc: CoerceFunc, name: string, type: string, localName: string, dynamic: boolean) {
        this.coerceFunc = coerceFunc;
        this.name = name;
        this.type = type;
        this.localName = localName;
        this.dynamic = dynamic;
    }

    abstract encode(value: any): Uint8Array;
    abstract decode(data: Uint8Array, offset: number): DecodedResult;
}

class CoderNull extends Coder {
    constructor(coerceFunc, localName) {
        super(coerceFunc, 'null', '', localName, false);
    }

    encode(value: any): Uint8Array {
        return arrayify([]);
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        if (offset > data.length) { throw new Error('invalid null'); }
        return {
            consumed: 0,
            value: this.coerceFunc('null', undefined)
        }
    }
}

class CoderNumber extends Coder {
    readonly size: number;
    readonly signed: boolean;
    constructor(coerceFunc, size, signed, localName) {
        const name = ((signed ? 'int': 'uint') + (size * 8));
        super(coerceFunc, name, name, localName, false);

        this.size = size;
        this.signed = signed;
    }

    encode(value: BigNumberish): Uint8Array {
        try {
            let v = bigNumberify(value);
            v = v.toTwos(this.size * 8).maskn(this.size * 8);
            //value = value.toTwos(size * 8).maskn(size * 8);
            if (this.signed) {
                v = v.fromTwos(this.size * 8).toTwos(256);
            }
            return padZeros(arrayify(v), 32);

        } catch (error) {
            errors.throwError('invalid number value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                type: typeof(value),
                value: value
            });
        }
        return null;
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + this.name + ' type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: hexlify(data.slice(offset, offset + 32))
            });
        }
        var junkLength = 32 - this.size;
        var value = bigNumberify(data.slice(offset + junkLength, offset + 32));
        if (this.signed) {
            value = value.fromTwos(this.size * 8);
        } else {
            value = value.maskn(this.size * 8);
        }

        return {
            consumed: 32,
            value: this.coerceFunc(this.name, value),
        }
    }
}
var uint256Coder = new CoderNumber(function(type, value) { return value; }, 32, false, 'none');

class CoderBoolean extends Coder {
    constructor(coerceFunc, localName) {
        super(coerceFunc, 'bool', 'bool', localName, false);
    }

    encode(value: boolean): Uint8Array {
        return uint256Coder.encode(!!value ? 1: 0);
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        try {
            var result = uint256Coder.decode(data, offset);
        } catch (error) {
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
        }
    }
}

class CoderFixedBytes extends Coder {
    readonly length: number;
    constructor(coerceFunc, length, localName) {
        const name = ('bytes' + length);
        super(coerceFunc, name, name, localName, false);
        this.length = length;
    }

    encode(value: Arrayish): Uint8Array {
        var result = new Uint8Array(32);

        try {
            let data = arrayify(value);
            if (data.length > 32) { throw new Error(); }
            result.set(data);
        } catch (error) {
            errors.throwError('invalid ' + this.name + ' value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                type: typeof(value),
                value: (error.value || value)
            });
        }

        return result;
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + name + ' type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: this.name,
                value: hexlify(data.slice(offset, offset + 32))
            });
        }

        return {
            consumed: 32,
            value: this.coerceFunc(this.name, hexlify(data.slice(offset, offset + this.length)))
        }
    }
}

class CoderAddress extends Coder {
    constructor(coerceFunc, localName) {
        super(coerceFunc, 'address', 'address', localName, false);
    }
    encode(value: string): Uint8Array {
        let result = new Uint8Array(32);
        try {
            result.set(arrayify(getAddress(value)), 12);
        } catch (error) {
            errors.throwError('invalid address', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                type: typeof(value),
                value: value
            });
        }
        return result;
    }
    decode(data: Uint8Array, offset: number): DecodedResult {
        if (data.length < offset + 32) {
            errors.throwError('insufficuent data for address type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'address',
                value: hexlify(data.slice(offset, offset + 32))
            });
        }
        return {
            consumed: 32,
            value: this.coerceFunc('address', getAddress(hexlify(data.slice(offset + 12, offset + 32))))
       }
    }
}

function _encodeDynamicBytes(value: Uint8Array): Uint8Array {
    var dataLength = Math.trunc(32 * Math.ceil(value.length / 32));
    var padding = new Uint8Array(dataLength - value.length);

    return concat([
        uint256Coder.encode(value.length),
        value,
        padding
    ]);
}

function _decodeDynamicBytes(data: Uint8Array, offset: number, localName: string): DecodedResult {
    if (data.length < offset + 32) {
        errors.throwError('insufficient data for dynamicBytes length', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: hexlify(data.slice(offset, offset + 32))
        });
    }

    var length = uint256Coder.decode(data, offset).value;
    try {
        length = length.toNumber();
    } catch (error) {
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
            value: hexlify(data.slice(offset, offset + 32 + length))
        });
    }

    return {
        consumed: Math.trunc(32 + 32 * Math.ceil(length / 32)),
        value: data.slice(offset + 32, offset + 32 + length),
    }
}

class CoderDynamicBytes extends Coder {
    constructor(coerceFunc, localName) {
        super(coerceFunc, 'bytes', 'bytes', localName, true);
    }
    encode(value: Arrayish): Uint8Array {
        try {
            return _encodeDynamicBytes(arrayify(value));
        } catch (error) {
            errors.throwError('invalid bytes value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                type: typeof(value),
                value: error.value
            });
        }
        return null;
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        var result = _decodeDynamicBytes(data, offset, this.localName);
        result.value = this.coerceFunc('bytes', hexlify(result.value));
        return result;
    }
}

class CoderString extends Coder {
    constructor(coerceFunc, localName) {
        super(coerceFunc, 'string', 'string', localName, true);
    }

    encode(value: string): Uint8Array {
        if (typeof(value) !== 'string') {
            errors.throwError('invalid string value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                type: typeof(value),
                value: value
            });
        }
        return _encodeDynamicBytes(toUtf8Bytes(value));
    }

    decode(data: Uint8Array, offset: number): DecodedResult {
        var result = _decodeDynamicBytes(data, offset, this.localName);
        result.value = this.coerceFunc('string', toUtf8String(result.value));
        return result;
    }
}

function alignSize(size: number): number {
    return Math.trunc(32 * Math.ceil(size / 32));
}

function pack(coders: Array<Coder>, values: Array<any>): Uint8Array {

    if (Array.isArray(values)) {
       // do nothing

    } else if (values && typeof(values) === 'object') {
        var arrayValues = [];
        coders.forEach(function(coder) {
            arrayValues.push(values[coder.localName]);
        });
        values = arrayValues;

    } else {
        errors.throwError('invalid tuple value', errors.INVALID_ARGUMENT, {
            coderType: 'tuple',
            type: typeof(values),
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

    coders.forEach(function(coder, index) {
        parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) });
    });

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

    parts.forEach(function(part) {
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

function unpack(coders: Array<Coder>, data: Uint8Array, offset: number): DecodedResult {
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

    coders.forEach(function(coder: Coder, index: number) {
        let name: string = coder.localName;
        if (!name) { return; }

        if (name === 'length') { name = '_length'; }

        if (value[name] != null) { return; }

        value[name] = value[index];
    });

    return {
        value: value,
        consumed: consumed
    }
}

class CoderArray extends Coder {
    readonly coder: Coder;
    readonly length: number;
    constructor(coerceFunc, coder, length, localName) {
        const type = (coder.type + '[' + (length >= 0 ? length: '') + ']');
        const dynamic = (length === -1 || coder.dynamic);
        super(coerceFunc, 'array', type, localName, dynamic);

        this.coder = coder;
        this.length = length;
    }

    encode(value: Array<any>): Uint8Array {
        if (!Array.isArray(value)) {
            errors.throwError('expected array value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                type: typeof(value),
                value: value
            });
        }

        var count = this.length;

        var result = new Uint8Array(0);
        if (count === -1) {
            count = value.length;
            result = uint256Coder.encode(count);
        }

        if (count !== value.length) {
            errors.throwError('array value length mismatch', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                count: value.length,
                expectedCount: count,
                value: value
            });
        }

        var coders = [];
        for (var i = 0; i < value.length; i++) { coders.push(this.coder); }

        return concat([result, pack(coders, value)]);
    }

    decode(data, offset) {
        // @TODO:
        //if (data.length < offset + length * 32) { throw new Error('invalid array'); }

        var consumed = 0;

        var count = this.length;

        if (count === -1) {
            try {
                var decodedLength = uint256Coder.decode(data, offset);
            } catch (error) {
                errors.throwError('insufficient data for dynamic array length', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: error.value
                });
             }
             try {
                 count = decodedLength.value.toNumber();
             } catch (error) {
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
        for (var i = 0; i < count; i++) { coders.push(this.coder); }

        var result = unpack(coders, data, offset);
        result.consumed += consumed;
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    }
}

class CoderTuple extends Coder {
    readonly coders: Array<Coder>;
    constructor(coerceFunc, coders, localName) {
        var dynamic = false;
        var types = [];
        coders.forEach(function(coder) {
            if (coder.dynamic) { dynamic = true; }
            types.push(coder.type);
        });
        var type = ('tuple(' + types.join(',') + ')');

        super(coerceFunc, 'tuple', type, localName, dynamic);
        this.coders = coders;
    }
    encode(value: Array<any>): Uint8Array {
        return pack(this.coders, value);
    }
    decode(data: Uint8Array, offset: number): DecodedResult {
        var result = unpack(this.coders, data, offset);
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    }
}
/*
function getTypes(coders) {
    var type = coderTuple(coders).type;
    return type.substring(6, type.length - 1);
}
*/
function splitNesting(value: string): Array<any> {
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

const paramTypeSimple = {
    address: CoderAddress,
    bool: CoderBoolean,
    string: CoderString,
    bytes: CoderDynamicBytes,
};

function getTupleParamCoder(coerceFunc: CoerceFunc, components: Array<any>, localName: string): CoderTuple {
    if (!components) { components = []; }
    var coders = [];
    components.forEach(function(component) {
        coders.push(getParamCoder(coerceFunc, component));
    });

    return new CoderTuple(coerceFunc, coders, localName);
}

function getParamCoder(coerceFunc: CoerceFunc, param: ParamType): Coder {
    var coder = paramTypeSimple[param.type];
    if (coder) { return new coder(coerceFunc, param.name); }
    var match = param.type.match(paramTypeNumber);
    if (match) {
        let size = parseInt(match[2] || "256");
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
        let size = parseInt(match[1]);
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
        let size = parseInt(match[2] || "-1");
        param.type = match[1];
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


export class AbiCoder {
    readonly coerceFunc: CoerceFunc;
    constructor(coerceFunc?: CoerceFunc) {
        //if (!(this instanceof Coder)) { throw new Error('missing new'); }
        if (!coerceFunc) { coerceFunc = defaultCoerceFunc; }
        // @TODO: readonly
        this.coerceFunc = coerceFunc;
    }

    encode(types: Array<string | ParamType>, values: Array<any>): string {

        if (types.length !== values.length) {
            errors.throwError('types/values length mismatch', errors.INVALID_ARGUMENT, {
                count: { types: types.length, values: values.length },
                value: { types: types, values: values }
            });
        }

        var coders: Array<Coder> = [];
        types.forEach(function(type) {
            // Convert types to type objects
            //   - "uint foo" => { type: "uint", name: "foo" }
            //   - "tuple(uint, uint)" => { type: "tuple", components: [ { type: "uint" }, { type: "uint" }, ] }
            if (typeof(type) === 'string') {
                type = parseParam(type);
            }

            coders.push(getParamCoder(this.coerceFunc, type));
        }, this);

        return hexlify(new CoderTuple(this.coerceFunc, coders, '_').encode(values));
    }

    decode(types: Array<string | ParamType>, data: Arrayish): any {

        var coders = [];
        types.forEach(function(type) {

            // See encode for details
            if (typeof(type) === 'string') {
                type = parseParam(type);
            }

            coders.push(getParamCoder(this.coerceFunc, type));
        }, this);

        return new CoderTuple(this.coerceFunc, coders, '_').decode(arrayify(data), 0).value;
    }
}

export const defaultAbiCoder: AbiCoder = new AbiCoder();
