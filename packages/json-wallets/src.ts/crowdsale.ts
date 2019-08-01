"use strict";

import aes from "aes-js";

import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { getAddress } from "@ethersproject/address";
import { arrayify, Bytes } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { pbkdf2 } from "@ethersproject/pbkdf2";
import { toUtf8Bytes } from "@ethersproject/strings";
import { Description } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { getPassword, looseArrayify, searchPath } from "./utils";

export class CrowdsaleAccount extends Description implements ExternallyOwnedAccount {
    readonly address: string;
    readonly privateKey: string;
    readonly mnemonic?: string;
    readonly path?: string;

    readonly _isCrowdsaleAccount: boolean;

    isCrowdsaleAccount(value: any): value is CrowdsaleAccount {
        return !!(value && value._isCrowdsaleAccount);
    }
}

// See: https://github.com/ethereum/pyethsaletool
export function decrypt(json: string, password: Bytes | string): ExternallyOwnedAccount {
    let data = JSON.parse(json);

    password = getPassword(password);

    // Ethereum Address
    let ethaddr = getAddress(searchPath(data, "ethaddr"));

    // Encrypted Seed
    let encseed = looseArrayify(searchPath(data, "encseed"));
    if (!encseed || (encseed.length % 16) !== 0) {
        logger.throwArgumentError("invalid encseed", "json", json);
    }

    let key = arrayify(pbkdf2(password, password, 2000, 32, "sha256")).slice(0, 16);

    let iv = encseed.slice(0, 16);
    let encryptedSeed = encseed.slice(16);

    // Decrypt the seed
    let aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    let seed = arrayify(aesCbc.decrypt(encryptedSeed));
    seed = aes.padding.pkcs7.strip(seed);

    // This wallet format is weird... Convert the binary encoded hex to a string.
    let seedHex = "";
    for (let i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }

    let seedHexBytes = toUtf8Bytes(seedHex);

    let privateKey = keccak256(seedHexBytes);

    return new CrowdsaleAccount ({
        _isCrowdsaleAccount: true,
        address: ethaddr,
        privateKey: privateKey
    });
}

