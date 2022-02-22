"use strict";

import { Bytes } from "@ethersproject/bytes";
import { ExternallyOwnedAccount } from "@hethers/abstract-signer";

import { getJsonWalletAddress, isKeystoreWallet } from "./inspect";
import { decrypt as decryptKeystore, decryptSync as decryptKeystoreSync, encrypt as encryptKeystore, EncryptOptions, ProgressCallback } from "./keystore";

function decryptJsonWallet(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<ExternallyOwnedAccount> {
    if (isKeystoreWallet(json)) {
        return decryptKeystore(json, password, progressCallback);
    }

    return Promise.reject(new Error("invalid JSON wallet"));
}

function decryptJsonWalletSync(json: string, password: Bytes | string): ExternallyOwnedAccount {
    if (isKeystoreWallet(json)) {
        return decryptKeystoreSync(json, password);
    }

    throw new Error("invalid JSON wallet");
}

export {
    decryptKeystore,
    decryptKeystoreSync,
    encryptKeystore,

    isKeystoreWallet,
    getJsonWalletAddress,

    decryptJsonWallet,
    decryptJsonWalletSync,

    ProgressCallback,
    EncryptOptions,
};
