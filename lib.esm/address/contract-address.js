import { keccak256 } from "../crypto/index.js";
import { concat, dataSlice, getBigInt, getBytes, encodeRlp, throwArgumentError } from "../utils/index.js";
import { getAddress } from "./address.js";
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
export function getCreateAddress(tx) {
    const from = getAddress(tx.from);
    const nonce = getBigInt(tx.nonce, "tx.nonce");
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
    return getAddress(dataSlice(keccak256(encodeRlp([from, nonceHex])), 12));
}
export function getCreate2Address(_from, _salt, _initCodeHash) {
    const from = getAddress(_from);
    const salt = getBytes(_salt, "salt");
    const initCodeHash = getBytes(_initCodeHash, "initCodeHash");
    if (salt.length !== 32) {
        throwArgumentError("salt must be 32 bytes", "salt", _salt);
    }
    if (initCodeHash.length !== 32) {
        throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", _initCodeHash);
    }
    return getAddress(dataSlice(keccak256(concat(["0xff", from, salt, initCodeHash])), 12));
}
//# sourceMappingURL=contract-address.js.map