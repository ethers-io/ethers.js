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
var strings_1 = require("@ethersproject/strings");
var bytes_1 = require("./bytes");
var StringCoder = /** @class */ (function (_super) {
    __extends(StringCoder, _super);
    function StringCoder(localName) {
        return _super.call(this, "string", localName) || this;
    }
    StringCoder.prototype.defaultValue = function () {
        return "";
    };
    StringCoder.prototype.encode = function (writer, value) {
        return _super.prototype.encode.call(this, writer, strings_1.toUtf8Bytes(value));
    };
    StringCoder.prototype.decode = function (reader) {
        return strings_1.toUtf8String(_super.prototype.decode.call(this, reader));
    };
    return StringCoder;
}(bytes_1.DynamicBytesCoder));
exports.StringCoder = StringCoder;
//# sourceMappingURL=string.js.map