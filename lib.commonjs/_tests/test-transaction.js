"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
const BN_0 = BigInt(0);
describe("Tests Unsigned Transaction Serializing", function () {
    const tests = (0, utils_js_1.loadTests)("transactions");
    for (const test of tests) {
        it(`serialized unsigned legacy transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });
            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) {
                txData.chainId = "0x00";
            }
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.unsignedSerialized, test.unsignedLegacy, "unsignedLegacy");
        });
    }
    for (const test of tests) {
        // Unsupported parameters for EIP-155; i.e. unspecified chain ID
        if (!test.unsignedEip155) {
            continue;
        }
        it(`serialized unsigned EIP-155 transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.unsignedSerialized, test.unsignedEip155, "unsignedEip155");
        });
    }
    for (const test of tests) {
        it(`serialized unsigned Berlin transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 1,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.unsignedSerialized, test.unsignedBerlin, "unsignedBerlin");
        });
    }
    for (const test of tests) {
        it(`serialized unsigned London transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, { type: 2 });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.unsignedSerialized, test.unsignedLondon, "unsignedLondon");
        });
    }
    for (const test of tests) {
        if (!test.unsignedCancun) {
            continue;
        }
        it(`serialized unsigned cancun transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, { type: 3 });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.unsignedSerialized, test.unsignedCancun, "unsignedCancun");
        });
    }
});
describe("Tests Signed Transaction Serializing", function () {
    const tests = (0, utils_js_1.loadTests)("transactions");
    for (const test of tests) {
        it(`serialized signed legacy transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
                signature: test.signatureLegacy
            });
            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) {
                txData.chainId = "0x00";
            }
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.serialized, test.signedLegacy, "signedLegacy");
        });
    }
    for (const test of tests) {
        if (!test.unsignedEip155) {
            continue;
        }
        it(`serialized signed EIP-155 transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
                signature: test.signatureEip155
            });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.serialized, test.signedEip155, "signedEip155");
        });
    }
    for (const test of tests) {
        it(`serialized signed Berlin transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 1,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            }, { signature: test.signatureBerlin });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.serialized, test.signedBerlin, "signedBerlin");
        });
    }
    for (const test of tests) {
        it(`serialized signed London transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 2,
                signature: test.signatureLondon
            });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.serialized, test.signedLondon, "signedLondon");
        });
    }
    for (const test of tests) {
        if (!test.signedCancun) {
            continue;
        }
        it(`serialized signed Cancun transaction: ${test.name}`, function () {
            const txData = Object.assign({}, test.transaction, {
                type: 3,
                signature: test.signatureCancun
            });
            const tx = index_js_1.Transaction.from(txData);
            assert_1.default.equal(tx.serialized, test.signedCancun, "signedCancun");
        });
    }
});
function assertTxUint(actual, _expected, name) {
    const expected = (_expected != null ? BigInt(_expected) : null);
    assert_1.default.equal(actual, expected, name);
}
function assertTxEqual(actual, expected) {
    assert_1.default.equal(actual.to, expected.to, "to");
    assert_1.default.equal(actual.nonce, expected.nonce, "nonce");
    assertTxUint(actual.gasLimit, expected.gasLimit, "gasLimit");
    assertTxUint(actual.gasPrice, expected.gasPrice, "gasPrice");
    assertTxUint(actual.maxFeePerGas, expected.maxFeePerGas, "maxFeePerGas");
    assertTxUint(actual.maxPriorityFeePerGas, expected.maxPriorityFeePerGas, "maxPriorityFeePerGas");
    assert_1.default.equal(actual.data, expected.data, "data");
    assertTxUint(actual.value, expected.value, "value");
    if (expected.accessList) {
        assert_1.default.equal(JSON.stringify(actual.accessList), JSON.stringify(expected.accessList), "accessList");
    }
    else {
        assert_1.default.equal(actual.accessList, null, "accessList:!null");
    }
    assertTxUint(actual.chainId, expected.chainId, "chainId");
}
function addDefault(tx, key, defaultValue) {
    if (tx[key] == null) {
        tx[key] = defaultValue;
    }
}
function addDefaults(tx) {
    tx = Object.assign({}, tx);
    addDefault(tx, "nonce", 0);
    addDefault(tx, "gasLimit", BN_0);
    addDefault(tx, "gasPrice", BN_0);
    addDefault(tx, "maxFeePerGas", BN_0);
    addDefault(tx, "maxPriorityFeePerGas", BN_0);
    addDefault(tx, "value", BN_0);
    addDefault(tx, "data", "0x");
    addDefault(tx, "accessList", []);
    addDefault(tx, "chainId", BN_0);
    return tx;
}
describe("Tests Unsigned Transaction Parsing", function () {
    const tests = (0, utils_js_1.loadTests)("transactions");
    for (const test of tests) {
        it(`parses unsigned legacy transaction: ${test.name}`, function () {
            const tx = index_js_1.Transaction.from(test.unsignedLegacy);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            expected.chainId = BN_0;
            assertTxEqual(tx, expected);
        });
    }
    for (const test of tests) {
        if (!test.unsignedEip155) {
            continue;
        }
        it(`parses unsigned EIP-155 transaction: ${test.name}`, function () {
            const tx = index_js_1.Transaction.from(test.unsignedEip155);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            assertTxEqual(tx, expected);
        });
    }
    for (const test of tests) {
        it(`parses unsigned Berlin transaction: ${test.name}`, function () {
            const tx = index_js_1.Transaction.from(test.unsignedBerlin);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            assertTxEqual(tx, expected);
        });
    }
    for (const test of tests) {
        it(`parses unsigned London transaction: ${test.name}`, function () {
            const tx = index_js_1.Transaction.from(test.unsignedLondon);
            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;
            assertTxEqual(tx, expected);
        });
    }
    for (const test of tests) {
        if (!test.unsignedCancun) {
            continue;
        }
        it(`parses unsigned Cancun transaction: ${test.name}`, function () {
            const tx = index_js_1.Transaction.from(test.unsignedCancun);
            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;
            assertTxEqual(tx, expected);
        });
    }
});
describe("Tests Signed Transaction Parsing", function () {
    const tests = (0, utils_js_1.loadTests)("transactions");
    for (const test of tests) {
        it(`parses signed legacy transaction: ${test.name}`, function () {
            let tx = index_js_1.Transaction.from(test.signedLegacy);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            expected.chainId = BN_0;
            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);
                assert_1.default.equal(tx.typeName, "legacy", "typeName");
                assert_1.default.equal(tx.isLegacy(), true, "isLegacy");
                assert_1.default.equal(tx.isBerlin(), false, "isBerlin");
                assert_1.default.equal(tx.isLondon(), false, "isLondon");
                assert_1.default.ok(!!tx.signature, "signature:!null");
                assert_1.default.equal(tx.signature.r, test.signatureLegacy.r, "signature.r");
                assert_1.default.equal(tx.signature.s, test.signatureLegacy.s, "signature.s");
                assert_1.default.equal(BigInt(tx.signature.v), BigInt(test.signatureLegacy.v), "signature.v");
                tx = tx.clone();
            }
        });
    }
    for (const test of tests) {
        if (!test.unsignedEip155) {
            continue;
        }
        it(`parses signed EIP-155 transaction: ${test.name}`, function () {
            let tx = index_js_1.Transaction.from(test.signedEip155);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);
                assert_1.default.equal(tx.typeName, "legacy", "typeName");
                assert_1.default.equal(tx.isLegacy(), true, "isLegacy");
                assert_1.default.equal(tx.isBerlin(), false, "isBerlin");
                assert_1.default.equal(tx.isLondon(), false, "isLondon");
                assert_1.default.equal(tx.isCancun(), false, "isCancun");
                assert_1.default.ok(!!tx.signature, "signature:!null");
                assert_1.default.equal(tx.signature.r, test.signatureEip155.r, "signature.r");
                assert_1.default.equal(tx.signature.s, test.signatureEip155.s, "signature.s");
                assert_1.default.equal(tx.signature.networkV, BigInt(test.signatureEip155.v), "signature.v");
                tx = tx.clone();
            }
        });
    }
    for (const test of tests) {
        it(`parses signed Berlin transaction: ${test.name}`, function () {
            let tx = index_js_1.Transaction.from(test.signedBerlin);
            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);
                assert_1.default.equal(tx.typeName, "eip-2930", "typeName");
                assert_1.default.equal(tx.isLegacy(), false, "isLegacy");
                assert_1.default.equal(tx.isBerlin(), true, "isBerlin");
                assert_1.default.equal(tx.isLondon(), false, "isLondon");
                assert_1.default.equal(tx.isCancun(), false, "isCancun");
                assert_1.default.ok(!!tx.signature, "signature:!null");
                assert_1.default.equal(tx.signature.r, test.signatureBerlin.r, "signature.r");
                assert_1.default.equal(tx.signature.s, test.signatureBerlin.s, "signature.s");
                assert_1.default.equal(tx.signature.yParity, parseInt(test.signatureBerlin.v), "signature.v");
                tx = tx.clone();
            }
        });
    }
    for (const test of tests) {
        it(`parses signed London transaction: ${test.name}`, function () {
            let tx = index_js_1.Transaction.from(test.signedLondon);
            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;
            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);
                assert_1.default.equal(tx.typeName, "eip-1559", "typeName");
                assert_1.default.equal(tx.isLegacy(), false, "isLegacy");
                assert_1.default.equal(tx.isBerlin(), false, "isBerlin");
                assert_1.default.equal(tx.isLondon(), true, "isLondon");
                assert_1.default.equal(tx.isCancun(), false, "isCancun");
                assert_1.default.ok(!!tx.signature, "signature:!null");
                assert_1.default.equal(tx.signature.r, test.signatureLondon.r, "signature.r");
                assert_1.default.equal(tx.signature.s, test.signatureLondon.s, "signature.s");
                assert_1.default.equal(tx.signature.yParity, parseInt(test.signatureLondon.v), "signature.v");
                // Test cloning
                tx = tx.clone();
            }
        });
    }
    for (const test of tests) {
        if (!test.signedCancun) {
            continue;
        }
        it(`parses signed Cancun transaction: ${test.name}`, function () {
            let tx = index_js_1.Transaction.from(test.signedCancun);
            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;
            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);
                assert_1.default.equal(tx.typeName, "eip-4844", "typeName");
                assert_1.default.equal(tx.isLegacy(), false, "isLegacy");
                assert_1.default.equal(tx.isBerlin(), false, "isBerlin");
                assert_1.default.equal(tx.isLondon(), false, "isLondon");
                assert_1.default.equal(tx.isCancun(), true, "isCancun");
                assert_1.default.ok(!!tx.signature, "signature:!null");
                assert_1.default.equal(tx.signature.r, test.signatureCancun.r, "signature.r");
                assert_1.default.equal(tx.signature.s, test.signatureCancun.s, "signature.s");
                assert_1.default.equal(tx.signature.yParity, parseInt(test.signatureCancun.v), "signature.v");
                // Test cloning
                tx = tx.clone();
            }
        });
    }
});
describe("Tests Transaction Parameters", function () {
    const badData = [
        {
            name: "accessList=0x09",
            data: "0x02c9010203040580070809",
            message: "invalid access list",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09]",
            data: "0x02ca0102030405800708c109",
            message: "invalid address-slot set",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09,0x10]",
            data: "0x02cb0102030405800708c20910",
            message: "invalid address-slot set",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09,[HASH]] (bad address)",
            data: "0x02ed0102030405800708e4e309e1a024412927c99a717115f5308c0ebd11136659b3cb6291abb4a8f87e9856a12538",
            message: "invalid address",
            argument: "accessList"
        },
        {
            name: "accessList=[ADDR,[0x09]] (bad slot)",
            data: "0x02e10102030405800708d8d794939d33ff01840e9eeeb67525ec2f7035af41a4b1c109",
            message: "invalid slot",
            argument: "accessList"
        }
    ];
    for (const { name, data, argument, message } of badData) {
        it(`correctly fails on bad accessList: ${name}`, function () {
            assert_1.default.throws(() => {
                // The access list is a single value: 0x09 instead of
                // structured data
                const result = index_js_1.Transaction.from(data);
                console.log(result);
            }, (error) => {
                return ((0, index_js_1.isError)(error, "INVALID_ARGUMENT") &&
                    error.argument === argument &&
                    (message == null || error.message.startsWith(message)));
            });
        });
    }
});
//# sourceMappingURL=test-transaction.js.map