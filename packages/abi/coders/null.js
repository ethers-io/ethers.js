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
var abstract_coder_1 = require("./abstract-coder");
var NullCoder = /** @class */ (function (_super) {
    __extends(NullCoder, _super);
    function NullCoder(localName) {
        return _super.call(this, "null", "", localName, false) || this;
    }
    NullCoder.prototype.encode = function (writer, value) {
        if (value != null) {
            this._throwError("not null", value);
        }
        return writer.writeBytes([]);
    };
    NullCoder.prototype.decode = function (reader) {
        reader.readBytes(0);
        return reader.coerce(this.name, null);
    };
    return NullCoder;
}(abstract_coder_1.Coder));
exports.NullCoder = NullCoder;
