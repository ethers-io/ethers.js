'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import { getAddress } from './address';
import { defaultAbiCoder, formatSignature, parseSignature } from './abi-coder';
import { BigNumber, bigNumberify } from './bignumber';
import { arrayify, concat, hexlify, hexZeroPad, isHexString } from './bytes';
import { id } from './hash';
import { keccak256 } from './keccak256';
import { deepCopy, defineReadOnly, isType, setType } from './properties';

import * as errors from '../errors';

///////////////////////////////
// Imported Types

import { BigNumberish } from './bignumber';
import { EventFragment, FunctionFragment, ParamType } from './abi-coder';

///////////////////////////////
// Exported Types

export interface Indexed {
    readonly hash: string;
}

export interface DeployDescription {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;
    encode(bytecode: string, params: Array<any>): string;
}

export interface FunctionDescription {
    readonly type: "call" | "transaction";
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;
    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;
    readonly gas: BigNumber;
    encode(params: Array<any>): string;
    decode(data: string): any;
}

export interface EventDescription {
    readonly name: string;
    readonly signature: string;
    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;
    encodeTopics(params: Array<any>): Array<string>;
    decode(data: string, topics?: Array<string>): any;
}

export interface LogDescription {
    readonly decode: (data: string, topics: Array<string>) => any;
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: any
}

export interface TransactionDescription {
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}

///////////////////////////////

class _Indexed implements Indexed {
    readonly hash: string;
    constructor(hash: string) {
        setType(this, 'Indexed');
        defineReadOnly(this, 'hash', hash);
    }
}

class Description {
    constructor(info: any) {
        setType(this, 'Description');
        for (var key in info) {
            defineReadOnly(this, key, deepCopy(info[key], true));
        }
        Object.freeze(this);
    }
}

class _DeployDescription extends Description implements DeployDescription {
    readonly inputs: Array<ParamType>;
    readonly payable: boolean;

    encode(bytecode: string, params: Array<any>): string {
        if (!isHexString(bytecode)) {
            errors.throwError('invalid contract bytecode', errors.INVALID_ARGUMENT, {
                arg: 'bytecode',
                value: bytecode
            });
        }

        errors.checkArgumentCount(params.length, this.inputs.length, ' in Interface constructor');

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

class _FunctionDescription extends Description implements FunctionDescription {
    readonly type: "call" | "transaction";
    readonly name: string;
    readonly signature: string;
    readonly sighash: string;

    readonly inputs: Array<ParamType>;
    readonly outputs: Array<ParamType>;
    readonly payable: boolean;

    readonly gas: BigNumber;

    encode(params: Array<any>): string {
        errors.checkArgumentCount(params.length, this.inputs.length, ' in interface function ' + this.name);

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

class Result extends Description {
    [key: string]: any;
    [key: number]: any;
}

class _EventDescription extends Description implements EventDescription {
    readonly name: string;
    readonly signature: string;

    readonly inputs: Array<ParamType>;
    readonly anonymous: boolean;
    readonly topic: string;

    encodeTopics(params: Array<any>): Array<string> {
        if (params.length > this.inputs.length) {
            errors.throwError('too many arguments for ' + this.name, errors.UNEXPECTED_ARGUMENT, { maxCount: params.length, expectedCount: this.inputs.length })
        }

        let topics: Array<string> = [];
        if (!this.anonymous) { topics.push(this.topic); }

        params.forEach((arg, index) => {

            let param = this.inputs[index];

            if (!param.indexed) {
                if (arg != null) {
                    errors.throwError('cannot filter non-indexed parameters; must be null', errors.INVALID_ARGUMENT, { argument: (param.name || index), value: arg });
                }
                return;
            }

            if (arg == null) {
                topics.push(null);
            } else if (param.type === 'string') {
                 topics.push(id(arg));
            } else if (param.type === 'bytes') {
                 topics.push(keccak256(arg));
            } else if (param.type.indexOf('[') !== -1 || param.type.substring(0, 5) === 'tuple') {
                errors.throwError('filtering with tuples or arrays not implemented yet; bug us on GitHub', errors.NOT_IMPLEMENTED, { operation: 'filter(array|tuple)' });
            } else {
                if (param.type === 'address') { getAddress(arg); }
                topics.push(hexZeroPad(hexlify(arg), 32).toLowerCase());
            }
        });

        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }

        return topics;
    }

    decode(data: string, topics?: Array<string>): any {
        // Strip the signature off of non-anonymous topics
        if (topics != null && !this.anonymous) { topics = topics.slice(1); }

        let inputIndexed: Array<ParamType> = [];
        let inputNonIndexed: Array<ParamType> = [];
        let inputDynamic: Array<boolean> = [];
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

        var result: any = {};
        var nonIndexedIndex = 0, indexedIndex = 0;
        this.inputs.forEach(function(input, index) {
            if (input.indexed) {
                if (topics == null) {
                    result[index] = new _Indexed(null);

                } else if (inputDynamic[index]) {
                    result[index] = new _Indexed(resultIndexed[indexedIndex++]);

                } else {
                    result[index] = resultIndexed[indexedIndex++];
                }
            } else {
                result[index] = resultNonIndexed[nonIndexedIndex++];
            }
            if (input.name) { result[input.name] = result[index]; }
        });

        result.length = this.inputs.length;

        return new Result(result);
    }
}

class _TransactionDescription extends Description implements TransactionDescription{
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly decode: (data: string) => any;
    readonly value: BigNumber;
}

class _LogDescription extends Description implements LogDescription {
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly decode: (data: string, topics: Array<string>) => any;
    readonly values: any
}


function addMethod(method: any): void {
    switch (method.type) {
        case 'constructor': {
            let description = new _DeployDescription({
                inputs: method.inputs,
                payable: (method.payable == null || !!method.payable)
            });

            if (!this.deployFunction) { this.deployFunction = description; }

            break;
        }

        case 'function': {
            let signature = formatSignature(method).replace(/tuple/g, '');
            let sighash = id(signature).substring(0, 10);

            let description = new _FunctionDescription({
                inputs: method.inputs,
                outputs: method.outputs,

                gas: method.gas,

                payable: (method.payable == null || !!method.payable),
                type: ((method.constant) ? 'call': 'transaction'),

                name: method.name,
                signature: signature,
                sighash: sighash,
            });

            // Expose the first (and hopefully unique named function)
            if (method.name) {
                if (this.functions[method.name] == null) {
                    defineReadOnly(this.functions, method.name, description);
                } else {
                    errors.warn('WARNING: Multiple definitions for ' + method.name);
                }
            }

            // Expose all methods by their signature, for overloaded functions
            if (this.functions[description.signature] == null) {
                defineReadOnly(this.functions, description.signature, description);
            }

            break;
        }

        case 'event': {
            let signature = formatSignature(method).replace(/tuple/g, '');

            let description = new _EventDescription({
                name: method.name,
                signature: signature,

                inputs: method.inputs,
                topic: id(signature),
                anonymous: (!!method.anonymous)
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
            errors.warn('WARNING: unsupported ABI type - ' + method.type);
            break;
    }
}

export class Interface {
    readonly abi: Array<EventFragment | FunctionFragment>;
    readonly functions: { [ name: string ]: _FunctionDescription };
    readonly events: { [ name: string ]: _EventDescription };
    readonly deployFunction: _DeployDescription;

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
        let _abi: Array<EventFragment | FunctionFragment> = [];
        abi.forEach((fragment) => {
            if (typeof(fragment) === 'string') {
                fragment = parseSignature(fragment);
            }
            // @TODO: We should probable do some validation; create abiCoder.formatSignature for checking
            _abi.push(<EventFragment | FunctionFragment>fragment);
        });

        defineReadOnly(this, 'abi', deepCopy(_abi, true));

        _abi.forEach(addMethod, this);

        // If there wasn't a constructor, create the default constructor
        if (!this.deployFunction) {
            addMethod.call(this, {type: 'constructor', inputs: []});
        }

        setType(this, 'Interface');
    }

    parseTransaction(tx: { data: string, value?: BigNumberish }): _TransactionDescription {
        var sighash = tx.data.substring(0, 10).toLowerCase();
        for (var name in this.functions) {
            if (name.indexOf('(') === -1) { continue; }
            var func = this.functions[name];
            if (func.sighash === sighash) {
                var result = defaultAbiCoder.decode(func.inputs, '0x' + tx.data.substring(10));
                return new _TransactionDescription({
                    args: result,
                    decode: func.decode,
                    name: func.name,
                    signature: func.signature,
                    sighash: func.sighash,
                    value: bigNumberify(tx.value || '0'),
                });
            }
        }

        return null;
    }

    parseLog(log: { topics: Array<string>, data: string}): _LogDescription {
        for (var name in this.events) {
            if (name.indexOf('(') === -1) { continue; }
            var event = this.events[name];
            if (event.anonymous) { continue; }
            if (event.topic !== log.topics[0]) { continue; }

            // @TODO: If anonymous, and the only method, and the input count matches, should we parse and return it?

            return new _LogDescription({
                decode: event.decode,
                name: event.name,
                signature: event.signature,
                topic: event.topic,
                values: event.decode(log.data, log.topics)
            });
        }

        return null;
    }

    static isInterface(value: any): value is Interface {
        return isType(value, 'Interface');
    }

    static isIndexed(value: any): value is Indexed {
        return isType(value, 'Indexed');
    }

}
