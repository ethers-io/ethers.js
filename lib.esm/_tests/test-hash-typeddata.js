import assert from "assert";
import { loadTests } from "./utils.js";
import { TypedDataEncoder } from "../index.js";
describe("Tests Typed Data (EIP-712)", function () {
    const tests = loadTests("typed-data");
    for (const test of tests) {
        it(`tests encoding typed-data: ${test.name}`, function () {
            const encoder = TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, test.primaryType, "primaryType");
            assert.equal(encoder.encode(test.data), test.encoded, "encoded");
            assert.equal(TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "primaryType");
            assert.equal(TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    }
});
//# sourceMappingURL=test-hash-typeddata.js.map