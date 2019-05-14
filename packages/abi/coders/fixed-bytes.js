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
// @TODO: Merge this with bytes
var FixedBytesCoder = /** @class */ (function (_super) {
    __extends(FixedBytesCoder, _super);
    function FixedBytesCoder(size, localName) {
        var _this = this;
        var name = "bytes" + String(size);
        _this = _super.call(this, name, name, localName, false) || this;
        _this.size = size;
        return _this;
    }
    FixedBytesCoder.prototype.encode = function (writer, value) {
        var data = bytes_1.arrayify(value);
        if (data.length !== this.size) {
            this._throwError("incorrect data length", value);
        }
        return writer.writeBytes(data);
    };
    FixedBytesCoder.prototype.decode = function (reader) {
        return reader.coerce(this.name, bytes_1.hexlify(reader.readBytes(this.size)));
    };
    return FixedBytesCoder;
}(abstract_coder_1.Coder));
exports.FixedBytesCoder = FixedBytesCoder;
