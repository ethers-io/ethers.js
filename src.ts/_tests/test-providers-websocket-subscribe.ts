import assert from "assert";

import { WebSocketProvider } from "../index.js";

import type { WebSocketLike } from "../providers/provider-websocket.js";

type JsonRpcReq = { id: number; method: string; params?: Array<any> };

function createRejectingSocket(): WebSocketLike {
    const socket: WebSocketLike = {
        readyState: 1,
        onopen: null,
        onmessage: null,
        onerror: null,
        send(payload: string): void {
            const req = <JsonRpcReq>JSON.parse(payload);
            let resp: any;
            switch (req.method) {
                case "eth_chainId":
                    resp = { jsonrpc: "2.0", id: req.id, result: "0x1" };
                    break;
                case "eth_blockNumber":
                    resp = { jsonrpc: "2.0", id: req.id, result: "0x1" };
                    break;
                case "eth_subscribe":
                    resp = {
                        jsonrpc: "2.0",
                        id: req.id,
                        error: { code: -32608, message: "unknown response, status code: 500" }
                    };
                    break;
                default:
                    resp = { jsonrpc: "2.0", id: req.id, error: { code: -32601, message: req.method } };
            }
            queueMicrotask(() => {
                if (socket.onmessage) {
                    socket.onmessage({ data: JSON.stringify(resp) });
                }
            });
        },
        close(): void { }
    };
    return socket;
}

describe("WebSocket subscribe errors", function() {
    it("emits error instead of unhandledRejection when eth_subscribe fails", async function() {
        this.timeout(15000);

        const socket = createRejectingSocket();
        const provider = new WebSocketProvider(socket, 1, { staticNetwork: true });

        const errors: Array<any> = [ ];
        const unhandled: Array<any> = [ ];
        const onUnhandled = (reason: any) => { unhandled.push(reason); };
        process.on("unhandledRejection", onUnhandled);
        provider.on("error", (error) => { errors.push(error); });

        try {
            if (socket.onopen) { await socket.onopen(); }
            await provider.on("block", () => { });
            await new Promise((resolve) => setTimeout(resolve, 400));

            assert.ok(errors.length >= 1, `expected provider error, got ${ errors.length }`);
            assert.equal(unhandled.length, 0, `unexpected unhandledRejection: ${ unhandled[0] }`);
        } finally {
            process.off("unhandledRejection", onUnhandled);
            await provider.destroy();
        }
    });
});
