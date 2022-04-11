import assert from "assert";
import { loadTests } from "./utils.js"
import type { TestCaseNamehash } from "./types.js";


import { dnsEncode, isValidName, namehash } from "../index.js";


describe("Tests Namehash", function() {
    const tests = loadTests<TestCaseNamehash>("namehash");
    for (const test of tests) {
        it(`hashes ENS names: ${ JSON.stringify(test.ensName) }`, function() {
            const actual = namehash(test.ensName);

            assert.equal(actual, test.namehash, "namehash");

            // The empty string is not a valid ENS name
            if (test.ensName) {
                assert.ok(isValidName(test.ensName), "isValidName");
            }
        });
    }
});

describe("Tests Bad ENS Names", function() {
    const badTests: Array<{ ensName: any, prefix: string }> = [
        { ensName: ".", prefix: "missing component" },
        { ensName:"..", prefix: "missing component" },
        { ensName:"ricmoo..eth", prefix: "missing component" },
        { ensName:"ricmoo...eth", prefix: "missing component" },
        { ensName:".foo", prefix: "missing component" },
        { ensName:"foo.", prefix: "missing component" },
        { ensName: 1234, prefix: "not a string" },
        { ensName: true, prefix: "not a string" },
    ];

    // The empty string is not a valid name, but has a valid namehash
    // (the zero hash) as it is the base case for recursion
    it("empty ENS name", function() {
        assert.ok(!isValidName(""), "!isValidName");
    });

    for (const { ensName, prefix } of badTests) {
        it(`fails on bad ENS name: ${ JSON.stringify(ensName) }`, function() {
            assert.ok(!isValidName(ensName), "!isValidName");
            assert.throws(() => {
                const result = namehash(ensName);
                console.log(result);
            }, (error) => {
                const errorPrefix = `invalid ENS name; ${ prefix }`;
                return (error.code === "INVALID_ARGUMENT" &&
                    error.argument === "name" && error.value === ensName &&
                    error.message.substring(0, errorPrefix.length) === errorPrefix);
            });
        });
    }
});

describe("Tests DNS Encoding", function() {
    const tests: Array<{ ensName: string, dnsEncoded: string}> = [
        { ensName: "", dnsEncoded: "0x00" },
        { ensName: "ricmoo.eth", dnsEncoded: "0x067269636d6f6f0365746800" },
    ];

    for (const { ensName, dnsEncoded } of tests) {
        it(`computes the DNS Encoding: ${ JSON.stringify(ensName) }`, function() {
            assert.equal(dnsEncode(ensName), dnsEncoded, "dnsEncoded");
        });
    }
});

describe("Tests DNS Names", function() {
    const badTests: Array<{ ensName: any, prefix: string}> = [
        { ensName: ".", prefix: "invalid DNS name; missing component" },
        { ensName: "foo..bar", prefix: "invalid DNS name; missing component" },
        { ensName: ".foo", prefix: "invalid DNS name; missing component" },
        { ensName: "foo.", prefix: "invalid DNS name; missing component" },
        { ensName: 1234, prefix: "invalid DNS name; not a string" },
        { ensName: true, prefix: "invalid DNS name; not a string" },
    ];

    for (const { ensName, prefix } of badTests) {
        it(`fails on bad DNS name: ${ JSON.stringify(ensName) }`, function() {
            assert.throws(() => {
                const result = dnsEncode(ensName);
                console.log(result);
            }, (error) => {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.argument === "name" && error.value === ensName &&
                    error.message.substring(0, prefix.length) === prefix);
            });
        });
    }

    {
        const ensName = "foobar012345678901234567890123456789012345678901234567890123456789";
        const prefix = "too long";
        it(`fails on bad DNS name: ${ JSON.stringify(ensName) }`, function() {
            assert.throws(() => {
                const result = dnsEncode(ensName);
                console.log(result);
            }, (error) => {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.argument === "value" && error.value === ensName &&
                    error.message.substring(0, prefix.length) === prefix);
            });
        });
    }

});
