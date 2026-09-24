import assert from "assert";

import {
    id, isError, makeError, toUtf8Bytes, toUtf8String,
    FetchRequest,
    Block, JsonRpcProvider, Transaction, Wallet
} from "../index.js";

import { formatBlock } from "../providers/format.js";
import type { BlockParams } from "../index.js";

const StatusMessages: Record<number, string> = {
  200: "OK",
  400: "BAD REQUEST",
  500: "SERVER ERROR",
};


type ProcessRequest = (method: string, params: Array<string>, blockNumber: number) => any;

const wallet = new Wallet(id("test"));

const blockHeader = {
    hash: id("block"), parentHash: id("parent"), number: "0x1",
    timestamp: "0x1234", nonce: "0x0000000000000000", difficulty: "0x0",
    gasLimit: "0x1c9c380", gasUsed: "0x5208", miner: wallet.address,
    extraData: "0x", transactions: [ ]
};

const emptyBlockAccessListHash = "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347";

function createProvider(testFunc: ProcessRequest): JsonRpcProvider {

    let blockNumber = 1;
    const ticker = setInterval(() => { blockNumber++ }, 100);
    if (ticker.unref) { ticker.unref(); }

    const processReq = (req: { method: string, params: Array<string>, id: any }) => {

        let result = testFunc(req.method, req.params, blockNumber);
        if (result === undefined) {
            switch (req.method) {
                case "eth_blockNumber":
                    result = blockNumber;
                    break;
                case "eth_chainId":
                    result = "0x1337";
                    break;
                case "eth_accounts":
                    result = [ wallet.address ];
                    break;
                default:
                    console.log("****", req);
                    return { id, error: "unsupported", jsonrpc: "2.0" };
            }
        }

        return { id: req.id, result, jsonrpc: "2.0" };
    };

    const req = new FetchRequest("http:/\/localhost:8082/");
    req.getUrlFunc = async (_req, signal) => {
        const req = JSON.parse(_req.hasBody() ? toUtf8String(_req.body): "");

        let statusCode = 200;
        const headers = { };

        let resp: any;
        try {
            if (Array.isArray(req)) {
                resp = req.map((r) => processReq(r));
            } else {
                resp = processReq(req);
            }

        } catch(error: any) {
            statusCode = 500;
            resp = error.message;
        }

        const body = toUtf8Bytes(JSON.stringify(resp));

        return {
            statusCode,
            statusMessage: StatusMessages[statusCode],
            headers, body
        };
    };

    return new JsonRpcProvider(req, undefined, { cacheTimeout: -1 });
}

describe("EIP-7843 and EIP-7928 block fields", function() {
    const cases: Array<{
        name: string;
        fields: { slotNumber?: null | string, blockAccessListHash?: null | string };
        slotNumber: null | bigint;
        blockAccessListHash: null | string;
    }> = [
        { name: "omitted", fields: { }, slotNumber: null, blockAccessListHash: null },
        {
            name: "null", fields: { slotNumber: null, blockAccessListHash: null },
            slotNumber: null, blockAccessListHash: null
        },
        {
            name: "zero slot only", fields: { slotNumber: "0x0" },
            slotNumber: BigInt(0), blockAccessListHash: null
        },
        {
            name: "hash only", fields: { blockAccessListHash: id("BAL") },
            slotNumber: null, blockAccessListHash: id("BAL")
        },
        {
            name: "unsafe number", fields: { slotNumber: "0x20000000000001" },
            slotNumber: BigInt("9007199254740993"), blockAccessListHash: null
        },
        {
            name: "uint64 maximum and empty BAL",
            fields: { slotNumber: "0xffffffffffffffff", blockAccessListHash: emptyBlockAccessListHash },
            slotNumber: BigInt("18446744073709551615"), blockAccessListHash: emptyBlockAccessListHash
        }
    ];

    function checkBlock(block: Block, test: typeof cases[number]): void {
        assert.strictEqual(block.slotNumber, test.slotNumber);
        assert.strictEqual(block.blockAccessListHash, test.blockAccessListHash);
        for (const json of [ block.toJSON(), JSON.parse(JSON.stringify(block)) ]) {
            assert.strictEqual(json.slotNumber, test.slotNumber == null ? null: test.slotNumber.toString());
            assert.strictEqual(json.blockAccessListHash, test.blockAccessListHash);
        }
    }

    for (const test of cases) {
        it(`constructs and serializes a block: ${ test.name }`, function() {
            const provider = createProvider(() => undefined);
            try {
                // Also test callers which construct BlockParams directly, without RPC formatting.
                const params: BlockParams = formatBlock(blockHeader);
                delete params.slotNumber;
                delete params.blockAccessListHash;
                if ("slotNumber" in test.fields) { params.slotNumber = test.slotNumber; }
                if ("blockAccessListHash" in test.fields) { params.blockAccessListHash = test.blockAccessListHash; }
                checkBlock(new Block(params, provider), test);
            } finally {
                provider.destroy();
            }
        });

        for (const byHash of [ false, true ]) {
            for (const prefetch of [ false, true ]) {
                it(`gets a block: ${ test.name }, byHash=${ byHash }, prefetch=${ prefetch }`, async function() {
                    const transaction = {
                        hash: id("transaction"), blockHash: blockHeader.hash,
                        blockNumber: "0x1", transactionIndex: "0x0", type: "0x0",
                        from: wallet.address, to: wallet.address, nonce: "0x0",
                        gas: "0x5208", gasPrice: "0x1", value: "0x0", input: "0x",
                        v: "0x1b", r: "0x1", s: "0x2"
                    };
                    const method = byHash ? "eth_getBlockByHash": "eth_getBlockByNumber";
                    const selector = byHash ? blockHeader.hash: "0x1";
                    const provider = createProvider((requestMethod, params) => {
                        if (requestMethod !== method) { return undefined; }
                        assert.deepStrictEqual(params, [ selector, prefetch ]);
                        return Object.assign({ }, blockHeader, test.fields, {
                            transactions: [ prefetch ? transaction: transaction.hash ]
                        });
                    });
                    try {
                        const block = await provider.getBlock(byHash ? blockHeader.hash: 1, prefetch);
                        assert.ok(block);
                        checkBlock(block, test);
                        assert.deepStrictEqual(block.transactions, [ transaction.hash ]);
                        if (prefetch) {
                            assert.strictEqual(block.prefetchedTransactions[0].hash, transaction.hash);
                            assert.strictEqual(block.prefetchedTransactions[0].gasLimit, BigInt(21000));
                        }
                    } finally {
                        provider.destroy();
                    }
                });
            }
        }
    }

    for (const [ field, values ] of Object.entries({
        slotNumber: [ "invalid", "0xgg", "1.5", 1.5, Number.MAX_SAFE_INTEGER + 1 ],
        blockAccessListHash: [ "0x", "0x1234", "0x" + "11".repeat(33), "0x" + "gg".repeat(32) ]
    })) {
        for (const value of values) {
            it(`rejects invalid ${ field }: ${ value }`, function() {
                assert.throws(() => formatBlock({ ...blockHeader, [field]: value }), (error: any) => {
                    return isError(error, "BAD_DATA") && error.message.includes(`value.${ field }`);
                });
            });
        }
    }
});

describe("Ensure Catchable Errors", function() {
    it("Can catch bad broadcast replies", async function() {
        this.timeout(15000);

        const txInfo = {
          chainId: 1337,
          gasLimit: 100000,
          maxFeePerGas: 2000000000,
          maxPriorityFeePerGas: 1000000000,
          to: wallet.address,
          value: 1,
        };
        const txSign = await wallet.signTransaction(txInfo);
        const txObj = Transaction.from(txSign);

        let count = 0;

        const provider = createProvider((method, params, blockNumber) => {

            switch (method) {
                case "eth_sendTransaction":
                    return txObj.hash;

                case "eth_getTransactionByHash": {
                    count++;

                    // First time; fail!
                    if (count === 1) {
                        throw makeError("Faux Error", "SERVER_ERROR", {
                            request: <any>({ })
                        });
                    }

                    // Second time; return null
                    if (count === 2) { return null; }

                    // Return a valid tx...
                    const result = Object.assign({ },
                        txObj.toJSON(),
                        txObj.signature!.toJSON(),
                        { hash: txObj.hash, from: wallet.address });

                    // ...eventually mined
                    if (count > 4) {
                        result.blockNumber = blockNumber;
                        result.blockHash = id("test");
                    }

                    return result;
                }
            }

            return undefined;
        });

        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction(txInfo);
        assert.ok(tx);
    });


    it("Missing v is recovered", async function() {
        this.timeout(15000);

        const txInfo = {
          chainId: 1337,
          gasLimit: 100000,
          maxFeePerGas: 2000000000,
          maxPriorityFeePerGas: 1000000000,
          to: wallet.address,
          value: 1,
        };
        const txSign = await wallet.signTransaction(txInfo);
        const txObj = Transaction.from(txSign);

        let count = 0;

        // A provider which is mocked to return a "missing v"
        // in getTransaction

        const provider = createProvider((method, params, blockNumber) => {

            switch (method) {
                case "eth_sendTransaction":
                    return txObj.hash;

                case "eth_getTransactionByHash": {
                    count++;

                    // The fully valid tx response
                    const result = Object.assign({ },
                        txObj.toJSON(),
                        txObj.signature!.toJSON(),
                        { hash: txObj.hash, from: wallet.address, sig: null });

                    // First time; fail with a missing v!
                    if (count < 2) { delete result.v; }

                    // Debug
                    result._count = count;

                    return result;
                }
            }

            return undefined;
        });

        // Track any "missing v" error
        let missingV: Error | null = null;
        provider.on("error", (e) => {
            if (isError(e, "UNKNOWN_ERROR") && isError(e.error, "INVALID_ARGUMENT")) {
                if (e.error.argument === "signature" && e.error.shortMessage === "missing v") {
                    missingV = e.error;
                }
            }
        });

        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction(txInfo);
        assert.ok(!!tx, "we got a transaction");
        assert.ok(!!missingV, "missing v error present");
    });
});
