"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreate2Address = exports.getCreateAddress = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../utils/index.js");
const address_js_1 = require("./address.js");
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getCreateAddress(tx) {
    const from = (0, address_js_1.getAddress)(tx.from);
    const nonce = (0, index_js_2.getBigInt)(tx.nonce, "tx.nonce");
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
    return (0, address_js_1.getAddress)((0, index_js_2.dataSlice)((0, index_js_1.keccak256)((0, index_js_2.encodeRlp)([from, nonceHex])), 12));
}
exports.getCreateAddress = getCreateAddress;
function getCreate2Address(_from, _salt, _initCodeHash) {
    const from = (0, address_js_1.getAddress)(_from);
    const salt = (0, index_js_2.getBytes)(_salt, "salt");
    const initCodeHash = (0, index_js_2.getBytes)(_initCodeHash, "initCodeHash");
    if (salt.length !== 32) {
        (0, index_js_2.throwArgumentError)("salt must be 32 bytes", "salt", _salt);
    }
    if (initCodeHash.length !== 32) {
        (0, index_js_2.throwArgumentError)("initCodeHash must be 32 bytes", "initCodeHash", _initCodeHash);
    }
    return (0, address_js_1.getAddress)((0, index_js_2.dataSlice)((0, index_js_1.keccak256)((0, index_js_2.concat)(["0xff", from, salt, initCodeHash])), 12));
}
exports.getCreate2Address = getCreate2Address;
//# sourceMappingURL=contract-address.js.map