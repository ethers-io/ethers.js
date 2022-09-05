import { keccak256 } from "../crypto/keccak.js";
import { concat, dataSlice, encodeRlp, logger } from "../utils/index.js";

import { getAddress } from "./address.js";

import type { BigNumberish, BytesLike } from "../utils/index.js";


// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
export function getCreateAddress(tx: { from: string, nonce: BigNumberish }): string {
    const from = getAddress(tx.from);
    const nonce = logger.getBigInt(tx.nonce, "tx.nonce");

    let nonceHex = nonce.toString(16);
    if (nonceHex === "0") {
        nonceHex = "0x";
    } else if (nonceHex.length % 2) {
        nonceHex = "0x0" + nonceHex;
    } else {
        nonceHex = "0x" + nonceHex;
    }

    return getAddress(dataSlice(keccak256(encodeRlp([ from, nonceHex ])), 12));
}

export function getCreate2Address(_from: string, _salt: BytesLike, _initCodeHash: BytesLike): string {
    const from = getAddress(_from);
    const salt = logger.getBytes(_salt, "salt");
    const initCodeHash = logger.getBytes(_initCodeHash, "initCodeHash");

    if (salt.length !== 32) {
        logger.throwArgumentError("salt must be 32 bytes", "salt", _salt);
    }

    if (initCodeHash.length !== 32) {
        logger.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", _initCodeHash);
    }

    return getAddress(dataSlice(keccak256(concat([ "0xff", from, salt, initCodeHash ])), 12))
}
