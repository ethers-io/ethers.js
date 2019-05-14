"use strict";

import sha3 = require("js-sha3");

import { arrayify, BytesLike } from "@ethersproject/bytes";

export function keccak256(data: BytesLike): string {
    return '0x' + sha3.keccak_256(arrayify(data));
}
