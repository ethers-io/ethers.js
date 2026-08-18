import assert from "assert";
import { WebSocketProvider } from "../index.js";
function createRejectingSocket() {
    const socket = {
        readyState: 1,
        onopen: null,
        onmessage: null,
        onerror: null,
        send(payload) {
            const req = JSON.parse(payload);
            let resp;
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
        close() { }
    };
    return socket;
}
describe("WebSocket subscribe errors", function () {
    it("emits error instead of unhandledRejection when eth_subscribe fails", async function () {
        this.timeout(15000);
        const socket = createRejectingSocket();
        const provider = new WebSocketProvider(socket, 1, { staticNetwork: true });
        const errors = [];
        const unhandled = [];
        const onUnhandled = (reason) => { unhandled.push(reason); };
        process.on("unhandledRejection", onUnhandled);
        provider.on("error", (error) => { errors.push(error); });
        try {
            if (socket.onopen) {
                await socket.onopen();
            }
            await provider.on("block", () => { });
            await new Promise((resolve) => setTimeout(resolve, 400));
            assert.ok(errors.length >= 1, `expected provider error, got ${errors.length}`);
            assert.equal(unhandled.length, 0, `unexpected unhandledRejection: ${unhandled[0]}`);
        }
        finally {
            process.off("unhandledRejection", onUnhandled);
            await provider.destroy();
        }
    });
});
//# sourceMappingURL=test-providers-websocket-subscribe.js.map