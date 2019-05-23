"use strict";

import { getAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { arrayify, BytesLike, concat, hexDataSlice, hexlify, hexZeroPad, isHexString } from "@ethersproject/bytes";
import { id } from "@ethersproject/hash";
import { keccak256 } from "@ethersproject/keccak256"
import * as errors from "@ethersproject/errors";
import { defineReadOnly, Description, isNamedInstance } from "@ethersproject/properties";

import { AbiCoder, defaultAbiCoder } from "./abi-coder";
import { ConstructorFragment, EventFragment, Fragment, FunctionFragment, JsonFragment, ParamType } from "./fragments";


export class LogDescription extends Description {
    readonly eventFragment: EventFragment;
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly values: any
}

export class TransactionDescription extends Description {
    readonly functionFragment: FunctionFragment;
    readonly name: string;
    readonly args: Array<any>;
    readonly signature: string;
    readonly sighash: string;
    readonly value: BigNumber;
}

export class Indexed extends Description {
    readonly hash: string;
}

export class Result {
    [key: string]: any;
    [key: number]: any;
}


export class Interface {
    readonly fragments: Array<Fragment>;

    readonly errors: { [ name: string ]: any };
    readonly events: { [ name: string ]: EventFragment };
    readonly functions: { [ name: string ]: FunctionFragment };
    readonly structs: { [ name: string ]: any };

    readonly deploy: ConstructorFragment;

    readonly _abiCoder: AbiCoder;

    constructor(fragments: string | Array<Fragment | JsonFragment | string>) {
        errors.checkNew(new.target, Interface);

        let abi: Array<Fragment | JsonFragment | string> = [ ];
        if (typeof(fragments) === "string") {
            abi = JSON.parse(fragments);
        } else {
            abi = fragments;
        }

        defineReadOnly(this, "fragments", abi.map((fragment) => {
            if (isNamedInstance<Fragment>(Fragment, fragment)) {
                return fragment
            }
            return Fragment.from(fragment);
        }).filter((fragment) => (fragment != null)));

        defineReadOnly(this, "_abiCoder", new.target.getAbiCoder());

        defineReadOnly(this, "functions", { });
        defineReadOnly(this, "errors", { });
        defineReadOnly(this, "events", { });
        defineReadOnly(this, "structs", { });

        // Add all fragments by their signature
        this.fragments.forEach((fragment) => {
            let bucket: { [ name: string ]: Fragment } = null;
            switch (fragment.type) {
                case "constructor":
                    if (this.deploy) {
                        errors.warn("duplicate definition - constructor");
                        return;
                    }
                    defineReadOnly(this, "deploy", fragment);
                    return;
                case "function":
                    bucket = this.functions;
                    break;
                case "event":
                    bucket = this.events;
                    break;
                default:
                    return;
            }

            let signature = fragment.format();
            if (bucket[signature]) {
                errors.warn("duplicate definition - " + signature);
                return;
            }

            bucket[signature] = fragment;
        });

        // Add any fragments with a unique name by its name (sans signature parameters)
        [this.events, this.functions].forEach((bucket) => {
            let count = getNameCount(bucket);
            Object.keys(bucket).forEach((signature) => {
                let fragment = bucket[signature];
                if (count[fragment.name] !== 1) {
                   errors.warn("duplicate definition - " + fragment.name);
                   return;
                }
                bucket[fragment.name] = fragment;
            });
        });

        // If we do not have a constructor use the default "constructor() payable"
        if (!this.deploy) {
            defineReadOnly(this, "deploy", ConstructorFragment.from( { type: "constructor" } ));
        }
    }

    static getAbiCoder(): AbiCoder {
        return defaultAbiCoder;
    }

    static getAddress(address: string): string {
        return getAddress(address);
    }

    _sighashify(functionFragment: FunctionFragment): string {
        return hexDataSlice(id(functionFragment.format()), 0, 4);
    }

    _topicify(eventFragment: EventFragment): string {
        return id(eventFragment.format());
    }

    getFunction(nameOrSignatureOrSighash: string): FunctionFragment {
        if (isHexString(nameOrSignatureOrSighash)) {
            return <FunctionFragment>getFragment(nameOrSignatureOrSighash, this.getSighash.bind(this), this.functions);
        }

        // It is a bare name, look up the function (will return null if ambiguous)
        if (nameOrSignatureOrSighash.indexOf("(") === -1) {
            return (this.functions[nameOrSignatureOrSighash.trim()] || null);
        }

        // Normlize the signature and lookup the function
        return this.functions[FunctionFragment.fromString(nameOrSignatureOrSighash).format()];
    }

    getEvent(nameOrSignatureOrTopic: string): EventFragment {
        if (isHexString(nameOrSignatureOrTopic)) {
            return <EventFragment>getFragment(nameOrSignatureOrTopic, this.getEventTopic.bind(this), this.events);
        }

        // It is a bare name, look up the function (will return null if ambiguous)
        if (nameOrSignatureOrTopic.indexOf("(") === -1) {
            return this.events[nameOrSignatureOrTopic];
        }

        return this.events[EventFragment.fromString(nameOrSignatureOrTopic).format()];
    }


    getSighash(functionFragment: FunctionFragment | string): string {
        if (typeof(functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }

        return this._sighashify(functionFragment);
    }

    getEventTopic(eventFragment: EventFragment | string): string {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        return this._topicify(eventFragment);
    }


    _encodeParams(params: Array<ParamType>, values: Array<any>): string {
        return this._abiCoder.encode(params, values)
    }

    encodeDeploy(values?: Array<any>): string {
        return this._encodeParams(this.deploy.inputs, values || [ ]);
    }

    encodeFunctionData(functionFragment: FunctionFragment | string, values?: Array<any>): string {
        if (typeof(functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }

        return hexlify(concat([
            this.getSighash(functionFragment),
            this._encodeParams(functionFragment.inputs, values || [ ])
        ]));
    }

    decodeFunctionResult(functionFragment: FunctionFragment | string, data: BytesLike): Array<any> {
        if (typeof(functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }

        let bytes  = arrayify(data);

        let reason: string = null;
        let errorSignature: string = null;
        switch (bytes.length % this._abiCoder._getWordSize()) {
            case 0:
                try {
                    return this._abiCoder.decode(functionFragment.outputs, bytes);
                } catch (error) { }
                break;

            case 4:
                if (hexlify(bytes.slice(0, 4)) === "0x08c379a0") {
                    errorSignature = "Error(string)";
                    reason = this._abiCoder.decode([ "string" ], bytes.slice(4));
                }
                break;
        }

        return errors.throwError("call revert exception", errors.CALL_EXCEPTION, {
            method: functionFragment.format(),
            errorSignature: errorSignature,
            errorArgs: [ reason ],
            reason: reason
        });
    }

    encodeFilterTopics(eventFragment: EventFragment, values: Array<any>): Array<string | Array<string>> {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        if (values.length > eventFragment.inputs.length) {
            errors.throwError("too many arguments for " + eventFragment.format(), errors.UNEXPECTED_ARGUMENT, {
                argument: "values",
                value: values
            })
        }

        let topics: Array<string> = [];
        if (!eventFragment.anonymous) { topics.push(this.getEventTopic(eventFragment)); }

        values.forEach((value, index) => {

            let param = eventFragment.inputs[index];

            if (!param.indexed) {
                if (value != null) {
                    errors.throwArgumentError("cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                }
                return;
            }

            if (value == null) {
                topics.push(null);
            } else if (param.type === "string") {
                 topics.push(id(value));
            } else if (param.type === "bytes") {
                 topics.push(keccak256(hexlify(value)));
            } else if (param.type.indexOf("[") !== -1 || param.type.substring(0, 5) === "tuple") {
                errors.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
            } else {
                // Check addresses are valid
                if (param.type === "address") { this._abiCoder.encode( [ "address" ], [ value ]); }
                topics.push(hexZeroPad(hexlify(value), 32));
            }
        });

        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }

        return topics;
    }

    decodeEventLog(eventFragment: EventFragment | string, data: BytesLike, topics?: Array<string>): Array<any> {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        if (topics != null && !eventFragment.anonymous) {
            let topicHash = this.getEventTopic(eventFragment);
            if (!isHexString(topics[0], 32) || topics[0].toLowerCase() !== topicHash) {
                errors.throwError("fragment/topic mismatch", errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: topicHash, value: topics[0] });
            }
            topics = topics.slice(1);
        }

        let indexed: Array<ParamType> = [];
        let nonIndexed: Array<ParamType> = [];
        let dynamic: Array<boolean> = [];

        eventFragment.inputs.forEach((param, index) => {
            if (param.indexed) {
                if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                    indexed.push(ParamType.fromObject({ type: "bytes32", name: param.name }));
                    dynamic.push(true);
                } else {
                    indexed.push(param);
                    dynamic.push(false);
                }
            } else {
                nonIndexed.push(param);
                dynamic.push(false);
            }
        });

        let resultIndexed = (topics != null) ? this._abiCoder.decode(indexed, concat(topics)): null;
        let resultNonIndexed = this._abiCoder.decode(nonIndexed, data);

        let result: Array<any> = [ ];
        let nonIndexedIndex = 0, indexedIndex = 0;
        eventFragment.inputs.forEach((param, index) => {
            if (param.indexed) {
                if (resultIndexed == null) {
                    result[index] = new Indexed({ hash: null });

                } else if (dynamic[index]) {
                    result[index] = new Indexed({ hash: resultIndexed[indexedIndex++] });

                } else {
                    result[index] = resultIndexed[indexedIndex++];
                }
            } else {
                result[index] = resultNonIndexed[nonIndexedIndex++];
            }
            //if (param.name && result[param.name] == null) { result[param.name] = result[index]; }
        });

        return result;
    }


    parseTransaction(tx: { data: string, value?: BigNumberish }): TransactionDescription {
        let fragment = this.getFunction(tx.data.substring(0, 10).toLowerCase())

        if (!fragment) { return null; }

        return new TransactionDescription({
            args: this._abiCoder.decode(fragment.inputs, "0x" + tx.data.substring(10)),
            functionFragment: fragment,
            name: fragment.name,
            signature: fragment.format(),
            sighash: this.getSighash(fragment),
            value: BigNumber.from(tx.value || "0"),
        });
    }

    parseLog(log: { topics: Array<string>, data: string}): LogDescription {
        let fragment = this.getEvent(log.topics[0]);

        if (!fragment || fragment.anonymous) { return null; }

        // @TODO: If anonymous, and the only method, and the input count matches, should we parse?


       return new LogDescription({
            eventFragment: fragment,
            name: fragment.name,
            signature: fragment.format(),
            topic: this.getEventTopic(fragment),
            values: this.decodeEventLog(fragment, log.data, log.topics)
        });
    }


    /*
    static from(value: Array<Fragment | string | JsonAbi> | string | Interface) {
        if (Interface.isInterface(value)) {
            return value;
        }
        if (typeof(value) === "string") {
            return new Interface(JSON.parse(value));
        }
        return new Interface(value);
    }
    */
}

function getFragment(hash: string, calcFunc: (f: Fragment) => string, items: { [ sig: string ]: Fragment } ) {
    for (let signature in items) {
        if (signature.indexOf("(") === -1) { continue; }
        let fragment = items[signature];
        if (calcFunc(fragment) === hash) { return fragment; }
    }
    return null;
}

function getNameCount(fragments: { [ signature: string ]: Fragment }): { [ name: string ]: number } {
    let unique: { [ name: string ]: number } = { };

    // Count each name
    for (let signature in fragments) {
        let name = fragments[signature].name;
        if (!unique[name]) { unique[name] = 0; }
        unique[name]++;
    }

    return unique;
}
