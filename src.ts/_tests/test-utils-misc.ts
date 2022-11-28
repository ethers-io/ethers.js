import assert from "assert";

import {
    decodeBase64, encodeBase64,
    defineProperties, isError,
    toUtf8Bytes
} from "../index.js";


describe("Base64 Coding", function() {
    const tests = [
        {
            name: "wikipedia",
            plaintext: toUtf8Bytes("Many hands make light work."),
            encoded: "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"
        }
    ];

    for (const test of tests) {
        it(`encodes base64: ${ test.name }`, function() {
            assert.equal(encodeBase64(test.plaintext), test.encoded);
        });
    }

    for (const test of tests) {
        it(`decodes base64: ${ test.name }`, function() {
            const decoded = decodeBase64(test.encoded);
            assert.equal(decoded.length, test.plaintext.length, "data.length");
            for (let i = 0; i < decoded.length; i++) {
                assert.equal(decoded[i], test.plaintext[i]);
            }
        });
    }
});

describe("Test Minor Features", function() {
    it("checks types in defineProperties", function() {
        const any = { };

        const values = {
            vAny: any,
            vBigint: BigInt(60),
            vBoolean: true,
            vNumber: 42,
            vString: "some string",
        };

        const item: any = { };
        defineProperties(item, values, {
            vAny: "any",
            vBigint: "bigint",
            vBoolean: "boolean",
            vNumber: "number",
            vString: "string"
        });

        assert.equal(item.vAny, any, "vAny");
        assert.equal(item.vBoolean, true, "vBoolenay");
        assert.equal(item.vNumber, 42, "nNumber");
        assert.equal(item.vString, "some string", "any");
    });

    it("correctly throws if defineProperty type mismatch", function() {
        assert.throws(() => {
            const item: any = { };

            const values = { vBoolean: 42 };
            defineProperties(item, values, { vBoolean: "boolean" });

            console.log(values);
        }, (error) => {
            return (isError(error, "INVALID_ARGUMENT") &&
                error.argument === "value.vBoolean" &&
                error.value === 42);
        });
    });
});
