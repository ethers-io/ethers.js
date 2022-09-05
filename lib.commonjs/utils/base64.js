"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64 = exports.decodeBase64 = void 0;
const logger_js_1 = require("./logger.js");
function decodeBase64(textData) {
    return logger_js_1.logger.getBytesCopy(Buffer.from(textData, "base64"));
}
exports.decodeBase64 = decodeBase64;
;
function encodeBase64(data) {
    return Buffer.from(logger_js_1.logger.getBytes(data)).toString("base64");
}
exports.encodeBase64 = encodeBase64;
//# sourceMappingURL=base64.js.map