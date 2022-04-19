import assert from "assert";
import { retryIt, stats } from "./utils.js";
import { providerNames, getProvider } from "./create-provider.js";
import { BlockchainData } from "./blockchain-data.js";
function sumhash(hash) {
    return `${hash.substring(0, 6)}..${hash.substring(hash.length - 4)}`;
}
function checkBlock(actual, test) {
    assert.equal(actual.hash, test.hash, "hash");
    assert.equal(actual.parentHash, test.parentHash, "parentHash");
    assert.equal(actual.number, test.number, "number");
    assert.equal(actual.timestamp, test.timestamp, "timestamp");
    assert.equal(actual.nonce, test.nonce, "nonce");
    assert.equal(actual.difficulty, test.difficulty, "difficulty");
    assert.equal(actual.gasLimit, test.gasLimit, "gasLimit");
    assert.equal(actual.gasUsed, test.gasUsed, "gasUsed");
    assert.equal(actual.miner, test.miner, "miner");
    assert.equal(actual.extraData, test.extraData, "extraData");
    if (test.baseFeePerGas != null) {
        assert.equal(actual.baseFeePerGas, test.baseFeePerGas, "baseFeePerGas");
    }
    assert.ok(!!actual.transactions, "hasTxs");
    assert.equal(actual.transactions.length, test.transactions.length, "txs.length");
    for (let i = 0; i < actual.transactions.length; i++) {
        const atx = actual.transactions[i];
        const ttx = test.transactions[i];
        assert.equal(atx, ttx, `txs[${i}]`);
    }
}
function checkTransaction(actual, test) {
    assert.equal(actual.hash, test.hash, "hash");
    assert.equal(actual.blockHash, test.blockHash, "blockHash");
    assert.equal(actual.blockNumber, test.blockNumber, "blockNumber");
    assert.equal(actual.type, test.type, "type");
    assert.equal(actual.index, test.index, "index");
    assert.equal(actual.from, test.from, "from");
    assert.equal(actual.to, test.to, "to");
    assert.equal(actual.gasLimit, test.gasLimit, "gasLimit");
    assert.equal(actual.gasPrice, test.gasPrice, "gasPrice");
    if (test.type === 2) {
        assert.equal(actual.maxFeePerGas, test.maxFeePerGas, "maxFeePerGas");
        assert.equal(actual.maxPriorityFeePerGas, test.maxPriorityFeePerGas, "maxPriorityFeePerGas");
    }
    else {
        assert.equal(actual.maxFeePerGas, null, "maxFeePerGas:null");
        assert.equal(actual.maxPriorityFeePerGas, null, "maxPriorityFeePerGas:null");
    }
    assert.equal(actual.value, test.value, "value");
    assert.equal(actual.nonce, test.nonce, "nonce");
    assert.equal(actual.data, test.data, "data");
    assert.equal(actual.creates, test.creates, "creates");
    assert.equal(actual.signature.r, test.signature.r, "signature.r");
    assert.equal(actual.signature.s, test.signature.s, "signature.s");
    if (test.type === 1 || test.type === 2) {
        // EIP-2930; v is the yParity
        assert.equal(actual.signature.yParity, test.signature.v, "signature.v (EIP-2930)");
    }
    else if (test.signature.v > 28) {
        // EIP-155; v is a the encoded chainId
        assert.equal(actual.signature.networkV, test.signature.v, "signature.networkV (EIP-155)");
        assert.equal(actual.signature.yParity, 1 - (test.signature.v % 2), "signature.yParity (EIP-155)");
    }
    else {
        // Pre-EIP-155 legacy; canonical v
        assert.equal(actual.signature.v, test.signature.v, "signature.v (Legacy)");
        assert.equal(actual.signature.networkV, null, "signature.netwrokV:!null (Legacy)");
    }
}
function checkLog(actual, test) {
    assert.equal(actual.address, test.address, "address");
    assert.equal(actual.blockHash, test.blockHash, "blockHash");
    assert.equal(actual.blockNumber, test.blockNumber, "blockNumber");
    assert.equal(actual.data, test.data, "data");
    assert.equal(actual.index, test.index, "logIndex");
    assert.equal(actual.topics.join(","), test.topics.join(","), "topics");
    assert.equal(actual.transactionHash, test.transactionHash, "transactionHash");
    assert.equal(actual.transactionIndex, test.transactionIndex, "transactionIndex");
}
function checkTransactionReceipt(actual, test) {
    assert.equal(actual.hash, test.hash, "hash");
    assert.equal(actual.index, test.index, "index");
    assert.equal(actual.to, test.to, "to");
    assert.equal(actual.from, test.from, "from");
    assert.equal(actual.contractAddress, test.contractAddress, "contractAddress");
    assert.equal(actual.blockHash, test.blockHash, "blockHash");
    assert.equal(actual.blockNumber, test.blockNumber, "blockNumber");
    assert.equal(actual.logsBloom, test.logsBloom, "logsBloom");
    // @TODO: Logs
    assert.ok(actual.logs != null, "logs != null");
    assert.equal(actual.logs.length, test.logs.length, "logs.length");
    for (let i = 0; i < actual.logs.length; i++) {
        checkLog(actual.logs[i], test.logs[i]);
    }
    assert.equal(actual.gasUsed, test.gasUsed, "gasUsed");
    assert.equal(actual.cumulativeGasUsed, test.cumulativeGasUsed, "cumulativeGasUsed");
    assert.equal(actual.gasPrice, test.gasPrice, "gasPrice");
    // Some nodes add status to pre-byzantium nodes, so don't include it at all
    if (actual.status != null) {
        assert.equal(actual.status, test.status, `status: ${actual.status} != ${test.status}`);
    }
    // Some nodes dropped root, event on pre-byzantium blocks
    if (actual.root != null) {
        assert.equal(actual.root, test.root, `root ${actual.root} != ${test.root}`);
    }
}
function stall(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
describe("Test Provider Methods", function () {
    before(function () {
        stats.start("Test Provider Methods");
    });
    // Wait before each testcase so the backends don't throttle
    // use as much
    beforeEach(async function () {
        await stall(1000);
    });
    after(function () {
        stats.end();
    });
    // Etherscan does not support this
    const skipGetBlockByBlockHash = ["EtherscanProvider"];
    const testSets = [];
    for (const providerName of providerNames) {
        for (const network in BlockchainData) {
            const provider = getProvider(providerName, network);
            if (provider == null || providerName === "CloudflareProvider") {
                console.log(`Skipping ${providerName}:${network}...`);
                continue;
            }
            const tests = BlockchainData[network];
            testSets.push({ providerName, provider, network, tests });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.addresses) {
            if (test.balance == null) {
                continue;
            }
            retryIt(`fetches address balance: ${providerName}.${network}.${sumhash(test.address)}`, async function () {
                assert.equal(await provider.getBalanceOf(test.address), test.balance, "balance");
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.addresses) {
            if (test.code == null) {
                continue;
            }
            retryIt(`fetches address code: ${providerName}.${network}.${sumhash(test.address)}`, async function () {
                assert.equal(await provider.getCode(test.address), test.code, "code");
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.addresses) {
            if (test.name == null) {
                continue;
            }
            retryIt(`fetches address reverse record: ${providerName}.${network}.${sumhash(test.address)}`, async function () {
                this.skip();
                assert.equal(await provider.lookupAddress(test.address), test.name, "name");
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.addresses) {
            if (test.storage == null) {
                continue;
            }
            retryIt(`fetches address storage: ${providerName}.${network}.${sumhash(test.address)}`, async function () {
                for (const slot in test.storage) {
                    const value = test.storage[slot];
                    assert.equal(await provider.getStorageAt(test.address, slot), value, `storage:${slot}`);
                }
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.blocks) {
            retryIt(`fetches block by number: ${providerName}.${network}.${test.number}`, async function () {
                checkBlock(await provider.getBlock(test.number), test);
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.blocks) {
            if (skipGetBlockByBlockHash.indexOf(providerName) === -1) {
                retryIt(`fetches block by hash: ${providerName}.${network}.${sumhash(test.hash)}`, async function () {
                    checkBlock(await provider.getBlock(test.hash), test);
                });
            }
            else {
                retryIt(`throws unsupported operation for fetching block by hash: ${providerName}.${network}.${sumhash(test.hash)}`, async function () {
                    await assert.rejects(provider.getBlock(test.hash), (error) => {
                        return (error.code === "UNSUPPORTED_OPERATION" &&
                            error.operation === "getBlock(blockHash)");
                    });
                });
            }
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.transactions) {
            retryIt(`fetches transaction: ${providerName}.${network}.${sumhash(test.hash)}`, async function () {
                checkTransaction(await provider.getTransaction(test.hash), test);
            });
        }
    }
    for (const { providerName, network, provider, tests } of testSets) {
        for (const test of tests.receipts) {
            retryIt(`fetches transaction receipt: ${providerName}.${network}.${sumhash(test.hash)}`, async function () {
                checkTransactionReceipt(await provider.getTransactionReceipt(test.hash), test);
            });
        }
    }
    for (const providerName of providerNames) {
        it(`fetches a pending block: ${providerName}`, async function () {
            this.timeout(15000);
            const provider = getProvider(providerName, "homestead");
            assert.ok(provider, "provider");
            const block = await provider.getBlock("pending");
            assert.ok(!!block, "block");
            assert.equal(block.hash, null, "hash");
            assert.ok(typeof (block.number) === "number", "number");
            assert.ok(typeof (block.timestamp) === "number", "timestamp");
        });
    }
});
//# sourceMappingURL=test-blockchain-data.js.map