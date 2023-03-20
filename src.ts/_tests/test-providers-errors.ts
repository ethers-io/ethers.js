
import assert from "assert";

import {
    concat, dataSlice, id, toBeArray, zeroPadValue,
    isCallException, isError,
    Wallet
} from "../index.js";

import { getProvider, setupProviders, providerNames } from "./create-provider.js";
import { stall } from "./utils.js";

import type { TransactionResponse } from "../index.js";

type TestCustomError = {
    name: string;
    signature: string;
    message: string,
    data: string;
    reason: null | string,
    revert: null | {
        signature: string,
        name: string,
        args: Array<any>
    },
};

setupProviders();

describe("Tests Provider Call Exception", function() {

    const panics: Array<{ code: number, reason: string }> = [
        //{ code: 0x00, reason: "GENERIC_PANIC" },
        { code: 0x01, reason: "ASSERT_FALSE" },
        { code: 0x11, reason: "OVERFLOW" },
        { code: 0x12, reason: "DIVIDE_BY_ZERO" },
        //{ code: 0x21, reason: "ENUM_RANGE_ERROR" },
        //{ code: 0x22, reason: "BAD_STORAGE_DATA" },
        { code: 0x31, reason: "STACK_UNDERFLOW" },
        { code: 0x32, reason: "ARRAY_RANGE_ERROR" },
        //{ code: 0x41, reason: "OUT_OF_MEMORY" },
        //{ code: 0x51, reason: "UNINITIALIZED_FUNCTION_CALL" },
    ];

    const testAddr = "0xF20Ba47c47a32fc2d9ad846fF06f2fa6e89eeC74";

    const networkName = "goerli";
    for (const { code, reason } of panics) {
        for (const method of [ "call", "estimateGas" ]) {
            for (const providerName of providerNames) {
                const provider = getProvider(providerName, networkName);
                if (provider == null) { continue; }

                it(`tests panic code: ${ providerName }.${ method }.${ reason }`, async function() {
                    this.timeout(10000);

                    const data = concat([
                        dataSlice(id("testPanic(uint256)"), 0, 4),
                        zeroPadValue(toBeArray(code), 32)
                    ]);

                    await stall(1000);

                    const tx = { to: testAddr, data };
                    try {
                        const result = await (method === "call" ? provider.call(tx): provider.estimateGas(tx));
                        console.log(result);

                        assert.ok(false, "panic call did not throw");
                    } catch (error) {
                        assert.ok(isCallException(error), "isCallException");

                        // Check some basics
                        assert.equal(error.action, method, `error.action == ${ method }`);
                        assert.equal(error.reason, `Panic due to ${ reason }(${ code })`, "error.reason");

                        // Check the transaciton
                        assert.equal(error.transaction.to, tx.to, `error.transaction.to`);
                        assert.equal(error.transaction.data, tx.data, `error.transaction.data`);

                        // We have no invocation data
                        assert.equal(error.invocation, null, `error.invocation != null`);

                        // Check the revert
                        assert.ok(error.revert != null, "error.revert == null");
                        assert.equal(error.revert.name, "Panic", `error.revert.name`);
                        assert.equal(error.revert.signature, "Panic(uint256)", `error.revert.signature`);
                        assert.equal(error.revert.args.length, 1, `error.revert.args.length`);
                        assert.equal(error.revert.args[0], code, `error.revert.args[0]`);
                    }
                });
            }
        }
    }

    const customErrors: Array<TestCustomError> = [
        {
            name: "CustomError1",
            signature: "testCustomError1(bool,uint256,string)",
            data: "0xdb7342480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000",
            //data: "0x852d0c740000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000",
            message: `execution reverted (unknown custom error)`,
            reason: null,
            revert: null,
        },
        {
            name: "Error",
            signature: "testErrorString(bool,string)",
            data: "0xb206699b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000",
            //data: "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000"
            message: `execution reverted: "hello world"`,
            reason: "hello world",
            revert: {
                signature: "Error(string)",
                name: "Error",
                args: [ 'hello world' ]
            }
        },
    ];

    for (const { data, message, name, reason, revert } of customErrors) {
        for (const method of [ "call", "estimateGas" ]) {
            const tx = { to: testAddr, data };
            for (const providerName of providerNames) {
                const provider = getProvider(providerName, networkName);
                if (provider == null) { continue; }

                it(`tests custom errors: ${ providerName }.${ method }.${ name }`, async function() {
                    this.timeout(10000)
                    try {
                        const result = await (method === "call" ? provider.call(tx): provider.estimateGas(tx));
                        console.log(result);

                        assert.ok(false, "panic call did not throw");
                    } catch (error) {
                        assert.ok(isCallException(error), "isCallException");

                        // Check some basics
                        assert.equal(error.action, method, `error.action == ${ method }`);
                        assert.ok(error.message.startsWith(message), "error.message == message");

                        if (reason) {
                            assert.equal(error.reason, reason, "error.reason");
                        } else {
                            assert.ok(error.reason == null, "error.reason != null");
                        }

                        if (revert) {
                            assert.ok(error.revert != null, "error.revert == null");
                            assert.equal(error.revert.name, revert.name, "error.revert.name");
                            assert.equal(error.revert.signature, revert.signature, "error.revert.signature");
                            assert.equal(error.revert.args.length, revert.args.length, "error.revert.args.length");
                            for (let i = 0; i < revert.args.length; i++) {
                                assert.equal(error.revert.args[i], revert.args[i], `error.revert.args[${ i }]`);
                            }
                        } else {
                            assert.ok(error.revert == null, "error.revert != null");
                        }
                    }
                });
            }
        }
    }
});

describe("Test Provider Blockchain Errors", function() {
    const wallet = new Wallet(<string>(process.env.FAUCET_PRIVATEKEY));

    const networkName = "goerli";
    for (const providerName of providerNames) {

        const provider = getProvider(providerName, networkName);
        if (provider == null) { continue; }

        // The CI runs multiple tests at once; minimize colliding with
        // the initial tx by using a random value, so we can detect
        // replacements we didn't do.
        const value = Math.trunc(Math.random() * 2048) + 2;

        it(`tests underpriced replacement transaction: ${ providerName }`, async function() {
            this.timeout(60000);

            const w = wallet.connect(provider);

            let tx1: null | TransactionResponse = null;
            let nonce: null | number = null;;
            for (let i = 0; i < 10; i++) {
                nonce = await w.getNonce("pending");
                try {
                    tx1 = await w.sendTransaction({
                        nonce, to: wallet, value
                    });
                } catch (error: any) {
                    // Another CI host beat us to this nonce
                    if (isError(error, "REPLACEMENT_UNDERPRICED") || isError(error, "NONCE_EXPIRED")) {
                        await stall(1000);
                        continue;
                    }
                    console.log("EE-tx1", nonce, value, error);
                    throw error;
                }
                break;
            }
            if (tx1 == null || nonce == null) { throw new Error("could not send initial tx"); }

            const rejection = assert.rejects(async function() {
                // Send another tx with the same nonce
                const tx2 = await w.sendTransaction({
                    nonce, to: wallet, value: 1
                });
                console.log({ tx1, tx2 });
            }, (error: unknown) => {
                return isError(error, "REPLACEMENT_UNDERPRICED");
            });

            // Wait for the first tx to get mined so we start with a
            // clean slate on the next provider
            await tx1.wait();

            // This should have already happened
            await rejection;
        });
    }

    for (const providerName of providerNames) {

        const provider = getProvider(providerName, networkName);
        if (provider == null) { continue; }

        it(`tests insufficient funds: ${ providerName }`, async function() {
            this.timeout(60000);

            const w = Wallet.createRandom().connect(provider);

            await assert.rejects(async function() {
                const tx = await w.sendTransaction({
                    to: wallet, value: 1
                });
                console.log(tx);
            }, (error) => {
                return (isError(error, "INSUFFICIENT_FUNDS") &&
                    typeof(error.transaction.from) === "string" &&
                    error.transaction.from.toLowerCase() === w.address.toLowerCase());
            });
        });
    }

    for (const providerName of providerNames) {

        const provider = getProvider(providerName, networkName);
        if (provider == null) { continue; }

        it(`tests nonce expired: ${ providerName }`, async function() {
            this.timeout(60000);

            const w = wallet.connect(provider);

            await assert.rejects(async function() {
                const tx = await w.sendTransaction({
                    to: wallet, nonce: 1, value: 1
                });
                console.log(tx);
            }, (error) => {
                if (!isError(error, "NONCE_EXPIRED")) {
                    console.log(error);
                }
                return isError(error, "NONCE_EXPIRED");
            });
        });
    }

});

