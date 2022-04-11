import { concat, hexlify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { nameprep, toUtf8Bytes } from "@ethersproject/strings";

import { logger } from "./logger.js";


const Zeros = new Uint8Array(32);
Zeros.fill(0);

const Partition = new RegExp("^((.*)\\.)?([^.]+)$");

export function isValidName(name: string): boolean {
    try {
        const comps = name.split(".");
        for (let i = 0; i < comps.length; i++) {
            if (nameprep(comps[i]).length === 0) {
                throw new Error("empty")
            }
        }
        return true;
    } catch (error) { }
    return false;
}

export function namehash(name: string): string {
    if (typeof(name) !== "string") {
        logger.throwArgumentError("invalid ENS name; not a string", "name", name);
    }

    let current = name;
    let result: string | Uint8Array = Zeros;
    while (current.length) {
        const partition = current.match(Partition);
        if (partition == null || partition[2] === "") {
            return logger.throwArgumentError("invalid ENS name; missing component", "name", name);
        }
        const label = toUtf8Bytes(nameprep(partition[3]));
        result = keccak256(concat([result, keccak256(label)]));

        current = partition[2] || "";
    }

    return hexlify(result);
}

export function dnsEncode(name: string): string {
    if (typeof(name) !== "string") {
        logger.throwArgumentError("invalid DNS name; not a string", "name", name);
    }

    if (name === "") { return "0x00"; }

    // @TODO: should we enforce the 255 octet limit?

    return concat(name.split(".").map((comp) => {
        if (comp === "") {
            logger.throwArgumentError("invalid DNS name; missing component", "name", name);
        }

        // We jam in an _ prefix to fill in with the length later
        // Note: Nameprep throws if the component is over 63 bytes
        const bytes = toUtf8Bytes("_" + nameprep(comp));

        bytes[0] = bytes.length - 1;
        return bytes;
    })) + "00";
}
