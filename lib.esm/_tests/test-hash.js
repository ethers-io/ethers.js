import assert from "assert";
import { hashMessage, namehash, isValidName, solidityPacked, solidityPackedKeccak256, solidityPackedSha256, isError } from "../index.js";
import { loadTests } from "./utils.js";
import { dnsEncode } from "../index.js";
describe("Tests Namehash", function () {
    const tests = loadTests("namehash");
    for (const test of tests) {
        if (!test.error) {
            it(`hashes ENS name: ${JSON.stringify(test.name)}`, function () {
                const actual = namehash(test.ensName);
                assert.equal(actual, test.namehash, "namehash");
                // The empty string is not a valid ENS name
                if (test.ensName) {
                    assert.ok(isValidName(test.ensName), "isValidName");
                }
            });
        }
    }
    for (const test of tests) {
        if (test.error) {
            it(`correctly fails to hash ENS name: ${test.error} ${JSON.stringify(test.name)}`, function () {
                assert.throws(function () {
                    const actual = namehash(test.ensName);
                    console.log("Failed to throw", actual);
                }, (error) => {
                    return (isError(error, "INVALID_ARGUMENT") &&
                        error.argument === "name" && error.value === test.ensName);
                });
                // The empty string is not a valid ENS name
                if (test.ensName) {
                    assert.ok(!isValidName(test.ensName), "!isValidName");
                }
            });
        }
    }
});
describe("Test dnsEncode", function () {
    const tests = [
        { name: "ricmoo.com", result: "0x067269636d6f6f03636f6d00" },
        { name: "ricmoo.com", length: 5, error: "exceeds 5 bytes" },
        {
            name: "a-very-long-label-without-a-length-override-foo-12345678901234567890",
            error: "exceeds 63 bytes"
        },
        {
            name: "a-very-long-label-with-a-length-override-to-255-foo-12345678901234567890",
            length: 255, result: "0x48612d766572792d6c6f6e672d6c6162656c2d776974682d612d6c656e6774682d6f766572726964652d746f2d3235352d666f6f2d313233343536373839303132333435363738393000"
        },
    ];
    for (const test of tests) {
        it(`tests dnsEncode: ${test.name}`, function () {
            if (test.error) {
                assert.throws(() => {
                    let result;
                    if (test.length != null) {
                        result = dnsEncode(test.name, test.length);
                    }
                    else {
                        result = dnsEncode(test.name);
                    }
                    console.log("result", result);
                }, (error) => {
                    return (isError(error, "INVALID_ARGUMENT") &&
                        error.argument === "name" && error.value === test.name &&
                        error.message.indexOf(test.error || "") >= 0);
                });
            }
            else {
                if (test.length != null) {
                    assert.equal(dnsEncode(test.name, test.length), test.result, "dnsEncode(name, length)");
                }
                else {
                    assert.equal(dnsEncode(test.name), test.result, "dnsEncode(name)");
                }
            }
        });
    }
});
describe("Test EIP-191 Personal Message Hash", function () {
    const tests = [
        {
            test: "hello-world",
            message: "Hello World",
            hash: "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2"
        },
        {
            test: "binary-message",
            message: new Uint8Array([0x42, 0x43]),
            hash: "0x0d3abc18ec299cf9b42ba439ac6f7e3e6ec9f5c048943704e30fc2d9c7981438"
        },
        {
            test: "hex-looking-string",
            message: "0x4243",
            hash: "0x6d91b221f765224b256762dcba32d62209cf78e9bebb0a1b758ca26c76db3af4"
        }
    ];
    for (const test of tests) {
        it(`tests hashMessage: ${test.test}`, function () {
            assert.equal(hashMessage(test.message), test.hash);
        });
    }
});
describe("Test Solidity Hash functions", function () {
    const tests = loadTests("solidity-hashes");
    for (const test of tests) {
        it(`computes the solidity keccak256: ${test.name}`, function () {
            assert.equal(solidityPackedKeccak256(test.types, test.values), test.keccak256);
        });
    }
    for (const test of tests) {
        it(`computes the solidity sha256: ${test.name}`, function () {
            assert.equal(solidityPackedSha256(test.types, test.values), test.sha256);
        });
    }
    const badTypes = [
        { types: ["uint5"], values: [1] },
        { types: ["bytes0"], values: ["0x"] },
        { types: ["blorb"], values: [false] },
    ];
    for (const { types, values } of badTypes) {
        it("correctly fails on invalid type", function () {
            assert.throws(function () {
                const result = solidityPacked(types, values);
                console.log(result);
            }, function (error) {
                return (isError(error, "INVALID_ARGUMENT") && error.argument === "type");
            });
        });
    }
});
//# sourceMappingURL=test-hash.js.map