import { concat, hexlify } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { ens_normalize } from "./ens-normalize/lib";

const Zeros = new Uint8Array(32);
Zeros.fill(0);

const Partition = new RegExp("^((.*)\\.)?([^.]+)$");

export function isValidName(name: string): boolean {
    try {
        return ens_normalize(name).length !== 0;
    } catch (error) { }
    return false;
}

export function namehash(name: string): string {
    /* istanbul ignore if */
    if (typeof(name) !== "string") {
        logger.throwArgumentError("invalid ENS name; not a string", "name", name);
    }

    let current = ens_normalize(name);
    let result: string | Uint8Array = Zeros;
    while (current.length) {
        const partition = current.match(Partition);
        if (partition == null || partition[2] === "") {
            logger.throwArgumentError("invalid ENS address; missing component", "name", name);
        }
        const label = toUtf8Bytes(partition[3]);
        result = keccak256(concat([result, keccak256(label)]));

        current = partition[2] || "";
    }

    return hexlify(result);
}

export function dnsEncode(name: string): string {
    name = ens_normalize(name)
    return hexlify(concat(name.split(".").map((comp) => {

        // DNS does not allow components over 63 bytes in length
        if (toUtf8Bytes(comp).length > 63) {
            throw new Error("invalid DNS encoded entry; length exceeds 63 bytes");
        }

        // We jam in an _ prefix to fill in with the length later
        const bytes = toUtf8Bytes("_" + comp);
        bytes[0] = bytes.length - 1;
        return bytes;
    }))) + "00";
}
