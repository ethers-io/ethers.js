import assert from "assert";

import {
    FetchRequest,
    OtterscanProvider,
    JsonRpcProvider,
} from "../index.js";

import type {
    OtsInternalOp,
    OtsBlockDetails,
    OtsBlockTxPage,
    OtsSearchResult,
    OtsContractCreator,
} from "../providers/provider-otterscan.js";

describe("Test Otterscan Provider", function() {
    // Mock OTS responses for testing
    function createMockOtsProvider() {
        const req = new FetchRequest("http://localhost:8545/");
        
        req.getUrlFunc = async (_req, signal) => {
            const bodyStr = typeof _req.body === "string" ? _req.body : new TextDecoder().decode(_req.body || new Uint8Array());
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
                    result = [{
                        type: 0,
                        from: "0x1234567890123456789012345678901234567890",
                        to: "0x0987654321098765432109876543210987654321",
                        value: "0x1000000000000000000"
                    }];
                    break;
                case "ots_getTransactionError":
                    result = "0x";
                    break;
                case "ots_traceTransaction":
                    result = { calls: [] };
                    break;
                case "ots_getBlockDetails":
                    result = {
                        block: {
                            hash: "0x123abc",
                            number: "0x1000"
                        },
                        transactionCount: 5,
                        totalFees: "0x5000000000000000"
                    };
                    break;
                case "ots_getBlockTransactions":
                    result = {
                        transactions: [{
                            hash: "0x456def",
                            from: "0x1111111111111111111111111111111111111111",
                            to: "0x2222222222222222222222222222222222222222",
                            value: "0x1000000000000000000"
                        }],
                        receipts: [{
                            status: "0x1",
                            gasUsed: "0x5208"
                        }]
                    };
                    break;
                case "ots_searchTransactionsBefore":
                case "ots_searchTransactionsAfter":
                    result = {
                        txs: [{
                            hash: "0x789ghi",
                            blockNumber: "0x1000"
                        }],
                        receipts: [{
                            status: "0x1"
                        }],
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

    it("should extend JsonRpcProvider", function() {
        const provider = createMockOtsProvider();
        assert(provider instanceof OtterscanProvider, "should be OtterscanProvider instance");
        assert(provider instanceof JsonRpcProvider, "should extend JsonRpcProvider");
    });

    it("should get OTS API level", async function() {
        const provider = createMockOtsProvider();
        const apiLevel = await provider.otsApiLevel();
        assert.strictEqual(apiLevel, 8, "should return API level 8");
    });

    it("should check if address has code", async function() {
        const provider = createMockOtsProvider();
        
        const hasCodeTrue = await provider.hasCode("0x1234567890123456789012345678901234567890");
        assert.strictEqual(hasCodeTrue, true, "should return true for non-zero address");
        
        const hasCodeFalse = await provider.hasCode("0x0000000000000000000000000000000000000000");
        assert.strictEqual(hasCodeFalse, false, "should return false for zero address");
    });

    it("should get internal operations", async function() {
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

    it("should get transaction error data", async function() {
        const provider = createMockOtsProvider();
        const errorData = await provider.getTransactionErrorData("0x123");
        assert.strictEqual(errorData, "0x", "should return empty error data");
    });

    it("should get transaction revert reason", async function() {
        const provider = createMockOtsProvider();
        const revertReason = await provider.getTransactionRevertReason("0x123");
        assert.strictEqual(revertReason, null, "should return null for no error");
    });

    it("should trace transaction", async function() {
        const provider = createMockOtsProvider();
        const trace = await provider.traceTransaction("0x123");
        assert(typeof trace === "object", "should return trace object");
        assert(Array.isArray(trace.calls), "should have calls array");
    });

    it("should get block details", async function() {
        const provider = createMockOtsProvider();
        const blockDetails = await provider.getBlockDetails(4096);
        
        assert(typeof blockDetails === "object", "should return object");
        assert.strictEqual(blockDetails.transactionCount, 5, "should have transaction count");
        assert.strictEqual(blockDetails.totalFees, "0x5000000000000000", "should have total fees");
        assert(blockDetails.block, "should have block data");
    });

    it("should get block transactions", async function() {
        const provider = createMockOtsProvider();
        const blockTxs = await provider.getBlockTransactions(4096, 0, 10);
        
        assert(Array.isArray(blockTxs.transactions), "should have transactions array");
        assert(Array.isArray(blockTxs.receipts), "should have receipts array");
        assert.strictEqual(blockTxs.transactions.length, 1, "should have one transaction");
        assert.strictEqual(blockTxs.receipts.length, 1, "should have one receipt");
    });

    it("should search transactions before", async function() {
        const provider = createMockOtsProvider();
        const searchResults = await provider.searchTransactionsBefore("0x123", 4096, 10);
        
        assert(Array.isArray(searchResults.txs), "should have txs array");
        assert(Array.isArray(searchResults.receipts), "should have receipts array");
        assert.strictEqual(searchResults.firstPage, true, "should be first page");
        assert.strictEqual(searchResults.lastPage, false, "should not be last page");
    });

    it("should search transactions after", async function() {
        const provider = createMockOtsProvider();
        const searchResults = await provider.searchTransactionsAfter("0x123", 4096, 10);
        
        assert(Array.isArray(searchResults.txs), "should have txs array");
        assert(Array.isArray(searchResults.receipts), "should have receipts array");
    });

    it("should get transaction by sender and nonce", async function() {
        const provider = createMockOtsProvider();
        const txHash = await provider.getTransactionBySenderAndNonce("0x123", 0);
        assert.strictEqual(txHash, "0xabcdef123456789", "should return transaction hash");
    });

    it("should get contract creator", async function() {
        const provider = createMockOtsProvider();
        const creator = await provider.getContractCreator("0x123");
        
        assert(typeof creator === "object", "should return object");
        assert.strictEqual(creator?.hash, "0x987654321", "should have creation hash");
        assert.strictEqual(creator?.creator, "0x1111111111111111111111111111111111111111", "should have creator address");
    });

    it("should ensure OTS capability", async function() {
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

    it("should have async iterator for address history", function() {
        const provider = createMockOtsProvider();
        const iterator = provider.iterateAddressHistory("0x123", "before", 4096);
        
        assert(typeof iterator[Symbol.asyncIterator] === "function", "should be async iterable");
    });

    it("should properly type return values", async function() {
        const provider = createMockOtsProvider();
        
        // Test TypeScript typing works correctly
        const apiLevel: number = await provider.otsApiLevel();
        const hasCode: boolean = await provider.hasCode("0x123");
        const internalOps: OtsInternalOp[] = await provider.getInternalOperations("0x123");
        const blockDetails: OtsBlockDetails = await provider.getBlockDetails(4096);
        const blockTxs: OtsBlockTxPage = await provider.getBlockTransactions(4096, 0, 10);
        const searchResults: OtsSearchResult = await provider.searchTransactionsBefore("0x123", 4096, 10);
        const creator: OtsContractCreator | null = await provider.getContractCreator("0x123");
        
        // Basic type assertions
        assert.strictEqual(typeof apiLevel, "number");
        assert.strictEqual(typeof hasCode, "boolean");
        assert(Array.isArray(internalOps));
        assert(typeof blockDetails === "object");
        assert(typeof blockTxs === "object" && Array.isArray(blockTxs.transactions));
        assert(typeof searchResults === "object" && Array.isArray(searchResults.txs));
        assert(creator === null || typeof creator === "object");
    });
});