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
//# sourceMappingURL=test-hash-typeddata.js.map