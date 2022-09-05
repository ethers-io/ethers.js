"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interface = exports.Indexed = exports.ErrorDescription = exports.TransactionDescription = exports.LogDescription = exports.Result = exports.checkResultErrors = void 0;
const data_js_1 = require("../utils/data.js");
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../hash/index.js");
const logger_js_1 = require("../utils/logger.js");
const properties_js_1 = require("../utils/properties.js");
const maths_js_1 = require("../utils/maths.js");
const abi_coder_js_1 = require("./abi-coder.js");
const abstract_coder_js_1 = require("./coders/abstract-coder.js");
Object.defineProperty(exports, "checkResultErrors", { enumerable: true, get: function () { return abstract_coder_js_1.checkResultErrors; } });
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return abstract_coder_js_1.Result; } });
const fragments_js_1 = require("./fragments.js");
const typed_js_1 = require("./typed.js");
class LogDescription {
    fragment;
    name;
    signature;
    topic;
    args;
    constructor(fragment, topic, args) {
        const name = fragment.name, signature = fragment.format();
        (0, properties_js_1.defineProperties)(this, {
            fragment, name, signature, topic, args
        });
    }
}
exports.LogDescription = LogDescription;
class TransactionDescription {
    fragment;
    name;
    args;
    signature;
    selector;
    value;
    constructor(fragment, selector, args, value) {
        const name = fragment.name, signature = fragment.format();
        (0, properties_js_1.defineProperties)(this, {
            fragment, name, args, signature, selector, value
        });
    }
}
exports.TransactionDescription = TransactionDescription;
class ErrorDescription {
    fragment;
    name;
    args;
    signature;
    selector;
    constructor(fragment, selector, args) {
        const name = fragment.name, signature = fragment.format();
        (0, properties_js_1.defineProperties)(this, {
            fragment, name, args, signature, selector
        });
    }
}
exports.ErrorDescription = ErrorDescription;
class Indexed {
    hash;
    _isIndexed;
    static isIndexed(value) {
        return !!(value && value._isIndexed);
    }
    constructor(hash) {
        (0, properties_js_1.defineProperties)(this, { hash, _isIndexed: true });
    }
}
exports.Indexed = Indexed;
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
class Interface {
    fragments;
    deploy;
    #errors;
    #events;
    #functions;
    //    #structs: Map<string, StructFragment>;
    #abiCoder;
    constructor(fragments) {
        let abi = [];
        if (typeof (fragments) === "string") {
            abi = JSON.parse(fragments);
        }
        else {
            abi = fragments;
        }
        this.#functions = new Map();
        this.#errors = new Map();
        this.#events = new Map();
        //        this.#structs = new Map();
        (0, properties_js_1.defineProperties)(this, {
            fragments: Object.freeze(abi.map((f) => fragments_js_1.Fragment.from(f)).filter((f) => (f != null))),
        });
        this.#abiCoder = this.getAbiCoder();
        // Add all fragments by their signature
        this.fragments.forEach((fragment) => {
            let bucket;
            switch (fragment.type) {
                case "constructor":
                    if (this.deploy) {
                        logger_js_1.logger.warn("duplicate definition - constructor");
                        return;
                    }
                    //checkNames(fragment, "input", fragment.inputs);
                    (0, properties_js_1.defineProperties)(this, { deploy: fragment });
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
                logger_js_1.logger.warn("duplicate definition - " + signature);
                return;
            }
            bucket.set(signature, fragment);
        });
        // If we do not have a constructor add a default
        if (!this.deploy) {
            (0, properties_js_1.defineProperties)(this, {
                deploy: fragments_js_1.ConstructorFragment.fromString("constructor()")
            });
        }
    }
    // @TODO: multi sig?
    format(format) {
        if (!format) {
            format = fragments_js_1.FormatType.full;
        }
        if (format === fragments_js_1.FormatType.sighash) {
            logger_js_1.logger.throwArgumentError("interface does not support formatting sighash", "format", format);
        }
        const abi = this.fragments.map((f) => f.format(format));
        // We need to re-bundle the JSON fragments a bit
        if (format === fragments_js_1.FormatType.json) {
            return JSON.stringify(abi.map((j) => JSON.parse(j)));
        }
        return abi;
    }
    getAbiCoder() {
        return abi_coder_js_1.defaultAbiCoder;
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
    #getFunction(key, values, forceUnique) {
        // Selector
        if ((0, data_js_1.isHexString)(key)) {
            const selector = key.toLowerCase();
            for (const fragment of this.#functions.values()) {
                if (selector === this.getSelector(fragment)) {
                    return fragment;
                }
            }
            logger_js_1.logger.throwArgumentError("no matching function", "selector", key);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [];
            for (const [name, fragment] of this.#functions) {
                if (name.split("(" /* fix:) */)[0] === key) {
                    matching.push(fragment);
                }
            }
            if (values) {
                const lastValue = (values.length > 0) ? values[values.length - 1] : null;
                let valueLength = values.length;
                let allowOptions = true;
                if (typed_js_1.Typed.isTyped(lastValue) && lastValue.type === "overrides") {
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
                        if (!typed_js_1.Typed.isTyped(values[j])) {
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
                logger_js_1.logger.throwArgumentError("no matching function", "name", key);
            }
            else if (matching.length > 1 && forceUnique) {
                const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                logger_js_1.logger.throwArgumentError(`multiple matching functions (i.e. ${matchStr})`, "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        const result = this.#functions.get(fragments_js_1.FunctionFragment.fromString(key).format());
        if (result) {
            return result;
        }
        return logger_js_1.logger.throwArgumentError("no matching function", "signature", key);
    }
    getFunctionName(key) {
        return (this.#getFunction(key, null, false)).name;
    }
    getFunction(key, values) {
        return this.#getFunction(key, values || null, true);
    }
    // Find an event definition by any means necessary (unless it is ambiguous)
    #getEvent(key, values, forceUnique) {
        // EventTopic
        if ((0, data_js_1.isHexString)(key)) {
            const eventTopic = key.toLowerCase();
            for (const fragment of this.#events.values()) {
                if (eventTopic === this.getEventTopic(fragment)) {
                    return fragment;
                }
            }
            logger_js_1.logger.throwArgumentError("no matching event", "eventTopic", key);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [];
            for (const [name, fragment] of this.#events) {
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
                        if (!typed_js_1.Typed.isTyped(values[j])) {
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
                logger_js_1.logger.throwArgumentError("no matching event", "name", key);
            }
            else if (matching.length > 1 && forceUnique) {
                // @TODO: refine by Typed
                logger_js_1.logger.throwArgumentError("multiple matching events", "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        const result = this.#events.get(fragments_js_1.EventFragment.fromString(key).format());
        if (result) {
            return result;
        }
        return logger_js_1.logger.throwArgumentError("no matching event", "signature", key);
    }
    getEventName(key) {
        return (this.#getEvent(key, null, false)).name;
    }
    getEvent(key, values) {
        return this.#getEvent(key, values || null, true);
    }
    // Find a function definition by any means necessary (unless it is ambiguous)
    getError(key, values) {
        if ((0, data_js_1.isHexString)(key)) {
            const selector = key.toLowerCase();
            if (BuiltinErrors[selector]) {
                return fragments_js_1.ErrorFragment.fromString(BuiltinErrors[selector].signature);
            }
            for (const fragment of this.#errors.values()) {
                if (selector === this.getSelector(fragment)) {
                    return fragment;
                }
            }
            logger_js_1.logger.throwArgumentError("no matching error", "selector", key);
        }
        // It is a bare name, look up the function (will return null if ambiguous)
        if (key.indexOf("(") === -1) {
            const matching = [];
            for (const [name, fragment] of this.#errors) {
                if (name.split("(" /* fix:) */)[0] === key) {
                    matching.push(fragment);
                }
            }
            if (matching.length === 0) {
                if (key === "Error") {
                    return fragments_js_1.ErrorFragment.fromString("error Error(string)");
                }
                if (key === "Panic") {
                    return fragments_js_1.ErrorFragment.fromString("error Panic(uint256)");
                }
                logger_js_1.logger.throwArgumentError("no matching error", "name", key);
            }
            else if (matching.length > 1) {
                // @TODO: refine by Typed
                logger_js_1.logger.throwArgumentError("multiple matching errors", "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        key = fragments_js_1.ErrorFragment.fromString(key).format();
        if (key === "Error(string)") {
            return fragments_js_1.ErrorFragment.fromString("error Error(string)");
        }
        if (key === "Panic(uint256)") {
            return fragments_js_1.ErrorFragment.fromString("error Panic(uint256)");
        }
        const result = this.#errors.get(key);
        if (result) {
            return result;
        }
        return logger_js_1.logger.throwArgumentError("no matching error", "signature", key);
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
        return (0, data_js_1.dataSlice)((0, index_js_2.id)(fragment.format()), 0, 4);
    }
    // Get the 32-byte topic hash used by Solidity to identify an event
    getEventTopic(fragment) {
        //if (typeof(fragment) === "string") { fragment = this.getEvent(eventFragment); }
        return (0, index_js_2.id)(fragment.format());
    }
    _decodeParams(params, data) {
        return this.#abiCoder.decode(params, data);
    }
    _encodeParams(params, values) {
        return this.#abiCoder.encode(params, values);
    }
    encodeDeploy(values) {
        return this._encodeParams(this.deploy.inputs, values || []);
    }
    decodeErrorResult(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getError(fragment);
        }
        if ((0, data_js_1.dataSlice)(data, 0, 4) !== this.getSelector(fragment)) {
            logger_js_1.logger.throwArgumentError(`data signature does not match error ${fragment.name}.`, "data", data);
        }
        return this._decodeParams(fragment.inputs, (0, data_js_1.dataSlice)(data, 4));
    }
    encodeErrorResult(fragment, values) {
        if (typeof (fragment) === "string") {
            fragment = this.getError(fragment);
        }
        return (0, data_js_1.concat)([
            this.getSelector(fragment),
            this._encodeParams(fragment.inputs, values || [])
        ]);
    }
    // Decode the data for a function call (e.g. tx.data)
    decodeFunctionData(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        if ((0, data_js_1.dataSlice)(data, 0, 4) !== this.getSelector(fragment)) {
            logger_js_1.logger.throwArgumentError(`data signature does not match function ${fragment.name}.`, "data", data);
        }
        return this._decodeParams(fragment.inputs, (0, data_js_1.dataSlice)(data, 4));
    }
    // Encode the data for a function call (e.g. tx.data)
    encodeFunctionData(fragment, values) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        return (0, data_js_1.concat)([
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
        const bytes = logger_js_1.logger.getBytesCopy(data);
        if ((bytes.length % 32) === 0) {
            try {
                return this.#abiCoder.decode(fragment.outputs, bytes);
            }
            catch (error) {
                message = "could not decode result data";
            }
        }
        // Call returned data with no error, but the data is junk
        return logger_js_1.logger.throwError(message, "BAD_DATA", {
            value: (0, data_js_1.hexlify)(bytes),
            info: { method: fragment.name, signature: fragment.format() }
        });
    }
    makeError(fragment, _data, tx) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        const data = logger_js_1.logger.getBytes(_data);
        let args = undefined;
        if (tx) {
            try {
                args = this.#abiCoder.decode(fragment.inputs, tx.data || "0x");
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
            const selector = (0, data_js_1.hexlify)(data.slice(0, 4));
            const builtin = BuiltinErrors[selector];
            if (builtin) {
                try {
                    errorName = builtin.name;
                    errorSignature = builtin.signature;
                    errorArgs = this.#abiCoder.decode(builtin.inputs, data.slice(4));
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
                        errorArgs = this.#abiCoder.decode(error.inputs, data.slice(4));
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
        return logger_js_1.logger.makeError("call revert exception", "CALL_EXCEPTION", {
            data: (0, data_js_1.hexlify)(data), transaction: null,
            method: fragment.name, signature: fragment.format(), args,
            errorArgs, errorName, errorSignature, reason
        });
    }
    // Encode the result for a function call (e.g. for eth_call)
    encodeFunctionResult(functionFragment, values) {
        if (typeof (functionFragment) === "string") {
            functionFragment = this.getFunction(functionFragment);
        }
        return (0, data_js_1.hexlify)(this.#abiCoder.encode(functionFragment.outputs, values || []));
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
            logger_js_1.logger.throwError("too many arguments for " + eventFragment.format(), "UNEXPECTED_ARGUMENT", {
                count: values.length,
                expectedCount: eventFragment.inputs.length
            });
        }
        const topics = [];
        if (!eventFragment.anonymous) {
            topics.push(this.getEventTopic(eventFragment));
        }
        // @TODO: Use the coders for this; to properly support tuples, etc.
        const encodeTopic = (param, value) => {
            if (param.type === "string") {
                return (0, index_js_2.id)(value);
            }
            else if (param.type === "bytes") {
                return (0, index_js_1.keccak256)((0, data_js_1.hexlify)(value));
            }
            if (param.type === "bool" && typeof (value) === "boolean") {
                value = (value ? "0x01" : "0x00");
            }
            if (param.type.match(/^u?int/)) {
                value = (0, maths_js_1.toHex)(value);
            }
            // Check addresses are valid
            if (param.type === "address") {
                this.#abiCoder.encode(["address"], [value]);
            }
            return (0, data_js_1.zeroPadValue)((0, data_js_1.hexlify)(value), 32);
            //@TOOD should probably be return toHex(value, 32)
        };
        values.forEach((value, index) => {
            const param = eventFragment.inputs[index];
            if (!param.indexed) {
                if (value != null) {
                    logger_js_1.logger.throwArgumentError("cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                }
                return;
            }
            if (value == null) {
                topics.push(null);
            }
            else if (param.baseType === "array" || param.baseType === "tuple") {
                logger_js_1.logger.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
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
            logger_js_1.logger.throwArgumentError("event arguments/values mismatch", "values", values);
        }
        eventFragment.inputs.forEach((param, index) => {
            const value = values[index];
            if (param.indexed) {
                if (param.type === "string") {
                    topics.push((0, index_js_2.id)(value));
                }
                else if (param.type === "bytes") {
                    topics.push((0, index_js_1.keccak256)(value));
                }
                else if (param.baseType === "tuple" || param.baseType === "array") {
                    // @TODO
                    throw new Error("not implemented");
                }
                else {
                    topics.push(this.#abiCoder.encode([param.type], [value]));
                }
            }
            else {
                dataTypes.push(param);
                dataValues.push(value);
            }
        });
        return {
            data: this.#abiCoder.encode(dataTypes, dataValues),
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
            if (!(0, data_js_1.isHexString)(topics[0], 32) || topics[0].toLowerCase() !== eventTopic) {
                logger_js_1.logger.throwArgumentError("fragment/topic mismatch", "topics[0]", topics[0]);
            }
            topics = topics.slice(1);
        }
        const indexed = [];
        const nonIndexed = [];
        const dynamic = [];
        eventFragment.inputs.forEach((param, index) => {
            if (param.indexed) {
                if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                    indexed.push(fragments_js_1.ParamType.fromObject({ type: "bytes32", name: param.name }));
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
        const resultIndexed = (topics != null) ? this.#abiCoder.decode(indexed, (0, data_js_1.concat)(topics)) : null;
        const resultNonIndexed = this.#abiCoder.decode(nonIndexed, data, true);
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
        return abstract_coder_js_1.Result.fromItems(values, keys);
    }
    // Given a transaction, find the matching function fragment (if any) and
    // determine all its properties and call parameters
    parseTransaction(tx) {
        const data = logger_js_1.logger.getBytes(tx.data, "tx.data");
        const value = logger_js_1.logger.getBigInt((tx.value != null) ? tx.value : 0, "tx.value");
        const fragment = this.getFunction((0, data_js_1.hexlify)(data.slice(0, 4)));
        if (!fragment) {
            return null;
        }
        const args = this.#abiCoder.decode(fragment.inputs, data.slice(4));
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
        const hexData = (0, data_js_1.hexlify)(data);
        const fragment = this.getError((0, data_js_1.dataSlice)(hexData, 0, 4));
        if (!fragment) {
            return null;
        }
        const args = this.#abiCoder.decode(fragment.inputs, (0, data_js_1.dataSlice)(hexData, 4));
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
            return new Interface(value.format(fragments_js_1.FormatType.json));
        }
        // Array of fragments
        return new Interface(value);
    }
}
exports.Interface = Interface;
//# sourceMappingURL=interface.js.map