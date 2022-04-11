import { arrayify, concat, dataSlice, hexlify, zeroPadLeft, isHexString } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto"
import { id } from "@ethersproject/hash"
import { defineProperties } from "@ethersproject/properties";

import { AbiCoder, defaultAbiCoder } from "./abi-coder.js";
import { checkResultErrors, Result } from "./coders/abstract-coder.js";
import { ConstructorFragment, ErrorFragment, EventFragment, FormatType, Fragment, FunctionFragment, ParamType } from "./fragments.js";
import { logger } from "./logger.js";
import { Typed } from "./typed.js";

import type { BytesLike } from "@ethersproject/bytes";
import type { BigNumberish } from "@ethersproject/logger";

import type { JsonFragment } from "./fragments.js";


export { checkResultErrors, Result };

export class LogDescription {
    readonly fragment!: EventFragment;
    readonly name!: string;
    readonly signature!: string;
    readonly topic!: string;
    readonly args!: Result

    constructor(fragment: EventFragment, topic: string, args: Result) {
        const name = fragment.name, signature = fragment.format();
        defineProperties<LogDescription>(this, {
            fragment, name, signature, topic, args
        });
    }
}

export class TransactionDescription {
    readonly fragment!: FunctionFragment;
    readonly name!: string;
    readonly args!: Result;
    readonly signature!: string;
    readonly selector!: string;
    readonly value!: bigint;

    constructor(fragment: FunctionFragment, selector: string, args: Result, value: bigint) {
        const name = fragment.name, signature = fragment.format();
        defineProperties<TransactionDescription>(this, {
            fragment, name, args, signature, selector, value
        });
    }
}

export class ErrorDescription {
    readonly fragment!: ErrorFragment;
    readonly name!: string;
    readonly args!: Result;
    readonly signature!: string;
    readonly selector!: string;

    constructor(fragment: ErrorFragment, selector: string, args: Result) {
        const name = fragment.name, signature = fragment.format();
        defineProperties<ErrorDescription>(this, {
            fragment, name, args, signature, selector
        });
    }
}

export class Indexed {
    readonly hash!: null | string;
    readonly _isIndexed!: boolean;

    static isIndexed(value: any): value is Indexed {
        return !!(value && value._isIndexed);
    }

    constructor(hash: null | string) {
        defineProperties<Indexed>(this, { hash, _isIndexed: true })
    }
}

type ErrorInfo = {
    signature: string,
    inputs: Array<string>,
    name: string,
    reason: (...args: Array<any>) => string;
};

// https://docs.soliditylang.org/en/v0.8.13/control-structures.html?highlight=panic#panic-via-assert-and-error-via-require
const PanicReasons: Record<string, string> = {
    "0": "generic panic",
    "1": "assert(false)",
    "17": "arithmetic overflow",
    "18": "division or modulo by zero",
    "33": "enum overflow",
    "34": "invalid encoded storage byte array accessed",
    "49": "out-of-bounds array access; popping on an empty array",
    "50": "out-of-bounds access of an array or bytesN",
    "65": "out of memory",
    "81": "uninitialized function",
}

const BuiltinErrors: Record<string, ErrorInfo> = {
    "0x08c379a0": {
        signature: "Error(string)",
        name: "Error",
        inputs: [ "string" ],
        reason: (message: string) => {
            return `reverted with reason string ${ JSON.stringify(message) }`;
        }
    },
    "0x4e487b71": {
        signature: "Panic(uint256)",
        name: "Panic",
        inputs: [ "uint256" ],
        reason: (code: bigint) => {
            let reason = "unknown panic code";
            if (code >= 0 && code <= 0xff && PanicReasons[code.toString()]) {
                reason = PanicReasons[code.toString()];
            }
            return `reverted with panic code 0x${ code.toString(16) } (${ reason })`;
        }
    }
}

/*
function wrapAccessError(property: string, error: Error): Error {
    const wrap = new Error(`deferred error during ABI decoding triggered accessing ${ property }`);
    (<any>wrap).error = error;
    return wrap;
}
*/
/*
function checkNames(fragment: Fragment, type: "input" | "output", params: Array<ParamType>): void {
    params.reduce((accum, param) => {
        if (param.name) {
            if (accum[param.name]) {
                logger.throwArgumentError(`duplicate ${ type } parameter ${ JSON.stringify(param.name) } in ${ fragment.format("full") }`, "fragment", fragment);
            }
            accum[param.name] = true;
        }
        return accum;
    }, <{ [ name: string ]: boolean }>{ });
}
*/
//export type AbiCoder = any;
//const defaultAbiCoder: AbiCoder = { };

export type InterfaceAbi = string | ReadonlyArray<Fragment | JsonFragment | string>;

export class Interface {
    readonly fragments!: ReadonlyArray<Fragment>;

    readonly deploy!: ConstructorFragment;

    #errors: Map<string, ErrorFragment>;
    #events: Map<string, EventFragment>;
    #functions: Map<string, FunctionFragment>;
//    #structs: Map<string, StructFragment>;

    #abiCoder: AbiCoder;

    constructor(fragments: InterfaceAbi) {
        let abi: ReadonlyArray<Fragment | JsonFragment | string> = [ ];
        if (typeof(fragments) === "string") {
            abi = JSON.parse(fragments);
        } else {
            abi = fragments;
        }

        this.#functions = new Map();
        this.#errors = new Map();
        this.#events = new Map();
//        this.#structs = new Map();

        defineProperties<Interface>(this, {
            fragments: Object.freeze(abi.map((f) => Fragment.from(f)).filter((f) => (f != null))),
        });

        this.#abiCoder = this.getAbiCoder();

        // Add all fragments by their signature
        this.fragments.forEach((fragment) => {
            let bucket: Map<string, Fragment>;
            switch (fragment.type) {
                case "constructor":
                    if (this.deploy) {
                        logger.warn("duplicate definition - constructor");
                        return;
                    }
                    //checkNames(fragment, "input", fragment.inputs);
                    defineProperties<Interface>(this, { deploy: <ConstructorFragment>fragment });
                    return;

                case "function":
                    //checkNames(fragment, "input", fragment.inputs);
                    //checkNames(fragment, "output", (<FunctionFragment>fragment).outputs);
                    bucket = this.#functions;
                    break;

                case "event":
                    //checkNames(fragment, "input", fragment.inputs);
                    bucket = this.#events;
                    break;

                case "error":
                    bucket = this.#errors;
                    break;

                default:
                    return;
            }

            const signature = fragment.format();
            if (bucket.has(signature)) {
                logger.warn("duplicate definition - " + signature);
                return;
            }

            bucket.set(signature, fragment);
        });

        // If we do not have a constructor add a default
        if (!this.deploy) {
            defineProperties<Interface>(this, {
                deploy: ConstructorFragment.fromString("constructor()")
            });
        }
    }
// @TODO: multi sig?
    format(format?: FormatType): string | Array<string> {
        if (!format) { format = FormatType.full; }
        if (format === FormatType.sighash) {
            logger.throwArgumentError("interface does not support formatting sighash", "format", format);
        }

        const abi = this.fragments.map((f) => f.format(format));

        // We need to re-bundle the JSON fragments a bit
        if (format === FormatType.json) {
             return JSON.stringify(abi.map((j) => JSON.parse(j)));
        }

        return abi;
    }

    getAbiCoder(): AbiCoder {
        return defaultAbiCoder;
    }

    //static getAddress(address: string): string {
    //    return getAddress(address);
    //}

    //static getSelector(fragment: ErrorFragment | FunctionFragment): string {
    //    return dataSlice(id(fragment.format()), 0, 4);
    //}

    //static getEventTopic(eventFragment: EventFragment): string {
    //    return id(eventFragment.format());
    //}

    // Find a function definition by any means necessary (unless it is ambiguous)
    #getFunction(key: string, values: null | Array<any | Typed>, forceUnique: boolean): FunctionFragment {

        // Selector
        if (isHexString(key)) {
            const selector = key.toLowerCase();
            for (const fragment of this.#functions.values()) {
                if (selector === this.getSelector(fragment)) { return fragment; }
            }
            logger.throwArgumentError("no matching function", "selector", key);
        }

        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching: Array<FunctionFragment> = [ ];
            for (const [ name, fragment ] of this.#functions) {
                if (name.split("("/* fix:) */)[0] === key) { matching.push(fragment); }
            }

            if (values) {
                const lastValue = (values.length > 0) ? values[values.length - 1]: null;

                let valueLength = values.length;
                let allowOptions = true;
                if (Typed.isTyped(lastValue) && lastValue.type === "overrides") {
                    allowOptions = false;
                    valueLength--;
                }

                // Remove all matches that don't have a compatible length. The args
                // may contain an overrides, so the match may have n or n - 1 parameters
                for (let i = matching.length - 1; i >= 0; i--) {
                    const inputs = matching[i].inputs.length;
                    if (inputs !== valueLength && (!allowOptions || inputs !== valueLength - 1)) {
                        matching.splice(i, 1);
                    }
                }

                // Remove all matches that don't match the Typed signature
                for (let i = matching.length - 1; i >= 0; i--) {
                    const inputs = matching[i].inputs;
                    for (let j = 0; j < values.length; j++) {
                        // Not a typed value
                        if (!Typed.isTyped(values[j])) { continue; }

                        // We are past the inputs
                        if (j >= inputs.length) {
                            if (values[j].type === "overrides") { continue; }
                            matching.splice(i, 1);
                            break;
                        }

                        // Make sure the value type matches the input type
                        if (values[j].type !== inputs[j].baseType) {
                            matching.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            // We found a single matching signature with an overrides, but the
            // last value is something that cannot possibly be an options
            if (matching.length === 1 && values && values.length !== matching[0].inputs.length) {
                const lastArg = values[values.length - 1];
                if (lastArg == null || Array.isArray(lastArg) || typeof(lastArg) !== "object") {
                    matching.splice(0, 1);
                }
            }

            if (matching.length === 0) {
                logger.throwArgumentError("no matching function", "name", key);

            } else if (matching.length > 1 && forceUnique) {
                const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                logger.throwArgumentError(`multiple matching functions (i.e. ${ matchStr })`, "name", key);
            }

            return matching[0];
        }

        // Normalize the signature and lookup the function
        const result = this.#functions.get(FunctionFragment.fromString(key).format());
        if (result) { return result; }

        return logger.throwArgumentError("no matching function", "signature", key);
    }
    getFunctionName(key: string): string {
        return (this.#getFunction(key, null, false)).name;
    }
    getFunction(key: string, values?: Array<any | Typed>): FunctionFragment {
        return this.#getFunction(key, values || null, true)
    }


    // Find an event definition by any means necessary (unless it is ambiguous)
    #getEvent(key: string, values: null | Array<null | any | Typed>, forceUnique: boolean): EventFragment {

        // EventTopic
        if (isHexString(key)) {
            const eventTopic = key.toLowerCase();
            for (const fragment of this.#events.values()) {
                if (eventTopic === this.getEventTopic(fragment)) { return fragment; }
            }
            logger.throwArgumentError("no matching event", "eventTopic", key);
        }

        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [ ];
            for (const [ name, fragment ] of this.#events) {
                if (name.split("("/* fix:) */)[0] === key) { matching.push(fragment); }
            }

            if (values) {
                // Remove all matches that don't have a compatible length.
                for (let i = matching.length - 1; i >= 0; i--) {
                    if (matching[i].inputs.length < values.length) {
                        matching.splice(i, 1);
                    }
                }

                // Remove all matches that don't match the Typed signature
                for (let i = matching.length - 1; i >= 0; i--) {
                    const inputs = matching[i].inputs;
                    for (let j = 0; j < values.length; j++) {
                        // Not a typed value
                        if (!Typed.isTyped(values[j])) { continue; }

                        // Make sure the value type matches the input type
                        if (values[j].type !== inputs[j].baseType) {
                            matching.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            if (matching.length === 0) {
                logger.throwArgumentError("no matching event", "name", key);
            } else if (matching.length > 1 && forceUnique) {
                // @TODO: refine by Typed
                logger.throwArgumentError("multiple matching events", "name", key);
            }

            return matching[0];
        }

        // Normalize the signature and lookup the function
        const result = this.#events.get(EventFragment.fromString(key).format());
        if (result) { return result; }

        return logger.throwArgumentError("no matching event", "signature", key);
    }
    getEventName(key: string): string {
        return (this.#getEvent(key, null, false)).name;
    }
    getEvent(key: string, values?: Array<any | Typed>): EventFragment {
        return this.#getEvent(key, values || null, true)
    }

    // Find a function definition by any means necessary (unless it is ambiguous)
    getError(key: string, values?: Array<any | Typed>): ErrorFragment {
        if (isHexString(key)) {
            const selector = key.toLowerCase();
            for (const fragment of this.#errors.values()) {
                if (selector === this.getSelector(fragment)) { return fragment; }
            }
            logger.throwArgumentError("no matching error", "selector", key);
        }

        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [ ];
            for (const [ name, fragment ] of this.#errors) {
                if (name.split("("/* fix:) */)[0] === key) { matching.push(fragment); }
            }
            if (matching.length === 0) {
                logger.throwArgumentError("no matching error", "name", key);
            } else if (matching.length > 1) {
                // @TODO: refine by Typed
                logger.throwArgumentError("multiple matching errors", "name", key);
            }

            return matching[0];
        }

        // Normalize the signature and lookup the function
        const result = this.#errors.get(ErrorFragment.fromString(key).format());
        if (result) { return result; }

        return logger.throwArgumentError("no matching error", "signature", key);
    }

    // Get the 4-byte selector used by Solidity to identify a function
    getSelector(fragment: ErrorFragment | FunctionFragment): string {
        /*
        if (typeof(fragment) === "string") {
            const matches: Array<Fragment> = [ ];

            try { matches.push(this.getFunction(fragment)); } catch (error) { }
            try { matches.push(this.getError(<string>fragment)); } catch (_) { }

            if (matches.length === 0) {
                logger.throwArgumentError("unknown fragment", "key", fragment);
            } else if (matches.length > 1) {
                logger.throwArgumentError("ambiguous fragment matches function and error", "key", fragment);
            }

            fragment = matches[0];
        }
        */

        return dataSlice(id(fragment.format()), 0, 4);
    }

    // Get the 32-byte topic hash used by Solidity to identify an event
    getEventTopic(fragment: EventFragment): string {
        //if (typeof(fragment) === "string") { fragment = this.getEvent(eventFragment); }
        return id(fragment.format());
    }


    _decodeParams(params: ReadonlyArray<ParamType>, data: BytesLike): Result {
        return this.#abiCoder.decode(params, data)
    }

    _encodeParams(params: ReadonlyArray<ParamType>, values: ReadonlyArray<any>): string {
        return this.#abiCoder.encode(params, values)
    }

    encodeDeploy(values?: ReadonlyArray<any>): string {
        return this._encodeParams(this.deploy.inputs, values || [ ]);
    }

    decodeErrorResult(fragment: ErrorFragment | string, data: BytesLike): Result {
        if (typeof(fragment) === "string") { fragment = this.getError(fragment); }

        if (dataSlice(data, 0, 4) !== this.getSelector(fragment)) {
            logger.throwArgumentError(`data signature does not match error ${ fragment.name }.`, "data", data);
        }

        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }

    encodeErrorResult(fragment: ErrorFragment | string, values?: ReadonlyArray<any>): string {
        if (typeof(fragment) === "string") { fragment = this.getError(fragment); }

        return concat([
            this.getSelector(fragment),
            this._encodeParams(fragment.inputs, values || [ ])
        ]);
    }

    // Decode the data for a function call (e.g. tx.data)
    decodeFunctionData(fragment: FunctionFragment | string, data: BytesLike): Result {
        if (typeof(fragment) === "string") { fragment = this.getFunction(fragment); }

        if (dataSlice(data, 0, 4) !== this.getSelector(fragment)) {
            logger.throwArgumentError(`data signature does not match function ${ fragment.name }.`, "data", data);
        }

        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }

    // Encode the data for a function call (e.g. tx.data)
    encodeFunctionData(fragment: FunctionFragment | string, values?: ReadonlyArray<any>): string {
        if (typeof(fragment) === "string") { fragment = this.getFunction(fragment); }

        return concat([
            this.getSelector(fragment),
            this._encodeParams(fragment.inputs, values || [ ])
        ]);
    }

    // Decode the result from a function call (e.g. from eth_call)
    decodeFunctionResult(fragment: FunctionFragment | string, data: BytesLike): Result {
        if (typeof(fragment) === "string") { fragment = this.getFunction(fragment); }

        let message = "invalid length for result data";

        const bytes = arrayify(data);
        if ((bytes.length % 32) === 0) {
            try {
                return this.#abiCoder.decode(fragment.outputs, bytes);
            } catch (error) {
                message = "could not decode result data";
            }
        }

        // Call returned data with no error, but the data is junk
        return logger.throwError(message, "BAD_DATA", {
            value: hexlify(bytes),
            info: { method: fragment.name, signature: fragment.format() }
        });
    }

    makeError(fragment: FunctionFragment | string, _data: BytesLike, tx?: { data: string }): Error {
        if (typeof(fragment) === "string") { fragment = this.getFunction(fragment); }

        const data = logger.getBytes(_data);

        let args: undefined | Result = undefined;
        if (tx) {
            try {
                args = this.#abiCoder.decode(fragment.inputs, tx.data || "0x");
            } catch (error) { console.log(error); }
        }

        let errorArgs: undefined | Result = undefined;
        let errorName: undefined | string = undefined;
        let errorSignature: undefined | string = undefined;
        let reason: string = "unknown reason";

        if (data.length === 0) {
            reason = "missing error reason";

        } else if ((data.length % 32) === 4) {
            const selector = hexlify(data.slice(0, 4));
            const builtin = BuiltinErrors[selector];
            if (builtin) {
                try {
                    errorName = builtin.name;
                    errorSignature = builtin.signature;
                    errorArgs = this.#abiCoder.decode(builtin.inputs, data.slice(4));
                    reason = builtin.reason(...errorArgs);
                } catch (error) {
                    console.log(error); // @TODO: remove
                }
            } else {
                reason = "unknown custom error";
                try {
                    const error = this.getError(selector);
                    errorName = error.name;
                    errorSignature = error.format();
                    reason = `custom error: ${ errorSignature }`;
                    try {
                        errorArgs = this.#abiCoder.decode(error.inputs, data.slice(4));
                    } catch (error) {
                        reason = `custom error: ${ errorSignature } (coult not decode error data)`
                    }
                } catch (error) {
                    console.log(error); // @TODO: remove
                }
            }
        }

        return logger.makeError("call revert exception", "CALL_EXCEPTION", {
            data: hexlify(data), transaction: null,
            method: fragment.name, signature: fragment.format(), args,
            errorArgs, errorName, errorSignature, reason
        });
    }

    // Encode the result for a function call (e.g. for eth_call)
    encodeFunctionResult(functionFragment: FunctionFragment | string, values?: ReadonlyArray<any>): string {
        if (typeof(functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }

        return hexlify(this.#abiCoder.encode(functionFragment.outputs, values || [ ]));
    }
/*
    spelunk(inputs: Array<ParamType>, values: ReadonlyArray<any>, processfunc: (type: string, value: any) => Promise<any>): Promise<Array<any>> {
        const promises: Array<Promise<>> = [ ];
        const process = function(type: ParamType, value: any): any {
            if (type.baseType === "array") {
                return descend(type.child
            }
            if (type. === "address") {
            }
        };

        const descend = function (inputs: Array<ParamType>, values: ReadonlyArray<any>) {
            if (inputs.length !== values.length) { throw new Error("length mismatch"); }
            
        };

        const result: Array<any> = [ ];
        values.forEach((value, index) => {
            if (value == null) {
                topics.push(null);
            } else if (param.baseType === "array" || param.baseType === "tuple") {
                logger.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
            } else if (Array.isArray(value)) {
                topics.push(value.map((value) => encodeTopic(param, value)));
            } else {
                topics.push(encodeTopic(param, value));
            }
        });
    }
*/
    // Create the filter for the event with search criteria (e.g. for eth_filterLog)
    encodeFilterTopics(eventFragment: EventFragment, values: ReadonlyArray<any>): Array<null | string | Array<string>> {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        if (values.length > eventFragment.inputs.length) {
            logger.throwError("too many arguments for " + eventFragment.format(), "UNEXPECTED_ARGUMENT", {
                count: values.length,
                expectedCount: eventFragment.inputs.length
            })
        }

        const topics: Array<null | string | Array<string>> = [];
        if (!eventFragment.anonymous) { topics.push(this.getEventTopic(eventFragment)); }

        const encodeTopic = (param: ParamType, value: any): string => {
            if (param.type === "string") {
                 return id(value);
            } else if (param.type === "bytes") {
                 return keccak256(hexlify(value));
            }

            // Check addresses are valid
            if (param.type === "address") { this.#abiCoder.encode( [ "address" ], [ value ]); }
            return zeroPadLeft(hexlify(value), 32);
            //@TOOD should probably be return toHex(value, 32)
        };

        values.forEach((value, index) => {

            const param = eventFragment.inputs[index];

            if (!param.indexed) {
                if (value != null) {
                    logger.throwArgumentError("cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                }
                return;
            }

            if (value == null) {
                topics.push(null);
            } else if (param.baseType === "array" || param.baseType === "tuple") {
                logger.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
            } else if (Array.isArray(value)) {
                topics.push(value.map((value) => encodeTopic(param, value)));
            } else {
                topics.push(encodeTopic(param, value));
            }
        });

        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }

        return topics;
    }

    encodeEventLog(eventFragment: EventFragment, values: ReadonlyArray<any>): { data: string, topics: Array<string> } {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        const topics: Array<string> = [ ];

        const dataTypes: Array<ParamType> = [ ];
        const dataValues: Array<string> = [ ];

        if (!eventFragment.anonymous) {
            topics.push(this.getEventTopic(eventFragment));
        }

        if (values.length !== eventFragment.inputs.length) {
            logger.throwArgumentError("event arguments/values mismatch", "values", values);
        }

        eventFragment.inputs.forEach((param, index) => {
            const value = values[index];
            if (param.indexed) {
                if (param.type === "string") {
                    topics.push(id(value))
                } else if (param.type === "bytes") {
                    topics.push(keccak256(value))
                } else if (param.baseType === "tuple" || param.baseType === "array") {
                    // @TODO
                    throw new Error("not implemented");
                } else {
                    topics.push(this.#abiCoder.encode([ param.type] , [ value ]));
                }
            } else {
                dataTypes.push(param);
                dataValues.push(value);
            }
        });

        return {
            data: this.#abiCoder.encode(dataTypes , dataValues),
            topics: topics
        };
    }

    // Decode a filter for the event and the search criteria
    decodeEventLog(eventFragment: EventFragment | string, data: BytesLike, topics?: ReadonlyArray<string>): Result {
        if (typeof(eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }

        if (topics != null && !eventFragment.anonymous) {
            const eventTopic = this.getEventTopic(eventFragment);
            if (!isHexString(topics[0], 32) || topics[0].toLowerCase() !== eventTopic) {
                logger.throwArgumentError("fragment/topic mismatch", "topics[0]", topics[0]);
            }
            topics = topics.slice(1);
        }

        const indexed: Array<ParamType> = [];
        const nonIndexed: Array<ParamType> = [];
        const dynamic: Array<boolean> = [];

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

        const resultIndexed = (topics != null) ? this.#abiCoder.decode(indexed, concat(topics)): null;
        const resultNonIndexed = this.#abiCoder.decode(nonIndexed, data, true);

        //const result: (Array<any> & { [ key: string ]: any }) = [ ];
        const values: Array<any> = [ ];
        const keys: Array<null | string> = [ ];
        let nonIndexedIndex = 0, indexedIndex = 0;
        eventFragment.inputs.forEach((param, index) => {
            let value = null;
            if (param.indexed) {
                if (resultIndexed == null) {
                    value = new Indexed(null);

                } else if (dynamic[index]) {
                    value = new Indexed(resultIndexed[indexedIndex++]);

                } else {
                    try {
                        value = resultIndexed[indexedIndex++];
                    } catch (error) {
                        value = error;
                    }
                }
            } else {
                try {
                    value = resultNonIndexed[nonIndexedIndex++];
                } catch (error) {
                    value = error;
                }
            }

            values.push(value);
            keys.push(param.name || null);
        });

        return Result.fromItems(values, keys);
    }

    // Given a transaction, find the matching function fragment (if any) and
    // determine all its properties and call parameters
    parseTransaction(tx: { data: string, value?: BigNumberish }): null | TransactionDescription {
        const data = logger.getBytes(tx.data, "tx.data");
        const value = logger.getBigInt((tx.value != null) ? tx.value: 0, "tx.value");

        const fragment = this.getFunction(hexlify(data.slice(0, 4)));

        if (!fragment) { return null; }

        const args = this.#abiCoder.decode(fragment.inputs, data.slice(4));
        return new TransactionDescription(fragment, this.getSelector(fragment), args, value);
    }

    // @TODO
    //parseCallResult(data: BytesLike): ??

    // Given an event log, find the matching event fragment (if any) and
    // determine all its properties and values
    parseLog(log: { topics: Array<string>, data: string}): null | LogDescription {
        const fragment = this.getEvent(log.topics[0]);

        if (!fragment || fragment.anonymous) { return null; }

        // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
        //        Probably not, because just because it is the only event in the ABI does
        //        not mean we have the full ABI; maybe just a fragment?


       return new LogDescription(fragment, this.getEventTopic(fragment), this.decodeEventLog(fragment, log.data, log.topics));
    }

    parseError(data: BytesLike): null | ErrorDescription {
        const hexData = hexlify(data);
        const fragment = this.getError(dataSlice(hexData, 0, 4));

        if (!fragment) { return null; }

        const args = this.#abiCoder.decode(fragment.inputs, dataSlice(hexData, 4));
        return new ErrorDescription(fragment, this.getSelector(fragment), args);
    }


    static from(value: ReadonlyArray<Fragment | string | JsonFragment> | string | Interface) {
        // Already an Interface, which is immutable
        if (value instanceof Interface) { return value; }

        // JSON
        if (typeof(value) === "string") { return new Interface(JSON.parse(value)); }

        // Maybe an interface from an older version, or from a symlinked copy
        if (typeof((<any>value).format) === "function") {
            return new Interface((<any>value).format(FormatType.json));
        }

        // Array of fragments
        return new Interface(value);
    }
}
