"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("../_version");
var logger = new logger_1.Logger(_version_1.version);
var abstract_coder_1 = require("./abstract-coder");
var anonymous_1 = require("./anonymous");
function pack(writer, coders, values) {
    if (Array.isArray(values)) {
        // do nothing
    }
    else if (values && typeof (values) === "object") {
        var arrayValues_1 = [];
        coders.forEach(function (coder) {
            arrayValues_1.push(values[coder.localName]);
        });
        values = arrayValues_1;
    }
    else {
        logger.throwArgumentError("invalid tuple value", "tuple", values);
    }
    if (coders.length !== values.length) {
        logger.throwArgumentError("types/value length mismatch", "tuple", values);
    }
    var staticWriter = new abstract_coder_1.Writer(writer.wordSize);
    var dynamicWriter = new abstract_coder_1.Writer(writer.wordSize);
    var updateFuncs = [];
    coders.forEach(function (coder, index) {
        var value = values[index];
        if (coder.dynamic) {
            // Get current dynamic offset (for the future pointer)
            var dynamicOffset_1 = dynamicWriter.length;
            // Encode the dynamic value into the dynamicWriter
            coder.encode(dynamicWriter, value);
            // Prepare to populate the correct offset once we are done
            var updateFunc_1 = staticWriter.writeUpdatableValue();
            updateFuncs.push(function (baseOffset) {
                updateFunc_1(baseOffset + dynamicOffset_1);
            });
        }
        else {
            coder.encode(staticWriter, value);
        }
    });
    // Backfill all the dynamic offsets, now that we know the static length
    updateFuncs.forEach(function (func) { func(staticWriter.length); });
    var length = writer.writeBytes(staticWriter.data);
    length += writer.writeBytes(dynamicWriter.data);
    return length;
}
exports.pack = pack;
function unpack(reader, coders) {
    var values = [];
    // A reader anchored to this base
    var baseReader = reader.subReader(0);
    // The amount of dynamic data read; to consume later to synchronize
    var dynamicLength = 0;
    coders.forEach(function (coder) {
        var value = null;
        if (coder.dynamic) {
            var offset = reader.readValue();
            var offsetReader = baseReader.subReader(offset.toNumber());
            try {
                value = coder.decode(offsetReader);
            }
            catch (error) {
                // Cannot recover from this
                if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
                    throw error;
                }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
            dynamicLength += offsetReader.consumed;
        }
        else {
            try {
                value = coder.decode(reader);
            }
            catch (error) {
                // Cannot recover from this
                if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
                    throw error;
                }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
        }
        if (value != undefined) {
            values.push(value);
        }
    });
    // @TODO: get rid of this an see if it still works?
    // Consume the dynamic components in the main reader
    reader.readBytes(dynamicLength);
    // Add any named parameters (i.e. tuples)
    coders.forEach(function (coder, index) {
        var name = coder.localName;
        if (!name) {
            return;
        }
        if (name === "length") {
            name = "_length";
        }
        if (values[name] != null) {
            return;
        }
        var value = values[index];
        if (value instanceof Error) {
            Object.defineProperty(values, name, {
                get: function () { throw value; }
            });
        }
        else {
            values[name] = value;
        }
    });
    var _loop_1 = function (i) {
        var value = values[i];
        if (value instanceof Error) {
            Object.defineProperty(values, i, {
                get: function () { throw value; }
            });
        }
    };
    for (var i = 0; i < values.length; i++) {
        _loop_1(i);
    }
    return Object.freeze(values);
}
exports.unpack = unpack;
var ArrayCoder = /** @class */ (function (_super) {
    __extends(ArrayCoder, _super);
    function ArrayCoder(coder, length, localName) {
        var _this = this;
        var type = (coder.type + "[" + (length >= 0 ? length : "") + "]");
        var dynamic = (length === -1 || coder.dynamic);
        _this = _super.call(this, "array", type, localName, dynamic) || this;
        _this.coder = coder;
        _this.length = length;
        return _this;
    }
    ArrayCoder.prototype.encode = function (writer, value) {
        if (!Array.isArray(value)) {
            this._throwError("expected array value", value);
        }
        var count = this.length;
        if (count === -1) {
            count = value.length;
            writer.writeValue(value.length);
        }
        logger.checkArgumentCount(count, value.length, "coder array" + (this.localName ? (" " + this.localName) : ""));
        var coders = [];
        for (var i = 0; i < value.length; i++) {
            coders.push(this.coder);
        }
        return pack(writer, coders, value);
    };
    ArrayCoder.prototype.decode = function (reader) {
        var count = this.length;
        if (count === -1) {
            count = reader.readValue().toNumber();
        }
        var coders = [];
        for (var i = 0; i < count; i++) {
            coders.push(new anonymous_1.AnonymousCoder(this.coder));
        }
        return reader.coerce(this.name, unpack(reader, coders));
    };
    return ArrayCoder;
}(abstract_coder_1.Coder));
exports.ArrayCoder = ArrayCoder;
