"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashMessage = void 0;
const keccak_js_1 = require("../crypto/keccak.js");
const index_js_1 = require("../constants/index.js");
const index_js_2 = require("../utils/index.js");
function hashMessage(message) {
    if (typeof (message) === "string") {
        message = (0, index_js_2.toUtf8Bytes)(message);
    }
    return (0, keccak_js_1.keccak256)((0, index_js_2.concat)([
        (0, index_js_2.toUtf8Bytes)(index_js_1.MessagePrefix),
        (0, index_js_2.toUtf8Bytes)(String(message.length)),
        message
    ]));
}
exports.hashMessage = hashMessage;
//# sourceMappingURL=message.js.map