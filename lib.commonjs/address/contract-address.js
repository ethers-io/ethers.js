"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreate2Address = exports.getCreateAddress = void 0;
const keccak_js_1 = require("../crypto/keccak.js");
const index_js_1 = require("../utils/index.js");
const address_js_1 = require("./address.js");
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getCreateAddress(tx) {
    const from = (0, address_js_1.getAddress)(tx.from);
    const nonce = index_js_1.logger.getBigInt(tx.nonce, "tx.nonce");
    let nonceHex = nonce.toString(16);
    if (nonceHex === "0") {
        nonceHex = "0x";
    }
    else if (nonceHex.length % 2) {
        nonceHex = "0x0" + nonceHex;
    }
    else {
        nonceHex = "0x" + nonceHex;
    }
    return (0, address_js_1.getAddress)((0, index_js_1.dataSlice)((0, keccak_js_1.keccak256)((0, index_js_1.encodeRlp)([from, nonceHex])), 12));
}
exports.getCreateAddress = getCreateAddress;
function getCreate2Address(_from, _salt, _initCodeHash) {
    const from = (0, address_js_1.getAddress)(_from);
    const salt = index_js_1.logger.getBytes(_salt, "salt");
    const initCodeHash = index_js_1.logger.getBytes(_initCodeHash, "initCodeHash");
    if (salt.length !== 32) {
        index_js_1.logger.throwArgumentError("salt must be 32 bytes", "salt", _salt);
    }
    if (initCodeHash.length !== 32) {
        index_js_1.logger.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", _initCodeHash);
    }
    return (0, address_js_1.getAddress)((0, index_js_1.dataSlice)((0, keccak_js_1.keccak256)((0, index_js_1.concat)(["0xff", from, salt, initCodeHash])), 12));
}
exports.getCreate2Address = getCreate2Address;
//# sourceMappingURL=contract-address.js.map