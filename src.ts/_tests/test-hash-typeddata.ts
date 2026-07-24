import assert from "assert";
import { loadTests } from "./utils.js";
import type { TestCaseTypedData } from "./types.js";
import { id, TypedDataEncoder } from "../index.js";


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
        {
            name: "array-uint",
            types: {
                foo: [
                    { name: "a", type: "uint256[]" },
                    { name: "b", type: "string" },
                ],
            },
            typesAlias: {
                foo: [
                    { name: "a", type: "uint[]" },
                    { name: "b", type: "string" },
                ],
            },
            data: {
                a: [ 35, 36, 37 ],
                b: "hello"
            },
            encoded: "0x1a961843d0002bdd66ec21afd6e4a5b0aac34a4b6112890378c6e3a38b752e0b0c22b846886e98aeffc1f1166d4b35868da4d4da853dcb3b2856cfc233fd10c81c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
        {
            name: "array-int",
            types: {
                foo: [
                    { name: "a", type: "int256[]" },
                    { name: "b", type: "string" },
                ],
            },
            typesAlias: {
                foo: [
                    { name: "a", type: "int[]" },
                    { name: "b", type: "string" },
                ],
            },
            data: {
                a: [ 35, 36, 37 ],
                b: "hello"
            },
            encoded: "0x0b89085a01a3b67d2231c6a136f9c8eea75d7d479a83a127356f8540ee15af010c22b846886e98aeffc1f1166d4b35868da4d4da853dcb3b2856cfc233fd10c81c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
        {
            name: "nested-array-uint",
            types: {
                foo: [
                    { name: "a", type: "uint256[][]" },
                    { name: "b", type: "string" },
                ],
            },
            typesAlias: {
                foo: [
                    { name: "a", type: "uint[][]" },
                    { name: "b", type: "string" },
                ],
            },
            data: {
                a: [ [ 35, 36 ], [ 37 ] ],
                b: "hello"
            },
            encoded: "0x5efa7c4b66979cf78fcc7c3e71cbfa04ec2c7529002642082bf20a91552c1147fa5ffe3a0504d850bc7c9eeda1cf960b596b73f4dc0272a6fa89dace08e320291c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
    ];

    for (const test of tests) {
        it(`tests encoding typed-data: ${ test.name }`, function() {
            const encoder = TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, "foo", "primaryType");
            assert.equal(encoder.encodeData("foo", test.data), test.encoded, "encoded");

            const encoderAlias = TypedDataEncoder.from(test.typesAlias);
            assert.equal(encoderAlias.primaryType, "foo", "primaryType");
            assert.equal(encoderAlias.encodeData("foo", test.data), test.encoded, "encoded");

            const payload = TypedDataEncoder.getPayload({ }, test.types, test.data);
            const payloadAlias = TypedDataEncoder.getPayload({ }, test.typesAlias, test.data);

            assert.equal(JSON.stringify(payloadAlias), JSON.stringify(payload), "payload");
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

describe("Tests Typed Data (EIP-712) getTypeHash", function() {
    const types = {
        Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
        ],
        Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
        ],
    };

    // Type hashes from the EIP-712 specification example
    const typeHashes: Record<string, string> = {
        Person: "0xb9d8c78acf9b987311de6c7b45bb6a9c8e1bf361fa7fd3467a2163f994c79500",
        Mail: "0xa0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2",
    };

    it("computes the type hash from the static method", function() {
        for (const name in typeHashes) {
            assert.equal(TypedDataEncoder.getTypeHash(name, types), typeHashes[name], name);
        }
    });

    it("computes the type hash from an encoder instance", function() {
        const encoder = TypedDataEncoder.from(types);
        for (const name in typeHashes) {
            assert.equal(encoder.getTypeHash(name), typeHashes[name], name);
        }
    });

    it("matches keccak256 of the encoded type", function() {
        const encoder = TypedDataEncoder.from(types);
        assert.equal(encoder.getTypeHash("Mail"), id(encoder.encodeType("Mail")), "Mail");
    });
});
