
import { toBigInt, toHex } from "./convert.js";
import { logger } from "./logger.js";

import type { BytesLike } from "@ethersproject/logger";


const Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
let Lookup: null | Record<string, bigint> = null;

function getAlpha(letter: string): bigint {
    if (Lookup == null) {
        Lookup = { };
        for (let i = 0; i < Alphabet.length; i++) {
            Lookup[Alphabet[i]] = BigInt(i);
        }
    }
    const result = Lookup[letter];
    if (result == null) {
        logger.throwArgumentError(`invalid base58 value`, "letter", letter);
    }
    return result;
}


const BN_0 = BigInt(0);
const BN_58 = BigInt(58);

export function encodeBase58(_value: BytesLike): string {
    let value = toBigInt(logger.getBytes(_value));
    let result = "";
    while (value) {
        result = Alphabet[Number(value % BN_58)] + result;
        value /= BN_58;
    }
    return result;
}

export function decodeBase58(value: string): string {
    let result = BN_0;
    for (let i = 0; i < value.length; i++) {
        result *= BN_58;
        result += getAlpha(value[i]);
    }
    return toHex(result);
}

