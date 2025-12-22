"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKeynet = void 0;
function isKeynet(url) {
    const hostname = new URL(url).hostname;
    return hostname.toLowerCase().endsWith('.keynet');
}
exports.isKeynet = isKeynet;
//# sourceMappingURL=isKeynet.js.map