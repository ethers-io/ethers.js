import assert from "assert";

import { FetchRequest, OtterscanProvider, JsonRpcProvider } from "../index.js";

import type {
    OtsInternalOp,
    OtsBlockDetails,
    OtsBlockTransactionsPage,
    OtsAddressTransactionsPage,
    OtsTraceEntry,
    OtsContractCreator
} from "../providers/provider-otterscan.js";

describe("Test Otterscan Provider", function () {
    // Mock OTS responses for testing
    function createMockOtsProvider() {
        const req = new FetchRequest("http://localhost:8545/");

        req.getUrlFunc = async (_req, signal) => {
            const bodyStr =
                typeof _req.body === "string" ? _req.body : new TextDecoder().decode(_req.body || new Uint8Array());
            const request = JSON.parse(bodyStr || "{}");

            let result: any;

            switch (request.method) {
                case "ots_getApiLevel":
                    result = 8;
                    break;
                case "ots_hasCode":
                    // Mock: return true for non-zero addresses
                    result = request.params[0] !== "0x0000000000000000000000000000000000000000";
                    break;
                case "ots_getInternalOperations":
                    result = [
                        {
                            type: 0,
                            from: "0x1234567890123456789012345678901234567890",
                            to: "0x0987654321098765432109876543210987654321",
                            value: "0x1000000000000000000"
                        }
                    ];
                    break;
                case "ots_getTransactionError":
                    result = "0x";
                    break;
                case "ots_traceTransaction":
                    result = [
                        {
                            type: "CALL",
                            depth: 0,
                            from: "0x737d16748aa3f93d6ff1b0aefa3eca7fffca868e",
                            to: "0x545ec8c956d307cc3bf7f9ba1e413217eff1bc7a",
                            value: "0x0",
                            input: "0xff02000000000000001596d80c86b939000000000000000019cfaf37a98833fed61000a72a288205ead800f1978fc2d943013f0e9f56d3a1077a294dde1b09bb078844df40758a5d0f9a27017ed0000000011e00000300000191ccf22538c30f09d14be27569c5bdb61f99b3c9f33c0bb40d1bbf6eafaaea2adfb7d2d3ebc1e49c01857e0000000000000000"
                        },
                        {
                            type: "DELEGATECALL",
                            depth: 1,
                            from: "0x545ec8c956d307cc3bf7f9ba1e413217eff1bc7a",
                            to: "0x998f7f745f61a910da86d8aa65db60b67a40da6d",
                            value: null,
                            input: "0x5697217300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000036a72a288205ead800f1978fc2d943013f0e9f56d3a1077a294dde1b09bb078844df40758a5d0f9a27017ed0000000011e000003000001"
                        },
                        {
                            type: "STATICCALL", 
                            depth: 2,
                            from: "0x545ec8c956d307cc3bf7f9ba1e413217eff1bc7a",
                            to: "0x91ccf22538c30f09d14be27569c5bdb61f99b3c9",
                            value: null,
                            input: "0x0902f1ac"
                        }
                    ];
                    break;
                case "ots_getBlockDetails":
                    result = {
                        block: {
                            hash: "0x123abc",
                            number: "0x1000",
                            timestamp: "0x499602d2",
                            parentHash: "0x000abc",
                            nonce: "0x0",
                            difficulty: "0x0",
                            gasLimit: "0x1c9c380",
                            gasUsed: "0x5208",
                            miner: "0x0000000000000000000000000000000000000000",
                            extraData: "0x",
                            baseFeePerGas: "0x0",
                            logsBloom: null
                        },
                        totalFees: "0x5000000000000000"
                    };
                    break;
                case "ots_getBlockTransactions":
                    result = {
                        transactions: [
                            {
                                hash: "0x456def",
                                from: "0x1111111111111111111111111111111111111111",
                                to: "0x2222222222222222222222222222222222222222",
                                value: "0x1000000000000000000"
                            }
                        ],
                        receipts: [
                            {
                                status: "0x1",
                                gasUsed: "0x5208"
                            }
                        ]
                    };
                    break;
                case "ots_searchTransactionsBefore":
                case "ots_searchTransactionsAfter":
                    result = {
                        txs: [
                            {
                                blockHash: "0x5adc8e4d5d8eee95a3b390e9cbed9f1633f94dae073b70f2c890d419b7bb7ca0",
                                blockNumber: "0x121e890",
                                from: "0x17076a2bdff9db26544a9201faad098b76b51b31",
                                gas: "0x5208",
                                gasPrice: "0x44721f210",
                                maxPriorityFeePerGas: "0x5f5e100",
                                maxFeePerGas: "0x5e2b132fb",
                                hash: "0xe689a340d805b0e6d5f26a4498caecec81752003b9352bb5802819641baaf9a9",
                                input: "0x",
                                nonce: "0x1f",
                                to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                                transactionIndex: "0x11",
                                value: "0x38d7ea4c68000",
                                type: "0x2",
                                accessList: [],
                                chainId: "0x1",
                                v: "0x0",
                                yParity: "0x0",
                                r: "0xd3ecccab74bc708d2ead0d913c38990870c31f3f3eee3c7354752c1fdd826b19",
                                s: "0x275c7656704d35da38b197d3365ef73388d42a8ca2304ce849547ce2348b087"
                            }
                        ],
                        receipts: [
                            {
                                blockHash: "0x5adc8e4d5d8eee95a3b390e9cbed9f1633f94dae073b70f2c890d419b7bb7ca0",
                                blockNumber: "0x121e890",
                                contractAddress: null,
                                cumulativeGasUsed: "0x2654c4",
                                effectiveGasPrice: "0x44721f210",
                                from: "0x17076a2bdff9db26544a9201faad098b76b51b31",
                                gasUsed: "0x5208",
                                logs: [],
                                logsBloom:
                                    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                                status: "0x1",
                                timestamp: 1705166675,
                                to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                                transactionHash: "0xe689a340d805b0e6d5f26a4498caecec81752003b9352bb5802819641baaf9a9",
                                transactionIndex: "0x11",
                                type: "0x2"
                            }
                        ],
                        firstPage: true,
                        lastPage: false
                    };
                    break;
                case "ots_getTransactionBySenderAndNonce":
                    result = "0xabcdef123456789";
                    break;
                case "ots_getContractCreator":
                    result = {
                        hash: "0x987654321",
                        creator: "0x1111111111111111111111111111111111111111"
                    };
                    break;
                case "eth_chainId":
                    result = "0x1";
                    break;
                case "eth_blockNumber":
                    result = "0x1000";
                    break;
                default:
                    throw new Error(`Unsupported method: ${request.method}`);
            }

            const response = {
                id: request.id,
                jsonrpc: "2.0",
                result
            };

            return {
                statusCode: 200,
                statusMessage: "OK",
                headers: { "content-type": "application/json" },
                body: new TextEncoder().encode(JSON.stringify(response))
            };
        };

        return new OtterscanProvider(req, 1, { staticNetwork: true });
    }

    it("should extend JsonRpcProvider", function () {
        const provider = createMockOtsProvider();
        assert(provider instanceof OtterscanProvider, "should be OtterscanProvider instance");
        assert(provider instanceof JsonRpcProvider, "should extend JsonRpcProvider");
    });

    it("should get OTS API level", async function () {
        const provider = createMockOtsProvider();
        const apiLevel = await provider.otsApiLevel();
        assert.strictEqual(apiLevel, 8, "should return API level 8");
    });

    it("should check if address has code", async function () {
        const provider = createMockOtsProvider();

        const hasCodeTrue = await provider.hasCode("0x1234567890123456789012345678901234567890");
        assert.strictEqual(hasCodeTrue, true, "should return true for non-zero address");

        const hasCodeFalse = await provider.hasCode("0x0000000000000000000000000000000000000000");
        assert.strictEqual(hasCodeFalse, false, "should return false for zero address");
    });

    it("should get internal operations", async function () {
        const provider = createMockOtsProvider();
        const internalOps = await provider.getInternalOperations("0x123");

        assert(Array.isArray(internalOps), "should return array");
        assert.strictEqual(internalOps.length, 1, "should have one operation");

        const op = internalOps[0];
        assert.strictEqual(op.type, 0, "should have type 0");
        assert.strictEqual(op.from, "0x1234567890123456789012345678901234567890", "should have correct from");
        assert.strictEqual(op.to, "0x0987654321098765432109876543210987654321", "should have correct to");
        assert.strictEqual(op.value, "0x1000000000000000000", "should have correct value");
    });

    it("should get transaction error data", async function () {
        const provider = createMockOtsProvider();
        const errorData = await provider.getTransactionErrorData("0x123");
        assert.strictEqual(errorData, "0x", "should return empty error data");
    });

    it("should get transaction revert reason", async function () {
        const provider = createMockOtsProvider();
        const revertReason = await provider.getTransactionRevertReason("0x123");
        assert.strictEqual(revertReason, null, "should return null for no error");
    });

    it("should trace transaction", async function () {
        const provider = createMockOtsProvider();
        const trace = await provider.traceTransaction("0x123");
        assert(Array.isArray(trace), "should return array of trace entries");
        assert.strictEqual(trace.length, 3, "should have three trace entries");

        const firstEntry = trace[0];
        assert.strictEqual(firstEntry.type, "CALL", "first entry should be CALL");
        assert.strictEqual(firstEntry.depth, 0, "first entry should have depth 0");
        assert.strictEqual(firstEntry.from, "0x737d16748aa3f93d6ff1b0aefa3eca7fffca868e", "should have correct from");
        assert.strictEqual(firstEntry.to, "0x545ec8c956d307cc3bf7f9ba1e413217eff1bc7a", "should have correct to");
        assert.strictEqual(firstEntry.value, "0x0", "should have correct value");
        assert(firstEntry.input?.startsWith("0xff02"), "should have input data");
        
        const delegateCall = trace[1];
        assert.strictEqual(delegateCall.type, "DELEGATECALL", "second entry should be DELEGATECALL");
        assert.strictEqual(delegateCall.value, null, "delegatecall should have null value");
        
        const staticCall = trace[2];
        assert.strictEqual(staticCall.type, "STATICCALL", "third entry should be STATICCALL");
        assert.strictEqual(staticCall.value, null, "staticcall should have null value");
    });

    it("should get block details", async function () {
        const provider = createMockOtsProvider();
        const blockDetails = await provider.getBlockDetails(4096);

        assert(typeof blockDetails === "object", "should return object");
        assert.strictEqual(
            blockDetails.block.logsBloom,
            null,
            "should have null logsBloom (removed for efficiency)"
        );
        assert.strictEqual(blockDetails.totalFees, "0x5000000000000000", "should have total fees");
        assert(blockDetails.block, "should have block data");
    });

    it("should get block transactions", async function () {
        const provider = createMockOtsProvider();
        const blockTxs = await provider.getBlockTransactions(4096, 0, 10);

        assert(Array.isArray(blockTxs.transactions), "should have transactions array");
        assert(Array.isArray(blockTxs.receipts), "should have receipts array");
        assert.strictEqual(blockTxs.transactions.length, 1, "should have one transaction");
        assert.strictEqual(blockTxs.receipts.length, 1, "should have one receipt");
    });

    it("should search transactions before", async function () {
        const provider = createMockOtsProvider();
        const searchResults = await provider.searchTransactionsBefore("0x123", 4096, 10);

        assert(Array.isArray(searchResults.txs), "should have txs array");
        assert(Array.isArray(searchResults.receipts), "should have receipts array");
        assert.strictEqual(searchResults.firstPage, true, "should be first page");
        assert.strictEqual(searchResults.lastPage, false, "should not be last page");
    });

    it("should search transactions after", async function () {
        const provider = createMockOtsProvider();
        const searchResults = await provider.searchTransactionsAfter("0x123", 4096, 10);

        assert(Array.isArray(searchResults.txs), "should have txs array");
        assert(Array.isArray(searchResults.receipts), "should have receipts array");
    });

    it("should get transaction by sender and nonce", async function () {
        const provider = createMockOtsProvider();
        const txHash = await provider.getTransactionBySenderAndNonce("0x123", 0);
        assert.strictEqual(txHash, "0xabcdef123456789", "should return transaction hash");
    });

    it("should get contract creator", async function () {
        const provider = createMockOtsProvider();
        const creator = await provider.getContractCreator("0x123");

        assert(typeof creator === "object", "should return object");
        assert.strictEqual(creator?.hash, "0x987654321", "should have creation hash");
        assert.strictEqual(
            creator?.creator,
            "0x1111111111111111111111111111111111111111",
            "should have creator address"
        );
    });

    it("should ensure OTS capability", async function () {
        const provider = createMockOtsProvider();

        // Should not throw
        await provider.ensureOts(8);

        // Should throw for higher requirement
        try {
            await provider.ensureOts(10);
            assert.fail("should have thrown for unsupported API level");
        } catch (error: any) {
            assert(error.message.includes("ots_getApiLevel"), "should mention API level");
            assert.strictEqual(error.code, "OTS_UNAVAILABLE", "should have correct error code");
        }
    });

    it("should have async iterator for address history", function () {
        const provider = createMockOtsProvider();
        const iterator = provider.iterateAddressHistory("0x123", 4000, 4096);

        assert(typeof iterator[Symbol.asyncIterator] === "function", "should be async iterable");
    });

    it("should properly type return values", async function () {
        const provider = createMockOtsProvider();

        // Test TypeScript typing works correctly
        const apiLevel: number = await provider.otsApiLevel();
        const hasCode: boolean = await provider.hasCode("0x123");
        const internalOps: OtsInternalOp[] = await provider.getInternalOperations("0x123");
        const blockDetails: OtsBlockDetails = await provider.getBlockDetails(4096);
        const blockTxs: OtsBlockTransactionsPage = await provider.getBlockTransactions(4096, 0, 10);
        const searchResults: OtsAddressTransactionsPage = await provider.searchTransactionsBefore("0x123", 4096, 10);
        const traceEntries: OtsTraceEntry[] = await provider.traceTransaction("0x123");
        const creator: OtsContractCreator | null = await provider.getContractCreator("0x123");

        // Basic type assertions
        assert.strictEqual(typeof apiLevel, "number");
        assert.strictEqual(typeof hasCode, "boolean");
        assert(Array.isArray(internalOps));
        assert(typeof blockDetails === "object");
        assert(typeof blockTxs === "object" && Array.isArray(blockTxs.transactions));
        assert(typeof searchResults === "object" && Array.isArray(searchResults.txs));
        assert(Array.isArray(traceEntries));
        assert(creator === null || typeof creator === "object");
    });
});
