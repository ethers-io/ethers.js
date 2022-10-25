
import { getBytes } from "./data.js";
import { assertArgument } from "./errors.js";
import { toBigInt, toHex } from "./maths.js";

import type { BytesLike } from "./index.js";


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
    assertArgument(result != null, `invalid base58 value`, "letter", letter);
    return result;
}


const BN_0 = BigInt(0);
const BN_58 = BigInt(58);

/**
 *  Encode %%value%% as Base58-encoded data.
 */
export function encodeBase58(_value: BytesLike): string {
    let value = toBigInt(getBytes(_value));
    let result = "";
    while (value) {
        result = Alphabet[Number(value % BN_58)] + result;
        value /= BN_58;
    }
    return result;
}

/**
 *  Decode the Base58-encoded %%value%%.
 */
export function decodeBase58(value: string): Uint8Array {
    let result = BN_0;
    for (let i = 0; i < value.length; i++) {
        result *= BN_58;
        result += getAlpha(value[i]);
    }
    return getBytes(toHex(result));
}
