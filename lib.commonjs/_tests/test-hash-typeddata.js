"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
describe("Tests Typed Data (EIP-712)", function () {
    const tests = (0, utils_js_1.loadTests)("typed-data");
    for (const test of tests) {
        it(`tests encoding typed-data: ${test.name}`, function () {
            const encoder = index_js_1.TypedDataEncoder.from(test.types);
            assert_1.default.equal(encoder.primaryType, test.primaryType, "primaryType");
            assert_1.default.equal(encoder.encode(test.data), test.encoded, "encoded");
            assert_1.default.equal(index_js_1.TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "primaryType");
            assert_1.default.equal(index_js_1.TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    }
});
describe("Tests Typed Data (EIP-712) aliases", function () {
    const tests = [
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
                a: [35, 36, 37],
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
                a: [35, 36, 37],
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
                a: [[35, 36], [37]],
                b: "hello"
            },
            encoded: "0x5efa7c4b66979cf78fcc7c3e71cbfa04ec2c7529002642082bf20a91552c1147fa5ffe3a0504d850bc7c9eeda1cf960b596b73f4dc0272a6fa89dace08e320291c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
        },
    ];
    for (const test of tests) {
        it(`tests encoding typed-data: ${test.name}`, function () {
            const encoder = index_js_1.TypedDataEncoder.from(test.types);
            assert_1.default.equal(encoder.primaryType, "foo", "primaryType");
            assert_1.default.equal(encoder.encodeData("foo", test.data), test.encoded, "encoded");
            const encoderAlias = index_js_1.TypedDataEncoder.from(test.typesAlias);
            assert_1.default.equal(encoderAlias.primaryType, "foo", "primaryType");
            assert_1.default.equal(encoderAlias.encodeData("foo", test.data), test.encoded, "encoded");
            const payload = index_js_1.TypedDataEncoder.getPayload({}, test.types, test.data);
            const payloadAlias = index_js_1.TypedDataEncoder.getPayload({}, test.typesAlias, test.data);
            assert_1.default.equal(JSON.stringify(payloadAlias), JSON.stringify(payload), "payload");
        });
    }
    it(`tests overriding an alias as a type`, function () {
        const encoder = index_js_1.TypedDataEncoder.from({
            uint: [
                { name: "value", type: "uint256" }
            ],
            foo: [
                { name: "a", type: "uint" },
                { name: "b", type: "string" },
            ]
        });
        assert_1.default.equal(encoder.primaryType, "foo", "primaryType");
        const data = encoder.encodeData("foo", {
            a: { value: 42 },
            b: "hello"
        });
        const encoded = "0x87a4bfff36f1a2ecde6468d6acd51ecc5ef8f3a15d8115a412c686d82d3fdbe4628fc3080b86a044fb60153bb7dc3f904e9ed1cebadf35c17099a060ba4df90b1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8";
        assert_1.default.equal(data, encoded, "encoded");
    });
});
//# sourceMappingURL=test-hash-typeddata.js.map