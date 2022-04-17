var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Interface_instances, _Interface_errors, _Interface_events, _Interface_functions, _Interface_abiCoder, _Interface_getFunction, _Interface_getEvent;
import { arrayify, concat, dataSlice, hexlify, zeroPadValue, isHexString } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { id } from "@ethersproject/hash";
import { defineProperties } from "@ethersproject/properties";
import { defaultAbiCoder } from "./abi-coder.js";
import { checkResultErrors, Result } from "./coders/abstract-coder.js";
import { ConstructorFragment, ErrorFragment, EventFragment, FormatType, Fragment, FunctionFragment, ParamType } from "./fragments.js";
import { logger } from "./logger.js";
import { Typed } from "./typed.js";
export { checkResultErrors, Result };
export class LogDescription {
    constructor(fragment, topic, args) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, signature, topic, args
        });
    }
}
export class TransactionDescription {
    constructor(fragment, selector, args, value) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, args, signature, selector, value
        });
    }
}
export class ErrorDescription {
    constructor(fragment, selector, args) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, args, signature, selector
        });
    }
}
export class Indexed {
    constructor(hash) {
        defineProperties(this, { hash, _isIndexed: true });
    }
    static isIndexed(value) {
        return !!(value && value._isIndexed);
    }
}
// https://docs.soliditylang.org/en/v0.8.13/control-structures.html?highlight=panic#panic-via-assert-and-error-via-require
const PanicReasons = {
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
};
const BuiltinErrors = {
    "0x08c379a0": {
        signature: "Error(string)",
        name: "Error",
        inputs: ["string"],
        reason: (message) => {
            return `reverted with reason string ${JSON.stringify(message)}`;
        }
    },
    "0x4e487b71": {
        signature: "Panic(uint256)",
        name: "Panic",
        inputs: ["uint256"],
        reason: (code) => {
            let reason = "unknown panic code";
            if (code >= 0 && code <= 0xff && PanicReasons[code.toString()]) {
                reason = PanicReasons[code.toString()];
            }
            return `reverted with panic code 0x${code.toString(16)} (${reason})`;
        }
    }
};
export class Interface {
    constructor(fragments) {
        _Interface_instances.add(this);
        _Interface_errors.set(this, void 0);
        _Interface_events.set(this, void 0);
        _Interface_functions.set(this, void 0);
        //    #structs: Map<string, StructFragment>;
        _Interface_abiCoder.set(this, void 0);
        let abi = [];
        if (typeof (fragments) === "string") {
            abi = JSON.parse(fragments);
        }
        else {
            abi = fragments;
        }
        __classPrivateFieldSet(this, _Interface_functions, new Map(), "f");
        __classPrivateFieldSet(this, _Interface_errors, new Map(), "f");
        __classPrivateFieldSet(this, _Interface_events, new Map(), "f");
        //        this.#structs = new Map();
        defineProperties(this, {
            fragments: Object.freeze(abi.map((f) => Fragment.from(f)).filter((f) => (f != null))),
        });
        __classPrivateFieldSet(this, _Interface_abiCoder, this.getAbiCoder(), "f");
        // Add all fragments by their signature
        this.fragments.forEach((fragment) => {
            let bucket;
            switch (fragment.type) {
                case "constructor":
                    if (this.deploy) {
                        logger.warn("duplicate definition - constructor");
                        return;
                    }
                    //checkNames(fragment, "input", fragment.inputs);
                    defineProperties(this, { deploy: fragment });
                    return;
                case "function":
                    //checkNames(fragment, "input", fragment.inputs);
                    //checkNames(fragment, "output", (<FunctionFragment>fragment).outputs);
                    bucket = __classPrivateFieldGet(this, _Interface_functions, "f");
                    break;
                case "event":
                    //checkNames(fragment, "input", fragment.inputs);
                    bucket = __classPrivateFieldGet(this, _Interface_events, "f");
                    break;
                case "error":
                    bucket = __classPrivateFieldGet(this, _Interface_errors, "f");
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
            defineProperties(this, {
                deploy: ConstructorFragment.fromString("constructor()")
            });
        }
    }
    // @TODO: multi sig?
    format(format) {
        if (!format) {
            format = FormatType.full;
        }
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
    getAbiCoder() {
        return defaultAbiCoder;
    }
    getFunctionName(key) {
        return (__classPrivateFieldGet(this, _Interface_instances, "m", _Interface_getFunction).call(this, key, null, false)).name;
    }
    getFunction(key, values) {
        return __classPrivateFieldGet(this, _Interface_instances, "m", _Interface_getFunction).call(this, key, values || null, true);
    }
    getEventName(key) {
        return (__classPrivateFieldGet(this, _Interface_instances, "m", _Interface_getEvent).call(this, key, null, false)).name;
    }
    getEvent(key, values) {
        return __classPrivateFieldGet(this, _Interface_instances, "m", _Interface_getEvent).call(this, key, values || null, true);
    }
    // Find a function definition by any means necessary (unless it is ambiguous)
    getError(key, values) {
        if (isHexString(key)) {
            const selector = key.toLowerCase();
            for (const fragment of __classPrivateFieldGet(this, _Interface_errors, "f").values()) {
                if (selector === this.getSelector(fragment)) {
                    return fragment;
                }
            }
            logger.throwArgumentError("no matching error", "selector", key);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [];
            for (const [name, fragment] of __classPrivateFieldGet(this, _Interface_errors, "f")) {
                if (name.split("(" /* fix:) */)[0] === key) {
                    matching.push(fragment);
                }
            }
            if (matching.length === 0) {
                logger.throwArgumentError("no matching error", "name", key);
            }
            else if (matching.length > 1) {
                // @TODO: refine by Typed
                logger.throwArgumentError("multiple matching errors", "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        const result = __classPrivateFieldGet(this, _Interface_errors, "f").get(ErrorFragment.fromString(key).format());
        if (result) {
            return result;
        }
        return logger.throwArgumentError("no matching error", "signature", key);
    }
    // Get the 4-byte selector used by Solidity to identify a function
    getSelector(fragment) {
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
    getEventTopic(fragment) {
        //if (typeof(fragment) === "string") { fragment = this.getEvent(eventFragment); }
        return id(fragment.format());
    }
    _decodeParams(params, data) {
        return __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(params, data);
    }
    _encodeParams(params, values) {
        return __classPrivateFieldGet(this, _Interface_abiCoder, "f").encode(params, values);
    }
    encodeDeploy(values) {
        return this._encodeParams(this.deploy.inputs, values || []);
    }
    decodeErrorResult(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getError(fragment);
        }
        if (dataSlice(data, 0, 4) !== this.getSelector(fragment)) {
            logger.throwArgumentError(`data signature does not match error ${fragment.name}.`, "data", data);
        }
        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }
    encodeErrorResult(fragment, values) {
        if (typeof (fragment) === "string") {
            fragment = this.getError(fragment);
        }
        return concat([
            this.getSelector(fragment),
            this._encodeParams(fragment.inputs, values || [])
        ]);
    }
    // Decode the data for a function call (e.g. tx.data)
    decodeFunctionData(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        if (dataSlice(data, 0, 4) !== this.getSelector(fragment)) {
            logger.throwArgumentError(`data signature does not match function ${fragment.name}.`, "data", data);
        }
        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }
    // Encode the data for a function call (e.g. tx.data)
    encodeFunctionData(fragment, values) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        return concat([
            this.getSelector(fragment),
            this._encodeParams(fragment.inputs, values || [])
        ]);
    }
    // Decode the result from a function call (e.g. from eth_call)
    decodeFunctionResult(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        let message = "invalid length for result data";
        const bytes = arrayify(data);
        if ((bytes.length % 32) === 0) {
            try {
                return __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(fragment.outputs, bytes);
            }
            catch (error) {
                message = "could not decode result data";
            }
        }
        // Call returned data with no error, but the data is junk
        return logger.throwError(message, "BAD_DATA", {
            value: hexlify(bytes),
            info: { method: fragment.name, signature: fragment.format() }
        });
    }
    makeError(fragment, _data, tx) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        const data = logger.getBytes(_data);
        let args = undefined;
        if (tx) {
            try {
                args = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(fragment.inputs, tx.data || "0x");
            }
            catch (error) {
                console.log(error);
            }
        }
        let errorArgs = undefined;
        let errorName = undefined;
        let errorSignature = undefined;
        let reason = "unknown reason";
        if (data.length === 0) {
            reason = "missing error reason";
        }
        else if ((data.length % 32) === 4) {
            const selector = hexlify(data.slice(0, 4));
            const builtin = BuiltinErrors[selector];
            if (builtin) {
                try {
                    errorName = builtin.name;
                    errorSignature = builtin.signature;
                    errorArgs = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(builtin.inputs, data.slice(4));
                    reason = builtin.reason(...errorArgs);
                }
                catch (error) {
                    console.log(error); // @TODO: remove
                }
            }
            else {
                reason = "unknown custom error";
                try {
                    const error = this.getError(selector);
                    errorName = error.name;
                    errorSignature = error.format();
                    reason = `custom error: ${errorSignature}`;
                    try {
                        errorArgs = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(error.inputs, data.slice(4));
                    }
                    catch (error) {
                        reason = `custom error: ${errorSignature} (coult not decode error data)`;
                    }
                }
                catch (error) {
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
    encodeFunctionResult(functionFragment, values) {
        if (typeof (functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }
        return hexlify(__classPrivateFieldGet(this, _Interface_abiCoder, "f").encode(functionFragment.outputs, values || []));
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
    encodeFilterTopics(eventFragment, values) {
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        if (values.length > eventFragment.inputs.length) {
            logger.throwError("too many arguments for " + eventFragment.format(), "UNEXPECTED_ARGUMENT", {
                count: values.length,
                expectedCount: eventFragment.inputs.length
            });
        }
        const topics = [];
        if (!eventFragment.anonymous) {
            topics.push(this.getEventTopic(eventFragment));
        }
        const encodeTopic = (param, value) => {
            if (param.type === "string") {
                return id(value);
            }
            else if (param.type === "bytes") {
                return keccak256(hexlify(value));
            }
            // Check addresses are valid
            if (param.type === "address") {
                __classPrivateFieldGet(this, _Interface_abiCoder, "f").encode(["address"], [value]);
            }
            return zeroPadValue(hexlify(value), 32);
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
            }
            else if (param.baseType === "array" || param.baseType === "tuple") {
                logger.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
            }
            else if (Array.isArray(value)) {
                topics.push(value.map((value) => encodeTopic(param, value)));
            }
            else {
                topics.push(encodeTopic(param, value));
            }
        });
        // Trim off trailing nulls
        while (topics.length && topics[topics.length - 1] === null) {
            topics.pop();
        }
        return topics;
    }
    encodeEventLog(eventFragment, values) {
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        const topics = [];
        const dataTypes = [];
        const dataValues = [];
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
                    topics.push(id(value));
                }
                else if (param.type === "bytes") {
                    topics.push(keccak256(value));
                }
                else if (param.baseType === "tuple" || param.baseType === "array") {
                    // @TODO
                    throw new Error("not implemented");
                }
                else {
                    topics.push(__classPrivateFieldGet(this, _Interface_abiCoder, "f").encode([param.type], [value]));
                }
            }
            else {
                dataTypes.push(param);
                dataValues.push(value);
            }
        });
        return {
            data: __classPrivateFieldGet(this, _Interface_abiCoder, "f").encode(dataTypes, dataValues),
            topics: topics
        };
    }
    // Decode a filter for the event and the search criteria
    decodeEventLog(eventFragment, data, topics) {
        if (typeof (eventFragment) === "string") {
            eventFragment = this.getEvent(eventFragment);
        }
        if (topics != null && !eventFragment.anonymous) {
            const eventTopic = this.getEventTopic(eventFragment);
            if (!isHexString(topics[0], 32) || topics[0].toLowerCase() !== eventTopic) {
                logger.throwArgumentError("fragment/topic mismatch", "topics[0]", topics[0]);
            }
            topics = topics.slice(1);
        }
        const indexed = [];
        const nonIndexed = [];
        const dynamic = [];
        eventFragment.inputs.forEach((param, index) => {
            if (param.indexed) {
                if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                    indexed.push(ParamType.fromObject({ type: "bytes32", name: param.name }));
                    dynamic.push(true);
                }
                else {
                    indexed.push(param);
                    dynamic.push(false);
                }
            }
            else {
                nonIndexed.push(param);
                dynamic.push(false);
            }
        });
        const resultIndexed = (topics != null) ? __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(indexed, concat(topics)) : null;
        const resultNonIndexed = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(nonIndexed, data, true);
        //const result: (Array<any> & { [ key: string ]: any }) = [ ];
        const values = [];
        const keys = [];
        let nonIndexedIndex = 0, indexedIndex = 0;
        eventFragment.inputs.forEach((param, index) => {
            let value = null;
            if (param.indexed) {
                if (resultIndexed == null) {
                    value = new Indexed(null);
                }
                else if (dynamic[index]) {
                    value = new Indexed(resultIndexed[indexedIndex++]);
                }
                else {
                    try {
                        value = resultIndexed[indexedIndex++];
                    }
                    catch (error) {
                        value = error;
                    }
                }
            }
            else {
                try {
                    value = resultNonIndexed[nonIndexedIndex++];
                }
                catch (error) {
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
    parseTransaction(tx) {
        const data = logger.getBytes(tx.data, "tx.data");
        const value = logger.getBigInt((tx.value != null) ? tx.value : 0, "tx.value");
        const fragment = this.getFunction(hexlify(data.slice(0, 4)));
        if (!fragment) {
            return null;
        }
        const args = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(fragment.inputs, data.slice(4));
        return new TransactionDescription(fragment, this.getSelector(fragment), args, value);
    }
    // @TODO
    //parseCallResult(data: BytesLike): ??
    // Given an event log, find the matching event fragment (if any) and
    // determine all its properties and values
    parseLog(log) {
        const fragment = this.getEvent(log.topics[0]);
        if (!fragment || fragment.anonymous) {
            return null;
        }
        // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
        //        Probably not, because just because it is the only event in the ABI does
        //        not mean we have the full ABI; maybe just a fragment?
        return new LogDescription(fragment, this.getEventTopic(fragment), this.decodeEventLog(fragment, log.data, log.topics));
    }
    parseError(data) {
        const hexData = hexlify(data);
        const fragment = this.getError(dataSlice(hexData, 0, 4));
        if (!fragment) {
            return null;
        }
        const args = __classPrivateFieldGet(this, _Interface_abiCoder, "f").decode(fragment.inputs, dataSlice(hexData, 4));
        return new ErrorDescription(fragment, this.getSelector(fragment), args);
    }
    static from(value) {
        // Already an Interface, which is immutable
        if (value instanceof Interface) {
            return value;
        }
        // JSON
        if (typeof (value) === "string") {
            return new Interface(JSON.parse(value));
        }
        // Maybe an interface from an older version, or from a symlinked copy
        if (typeof (value.format) === "function") {
            return new Interface(value.format(FormatType.json));
        }
        // Array of fragments
        return new Interface(value);
    }
}
_Interface_errors = new WeakMap(), _Interface_events = new WeakMap(), _Interface_functions = new WeakMap(), _Interface_abiCoder = new WeakMap(), _Interface_instances = new WeakSet(), _Interface_getFunction = function _Interface_getFunction(key, values, forceUnique) {
    // Selector
    if (isHexString(key)) {
        const selector = key.toLowerCase();
        for (const fragment of __classPrivateFieldGet(this, _Interface_functions, "f").values()) {
            if (selector === this.getSelector(fragment)) {
                return fragment;
            }
        }
        logger.throwArgumentError("no matching function", "selector", key);
    }
    // It is a bare name, look up the function (will return null if ambiguous)
    if (key.indexOf("(") === -1) {
        const matching = [];
        for (const [name, fragment] of __classPrivateFieldGet(this, _Interface_functions, "f")) {
            if (name.split("(" /* fix:) */)[0] === key) {
                matching.push(fragment);
            }
        }
        if (values) {
            const lastValue = (values.length > 0) ? values[values.length - 1] : null;
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
                    if (!Typed.isTyped(values[j])) {
                        continue;
                    }
                    // We are past the inputs
                    if (j >= inputs.length) {
                        if (values[j].type === "overrides") {
                            continue;
                        }
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
            if (lastArg == null || Array.isArray(lastArg) || typeof (lastArg) !== "object") {
                matching.splice(0, 1);
            }
        }
        if (matching.length === 0) {
            logger.throwArgumentError("no matching function", "name", key);
        }
        else if (matching.length > 1 && forceUnique) {
            const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
            logger.throwArgumentError(`multiple matching functions (i.e. ${matchStr})`, "name", key);
        }
        return matching[0];
    }
    // Normalize the signature and lookup the function
    const result = __classPrivateFieldGet(this, _Interface_functions, "f").get(FunctionFragment.fromString(key).format());
    if (result) {
        return result;
    }
    return logger.throwArgumentError("no matching function", "signature", key);
}, _Interface_getEvent = function _Interface_getEvent(key, values, forceUnique) {
    // EventTopic
    if (isHexString(key)) {
        const eventTopic = key.toLowerCase();
        for (const fragment of __classPrivateFieldGet(this, _Interface_events, "f").values()) {
            if (eventTopic === this.getEventTopic(fragment)) {
                return fragment;
            }
        }
        logger.throwArgumentError("no matching event", "eventTopic", key);
    }
    // It is a bare name, look up the function (will return null if ambiguous)
    if (key.indexOf("(") === -1) {
        const matching = [];
        for (const [name, fragment] of __classPrivateFieldGet(this, _Interface_events, "f")) {
            if (name.split("(" /* fix:) */)[0] === key) {
                matching.push(fragment);
            }
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
                    if (!Typed.isTyped(values[j])) {
                        continue;
                    }
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
        }
        else if (matching.length > 1 && forceUnique) {
            // @TODO: refine by Typed
            logger.throwArgumentError("multiple matching events", "name", key);
        }
        return matching[0];
    }
    // Normalize the signature and lookup the function
    const result = __classPrivateFieldGet(this, _Interface_events, "f").get(EventFragment.fromString(key).format());
    if (result) {
        return result;
    }
    return logger.throwArgumentError("no matching event", "signature", key);
};
//# sourceMappingURL=interface.js.map