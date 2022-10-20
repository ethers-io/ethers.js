
import assert from "assert";

import {
    concat, dataSlice, id, toArray, zeroPadValue,
    isCallException
} from "../index.js";

import { getProvider, providerNames } from "./create-provider.js";

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

describe("Tests Provider Errors", function() {

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

    const cleanup: Array<() => void> = [ ];
    after(function() {
        for (const func of cleanup) { func(); }
    });

    const testAddr = "0xF20Ba47c47a32fc2d9ad846fF06f2fa6e89eeC74";

    const networkName = "goerli";
    for (const { code, reason } of panics) {
        for (const method of [ "call", "estimateGas" ]) {
            for (const providerName of providerNames) {
                const provider = getProvider(providerName, networkName);
                if (provider == null) { continue; }

                // Shutdown socket-based provider, otherwise its socket will prevent
                // this process from exiting
                if ((<any>provider).destroy) { cleanup.push(() => {(<any>provider).destroy(); }); }


                it(`tests panic code: ${ providerName }.${ method }.${ reason }`, async function() {
                    this.timeout(10000);

                    const data = concat([
                        dataSlice(id("testPanic(uint256)"), 0, 4),
                        zeroPadValue(toArray(code), 32)
                    ]);

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

                // Shutdown socket-based provider, otherwise its socket will prevent
                // this process from exiting
                if ((<any>provider).destroy) { cleanup.push(() => {(<any>provider).destroy(); }); }

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
