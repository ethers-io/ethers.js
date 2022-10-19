/* istanbul ignore file */

'use strict';

import { ethers } from "ethers";

function randomBytes(seed: string, lower: number, upper?: number): Uint8Array {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    let result = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = ethers.utils.concat([result, ethers.utils.keccak256(ethers.utils.concat([seed, result]))]);
    }

    let top = ethers.utils.arrayify(ethers.utils.keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}

function randomHexString(seed: string, lower: number, upper?: number): string {
    return ethers.utils.hexlify(randomBytes(seed, lower, upper));
}

function randomNumber(seed: string, lower: number, upper: number): number {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}

function equals(a: any, b: any): boolean {

    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    // BigNumber
    if (a.eq) {
        if (!b.eq || !a.eq(b)) { return false; }
        return true;
    }

    // Uint8Array
    if (a.buffer) {
        if (!b.buffer || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    // Something else
    return a === b;
}

function getWallet(): ethers.Wallet {
    const provider = new ethers.providers.InfuraProvider("goerli", "49a0efa3aaee4fd99797bfa94d8ce2f1");

    let key: null | string = null;

    // browser
    if (key == null) {
        try {
            if (typeof window !== "undefined") {
                key = (<any>window).__karma__.config.args[0];
                if (typeof(key) !== "string") { key = null; }
            }
        } catch (error) { }
    }

    // node.js
    if (key == null) {
        try {
            key = process.env.FAUCET_PRIVATEKEY;
            if (typeof(key) !== "string") { key = null; }
        } catch (error) { }
    }

    if (key == null) {
        throw new Error("could not find faucet private key");
    }

    return new ethers.Wallet(key, provider);
}

export async function fundAddress(address: string): Promise<string> {
    try {
        const faucetWallet = getWallet();
        const tx = await faucetWallet.sendTransaction({
            to: address,
            value: "314159265358979323"
        });
        return tx.wait().then((resp) => resp.transactionHash);
    } catch (error) {
        console.log("ERROR getting faucet", error);
        throw error;
    }
}

export async function returnFunds(wallet: ethers.Wallet): Promise<string> {

    const faucet = getWallet();

    const provider = faucet.provider;

    // Refund all unused ether to the faucet
    const gasPrice = await provider.getGasPrice();
    const balance = await provider.getBalance(wallet.address);
    const tx = await wallet.connect(provider).sendTransaction({
        to: faucet.address,
        gasLimit: 21000,
        gasPrice: gasPrice,
        value: balance.sub(gasPrice.mul(21000))
    });

    return tx.hash;
}

export async function sendTransaction(txObj: ethers.providers.TransactionRequest): Promise<string> {
    const wallet = getWallet();
    const tx = await wallet.sendTransaction(txObj);
    return tx.hash;
}

export {
    randomBytes,
    randomHexString,
    randomNumber,

    equals
}
