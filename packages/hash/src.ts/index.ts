"use strict";

// @TODO: Migrate this to a better named package...

import * as errors from "@ethersproject/errors";

import { Bytes, concat, hexlify } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";

///////////////////////////////

const Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const Partition = new RegExp("^((.*)\\.)?([^.]+)$");
const UseSTD3ASCIIRules = new RegExp("^[a-z0-9.-]*$");

export function namehash(name: string): string {
    if (typeof(name) !== "string") {
        errors.throwError("invalid address - " + String(name), errors.INVALID_ARGUMENT, {
            argument: "name",
            value: name
        });
    }

    name = name.toLowerCase();

    // Supporting the full UTF-8 space requires additional (and large)
    // libraries, so for now we simply do not support them.
    // It should be fairly easy in the future to support systems with
    // String.normalize, but that is future work.
    if (!name.match(UseSTD3ASCIIRules)) {
        errors.throwError("contains invalid UseSTD3ASCIIRules characters", errors.INVALID_ARGUMENT, {
            argument: "name",
            value: name
        });
    }

    let result: string | Uint8Array = Zeros;
    while (name.length) {
        let partition = name.match(Partition);
        let label = toUtf8Bytes(partition[3]);
        result = keccak256(concat([result, keccak256(label)]));

        name = partition[2] || "";
    }

    return hexlify(result);
}


export function id(text: string): string {
    return keccak256(toUtf8Bytes(text));
}

export const messagePrefix = "\x19Ethereum Signed Message:\n";

export function hashMessage(message: Bytes | string): string {
    if (typeof(message) === "string") { message = toUtf8Bytes(message); }
    return keccak256(concat([
        toUtf8Bytes(messagePrefix),
        toUtf8Bytes(String(message.length)),
        message
    ]));
}
