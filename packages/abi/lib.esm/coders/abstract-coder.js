"use strict";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { BigNumber } from "@ethersproject/bignumber";
import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "../_version";
const logger = new Logger(version);
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
export class Coder {
    constructor(name, type, localName, dynamic) {
        // @TODO: defineReadOnly these
        this.name = name;
        this.type = type;
        this.localName = localName;
        this.dynamic = dynamic;
    }
    _throwError(message, value) {
        logger.throwArgumentError(message, this.localName, value);
    }
}
export class Writer {
    constructor(wordSize) {
        defineReadOnly(this, "wordSize", wordSize || 32);
        this._data = arrayify([]);
        this._padding = new Uint8Array(wordSize);
    }
    get data() { return hexlify(this._data); }
    get length() { return this._data.length; }
    _writeData(data) {
        this._data = concat([this._data, data]);
        return data.length;
    }
    // Arrayish items; padded on the right to wordSize
    writeBytes(value) {
        let bytes = arrayify(value);
        if (bytes.length % this.wordSize) {
            bytes = concat([bytes, this._padding.slice(bytes.length % this.wordSize)]);
        }
        return this._writeData(bytes);
    }
    _getValue(value) {
        let bytes = arrayify(BigNumber.from(value));
        if (bytes.length > this.wordSize) {
            logger.throwError("value out-of-bounds", Logger.errors.BUFFER_OVERRUN, {
                length: this.wordSize,
                offset: bytes.length
            });
        }
        if (bytes.length % this.wordSize) {
            bytes = concat([this._padding.slice(bytes.length % this.wordSize), bytes]);
        }
        return bytes;
    }
    // BigNumberish items; padded on the left to wordSize
    writeValue(value) {
        return this._writeData(this._getValue(value));
    }
    writeUpdatableValue() {
        let offset = this.length;
        this.writeValue(0);
        return (value) => {
            this._data.set(this._getValue(value), offset);
        };
    }
}
export class Reader {
    constructor(data, wordSize, coerceFunc) {
        defineReadOnly(this, "_data", arrayify(data));
        defineReadOnly(this, "wordSize", wordSize || 32);
        defineReadOnly(this, "_coerceFunc", coerceFunc);
        this._offset = 0;
    }
    get data() { return hexlify(this._data); }
    get consumed() { return this._offset; }
    // The default Coerce function
    static coerce(name, value) {
        let match = name.match("^u?int([0-9]+)$");
        if (match && parseInt(match[1]) <= 48) {
            value = value.toNumber();
        }
        return value;
    }
    coerce(name, value) {
        if (this._coerceFunc) {
            return this._coerceFunc(name, value);
        }
        return Reader.coerce(name, value);
    }
    _peekBytes(offset, length) {
        let alignedLength = Math.ceil(length / this.wordSize) * this.wordSize;
        if (this._offset + alignedLength > this._data.length) {
            logger.throwError("data out-of-bounds", Logger.errors.BUFFER_OVERRUN, {
                length: this._data.length,
                offset: this._offset + alignedLength
            });
        }
        return this._data.slice(this._offset, this._offset + alignedLength);
    }
    subReader(offset) {
        return new Reader(this._data.slice(this._offset + offset), this.wordSize, this._coerceFunc);
    }
    readBytes(length) {
        let bytes = this._peekBytes(0, length);
        this._offset += bytes.length;
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    }
    readValue() {
        return BigNumber.from(this.readBytes(this.wordSize));
    }
}
