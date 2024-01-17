"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const index_js_1 = require("../index.js");
const StatusMessages = {
    200: "OK",
    400: "BAD REQUEST",
    500: "SERVER ERROR",
};
const wallet = new index_js_1.Wallet((0, index_js_1.id)("test"));
function createProvider(testFunc) {
    let blockNumber = 1;
    const ticker = setInterval(() => { blockNumber++; }, 100);
    if (ticker.unref) {
        ticker.unref();
    }
    const processReq = (req) => {
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
                    result = [wallet.address];
                    break;
                default:
                    console.log("****", req);
                    return { id: index_js_1.id, error: "unsupported", jsonrpc: "2.0" };
            }
        }
        return { id: req.id, result, jsonrpc: "2.0" };
    };
    const req = new index_js_1.FetchRequest("http:/\/localhost:8082/");
    req.getUrlFunc = async (_req, signal) => {
        const req = JSON.parse(_req.hasBody() ? (0, index_js_1.toUtf8String)(_req.body) : "");
        let statusCode = 200;
        const headers = {};
        let resp;
        try {
            if (Array.isArray(req)) {
                resp = req.map((r) => processReq(r));
            }
            else {
                resp = processReq(req);
            }
        }
        catch (error) {
            statusCode = 500;
            resp = error.message;
        }
        const body = (0, index_js_1.toUtf8Bytes)(JSON.stringify(resp));
        return {
            statusCode,
            statusMessage: StatusMessages[statusCode],
            headers, body
        };
    };
    return new index_js_1.JsonRpcProvider(req, undefined, { cacheTimeout: -1 });
}
describe("Ensure Catchable Errors", function () {
    it("Can catch bad broadcast replies", async function () {
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
        const txObj = index_js_1.Transaction.from(txSign);
        let count = 0;
        const provider = createProvider((method, params, blockNumber) => {
            switch (method) {
                case "eth_sendTransaction":
                    return txObj.hash;
                case "eth_getTransactionByHash": {
                    count++;
                    // First time; fail!
                    if (count === 1) {
                        throw (0, index_js_1.makeError)("Faux Error", "SERVER_ERROR", {
                            request: ({})
                        });
                    }
                    // Second time; return null
                    if (count === 2) {
                        return null;
                    }
                    // Return a valid tx...
                    const result = Object.assign({}, txObj.toJSON(), txObj.signature.toJSON(), { hash: txObj.hash, from: wallet.address });
                    // ...eventually mined
                    if (count > 4) {
                        result.blockNumber = blockNumber;
                        result.blockHash = (0, index_js_1.id)("test");
                    }
                    return result;
                }
            }
            return undefined;
        });
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction(txInfo);
        (0, assert_1.default)(tx);
    });
    it("Missing v is recovered", async function () {
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
        const txObj = index_js_1.Transaction.from(txSign);
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
                    const result = Object.assign({}, txObj.toJSON(), txObj.signature.toJSON(), { hash: txObj.hash, from: wallet.address, sig: null });
                    // First time; fail with a missing v!
                    if (count < 2) {
                        delete result.v;
                    }
                    // Debug
                    result._count = count;
                    return result;
                }
            }
            return undefined;
        });
        // Track any "missing v" error
        let missingV = null;
        provider.on("error", (e) => {
            if ((0, index_js_1.isError)(e, "UNKNOWN_ERROR") && (0, index_js_1.isError)(e.error, "INVALID_ARGUMENT")) {
                if (e.error.argument === "signature" && e.error.shortMessage === "missing v") {
                    missingV = e.error;
                }
            }
        });
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction(txInfo);
        assert_1.default.ok(!!tx, "we got a transaction");
        assert_1.default.ok(!!missingV, "missing v error present");
    });
});
//# sourceMappingURL=test-providers-jsonrpc.js.map