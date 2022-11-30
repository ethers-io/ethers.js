"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reader = exports.Writer = exports.Coder = exports.checkResultErrors = exports.Result = exports.WordSize = void 0;
const index_js_1 = require("../../utils/index.js");
exports.WordSize = 32;
const Padding = new Uint8Array(exports.WordSize);
// Properties used to immediate pass through to the underlying object
// - `then` is used to detect if an object is a Promise for await
const passProperties = ["then"];
const _guard = {};
/**
 *  A [[Result]] is a sub-class of Array, which allows accessing any
 *  of its values either positionally by its index or, if keys are
 *  provided by its name.
 *
 *  @_docloc: api/abi
 */
class Result extends Array {
    #indices;
    /**
     *  @private
     */
    constructor(guard, items, keys) {
        (0, index_js_1.assertPrivate)(guard, _guard, "Result");
        super(...items);
        // Name lookup table
        this.#indices = new Map();
        if (keys) {
            keys.forEach((key, index) => {
                if (key == null) {
                    return;
                }
                if (this.#indices.has(key)) {
                    (this.#indices.get(key)).push(index);
                }
                else {
                    this.#indices.set(key, [index]);
                }
            });
        }
        Object.freeze(this);
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof (prop) === "string") {
                    if (prop.match(/^[0-9]+$/)) {
                        const index = (0, index_js_1.getNumber)(prop, "%index");
                        if (index < 0 || index >= this.length) {
                            throw new RangeError("out of result range");
                        }
                        const item = target[index];
                        if (item instanceof Error) {
                            this.#throwError(`index ${index}`, item);
                        }
                        return item;
                    }
                    // Pass important checks (like `then` for Promise) through
                    if (prop in target || passProperties.indexOf(prop) >= 0) {
                        return Reflect.get(target, prop, receiver);
                    }
                    // Something that could be a result keyword value
                    if (!(prop in target)) {
                        return target.getValue(prop);
                    }
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }
    /*
    toJSON(): any {
        if (this.#indices.length === this.length) {
            const result: Record<string, any> = { };
            for (const key of this.#indices.keys()) {
                result[key] = ths.getValue(key);
            }
            return result;
        }
        return this;
    }
    */
    /**
     *  @_ignore
     */
    slice(start, end) {
        if (start == null) {
            start = 0;
        }
        if (end == null) {
            end = this.length;
        }
        const result = [];
        for (let i = start; i < end; i++) {
            let value;
            try {
                value = this[i];
            }
            catch (error) {
                value = error.error;
            }
            result.push(value);
        }
        return result;
    }
    #throwError(name, error) {
        const wrapped = new Error(`deferred error during ABI decoding triggered accessing ${name}`);
        wrapped.error = error;
        throw wrapped;
    }
    /**
     *  Returns the value for %%name%%.
     *
     *  Since it is possible to have a key whose name conflicts with
     *  a method on a [[Result]] or its superclass Array, or any
     *  JavaScript keyword, this ensures all named values are still
     *  accessible by name.
     */
    getValue(name) {
        const index = this.#indices.get(name);
        if (index != null && index.length === 1) {
            const item = this[index[0]];
            if (item instanceof Error) {
                this.#throwError(`property ${JSON.stringify(name)}`, item);
            }
            return item;
        }
        throw new Error(`no named parameter: ${JSON.stringify(name)}`);
    }
    /**
     *  Creates a new [[Result]] for %%items%% with each entry
     *  also accessible by its corresponding name in %%keys%%.
     */
    static fromItems(items, keys) {
        return new Result(_guard, items, keys);
    }
}
exports.Result = Result;
/**
 *  Returns all errors found in a [[Result]].
 *
 *  Since certain errors encountered when creating a [[Result]] do
 *  not impact the ability to continue parsing data, they are
 *  deferred until they are actually accessed. Hence a faulty string
 *  in an Event that is never used does not impact the program flow.
 *
 *  However, sometimes it may be useful to access, identify or
 *  validate correctness of a [[Result]].
 *
 *  @_docloc api/abi
 */
function checkResultErrors(result) {
    // Find the first error (if any)
    const errors = [];
    const checkErrors = function (path, object) {
        if (!Array.isArray(object)) {
            return;
        }
        for (let key in object) {
            const childPath = path.slice();
            childPath.push(key);
            try {
                checkErrors(childPath, object[key]);
            }
            catch (error) {
                errors.push({ path: childPath, error: error });
            }
        }
    };
    checkErrors([], result);
    return errors;
}
exports.checkResultErrors = checkResultErrors;
function getValue(value) {
    let bytes = (0, index_js_1.toArray)(value);
    (0, index_js_1.assert)(bytes.length <= exports.WordSize, "value out-of-bounds", "BUFFER_OVERRUN", { buffer: bytes, length: exports.WordSize, offset: bytes.length });
    if (bytes.length !== exports.WordSize) {
        bytes = (0, index_js_1.getBytesCopy)((0, index_js_1.concat)([Padding.slice(bytes.length % exports.WordSize), bytes]));
    }
    return bytes;
}
/**
 *  @_ignore
 */
class Coder {
    // The coder name:
    //   - address, uint256, tuple, array, etc.
    name;
    // The fully expanded type, including composite types:
    //   - address, uint256, tuple(address,bytes), uint256[3][4][],  etc.
    type;
    // The localName bound in the signature, in this example it is "baz":
    //   - tuple(address foo, uint bar) baz
    localName;
    // Whether this type is dynamic:
    //  - Dynamic: bytes, string, address[], tuple(boolean[]), etc.
    //  - Not Dynamic: address, uint256, boolean[3], tuple(address, uint8)
    dynamic;
    constructor(name, type, localName, dynamic) {
        (0, index_js_1.defineProperties)(this, { name, type, localName, dynamic }, {
            name: "string", type: "string", localName: "string", dynamic: "boolean"
        });
    }
    _throwError(message, value) {
        (0, index_js_1.assertArgument)(false, message, this.localName, value);
    }
}
exports.Coder = Coder;
/**
 *  @_ignore
 */
class Writer {
    // An array of WordSize lengthed objects to concatenation
    #data;
    #dataLength;
    constructor() {
        this.#data = [];
        this.#dataLength = 0;
    }
    get data() {
        return (0, index_js_1.concat)(this.#data);
    }
    get length() { return this.#dataLength; }
    #writeData(data) {
        this.#data.push(data);
        this.#dataLength += data.length;
        return data.length;
    }
    appendWriter(writer) {
        return this.#writeData((0, index_js_1.getBytesCopy)(writer.data));
    }
    // Arrayish item; pad on the right to *nearest* WordSize
    writeBytes(value) {
        let bytes = (0, index_js_1.getBytesCopy)(value);
        const paddingOffset = bytes.length % exports.WordSize;
        if (paddingOffset) {
            bytes = (0, index_js_1.getBytesCopy)((0, index_js_1.concat)([bytes, Padding.slice(paddingOffset)]));
        }
        return this.#writeData(bytes);
    }
    // Numeric item; pad on the left *to* WordSize
    writeValue(value) {
        return this.#writeData(getValue(value));
    }
    // Inserts a numeric place-holder, returning a callback that can
    // be used to asjust the value later
    writeUpdatableValue() {
        const offset = this.#data.length;
        this.#data.push(Padding);
        this.#dataLength += exports.WordSize;
        return (value) => {
            this.#data[offset] = getValue(value);
        };
    }
}
exports.Writer = Writer;
/**
 *  @_ignore
 */
class Reader {
    // Allows incomplete unpadded data to be read; otherwise an error
    // is raised if attempting to overrun the buffer. This is required
    // to deal with an old Solidity bug, in which event data for
    // external (not public thoguh) was tightly packed.
    allowLoose;
    #data;
    #offset;
    constructor(data, allowLoose) {
        (0, index_js_1.defineProperties)(this, { allowLoose: !!allowLoose });
        this.#data = (0, index_js_1.getBytesCopy)(data);
        this.#offset = 0;
    }
    get data() { return (0, index_js_1.hexlify)(this.#data); }
    get dataLength() { return this.#data.length; }
    get consumed() { return this.#offset; }
    get bytes() { return new Uint8Array(this.#data); }
    #peekBytes(offset, length, loose) {
        let alignedLength = Math.ceil(length / exports.WordSize) * exports.WordSize;
        if (this.#offset + alignedLength > this.#data.length) {
            if (this.allowLoose && loose && this.#offset + length <= this.#data.length) {
                alignedLength = length;
            }
            else {
                (0, index_js_1.assert)(false, "data out-of-bounds", "BUFFER_OVERRUN", {
                    buffer: (0, index_js_1.getBytesCopy)(this.#data),
                    length: this.#data.length,
                    offset: this.#offset + alignedLength
                });
            }
        }
        return this.#data.slice(this.#offset, this.#offset + alignedLength);
    }
    // Create a sub-reader with the same underlying data, but offset
    subReader(offset) {
        return new Reader(this.#data.slice(this.#offset + offset), this.allowLoose);
    }
    // Read bytes
    readBytes(length, loose) {
        let bytes = this.#peekBytes(0, length, !!loose);
        this.#offset += bytes.length;
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    }
    // Read a numeric values
    readValue() {
        return (0, index_js_1.toBigInt)(this.readBytes(exports.WordSize));
    }
    readIndex() {
        return (0, index_js_1.toNumber)(this.readBytes(exports.WordSize));
    }
}
exports.Reader = Reader;
//# sourceMappingURL=abstract-coder.js.map