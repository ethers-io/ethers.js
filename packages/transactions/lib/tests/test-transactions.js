import assert from "assert";
import { loadTests } from "./utils.js";
import { Transaction } from "../index.js";
describe("Tests Transaction Serializing", function () {
    const tests = loadTests("transactions");
    for (const test of tests) {
        it(`serialized unsigned EIP-155 transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, { type: 0, accessList: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });
            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) {
                txData.chainId = "0x00";
            }
            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedLegacy, "unsignedLegacy");
        });
        // Unsupported parameters for EIP-155; i.e. unspecified chain ID
        if (test.unsignedEip155) {
            it(`serialized unsigned EIP-155 transaction: ${test.name}`, function () {
                const txData = Object.assign({}, test.transaction, { type: 0, accessList: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });
                const tx = Transaction.from(txData);
                assert.equal(tx.unsignedSerialized, test.unsignedEip155, "unsignedEip155");
            });
        }
        it(`serialized unsigned Berlin transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, { type: 1, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined });
            const tx = Transaction.from(txData); //Object.assign({ }, txData, { type: 1, maxFeePerGas: undefined }));
            assert.equal(tx.unsignedSerialized, test.unsignedBerlin, "unsignedBerlin");
        });
        it(`serialized unsigned London transaction: ${test.name}`, function () {
            const txData = test.transaction;
            const tx = Transaction.from(Object.assign({ type: 2 }, txData));
            assert.equal(tx.unsignedSerialized, test.unsignedLondon, "unsignedLondon");
        });
    }
});
describe("Tests Transaction Parsing", function () {
});
//# sourceMappingURL=test-transactions.js.map