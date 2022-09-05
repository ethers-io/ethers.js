"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
function equal(actual, expected) {
    switch (expected.type) {
        case "address":
        case "boolean":
        case "hexstring":
        case "string":
            assert_1.default.equal(actual, expected.value);
            return;
        case "number":
            assert_1.default.equal(actual, BigInt(expected.value));
            return;
        case "array":
        case "object":
            assert_1.default.ok(Array.isArray(actual), "!array");
            assert_1.default.equal(actual.length, expected.value.length, ".length mismatch");
            for (let i = 0; i < actual.length; i++) {
                equal(actual[i], expected.value[i]);
            }
            return;
    }
    throw new Error(`unsupported: ${expected}`);
}
describe("Tests ABI Coder", function () {
    const tests = (0, utils_js_1.loadTests)("abi");
    for (const test of tests) {
        it(`tests ABI encoding: (${test.name})`, function () {
            const encoded = index_js_1.defaultAbiCoder.encode([test.type], [test.value]);
            assert_1.default.equal(encoded, test.encoded, "encoded");
        });
    }
    for (const test of tests) {
        it(`tests ABI decoding: (${test.name})`, function () {
            const decoded = index_js_1.defaultAbiCoder.decode([test.type], test.encoded)[0];
            equal(decoded, test.verbose);
        });
    }
});
//# sourceMappingURL=test-abi.js.map