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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors = __importStar(require("@ethersproject/errors"));
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
        errors.throwError("invalid tuple value", errors.INVALID_ARGUMENT, {
            coderType: "tuple",
            value: values
        });
    }
    if (coders.length !== values.length) {
        errors.throwError("types/value length mismatch", errors.INVALID_ARGUMENT, {
            coderType: "tuple",
            value: values
        });
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
            value = coder.decode(offsetReader);
            dynamicLength += offsetReader.consumed;
        }
        else {
            value = coder.decode(reader);
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
        values[name] = values[index];
    });
    return values;
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
        //let result = new Uint8Array(0);
        if (count === -1) {
            count = value.length;
            writer.writeValue(value.length);
        }
        errors.checkArgumentCount(count, value.length, " in coder array" + (this.localName ? (" " + this.localName) : ""));
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
