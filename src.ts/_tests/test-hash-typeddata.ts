import assert from "assert";
import { loadTests } from "./utils.js";
import type { TestCaseTypedData } from "./types.js";
import { TypedDataEncoder } from "../index.js";


describe("Tests Typed Data (EIP-712)", function() {
    const tests = loadTests<TestCaseTypedData>("typed-data");
    for (const test of tests) {
        it(`tests encoding typed-data: ${ test.name }`, function() {
            const encoder = TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, test.primaryType, "primaryType");
            assert.equal(encoder.encode(test.data), test.encoded, "encoded");

            assert.equal(TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "primaryType");
            assert.equal(TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    }
});

interface TestAlias {
    name: string;
    types: Record<string, Array<{ name: string, type: string }>>;
    typesAlias: Record<string, Array<{ name: string, type: string }>>;
    data: Record<string, any>;
    encoded: string;
}

describe("Tests Typed Data (EIP-712) aliases", function() {
    const tests: Array<TestAlias> = [
        {
            name: "uint",
            types: {
                foo: [
                    { name: "a", type: "uint256" },
                    { name: "b", type: "string" },
                ],
            },
            typesAlias: {
                foo: [
                    { name: "a", type: "uint" },
                    { name: "b", type: "string" },
                ],
            },
            data: {
                a: 35,
                b: "hello"
            },
            encoded: "0x859b6b4a5d436f85a809f6383b4b35a153aa6fe9c95946c366d9dfd634b89f4700000000000000000000000000000000000000000000000000000000000000231c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
        {
            name: "int",
            types: {
                foo: [
                    { name: "a", type: "int256" },
                    { name: "b", type: "string" },
                ],
            },
            typesAlias: {
                foo: [
                    { name: "a", type: "int" },
                    { name: "b", type: "string" },
                ],
            },
            data: {
                a: 35,
                b: "hello"
            },
            encoded: "0xa272ada5f88085e4cb18acdb87bd057a8cbfec249fee53de0149409080947cf500000000000000000000000000000000000000000000000000000000000000231c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
    ];

    for (const test of tests) {
        it(`tests encoding typed-data: ${ test.name }`, function() {
            const encoder = TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, "foo", "primaryType");
            assert.equal(encoder.encodeData("foo", test.data), test.encoded, "encoded");
        });
    }

    it(`tests overriding an alias as a type`, function() {
        const encoder = TypedDataEncoder.from({
            uint: [
                { name: "value", type: "uint256" }
            ],
            foo: [
                { name: "a", type: "uint" },
                { name: "b", type: "string" },
            ]
        });
        assert.equal(encoder.primaryType, "foo", "primaryType");

        const data = encoder.encodeData("foo", {
            a: { value: 42 },
            b: "hello"
        });

        const encoded = "0x87a4bfff36f1a2ecde6468d6acd51ecc5ef8f3a15d8115a412c686d82d3fdbe4628fc3080b86a044fb60153bb7dc3f904e9ed1cebadf35c17099a060ba4df90b1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8";
        assert.equal(data, encoded, "encoded");
    });
});
