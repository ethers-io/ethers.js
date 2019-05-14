"use strict";

import { ethers } from "ethers";

import scrypt from "scrypt-js";

let warned = false;

export class BrainWallet extends ethers.Wallet {

    static _generate(username: ethers.Bytes | string, password: ethers.Bytes | string, legacy: boolean, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet> {
        if (!warned) {
            ethers.errors.warn("Warning: using Brain Wallets should be considered insecure (this warning will not be repeated)");
            warned = true;
        }
        let usernameBytes: Uint8Array = null;
        let passwordBytes: Uint8Array = null;

        if (typeof(username) === 'string') {
            ethers.errors.checkNormalize();
            usernameBytes = ethers.utils.toUtf8Bytes(username.normalize('NFKC'));
        } else {
            usernameBytes = ethers.utils.arrayify(username);
        }

        if (typeof(password) === 'string') {
            ethers.errors.checkNormalize();
            passwordBytes = ethers.utils.toUtf8Bytes(password.normalize('NFKC'));
        } else {
            passwordBytes = ethers.utils.arrayify(password);
        }

        return new Promise((resolve, reject) => {
            scrypt(passwordBytes, usernameBytes, (1 << 18), 8, 1, 32, (error: Error, progress: number, key: Uint8Array) => {
                if (error) {
                    reject(error);

                } else if (key) {
                    if (legacy) {
                        resolve(new BrainWallet(key));

                    } else {
                        let mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.arrayify(key).slice(0, 16));
                        resolve(new BrainWallet(ethers.Wallet.fromMnemonic(mnemonic)));
                    }

                } else if (progressCallback) {
                    return progressCallback(progress);
                }
            });
        });
    }

    static generate(username: ethers.Bytes | string, password: ethers.Bytes | string, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet> {
        return BrainWallet._generate(username, password, false, progressCallback);
    }

    static generateLegacy(username: ethers.Bytes | string, password: ethers.Bytes | string, progressCallback?: ethers.utils.ProgressCallback): Promise<BrainWallet> {
        return BrainWallet._generate(username, password, true, progressCallback);
    }
}

/*
// Test Legacy correctly matches our old test-vector:
// See: https://github.com/ethers-io/ethers.js/blob/3bf39b3bee0834566243211783ed8ec052c2f950/tests/test-wallet.js#L13
BrainWallet.generateLegacy("ricmoo", "password").then((wallet) => {
    console.log("Expected:", "0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC");
    console.log(wallet);
});


BrainWallet.generate("ricmoo", "password").then((wallet) => {
    console.log("Expected:", "0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC");
    console.log(wallet);
});
*/
