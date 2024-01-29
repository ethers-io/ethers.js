import assert from "assert";

import {
    checkProvider, getProvider, setupProviders, providerNames
} from "./create-provider.js";
import { retryIt } from "./utils.js";

import { JsonRpcProvider, Network } from "../index.js";

import type { Provider } from "../index.js";


import {
    networkFeatureAtBlock, networkNames,
    testAddress, testBlock, testReceipt, testTransaction
} from "./blockchain-data.js";

import type { TestBlockchainNetwork } from "./blockchain-data.js";


setupProviders();


function forEach<T extends { test: string }>(prefix: string, tests: Record<TestBlockchainNetwork, Array<T>>, func: (providerName: string, test: T) => (null | ((p: Provider) => Promise<void>))): void {
    for (const networkName of networkNames) {
        const networkTests: Array<T> = tests[networkName];
        if (networkTests == null) { continue; }

        for (const test of networkTests) {
            for (const providerName of providerNames) {
                if (!checkProvider(providerName, networkName)) { continue; }

                // Let the testcase skip this by returning null
                const testFunc = func(providerName, test);
                if (testFunc == null) { continue; }

                // Prepare the testcase
                retryIt(`${ prefix }: ${ providerName }:${ networkName }.${ test.test }`, async function() {
                    // Create a provider
                    const provider = getProvider(providerName, networkName);

                    try {
                        assert.ok(provider != null, "missing provider");

                        await testFunc(provider);

                    } catch (error) {
                        // Shutdown socket-based provider, otherwise its socket will prevent
                        // this process from exiting
                        if ((<any>provider).destroy) { (<any>provider).destroy(); }

                        throw error;
                    }

                    // Shutdown socket-based provider, otherwise its socket will prevent
                    // this process from exiting
                    if ((<any>provider).destroy) { (<any>provider).destroy(); }
                });
            }
        }
    }
}

describe("Test Provider Address operations", function() {
    forEach("test getBalance(address)", testAddress, (providerName, test) => {
        if (test.balance == null) { return null; }
        return async (provider) => {
            assert.equal(await provider.getBalance(test.address), test.balance);
        };
    });

    forEach("test getCode(address)", testAddress, (providerName, test) => {
        if (test.code == null) { return null; }
        return async (provider) => {
            assert.equal(await provider.getCode(test.address), test.code);
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
    forEach("test getStorage(address)", testAddress, (providerName, test) => {
        if (test.storage == null) { return null; }
        return async (provider) => {
            for (const key in test.storage) {
                assert.equal(await provider.getStorage(test.address, key), test.storage[key]);
            }
        };
    });

    forEach("test getTransactionCount(address)", testAddress, (providerName, test) => {
        if (test.balance == null) { return null; }
        return async (provider) => {
            assert.equal(await provider.getTransactionCount(test.address), test.nonce);
        };
    });
});

function assertObj(prefix: string, actual: any, expected: any): void {
    assert.ok(actual != null, `${ prefix } is null`);
    for (const key in expected) {
        if (expected[key] === undefined) { continue; }
        assert.equal(actual[key], expected[key], `${ prefix }.${ key }`);
    }
}

function assertBlock(actual: any, expected: any): void {
    // Check transactions
    for (let i = 0; i < expected.transactions.length; i++) {
        const expectedTx = expected.transactions[i];
        if (typeof(expectedTx) === "string") {
            assert.equal(actual.transactions[i], expectedTx, `block.transactions[${ i }]`);
        } else {
            throw new Error("@TODO");
        }
    }

    // Remove the transactions and test keys
    expected = Object.assign({ }, expected, { transactions: undefined, test: undefined });

    // Check remaining keys
    assertObj("block", actual, expected);
}

function assertTransaction(actual: any, expected: any): void {
    // @TODO: Accesslist

    // Check signature
    assertObj("tx.signature", actual.signature, expected.signature);

    // Remove the transactions and test keys
    expected = Object.assign({ }, expected, {
        accessList: undefined,
        signature: undefined,
        test: undefined
    });

    // Check remaining keys
    assertObj("tx", actual, expected);
}

function assertReceipt(actual: any, expected: any): void {

    // Check logs
    for (let i = 0; i < expected.logs.length; i++) {
        let expectedLog = expected.logs[i];
        for (let j = 0; j < expectedLog.topics.length; j++) {
            assert.equal(actual.logs[i].topics[j], expectedLog.topics[j], `receipt.logs[${ i }].topics[${ j }]`);
        }

        expectedLog = Object.assign({ }, expectedLog, { topics: undefined });

        assertObj(`receipt.log[${ i }]`, actual.logs[i], expectedLog);
    }

    // Remove the transactions and test keys
    expected = Object.assign({ }, expected, { logs: undefined, test: undefined });

    // In Byzantium, the root was dropped and the status was added
    if (networkFeatureAtBlock("byzantium", expected.blockNumber)) {
        expected = Object.assign({ }, expected, { root: undefined });
    } else {
        expected = Object.assign({ }, expected, { status: undefined });
    }

    // Check remaining keys
    assertObj("receipt", actual, expected);
}

describe("Test Provider Block operations", function() {
    forEach("test getBlock(blockHash)", testBlock, (providerName, test) => {
        // Etherscan does not support getting a block by blockhash
        if (providerName === "EtherscanProvider") { return null; }

        return async (provider) => {
            assertBlock(await provider.getBlock(test.hash), test);
        };
    });

    forEach("test getBlock(blockNumber)", testBlock, (providerName, test) => {
        return async (provider) => {
            assertBlock(await provider.getBlock(test.number), test);
        };
    });
});

describe("Test Provider Transaction operations", function() {
    forEach("test getTransaction(hash)", testTransaction, (providerName, test) => {
        return async (provider) => {
            assertTransaction(await provider.getTransaction(test.hash), test);
        };
    });

    forEach("test getTransactionReceipt(hash)", testReceipt, (providerName, test) => {
        return async (provider) => {
            const receipt = await provider.getTransactionReceipt(test.hash)
            assert.ok(receipt != null, "receipt != null");

            // Cloudflare doesn't return the root in legacy receipts; but it isn't
            // *actually* that important, so we'll give it a pass...
            if (providerName === "CloudflareProvider" || providerName === "AnkrProvider" || providerName === "PocketProvider") {
                test = Object.assign({ } , test, { root: undefined });
            }

            //if (providerName === "PocketProvider") {
            //}

            assertReceipt(receipt, test);
        };
    });

    forEach("test lookupAddress(addr) == null", testReceipt, (providerName, test) => {
        return async (provider) => {
            const name = await provider.lookupAddress("0x0123456789012345678901234567890123456789")
            assert.ok(name == null, "name == null");
        };
    });
});

describe("Test Networks", function() {
    const networks = [
        "mainnet", "goerli", "sepolia",
        "arbitrum", "arbitrum-goerli", "arbitrum-sepolia",
        "base", "base-goerli", "base-sepolia",
        "bnb", "bnbt",
        "linea", "linea-goerli",
        "matic", "matic-mumbai",
        "optimism", "optimism-goerli", "optimism-sepolia",
        "xdai",
    ];

    const providerNames = [
        "AlchemyProvider", "InfuraProvider", "AnkrProvider",
        "QuickNodeProvider",
    ];

    for (const providerName of providerNames) {
        for (const networkName of networks) {
            const network = Network.from(networkName);
            const provider = getProvider(providerName, networkName);
            if (provider == null || !(provider instanceof JsonRpcProvider)) { continue; }

            it(`checks network chainId: ${ providerName }/${ networkName }`, async function() {
                const chainId = await provider.send("eth_chainId", [ ]);
                assert.equal(parseInt(chainId), network.chainId, "chainId");
            });
        }
    }
});
