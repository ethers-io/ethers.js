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
var bytes_1 = require("@ethersproject/bytes");
var abstract_coder_1 = require("./abstract-coder");
var DynamicBytesCoder = /** @class */ (function (_super) {
    __extends(DynamicBytesCoder, _super);
    function DynamicBytesCoder(type, localName) {
        return _super.call(this, type, type, localName, true) || this;
    }
    DynamicBytesCoder.prototype.encode = function (writer, value) {
        value = bytes_1.arrayify(value);
        var length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    };
    DynamicBytesCoder.prototype.decode = function (reader) {
        return reader.readBytes(reader.readValue().toNumber(), true);
    };
    return DynamicBytesCoder;
}(abstract_coder_1.Coder));
exports.DynamicBytesCoder = DynamicBytesCoder;
var BytesCoder = /** @class */ (function (_super) {
    __extends(BytesCoder, _super);
    function BytesCoder(localName) {
        return _super.call(this, "bytes", localName) || this;
    }
    BytesCoder.prototype.decode = function (reader) {
        return reader.coerce(this.name, bytes_1.hexlify(_super.prototype.decode.call(this, reader)));
    };
    return BytesCoder;
}(DynamicBytesCoder));
exports.BytesCoder = BytesCoder;
//# sourceMappingURL=bytes.js.map