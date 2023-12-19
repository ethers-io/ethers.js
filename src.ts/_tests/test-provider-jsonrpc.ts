import assert from "assert";

import {
    id, isError, makeError, toUtf8Bytes, toUtf8String,
    FetchRequest,
    JsonRpcProvider, Transaction, Wallet
} from "../index.js";

const StatusMessages: Record<number, string> = {
  200: "OK",
  400: "BAD REQUEST",
  500: "SERVER ERROR",
};


type ProcessRequest = (method: string, params: Array<string>, blockNumber: number) => any;

const wallet = new Wallet(id("test"));

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
        assert(tx);
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

