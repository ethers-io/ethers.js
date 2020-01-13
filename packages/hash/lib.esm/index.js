"use strict";
import { concat, hexlify } from "@ethersproject/bytes";
import { nameprep, toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
///////////////////////////////
const Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const Partition = new RegExp("^((.*)\\.)?([^.]+)$");
export function isValidName(name) {
    try {
        const comps = name.split(".");
        for (let i = 0; i < comps.length; i++) {
            if (nameprep(comps[i]).length === 0) {
                throw new Error("empty");
            }
        }
        return true;
    }
    catch (error) { }
    return false;
}
export function namehash(name) {
    if (typeof (name) !== "string") {
        logger.throwArgumentError("invalid address - " + String(name), "name", name);
    }
    let result = Zeros;
    while (name.length) {
        const partition = name.match(Partition);
        const label = toUtf8Bytes(nameprep(partition[3]));
        result = keccak256(concat([result, keccak256(label)]));
        name = partition[2] || "";
    }
    return hexlify(result);
}
export function id(text) {
    return keccak256(toUtf8Bytes(text));
}
export const messagePrefix = "\x19Ethereum Signed Message:\n";
export function hashMessage(message) {
    if (typeof (message) === "string") {
        message = toUtf8Bytes(message);
    }
    return keccak256(concat([
        toUtf8Bytes(messagePrefix),
        toUtf8Bytes(String(message.length)),
        message
    ]));
}
