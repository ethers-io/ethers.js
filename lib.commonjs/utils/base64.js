"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64 = exports.decodeBase64 = void 0;
const data_js_1 = require("./data.js");
/**
 *  Decodes the base-64 encoded %%base64Data%%.
 */
function decodeBase64(base64Data) {
    return (0, data_js_1.getBytesCopy)(Buffer.from(base64Data, "base64"));
}
exports.decodeBase64 = decodeBase64;
;
/**
 *  Encodes %%data%% as base-64 encoded data.
 */
function encodeBase64(data) {
    return Buffer.from((0, data_js_1.getBytes)(data)).toString("base64");
}
exports.encodeBase64 = encodeBase64;
//# sourceMappingURL=base64.js.map