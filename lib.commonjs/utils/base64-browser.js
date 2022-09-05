"use strict";
// utils/base64-browser
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64 = exports.decodeBase64 = void 0;
const logger_js_1 = require("./logger.js");
function decodeBase64(textData) {
    textData = atob(textData);
    const data = new Uint8Array(textData.length);
    for (let i = 0; i < textData.length; i++) {
        data[i] = textData.charCodeAt(i);
    }
    return logger_js_1.logger.getBytes(data);
}
exports.decodeBase64 = decodeBase64;
function encodeBase64(_data) {
    const data = logger_js_1.logger.getBytes(_data);
    let textData = "";
    for (let i = 0; i < data.length; i++) {
        textData += String.fromCharCode(data[i]);
    }
    return btoa(textData);
}
exports.encodeBase64 = encodeBase64;
//# sourceMappingURL=base64-browser.js.map