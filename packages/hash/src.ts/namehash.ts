import { concat, hexlify } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { ens_normalize } from "./ens-normalize/lib";

const Zeros = new Uint8Array(32);
Zeros.fill(0);

function ensNameSplit(name: string): Array<Uint8Array> {
    // the empty string is 0-labels
    // every label must be non-empty
    if (!name) return []; // note: "".split('.') === [""]
    return ens_normalize(name).split('.').map(x => toUtf8Bytes(x));
}

export function ensNormalize(name: string): string {
    return ens_normalize(name);
}

export function isValidName(name: string): boolean {
    // there must be 1+ labels
    // every labels must be non-empty
    try {
        return !!ens_normalize(name);
    } catch { }
    return false;
}

export function namehash(name: string): string {
    /* istanbul ignore if */
    if (typeof(name) !== "string") {
        logger.throwArgumentError("invalid ENS name; not a string", "name", name);
    }

    let result: string | Uint8Array = Zeros;

    const comps = ensNameSplit(name);
    while (comps.length) {
        result = keccak256(concat([result, keccak256(comps.pop())]));
    }

    return hexlify(result);
}

export function dnsEncode(name: string, max?: number): string {
    if ((max & 255) !== max) max = 63; // max must be exactly 1 byte else 63 (old default)
    return hexlify(concat(ensNameSplit(name).map((comp) => {
        if (comp.length > max) {
            throw new Error(`invalid DNS encoded entry; length exceeds ${max} bytes`);
        }
        const bytes = new Uint8Array(comp.length + 1);
        bytes[0] = comp.length;
        bytes.set(comp, 1);
        return bytes;
    }))) + "00";
}
