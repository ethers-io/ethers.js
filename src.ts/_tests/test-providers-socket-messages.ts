import assert from "assert";

import { SocketProvider, isError } from "../index.js";

class MessageProvider extends SocketProvider {
    async _write(message: string): Promise<void> {
        const payload = JSON.parse(message);
        await this._processMessage(JSON.stringify({
            id: payload.id, jsonrpc: "2.0", result: "0x2a"
        }));
    }
}

describe("Tests malformed socket messages", function() {
    const frames = [
        "rate limit exceeded",
        "{",
        "null",
        "[]",
        "42",
        JSON.stringify({ method: "eth_subscription" }),
        JSON.stringify({ method: "eth_subscription", params: null }),
        JSON.stringify({ method: "eth_subscription", params: {} }),
        JSON.stringify({ method: "eth_subscription", params: { subscription: "0x1" } }),
        JSON.stringify({ method: "eth_subscription", params: { subscription: 1, result: null } })
    ];

    for (const frame of frames) {
        it(`emits an error for ${ frame } and continues processing`, async function() {
            const provider = new MessageProvider(1, { staticNetwork: true });
            const errors: Array<any> = [];
            try {
                await provider.on("error", (error) => { errors.push(error); });
                await provider._processMessage(frame);
                await new Promise((resolve) => { setTimeout(resolve, 0); });
                assert.equal(errors.length, 1);
                assert.ok(isError(errors[0], "UNKNOWN_ERROR"));
                assert.equal(errors[0].reasonCode, "UNEXPECTED_MESSAGE");

                await provider._start();
                assert.equal(await provider.getBlockNumber(), 42);
            } finally {
                provider.destroy();
            }
        });
    }

    it("accepts a subscription notification with a null result", async function() {
        const provider = new MessageProvider(1, { staticNetwork: true });
        const errors: Array<any> = [];
        try {
            await provider.on("error", (error) => { errors.push(error); });
            await provider._processMessage(JSON.stringify({
                method: "eth_subscription", params: { subscription: "0x1", result: null }
            }));
            await new Promise((resolve) => { setTimeout(resolve, 0); });
            assert.equal(errors.length, 0);
        } finally {
            provider.destroy();
        }
    });
});
