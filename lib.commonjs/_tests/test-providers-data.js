"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const create_provider_js_1 = require("./create-provider.js");
const utils_js_1 = require("./utils.js");
const blockchain_data_js_1 = require("./blockchain-data.js");
(0, create_provider_js_1.setupProviders)();
function forEach(prefix, tests, func) {
    for (const networkName of blockchain_data_js_1.networkNames) {
        const networkTests = tests[networkName];
        if (networkTests == null) {
            continue;
        }
        for (const test of networkTests) {
            for (const providerName of create_provider_js_1.providerNames) {
                if (!(0, create_provider_js_1.checkProvider)(providerName, networkName)) {
                    continue;
                }
                // Let the testcase skip this by returning null
                const testFunc = func(providerName, test);
                if (testFunc == null) {
                    continue;
                }
                // Prepare the testcase
                (0, utils_js_1.retryIt)(`${prefix}: ${providerName}:${networkName}.${test.test}`, async function () {
                    // Create a provider
                    const provider = (0, create_provider_js_1.getProvider)(providerName, networkName);
                    try {
                        assert_1.default.ok(provider != null, "missing provider");
                        await testFunc(provider);
                    }
                    catch (error) {
                        // Shutdown socket-based provider, otherwise its socket will prevent
                        // this process from exiting
                        if (provider.destroy) {
                            provider.destroy();
                        }
                        throw error;
                    }
                    // Shutdown socket-based provider, otherwise its socket will prevent
                    // this process from exiting
                    if (provider.destroy) {
                        provider.destroy();
                    }
                });
            }
        }
    }
}
describe("Test Provider Address operations", function () {
    forEach("test getBalance(address)", blockchain_data_js_1.testAddress, (providerName, test) => {
        if (test.balance == null) {
            return null;
        }
        return async (provider) => {
            assert_1.default.equal(await provider.getBalance(test.address), test.balance);
        };
    });
    forEach("test getCode(address)", blockchain_data_js_1.testAddress, (providerName, test) => {
        if (test.code == null) {
            return null;
        }
        return async (provider) => {
            assert_1.default.equal(await provider.getCode(test.address), test.code);
        };
    });
    /*
        forEach("test lookupAddress(address)", testAddress, (provider, test) => {
            if (test.name == null) { return null; }
            return async () => {
                assert.equal(await provider.lookupAddress(test.address), test.name);
            };
        });
    
        forEach("test resolveName(name)", testAddress, (provider, test) => {
            if (test.name == null) { return null; }
            return async () => {
                assert.equal(await provider.lookupAddress(<string>(test.name)), test.address);
            };
        });
    */
    forEach("test getStorage(address)", blockchain_data_js_1.testAddress, (providerName, test) => {
        if (test.storage == null) {
            return null;
        }
        return async (provider) => {
            for (const key in test.storage) {
                assert_1.default.equal(await provider.getStorage(test.address, key), test.storage[key]);
            }
        };
    });
    forEach("test getTransactionCount(address)", blockchain_data_js_1.testAddress, (providerName, test) => {
        if (test.balance == null) {
            return null;
        }
        return async (provider) => {
            assert_1.default.equal(await provider.getTransactionCount(test.address), test.nonce);
        };
    });
});
function assertObj(prefix, actual, expected) {
    assert_1.default.ok(actual != null, `${prefix} is null`);
    for (const key in expected) {
        if (expected[key] === undefined) {
            continue;
        }
        assert_1.default.equal(actual[key], expected[key], `${prefix}.${key}`);
    }
}
function assertBlock(actual, expected) {
    // Check transactions
    for (let i = 0; i < expected.transactions.length; i++) {
        const expectedTx = expected.transactions[i];
        if (typeof (expectedTx) === "string") {
            assert_1.default.equal(actual.transactions[i], expectedTx, `block.transactions[${i}]`);
        }
        else {
            throw new Error("@TODO");
        }
    }
    // Remove the transactions and test keys
    expected = Object.assign({}, expected, { transactions: undefined, test: undefined });
    // Check remaining keys
    assertObj("block", actual, expected);
}
function assertTransaction(actual, expected) {
    // @TODO: Accesslist
    // Check signature
    assertObj("tx.signature", actual.signature, expected.signature);
    // Remove the transactions and test keys
    expected = Object.assign({}, expected, {
        accessList: undefined,
        signature: undefined,
        test: undefined
    });
    // Check remaining keys
    assertObj("tx", actual, expected);
}
function assertReceipt(actual, expected) {
    // Check logs
    for (let i = 0; i < expected.logs.length; i++) {
        let expectedLog = expected.logs[i];
        for (let j = 0; j < expectedLog.topics.length; j++) {
            assert_1.default.equal(actual.logs[i].topics[j], expectedLog.topics[j], `receipt.logs[${i}].topics[${j}]`);
        }
        expectedLog = Object.assign({}, expectedLog, { topics: undefined });
        assertObj(`receipt.log[${i}]`, actual.logs[i], expectedLog);
    }
    // Remove the transactions and test keys
    expected = Object.assign({}, expected, { logs: undefined, test: undefined });
    // In Byzantium, the root was dropped and the status was added
    if ((0, blockchain_data_js_1.networkFeatureAtBlock)("byzantium", expected.blockNumber)) {
        expected = Object.assign({}, expected, { root: undefined });
    }
    else {
        expected = Object.assign({}, expected, { status: undefined });
    }
    // Check remaining keys
    assertObj("receipt", actual, expected);
}
describe("Test Provider Block operations", function () {
    forEach("test getBlock(blockHash)", blockchain_data_js_1.testBlock, (providerName, test) => {
        // Etherscan does not support getting a block by blockhash
        if (providerName === "EtherscanProvider") {
            return null;
        }
        return async (provider) => {
            assertBlock(await provider.getBlock(test.hash), test);
        };
    });
    forEach("test getBlock(blockNumber)", blockchain_data_js_1.testBlock, (providerName, test) => {
        return async (provider) => {
            assertBlock(await provider.getBlock(test.number), test);
        };
    });
});
describe("Test Provider Transaction operations", function () {
    forEach("test getTransaction(hash)", blockchain_data_js_1.testTransaction, (providerName, test) => {
        return async (provider) => {
            assertTransaction(await provider.getTransaction(test.hash), test);
        };
    });
    forEach("test getTransactionReceipt(hash)", blockchain_data_js_1.testReceipt, (providerName, test) => {
        return async (provider) => {
            const receipt = await provider.getTransactionReceipt(test.hash);
            assert_1.default.ok(receipt != null, "receipt != null");
            // Cloudflare doesn't return the root in legacy receipts; but it isn't
            // *actually* that important, so we'll give it a pass...
            if (providerName === "CloudflareProvider" || providerName === "AnkrProvider" || providerName === "PocketProvider") {
                test = Object.assign({}, test, { root: undefined });
            }
            //if (providerName === "PocketProvider") {
            //}
            assertReceipt(receipt, test);
        };
    });
    forEach("test lookupAddress(addr) == null", blockchain_data_js_1.testReceipt, (providerName, test) => {
        return async (provider) => {
            const name = await provider.lookupAddress("0x0123456789012345678901234567890123456789");
            assert_1.default.ok(name == null, "name == null");
        };
    });
});
//# sourceMappingURL=test-providers-data.js.map