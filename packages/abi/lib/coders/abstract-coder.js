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
var _Result_instances, _Result_indices, _Result_throwError, _Writer_instances, _Writer_data, _Writer_dataLength, _Writer_writeData, _Reader_instances, _Reader_data, _Reader_offset, _Reader_coerceFunc, _Reader_peekBytes;
import { toArray, toBigInt, toNumber } from "@ethersproject/math";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { defineProperties } from "@ethersproject/properties";
import { logger } from "../logger.js";
export const WordSize = 32;
const Padding = new Uint8Array(WordSize);
// Properties used to immediate pass through to the underlying object
// - `then` is used to detect if an object is a Promise for await
const passProperties = ["then"];
const _guard = {};
export class Result extends Array {
    constructor(guard, items, keys) {
        logger.assertPrivate(guard, _guard, "Result");
        super(...items);
        _Result_instances.add(this);
        _Result_indices.set(this, void 0);
        // Name lookup table
        __classPrivateFieldSet(this, _Result_indices, new Map(), "f");
        if (keys) {
            keys.forEach((key, index) => {
                if (key == null) {
                    return;
                }
                if (__classPrivateFieldGet(this, _Result_indices, "f").has(key)) {
                    (__classPrivateFieldGet(this, _Result_indices, "f").get(key)).push(index);
                }
                else {
                    __classPrivateFieldGet(this, _Result_indices, "f").set(key, [index]);
                }
            });
        }
        Object.freeze(this);
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof (prop) === "string") {
                    if (prop.match(/^[0-9]+$/)) {
                        const index = logger.getNumber(prop, "%index");
                        if (index < 0 || index >= this.length) {
                            throw new RangeError("out of result range");
                        }
                        const item = target[index];
                        if (item instanceof Error) {
                            __classPrivateFieldGet(this, _Result_instances, "m", _Result_throwError).call(this, `index ${index}`, item);
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
    getValue(name) {
        const index = __classPrivateFieldGet(this, _Result_indices, "f").get(name);
        if (index != null && index.length === 1) {
            const item = this[index[0]];
            if (item instanceof Error) {
                __classPrivateFieldGet(this, _Result_instances, "m", _Result_throwError).call(this, `property ${JSON.stringify(name)}`, item);
            }
            return item;
        }
        throw new Error(`no named parameter: ${JSON.stringify(name)}`);
    }
    static fromItems(items, keys) {
        return new Result(_guard, items, keys);
    }
}
_Result_indices = new WeakMap(), _Result_instances = new WeakSet(), _Result_throwError = function _Result_throwError(name, error) {
    const wrapped = new Error(`deferred error during ABI decoding triggered accessing ${name}`);
    wrapped.error = error;
    throw wrapped;
};
export function checkResultErrors(result) {
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
function getValue(value) {
    let bytes = toArray(value);
    if (bytes.length > WordSize) {
        logger.throwError("value out-of-bounds", "BUFFER_OVERRUN", {
            buffer: bytes,
            length: WordSize,
            offset: bytes.length
        });
    }
    if (bytes.length % WordSize) {
        bytes = arrayify(concat([Padding.slice(bytes.length % WordSize), bytes]));
    }
    return bytes;
}
export class Coder {
    constructor(name, type, localName, dynamic) {
        defineProperties(this, { name, type, localName, dynamic }, {
            name: "string", type: "string", localName: "string", dynamic: "boolean"
        });
    }
    _throwError(message, value) {
        return logger.throwArgumentError(message, this.localName, value);
    }
}
export class Writer {
    constructor() {
        _Writer_instances.add(this);
        // An array of WordSize lengthed objects to concatenation
        _Writer_data.set(this, void 0);
        _Writer_dataLength.set(this, void 0);
        __classPrivateFieldSet(this, _Writer_data, [], "f");
        __classPrivateFieldSet(this, _Writer_dataLength, 0, "f");
    }
    get data() {
        return concat(__classPrivateFieldGet(this, _Writer_data, "f"));
    }
    get length() { return __classPrivateFieldGet(this, _Writer_dataLength, "f"); }
    appendWriter(writer) {
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, arrayify(writer.data));
    }
    // Arrayish item; pad on the right to *nearest* WordSize
    writeBytes(value) {
        let bytes = arrayify(value);
        const paddingOffset = bytes.length % WordSize;
        if (paddingOffset) {
            bytes = arrayify(concat([bytes, Padding.slice(paddingOffset)]));
        }
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, bytes);
    }
    // Numeric item; pad on the left *to* WordSize
    writeValue(value) {
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, getValue(value));
    }
    // Inserts a numeric place-holder, returning a callback that can
    // be used to asjust the value later
    writeUpdatableValue() {
        const offset = __classPrivateFieldGet(this, _Writer_data, "f").length;
        __classPrivateFieldGet(this, _Writer_data, "f").push(Padding);
        __classPrivateFieldSet(this, _Writer_dataLength, __classPrivateFieldGet(this, _Writer_dataLength, "f") + WordSize, "f");
        return (value) => {
            __classPrivateFieldGet(this, _Writer_data, "f")[offset] = getValue(value);
        };
    }
}
_Writer_data = new WeakMap(), _Writer_dataLength = new WeakMap(), _Writer_instances = new WeakSet(), _Writer_writeData = function _Writer_writeData(data) {
    __classPrivateFieldGet(this, _Writer_data, "f").push(data);
    __classPrivateFieldSet(this, _Writer_dataLength, __classPrivateFieldGet(this, _Writer_dataLength, "f") + data.length, "f");
    return data.length;
};
export class Reader {
    constructor(data, coerceFunc, allowLoose) {
        _Reader_instances.add(this);
        _Reader_data.set(this, void 0);
        _Reader_offset.set(this, void 0);
        _Reader_coerceFunc.set(this, void 0);
        defineProperties(this, { allowLoose: !!allowLoose });
        __classPrivateFieldSet(this, _Reader_data, arrayify(data), "f");
        __classPrivateFieldSet(this, _Reader_coerceFunc, coerceFunc || Reader.coerce, "f");
        __classPrivateFieldSet(this, _Reader_offset, 0, "f");
    }
    get data() { return hexlify(__classPrivateFieldGet(this, _Reader_data, "f")); }
    get dataLength() { return __classPrivateFieldGet(this, _Reader_data, "f").length; }
    get consumed() { return __classPrivateFieldGet(this, _Reader_offset, "f"); }
    get bytes() { return new Uint8Array(__classPrivateFieldGet(this, _Reader_data, "f")); }
    // The default Coerce function
    static coerce(type, value) {
        let match = type.match("^u?int([0-9]+)$");
        if (match && parseInt(match[1]) <= 48) {
            value = value.toNumber();
        }
        return value;
    }
    coerce(type, value) {
        return __classPrivateFieldGet(this, _Reader_coerceFunc, "f").call(this, type, value);
    }
    // Create a sub-reader with the same underlying data, but offset
    subReader(offset) {
        return new Reader(__classPrivateFieldGet(this, _Reader_data, "f").slice(__classPrivateFieldGet(this, _Reader_offset, "f") + offset), __classPrivateFieldGet(this, _Reader_coerceFunc, "f"), this.allowLoose);
    }
    // Read bytes
    readBytes(length, loose) {
        let bytes = __classPrivateFieldGet(this, _Reader_instances, "m", _Reader_peekBytes).call(this, 0, length, !!loose);
        __classPrivateFieldSet(this, _Reader_offset, __classPrivateFieldGet(this, _Reader_offset, "f") + bytes.length, "f");
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    }
    // Read a numeric values
    readValue() {
        return toBigInt(this.readBytes(WordSize));
    }
    readIndex() {
        return toNumber(this.readBytes(WordSize));
    }
}
_Reader_data = new WeakMap(), _Reader_offset = new WeakMap(), _Reader_coerceFunc = new WeakMap(), _Reader_instances = new WeakSet(), _Reader_peekBytes = function _Reader_peekBytes(offset, length, loose) {
    let alignedLength = Math.ceil(length / WordSize) * WordSize;
    if (__classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength > __classPrivateFieldGet(this, _Reader_data, "f").length) {
        if (this.allowLoose && loose && __classPrivateFieldGet(this, _Reader_offset, "f") + length <= __classPrivateFieldGet(this, _Reader_data, "f").length) {
            alignedLength = length;
        }
        else {
            logger.throwError("data out-of-bounds", "BUFFER_OVERRUN", {
                buffer: arrayify(__classPrivateFieldGet(this, _Reader_data, "f")),
                length: __classPrivateFieldGet(this, _Reader_data, "f").length,
                offset: __classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength
            });
        }
    }
    return __classPrivateFieldGet(this, _Reader_data, "f").slice(__classPrivateFieldGet(this, _Reader_offset, "f"), __classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength);
};
//# sourceMappingURL=abstract-coder.js.map