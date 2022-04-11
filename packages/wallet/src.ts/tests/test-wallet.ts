import assert from "assert";

import { loadTests } from "./utils.js";

import type {
    TestCaseAccount, TestCaseTypedData, TestCaseTransaction
} from "./types";


import { Wallet } from "../index.js";


describe("Test Private Key Wallet", function() {
    const tests = loadTests<TestCaseAccount>("accounts");

    tests.forEach(({ name, privateKey, address }) => {
        it(`creates wallet: ${ name }`, function() {
            const wallet = new Wallet(privateKey);
            assert.equal(wallet.privateKey, privateKey);
            assert.equal(wallet.address, address);
        });
    });
});

describe("Test Transaction Signing", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");
    for (const test of tests) {
        it(`tests signing a legacy transaction: ${ test.name }`, async function() {
            const wallet = new Wallet(test.privateKey);
            const txData = Object.assign({ }, test.transaction, { type: 0, accessList: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });

            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) { txData.chainId = "0x00"; }

            const signed = await wallet.signTransaction(txData);
            assert.equal(signed, test.signedLegacy, "signedLegacy");
        });
    }

    for (const test of tests) {
        if (!test.signedEip155) { continue; }
        it(`tests signing an EIP-155 transaction: ${ test.name }`, async function() {
            const wallet = new Wallet(test.privateKey);
            const txData = Object.assign({ }, test.transaction, { type: 0, accessList: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });
            const signed = await wallet.signTransaction(txData);
            assert.equal(signed, test.signedEip155, "signedEip155");
        });
    }

    for (const test of tests) {
        it(`tests signing a Berlin transaction: ${ test.name }`, async function() {
            const wallet = new Wallet(test.privateKey);
            const txData = Object.assign({ }, test.transaction, { type: 1, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });
            const signed = await wallet.signTransaction(txData);
            assert.equal(signed, test.signedBerlin, "signedBerlin");
        });
    }

    for (const test of tests) {
        it(`tests signing a London transaction: ${ test.name }`, async function() {
            const wallet = new Wallet(test.privateKey);
            const txData = Object.assign({ }, test.transaction, { type: 2 });
            const signed = await wallet.signTransaction(txData);
            assert.equal(signed, test.signedLondon, "signedLondon");
        });
    }
});

describe("Test Message Signing (EIP-191)", function() {
});

describe("Test Typed-Data Signing (EIP-712)", function() {
    const tests = loadTests<TestCaseTypedData>("typed-data");
    for (const test of tests) {
        const { privateKey, signature } = test;
        if (privateKey == null || signature == null) { continue; }
        it(`tests signing typed-data: ${ test.name }`, async function() {
            const wallet = new Wallet(privateKey);
            const sig = await wallet.signTypedData(test.domain, test.types, test.data);
            assert.equal(sig, signature, "signature");
        });
    }
});
