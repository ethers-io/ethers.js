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
var BooleanCoder = /** @class */ (function (_super) {
    __extends(BooleanCoder, _super);
    function BooleanCoder(localName) {
        return _super.call(this, "bool", "bool", localName, false) || this;
    }
    BooleanCoder.prototype.encode = function (writer, value) {
        return writer.writeValue(value ? 1 : 0);
    };
    BooleanCoder.prototype.decode = function (reader) {
        return reader.coerce(this.type, !reader.readValue().isZero());
    };
    return BooleanCoder;
}(abstract_coder_1.Coder));
exports.BooleanCoder = BooleanCoder;
//# sourceMappingURL=boolean.js.map