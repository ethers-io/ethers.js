"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../index.js");
const create_provider_js_1 = require("./create-provider.js");
describe("Tests Provider Errors", function () {
    const panics = [
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
    const cleanup = [];
    after(function () {
        for (const func of cleanup) {
            func();
        }
    });
    const testAddr = "0xF20Ba47c47a32fc2d9ad846fF06f2fa6e89eeC74";
    const networkName = "goerli";
    for (const { code, reason } of panics) {
        for (const method of ["call", "estimateGas"]) {
            for (const providerName of create_provider_js_1.providerNames) {
                const provider = (0, create_provider_js_1.getProvider)(providerName, networkName);
                if (provider == null) {
                    continue;
                }
                // Shutdown socket-based provider, otherwise its socket will prevent
                // this process from exiting
                if (provider.destroy) {
                    cleanup.push(() => { provider.destroy(); });
                }
                it(`tests panic code: ${providerName}.${method}.${reason}`, async function () {
                    this.timeout(10000);
                    const data = (0, index_js_1.concat)([
                        (0, index_js_1.dataSlice)((0, index_js_1.id)("testPanic(uint256)"), 0, 4),
                        (0, index_js_1.zeroPadValue)((0, index_js_1.toArray)(code), 32)
                    ]);
                    const tx = { to: testAddr, data };
                    try {
                        const result = await (method === "call" ? provider.call(tx) : provider.estimateGas(tx));
                        console.log(result);
                        assert_1.default.ok(false, "panic call did not throw");
                    }
                    catch (error) {
                        assert_1.default.ok((0, index_js_1.isCallException)(error), "isCallException");
                        // Check some basics
                        assert_1.default.equal(error.action, method, `error.action == ${method}`);
                        assert_1.default.equal(error.reason, `Panic due to ${reason}(${code})`, "error.reason");
                        // Check the transaciton
                        assert_1.default.equal(error.transaction.to, tx.to, `error.transaction.to`);
                        assert_1.default.equal(error.transaction.data, tx.data, `error.transaction.data`);
                        // We have no invocation data
                        assert_1.default.equal(error.invocation, null, `error.invocation != null`);
                        // Check the revert
                        assert_1.default.ok(error.revert != null, "error.revert == null");
                        assert_1.default.equal(error.revert.name, "Panic", `error.revert.name`);
                        assert_1.default.equal(error.revert.signature, "Panic(uint256)", `error.revert.signature`);
                        assert_1.default.equal(error.revert.args.length, 1, `error.revert.args.length`);
                        assert_1.default.equal(error.revert.args[0], code, `error.revert.args[0]`);
                    }
                });
            }
        }
    }
    const customErrors = [
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
                args: ['hello world']
            }
        },
    ];
    for (const { data, message, name, reason, revert } of customErrors) {
        for (const method of ["call", "estimateGas"]) {
            const tx = { to: testAddr, data };
            for (const providerName of create_provider_js_1.providerNames) {
                const provider = (0, create_provider_js_1.getProvider)(providerName, networkName);
                if (provider == null) {
                    continue;
                }
                // Shutdown socket-based provider, otherwise its socket will prevent
                // this process from exiting
                if (provider.destroy) {
                    cleanup.push(() => { provider.destroy(); });
                }
                it(`tests custom errors: ${providerName}.${method}.${name}`, async function () {
                    this.timeout(10000);
                    try {
                        const result = await (method === "call" ? provider.call(tx) : provider.estimateGas(tx));
                        console.log(result);
                        assert_1.default.ok(false, "panic call did not throw");
                    }
                    catch (error) {
                        assert_1.default.ok((0, index_js_1.isCallException)(error), "isCallException");
                        // Check some basics
                        assert_1.default.equal(error.action, method, `error.action == ${method}`);
                        assert_1.default.ok(error.message.startsWith(message), "error.message == message");
                        if (reason) {
                            assert_1.default.equal(error.reason, reason, "error.reason");
                        }
                        else {
                            assert_1.default.ok(error.reason == null, "error.reason != null");
                        }
                        if (revert) {
                            assert_1.default.ok(error.revert != null, "error.revert == null");
                            assert_1.default.equal(error.revert.name, revert.name, "error.revert.name");
                            assert_1.default.equal(error.revert.signature, revert.signature, "error.revert.signature");
                            assert_1.default.equal(error.revert.args.length, revert.args.length, "error.revert.args.length");
                            for (let i = 0; i < revert.args.length; i++) {
                                assert_1.default.equal(error.revert.args[i], revert.args[i], `error.revert.args[${i}]`);
                            }
                        }
                        else {
                            assert_1.default.ok(error.revert == null, "error.revert != null");
                        }
                    }
                });
            }
        }
    }
});
//# sourceMappingURL=test-providers-errors.js.map