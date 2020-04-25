"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var bignumber_1 = require("@ethersproject/bignumber");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("../_version");
var logger = new logger_1.Logger(_version_1.version);
function checkResultErrors(result) {
    // Find the first error (if any)
    var errors = [];
    var checkErrors = function (path, object) {
        if (!Array.isArray(object)) {
            return;
        }
        for (var key in object) {
            var childPath = path.slice();
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
var Coder = /** @class */ (function () {
    function Coder(name, type, localName, dynamic) {
        // @TODO: defineReadOnly these
        this.name = name;
        this.type = type;
        this.localName = localName;
        this.dynamic = dynamic;
    }
    Coder.prototype._throwError = function (message, value) {
        logger.throwArgumentError(message, this.localName, value);
    };
    return Coder;
}());
exports.Coder = Coder;
var Writer = /** @class */ (function () {
    function Writer(wordSize) {
        properties_1.defineReadOnly(this, "wordSize", wordSize || 32);
        this._data = bytes_1.arrayify([]);
        this._padding = new Uint8Array(wordSize);
    }
    Object.defineProperty(Writer.prototype, "data", {
        get: function () { return bytes_1.hexlify(this._data); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Writer.prototype, "length", {
        get: function () { return this._data.length; },
        enumerable: true,
        configurable: true
    });
    Writer.prototype._writeData = function (data) {
        this._data = bytes_1.concat([this._data, data]);
        return data.length;
    };
    // Arrayish items; padded on the right to wordSize
    Writer.prototype.writeBytes = function (value) {
        var bytes = bytes_1.arrayify(value);
        if (bytes.length % this.wordSize) {
            bytes = bytes_1.concat([bytes, this._padding.slice(bytes.length % this.wordSize)]);
        }
        return this._writeData(bytes);
    };
    Writer.prototype._getValue = function (value) {
        var bytes = bytes_1.arrayify(bignumber_1.BigNumber.from(value));
        if (bytes.length > this.wordSize) {
            logger.throwError("value out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
                length: this.wordSize,
                offset: bytes.length
            });
        }
        if (bytes.length % this.wordSize) {
            bytes = bytes_1.concat([this._padding.slice(bytes.length % this.wordSize), bytes]);
        }
        return bytes;
    };
    // BigNumberish items; padded on the left to wordSize
    Writer.prototype.writeValue = function (value) {
        return this._writeData(this._getValue(value));
    };
    Writer.prototype.writeUpdatableValue = function () {
        var _this = this;
        var offset = this.length;
        this.writeValue(0);
        return function (value) {
            _this._data.set(_this._getValue(value), offset);
        };
    };
    return Writer;
}());
exports.Writer = Writer;
var Reader = /** @class */ (function () {
    function Reader(data, wordSize, coerceFunc) {
        properties_1.defineReadOnly(this, "_data", bytes_1.arrayify(data));
        properties_1.defineReadOnly(this, "wordSize", wordSize || 32);
        properties_1.defineReadOnly(this, "_coerceFunc", coerceFunc);
        this._offset = 0;
    }
    Object.defineProperty(Reader.prototype, "data", {
        get: function () { return bytes_1.hexlify(this._data); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reader.prototype, "consumed", {
        get: function () { return this._offset; },
        enumerable: true,
        configurable: true
    });
    // The default Coerce function
    Reader.coerce = function (name, value) {
        var match = name.match("^u?int([0-9]+)$");
        if (match && parseInt(match[1]) <= 48) {
            value = value.toNumber();
        }
        return value;
    };
    Reader.prototype.coerce = function (name, value) {
        if (this._coerceFunc) {
            return this._coerceFunc(name, value);
        }
        return Reader.coerce(name, value);
    };
    Reader.prototype._peekBytes = function (offset, length) {
        var alignedLength = Math.ceil(length / this.wordSize) * this.wordSize;
        if (this._offset + alignedLength > this._data.length) {
            logger.throwError("data out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
                length: this._data.length,
                offset: this._offset + alignedLength
            });
        }
        return this._data.slice(this._offset, this._offset + alignedLength);
    };
    Reader.prototype.subReader = function (offset) {
        return new Reader(this._data.slice(this._offset + offset), this.wordSize, this._coerceFunc);
    };
    Reader.prototype.readBytes = function (length) {
        var bytes = this._peekBytes(0, length);
        this._offset += bytes.length;
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    };
    Reader.prototype.readValue = function () {
        return bignumber_1.BigNumber.from(this.readBytes(this.wordSize));
    };
    return Reader;
}());
exports.Reader = Reader;
