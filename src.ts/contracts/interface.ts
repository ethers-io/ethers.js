'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import { defaultAbiCoder, ParamType, parseSignature } from '../utils/abi-coder';
import { BigNumber, bigNumberify, BigNumberish } from '../utils/bignumber';
import { arrayify, concat, isHexString } from '../utils/convert';
import { keccak256 } from '../utils/keccak256';
import { toUtf8Bytes } from '../utils/utf8';
import { defineReadOnly, defineFrozen } from '../utils/properties';

import * as errors from '../utils/errors';

function parseParams(params: Array<ParamType>): { names: Array<any>, types: Array<any> } {
    var names = [];
    var types = [];

    params.forEach(function(param) {
        if (param.components != null) {
            if (param.type.substring(0, 5) !== 'tuple') {
                throw new Error('internal error; report on GitHub');
            }
            var suffix = '';
            var arrayBracket = param.type.indexOf('[');
            if (arrayBracket >= 0) { suffix = param.type.substring(arrayBracket); }

            var result = parseParams(param.components);
            names.push({ name: (param.name || null), names: result.names });
            types.push('tuple(' + result.types.join(',') + ')' + suffix)
        } else {
            names.push(param.name || null);
            types.push(param.type);
        }
    });

    return {
        names: names,
        types: types
    }
}

export class Indexed {
    readonly hash: string;
    constructor(value: string) {
        defineReadOnly(this, 'hash', value);
    }
}

export class Description {
    readonly type: string;
    readonly inputs: Array<ParamType>;
    constructor(info: any) {
        for (var key in info) {
            let value = info[key];
            if (value != null && typeof(value) === 'object') {
                defineFrozen(this, key, info[key]);
            } else {
                defineReadOnly(this, key, info[key]);
            }
        }
    }
}

export class DeployDescription extends Description {
    readonly payable: boolean;

    encode(bytecode: string, params: Array<any>): string {
                    if (!isHexString(bytecode)) {
                        errors.throwError('invalid contract bytecode', errors.INVALID_ARGUMENT, {
                            arg: 'bytecode',
                            type: typeof(bytecode),
                            value: bytecode
                        });
                    }

                    if (params.length < this.inputs.length) {
                        errors.throwError('missing constructor argument', errors.MISSING_ARGUMENT, {
                            arg: (this.inputs[params.length].name || 'unknown'),
                            count: params.length,
                            expectedCount: this.inputs.length
                        });
                    } else if (params.length > this.inputs.length) {
                        errors.throwError('too many constructor arguments', errors.UNEXPECTED_ARGUMENT, {
                            count: params.length,
                            expectedCount: this.inputs.length
                        });
                    }

                    try {
                        return (bytecode + defaultAbiCoder.encode(this.inputs, params).substring(2));
                    } catch (error) {
                        errors.throwError('invalid constructor argument', errors.INVALID_ARGUMENT, {
                            arg: error.arg,
                            reason: error.reason,
                            value: error.value
                        });
                    }

                    return null;
    }
}

export class FunctionDescription extends Description {
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;

    readonly outputs: Array<ParamType>;
    readonly payable: boolean;

    encode(params: Array<any>): string {
                    if (params.length < this.inputs.length) {
                        errors.throwError('missing input argument', errors.MISSING_ARGUMENT, {
                            arg: (this.inputs[params.length].name || 'unknown'),
                            count: params.length,
                            expectedCount: this.inputs.length,
                            name: this.name
                        });
                    } else if (params.length > this.inputs.length) {
                        errors.throwError('too many input arguments', errors.UNEXPECTED_ARGUMENT, {
                            count: params.length,
                            expectedCount: this.inputs.length
                        });
                    }

                    try {
                        return this.sighash + defaultAbiCoder.encode(this.inputs, params).substring(2);
                    } catch (error) {
                        errors.throwError('invalid input argument', errors.INVALID_ARGUMENT, {
                            arg: error.arg,
                            reason: error.reason,
                            value: error.value
                        });
                    }

                    return null;
    }

    decode(data: string): any {
                    try {
                        return defaultAbiCoder.decode(this.outputs, arrayify(data));
                    } catch(error) {
                        errors.throwError('invalid data for function output', errors.INVALID_ARGUMENT, {
                            arg: 'data',
                            errorArg: error.arg,
                            errorValue: error.value,
                            value: data,
                            reason: error.reason
                        });
                    }
    }
}

// @TODO: sub-class a description
export type CallTransaction = {
    args: Array<any>,
    signature: string,
    sighash: string,
    decode: (data: string) => any,
    value: BigNumber
}

// @TODO: Make this a class
function Result() {}

export class EventDescription extends Description {
    readonly name: string;
    readonly signature: string;

    readonly anonymous: boolean;
    readonly topic: string;

    decode(data: string, topics?: Array<string>): any {
        // Strip the signature off of non-anonymous topics
        if (topics != null && !this.anonymous) { topics = topics.slice(1); }

        let inputIndexed = [], inputNonIndexed = [];
        let inputDynamic = [];
        this.inputs.forEach(function(param, index) {

            if (param.indexed) {
                if (param.type === 'string' || param.type === 'bytes' || param.type.indexOf('[') >= 0 || param.type.substring(0, 5) === 'tuple') {
                    inputIndexed.push({ type: 'bytes32', name: (param.name || '')});
                    inputDynamic.push(true);
                } else {
                    inputIndexed.push(param);
                    inputDynamic.push(false);
                }
            } else {
                inputNonIndexed.push(param);
                inputDynamic.push(false);
            }
        });

        if (topics != null) {
            var resultIndexed = defaultAbiCoder.decode(
                inputIndexed,
                concat(topics)
            );
        }

        var resultNonIndexed = defaultAbiCoder.decode(
            inputNonIndexed,
            arrayify(data)
        );

        var result = new Result();
        var nonIndexedIndex = 0, indexedIndex = 0;
        this.inputs.forEach(function(input, index) {
            if (input.indexed) {
                if (topics == null) {
                    result[index] = new Indexed(null);

                } else if (inputDynamic[index]) {
                    result[index] = new Indexed(resultIndexed[indexedIndex++]);
                } else {
                    result[index] = resultIndexed[indexedIndex++];
                }
            } else {
                result[index] = resultNonIndexed[nonIndexedIndex++];
            }
            if (input.name) { result[input.name] = result[index]; }
        });

        result.length = this.inputs.length;

        return result;
    }
}

// @TODO:
//export class Result {
//    [prop: string]: any;
//}

function addMethod(method: any): void {
    switch (method.type) {
        case 'constructor': {
            let description = new DeployDescription({
                inputs: method.inputs,
                payable: (method.payable == null || !!method.payable),
                type: 'deploy'
            });

            if (!this.deployFunction) { this.deployFunction = description; }

            break;
        }

        case 'function': {
            // @TODO: See event
            let signature = '(' + parseParams(method.inputs).types.join(',') + ')';
            signature = signature.replace(/tuple/g, '');
            signature = method.name + signature;

            let sighash = keccak256(toUtf8Bytes(signature)).substring(0, 10);

            let description = new FunctionDescription({
                inputs: method.inputs,
                outputs: method.outputs,

                payable: (method.payable == null || !!method.payable),
                type: ((method.constant) ? 'call': 'transaction'),

                signature: signature,
                sighash: sighash,
            });

            // Expose the first (and hopefully unique named function
            if (method.name && this.functions[method.name] == null) {
                defineReadOnly(this.functions, method.name, description);
            }

            // Expose all methods by their signature, for overloaded functions
            if (this.functions[description.signature] == null) {
                defineReadOnly(this.functions, description.signature, description);
            }

            break;
        }

        case 'event': {
            // @TODO: method.params instead? As well? Different fomrat?
            //let inputParams = parseParams(method.inputs);

            // @TODO: Don't use parseParams (create new function in ABI, formatSignature)
            let signature = '(' + parseParams(method.inputs).types.join(',') + ')';
            signature = signature.replace(/tuple/g, '');
            signature = method.name + signature;

            let description = new EventDescription({
                name: method.name,
                signature: signature,

                inputs: method.inputs,
                topics: [ keccak256(toUtf8Bytes(signature)) ],
                anonymous: (!!method.anonymous),

                type: 'event'
            });

            // Expose the first (and hopefully unique) event name
            if (method.name && this.events[method.name] == null) {
                defineReadOnly(this.events, method.name, description);
            }

            // Expose all events by their signature, for overloaded functions
            if (this.events[description.signature] == null) {
                defineReadOnly(this.events, description.signature, description);
            }

            break;
        }


        case 'fallback':
            // Nothing to do for fallback
            break;

        default:
            console.log('WARNING: unsupported ABI type - ' + method.type);
            break;
    }
}

export class Interface {
    readonly abi: Array<any>;
    readonly functions: Array<FunctionDescription>;
    readonly events: Array<EventDescription>;
    readonly deployFunction: DeployDescription;

    constructor(abi: Array<string | ParamType> | string) {
        errors.checkNew(this, Interface);

        if (typeof(abi) === 'string') {
            try {
                abi = JSON.parse(abi);
            } catch (error) {
                errors.throwError('could not parse ABI JSON', errors.INVALID_ARGUMENT, {
                    arg: 'abi',
                    errorMessage: error.message,
                    value: abi
                });
            }

            if (!Array.isArray(abi)) {
                errors.throwError('invalid abi', errors.INVALID_ARGUMENT, { arg: 'abi', value: abi });
                return null;
            }
        }

        defineReadOnly(this, 'functions', { });
        defineReadOnly(this, 'events', { });

        // Convert any supported ABI format into a standard ABI format
        let _abi = [];
        abi.forEach((fragment) => {
            if (typeof(fragment) === 'string') {
                fragment = parseSignature(fragment);
            }
            _abi.push(fragment);
        });

        defineFrozen(this, 'abi', _abi);

        _abi.forEach(addMethod, this);

        // If there wasn't a constructor, create the default constructor
        if (!this.deployFunction) {
            addMethod.call(this, {type: 'constructor', inputs: []});
        }
    }

    parseTransaction(tx: { data: string, value?: BigNumberish }): CallTransaction {
        var sighash = tx.data.substring(0, 10).toLowerCase();
        for (var name in this.functions) {
            if (name.indexOf('(') === -1) { continue; }
            var func = this.functions[name];
            if (func.sighash === sighash) {
                var result = defaultAbiCoder.decode(func.inputs, '0x' + tx.data.substring(10));
                return {
                    args: result,
                    signature: func.signature,
                    sighash: func.sighash,
                    decode: func.decode,
                    value: bigNumberify(tx.value || 0),
                }
            }
        }
        return null;
    }

    // @TODO:
    //parseEvent(log: { }): Lo
}
