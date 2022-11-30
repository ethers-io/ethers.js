/**
 *  About Interface
 *
 *  @_subsection api/abi:Interfaces  [interfaces]
 */
import { keccak256 } from "../crypto/index.js";
import { id } from "../hash/index.js";
import { concat, dataSlice, getBigInt, getBytes, getBytesCopy, hexlify, zeroPadValue, isHexString, defineProperties, assertArgument, toHex, assert } from "../utils/index.js";
import { AbiCoder } from "./abi-coder.js";
import { checkResultErrors, Result } from "./coders/abstract-coder.js";
import { ConstructorFragment, ErrorFragment, EventFragment, Fragment, FunctionFragment, ParamType } from "./fragments.js";
import { Typed } from "./typed.js";
export { checkResultErrors, Result };
export class LogDescription {
    fragment;
    name;
    signature;
    topic;
    args;
    constructor(fragment, topic, args) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, signature, topic, args
        });
    }
}
export class TransactionDescription {
    fragment;
    name;
    args;
    signature;
    selector;
    value;
    constructor(fragment, selector, args, value) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, args, signature, selector, value
        });
    }
}
export class ErrorDescription {
    fragment;
    name;
    args;
    signature;
    selector;
    constructor(fragment, selector, args) {
        const name = fragment.name, signature = fragment.format();
        defineProperties(this, {
            fragment, name, args, signature, selector
        });
    }
}
export class Indexed {
    hash;
    _isIndexed;
    static isIndexed(value) {
        return !!(value && value._isIndexed);
    }
    constructor(hash) {
        defineProperties(this, { hash, _isIndexed: true });
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
/**
 *  An Interface abstracts many of the low-level details for
 *  encoding and decoding the data on the blockchain.
 *
 *  An ABI provides information on how to encode data to send to
 *  a Contract, how to decode the results and events and how to
 *  interpret revert errors.
 *
 *  The ABI can be specified by [any supported format](InterfaceAbi).
 */
export class Interface {
    /**
     *  All the Contract ABI members (i.e. methods, events, errors, etc).
     */
    fragments;
    /**
     *  The Contract constructor.
     */
    deploy;
    #errors;
    #events;
    #functions;
    //    #structs: Map<string, StructFragment>;
    #abiCoder;
    /**
     *  Create a new Interface for the %%fragments%%.
     */
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
        const frags = [];
        for (const a of abi) {
            try {
                frags.push(Fragment.from(a));
            }
            catch (error) {
                console.log("EE", error);
            }
        }
        defineProperties(this, {
            fragments: Object.freeze(frags)
        });
        this.#abiCoder = this.getAbiCoder();
        // Add all fragments by their signature
        this.fragments.forEach((fragment) => {
            let bucket;
            switch (fragment.type) {
                case "constructor":
                    if (this.deploy) {
                        console.log("duplicate definition - constructor");
                        return;
                    }
                    //checkNames(fragment, "input", fragment.inputs);
                    defineProperties(this, { deploy: fragment });
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
            // Two identical entries; ignore it
            const signature = fragment.format();
            if (bucket.has(signature)) {
                return;
            }
            bucket.set(signature, fragment);
        });
        // If we do not have a constructor add a default
        if (!this.deploy) {
            defineProperties(this, {
                deploy: ConstructorFragment.from("constructor()")
            });
        }
    }
    /**
     *  Returns the entire Human-Readable ABI, as an array of
     *  signatures, optionally as %%minimal%% strings, which
     *  removes parameter names and unneceesary spaces.
     */
    format(minimal) {
        const format = (minimal ? "minimal" : "full");
        const abi = this.fragments.map((f) => f.format(format));
        return abi;
    }
    /**
     *  Return the JSON-encoded ABI. This is the format Solidiy
     *  returns.
     */
    formatJson() {
        const abi = this.fragments.map((f) => f.format("json"));
        // We need to re-bundle the JSON fragments a bit
        return JSON.stringify(abi.map((j) => JSON.parse(j)));
    }
    /**
     *  The ABI coder that will be used to encode and decode binary
     *  data.
     */
    getAbiCoder() {
        return AbiCoder.defaultAbiCoder();
    }
    // Find a function definition by any means necessary (unless it is ambiguous)
    #getFunction(key, values, forceUnique) {
        // Selector
        if (isHexString(key)) {
            const selector = key.toLowerCase();
            for (const fragment of this.#functions.values()) {
                if (selector === fragment.selector) {
                    return fragment;
                }
            }
            assertArgument(false, "no matching function", "selector", key);
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
            assertArgument(matching.length !== 0, "no matching function", "name", key);
            if (matching.length > 1 && forceUnique) {
                const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                assertArgument(false, `multiple matching functions (i.e. ${matchStr})`, "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        const result = this.#functions.get(FunctionFragment.from(key).format());
        if (result) {
            return result;
        }
        assertArgument(false, "no matching function", "signature", key);
    }
    /**
     *  Get the function name for %%key%%, which may be a function selector,
     *  function name or function signature that belongs to the ABI.
     */
    getFunctionName(key) {
        return (this.#getFunction(key, null, false)).name;
    }
    /**
     *  Get the [[FunctionFragment]] for %%key%%, which may be a function
     *  selector, function name or function signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple functions match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single function in
     *  the ABI, this will throw.
     */
    getFunction(key, values) {
        return this.#getFunction(key, values || null, true);
    }
    // Find an event definition by any means necessary (unless it is ambiguous)
    #getEvent(key, values, forceUnique) {
        // EventTopic
        if (isHexString(key)) {
            const eventTopic = key.toLowerCase();
            for (const fragment of this.#events.values()) {
                if (eventTopic === fragment.topicHash) {
                    return fragment;
                }
            }
            assertArgument(false, "no matching event", "eventTopic", key);
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
            assertArgument(matching.length > 0, "no matching event", "name", key);
            if (matching.length > 1 && forceUnique) {
                // @TODO: refine by Typed
                assertArgument(false, "multiple matching events", "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        const result = this.#events.get(EventFragment.from(key).format());
        if (result) {
            return result;
        }
        assertArgument(false, "no matching event", "signature", key);
    }
    /**
     *  Get the event name for %%key%%, which may be a topic hash,
     *  event name or event signature that belongs to the ABI.
     */
    getEventName(key) {
        return (this.#getEvent(key, null, false)).name;
    }
    /**
     *  Get the [[EventFragment]] for %%key%%, which may be a topic hash,
     *  event name or event signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple events match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single event in
     *  the ABI, this will throw.
     */
    getEvent(key, values) {
        return this.#getEvent(key, values || null, true);
    }
    /**
     *  Get the [[ErrorFragment]] for %%key%%, which may be an error
     *  selector, error name or error signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple errors match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single error in
     *  the ABI, this will throw.
     */
    getError(key, values) {
        if (isHexString(key)) {
            const selector = key.toLowerCase();
            if (BuiltinErrors[selector]) {
                return ErrorFragment.from(BuiltinErrors[selector].signature);
            }
            for (const fragment of this.#errors.values()) {
                if (selector === fragment.selector) {
                    return fragment;
                }
            }
            assertArgument(false, "no matching error", "selector", key);
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
                    return ErrorFragment.from("error Error(string)");
                }
                if (key === "Panic") {
                    return ErrorFragment.from("error Panic(uint256)");
                }
                assertArgument(false, "no matching error", "name", key);
            }
            else if (matching.length > 1) {
                // @TODO: refine by Typed
                assertArgument(false, "multiple matching errors", "name", key);
            }
            return matching[0];
        }
        // Normalize the signature and lookup the function
        key = ErrorFragment.from(key).format();
        if (key === "Error(string)") {
            return ErrorFragment.from("error Error(string)");
        }
        if (key === "Panic(uint256)") {
            return ErrorFragment.from("error Panic(uint256)");
        }
        const result = this.#errors.get(key);
        if (result) {
            return result;
        }
        assertArgument(false, "no matching error", "signature", key);
    }
    // Get the 4-byte selector used by Solidity to identify a function
    /*
getSelector(fragment: ErrorFragment | FunctionFragment): string {
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

    return dataSlice(id(fragment.format()), 0, 4);
}
    */
    // Get the 32-byte topic hash used by Solidity to identify an event
    /*
    getEventTopic(fragment: EventFragment): string {
        //if (typeof(fragment) === "string") { fragment = this.getEvent(eventFragment); }
        return id(fragment.format());
    }
    */
    _decodeParams(params, data) {
        return this.#abiCoder.decode(params, data);
    }
    _encodeParams(params, values) {
        return this.#abiCoder.encode(params, values);
    }
    /**
     *  Encodes a ``tx.data`` object for deploying the Contract with
     *  the %%values%% as the constructor arguments.
     */
    encodeDeploy(values) {
        return this._encodeParams(this.deploy.inputs, values || []);
    }
    /**
     *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
     *  specified error (see [[getError]] for valid values for
     *  %%key%%).
     *
     *  Most developers should prefer the [[parseResult]] method instead,
     *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
     *  corresponding error.
     */
    decodeErrorResult(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getError(fragment);
        }
        assertArgument(dataSlice(data, 0, 4) === fragment.selector, `data signature does not match error ${fragment.name}.`, "data", data);
        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }
    /**
     *  Encodes the transaction revert data for a call result that
     *  reverted from the the Contract with the sepcified %%error%%
     *  (see [[getError]] for valid values for %%key%%) with the %%values%%.
     *
     *  This is generally not used by most developers, unless trying to mock
     *  a result from a Contract.
     */
    encodeErrorResult(key, values) {
        const fragment = (typeof (key) === "string") ? this.getError(key) : key;
        return concat([
            fragment.selector,
            this._encodeParams(fragment.inputs, values || [])
        ]);
    }
    /**
     *  Decodes the %%data%% from a transaction ``tx.data`` for
     *  the function specified (see [[getFunction]] for valid values
     *  for %%key%%).
     *
     *  Most developers should prefer the [[parseTransaction]] method
     *  instead, which will automatically detect the fragment.
     */
    decodeFunctionData(key, data) {
        const fragment = (typeof (key) === "string") ? this.getFunction(key) : key;
        assertArgument(dataSlice(data, 0, 4) === fragment.selector, `data signature does not match function ${fragment.name}.`, "data", data);
        return this._decodeParams(fragment.inputs, dataSlice(data, 4));
    }
    /**
     *  Encodes the ``tx.data`` for a transaction that calls the function
     *  specified (see [[getFunction]] for valid values for %%key%%) with
     *  the %%values%%.
     */
    encodeFunctionData(key, values) {
        const fragment = (typeof (key) === "string") ? this.getFunction(key) : key;
        return concat([
            fragment.selector,
            this._encodeParams(fragment.inputs, values || [])
        ]);
    }
    /**
     *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
     *  specified function (see [[getFunction]] for valid values for
     *  %%key%%).
     *
     *  Most developers should prefer the [[parseResult]] method instead,
     *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
     *  corresponding error.
     */
    decodeFunctionResult(fragment, data) {
        if (typeof (fragment) === "string") {
            fragment = this.getFunction(fragment);
        }
        let message = "invalid length for result data";
        const bytes = getBytesCopy(data);
        if ((bytes.length % 32) === 0) {
            try {
                return this.#abiCoder.decode(fragment.outputs, bytes);
            }
            catch (error) {
                message = "could not decode result data";
            }
        }
        // Call returned data with no error, but the data is junk
        assert(false, message, "BAD_DATA", {
            value: hexlify(bytes),
            info: { method: fragment.name, signature: fragment.format() }
        });
    }
    makeError(_data, tx) {
        const data = getBytes(_data, "data");
        const error = AbiCoder.getBuiltinCallException("call", tx, data);
        // Not a built-in error; try finding a custom error
        if (!error.message.match(/could not decode/)) {
            const selector = hexlify(data.slice(0, 4));
            error.message = "execution reverted (unknown custom error)";
            try {
                const ef = this.getError(selector);
                try {
                    error.revert = {
                        name: ef.name,
                        signature: ef.format(),
                        args: this.#abiCoder.decode(ef.inputs, data.slice(4))
                    };
                    error.reason = error.revert.signature;
                    error.message = `execution reverted: ${error.reason}`;
                }
                catch (e) {
                    error.message = `execution reverted (coult not decode custom error)`;
                }
            }
            catch (error) {
                console.log(error); // @TODO: remove
            }
        }
        // Add the invocation, if available
        const parsed = this.parseTransaction(tx);
        if (parsed) {
            error.invocation = {
                method: parsed.name,
                signature: parsed.signature,
                args: parsed.args
            };
        }
        return error;
    }
    /**
     *  Encodes the result data (e.g. from an ``eth_call``) for the
     *  specified function (see [[getFunction]] for valid values
     *  for %%key%%) with %%values%%.
     *
     *  This is generally not used by most developers, unless trying to mock
     *  a result from a Contract.
     */
    encodeFunctionResult(key, values) {
        const fragment = (typeof (key) === "string") ? this.getFunction(key) : key;
        return hexlify(this.#abiCoder.encode(fragment.outputs, values || []));
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
        assert(values.length <= eventFragment.inputs.length, `too many arguments for ${eventFragment.format()}`, "UNEXPECTED_ARGUMENT", { count: values.length, expectedCount: eventFragment.inputs.length });
        const topics = [];
        if (!eventFragment.anonymous) {
            topics.push(eventFragment.topicHash);
        }
        // @TODO: Use the coders for this; to properly support tuples, etc.
        const encodeTopic = (param, value) => {
            if (param.type === "string") {
                return id(value);
            }
            else if (param.type === "bytes") {
                return keccak256(hexlify(value));
            }
            if (param.type === "bool" && typeof (value) === "boolean") {
                value = (value ? "0x01" : "0x00");
            }
            if (param.type.match(/^u?int/)) {
                value = toHex(value);
            }
            // Check addresses are valid
            if (param.type === "address") {
                this.#abiCoder.encode(["address"], [value]);
            }
            return zeroPadValue(hexlify(value), 32);
            //@TOOD should probably be return toHex(value, 32)
        };
        values.forEach((value, index) => {
            const param = eventFragment.inputs[index];
            if (!param.indexed) {
                assertArgument(value == null, "cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                return;
            }
            if (value == null) {
                topics.push(null);
            }
            else if (param.baseType === "array" || param.baseType === "tuple") {
                assertArgument(false, "filtering with tuples or arrays not supported", ("contract." + param.name), value);
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
            topics.push(eventFragment.topicHash);
        }
        assertArgument(values.length === eventFragment.inputs.length, "event arguments/values mismatch", "values", values);
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
            const eventTopic = eventFragment.topicHash;
            assertArgument(isHexString(topics[0], 32) && topics[0].toLowerCase() === eventTopic, "fragment/topic mismatch", "topics[0]", topics[0]);
            topics = topics.slice(1);
        }
        const indexed = [];
        const nonIndexed = [];
        const dynamic = [];
        eventFragment.inputs.forEach((param, index) => {
            if (param.indexed) {
                if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                    indexed.push(ParamType.from({ type: "bytes32", name: param.name }));
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
        const resultIndexed = (topics != null) ? this.#abiCoder.decode(indexed, concat(topics)) : null;
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
        return Result.fromItems(values, keys);
    }
    /**
     *  Parses a transaction, finding the matching function and extracts
     *  the parameter values along with other useful function details.
     *
     *  If the matching function cannot be found, return null.
     */
    parseTransaction(tx) {
        const data = getBytes(tx.data, "tx.data");
        const value = getBigInt((tx.value != null) ? tx.value : 0, "tx.value");
        const fragment = this.getFunction(hexlify(data.slice(0, 4)));
        if (!fragment) {
            return null;
        }
        const args = this.#abiCoder.decode(fragment.inputs, data.slice(4));
        return new TransactionDescription(fragment, fragment.selector, args, value);
    }
    parseCallResult(data) {
        throw new Error("@TODO");
    }
    /**
     *  Parses a receipt log, finding the matching event and extracts
     *  the parameter values along with other useful event details.
     *
     *  If the matching event cannot be found, returns null.
     */
    parseLog(log) {
        const fragment = this.getEvent(log.topics[0]);
        if (!fragment || fragment.anonymous) {
            return null;
        }
        // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
        //        Probably not, because just because it is the only event in the ABI does
        //        not mean we have the full ABI; maybe just a fragment?
        return new LogDescription(fragment, fragment.topicHash, this.decodeEventLog(fragment, log.data, log.topics));
    }
    /**
     *  Parses a revert data, finding the matching error and extracts
     *  the parameter values along with other useful error details.
     *
     *  If the matching event cannot be found, returns null.
     */
    parseError(data) {
        const hexData = hexlify(data);
        const fragment = this.getError(dataSlice(hexData, 0, 4));
        if (!fragment) {
            return null;
        }
        const args = this.#abiCoder.decode(fragment.inputs, dataSlice(hexData, 4));
        return new ErrorDescription(fragment, fragment.selector, args);
    }
    /**
     *  Creates a new [[Interface]] from the ABI %%value%%.
     *
     *  The %%value%% may be provided as an existing [[Interface]] object,
     *  a JSON-encoded ABI or any Human-Readable ABI format.
     */
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
            return new Interface(value.format("json"));
        }
        // Array of fragments
        return new Interface(value);
    }
}
//# sourceMappingURL=interface.js.map