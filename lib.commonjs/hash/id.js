"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.id = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../utils/index.js");
function id(value) {
    return (0, index_js_1.keccak256)((0, index_js_2.toUtf8Bytes)(value));
}
exports.id = id;
//# sourceMappingURL=id.js.map