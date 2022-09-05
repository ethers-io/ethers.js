import assert from "assert";
import { loadTests } from "./utils.js";
import { defaultAbiCoder } from "../index.js";
function equal(actual, expected) {
    switch (expected.type) {
        case "address":
        case "boolean":
        case "hexstring":
        case "string":
            assert.equal(actual, expected.value);
            return;
        case "number":
            assert.equal(actual, BigInt(expected.value));
            return;
        case "array":
        case "object":
            assert.ok(Array.isArray(actual), "!array");
            assert.equal(actual.length, expected.value.length, ".length mismatch");
            for (let i = 0; i < actual.length; i++) {
                equal(actual[i], expected.value[i]);
            }
            return;
    }
    throw new Error(`unsupported: ${expected}`);
}
describe("Tests ABI Coder", function () {
    const tests = loadTests("abi");
    for (const test of tests) {
        it(`tests ABI encoding: (${test.name})`, function () {
            const encoded = defaultAbiCoder.encode([test.type], [test.value]);
            assert.equal(encoded, test.encoded, "encoded");
        });
    }
    for (const test of tests) {
        it(`tests ABI decoding: (${test.name})`, function () {
            const decoded = defaultAbiCoder.decode([test.type], test.encoded)[0];
            equal(decoded, test.verbose);
        });
    }
});
//# sourceMappingURL=test-abi.js.map