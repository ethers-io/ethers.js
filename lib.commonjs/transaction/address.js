"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverAddress = exports.computeAddress = void 0;
const index_js_1 = require("../address/index.js");
const index_js_2 = require("../crypto/index.js");
function computeAddress(key) {
    const publicKey = index_js_2.SigningKey.computePublicKey(key, false);
    return (0, index_js_1.getAddress)((0, index_js_2.keccak256)("0x" + publicKey.substring(4)).substring(26));
}
exports.computeAddress = computeAddress;
function recoverAddress(digest, signature) {
    return computeAddress(index_js_2.SigningKey.recoverPublicKey(digest, signature));
}
exports.recoverAddress = recoverAddress;
//# sourceMappingURL=address.js.map